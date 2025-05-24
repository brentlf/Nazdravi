import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdminViewingClient: boolean;
  viewingClientUser: User | null;
  effectiveUser: User | null; // The user data to actually use (client if admin is viewing, otherwise regular user)
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  setViewingClient: (clientId: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingClientUser, setViewingClientUser] = useState<User | null>(null);

  const isAdminViewingClient = user?.role === "admin" && viewingClientUser !== null;
  const effectiveUser = isAdminViewingClient ? viewingClientUser : user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Define admin email addresses and check if current user should be admin
          const adminEmails = ["brentlf@gmail.com", "vero.bakova@gmail.com"];
          const shouldBeAdmin = adminEmails.includes(firebaseUser.email || "");
          const currentRole = shouldBeAdmin ? "admin" : (userData.role || "client");
          
          // Update role in Firestore if it needs to change
          if (shouldBeAdmin && userData.role !== "admin") {
            await setDoc(doc(db, "users", firebaseUser.uid), {
              ...userData,
              role: "admin"
            }, { merge: true });
          }
          
          setUser({
            uid: firebaseUser.uid,
            role: currentRole,
            name: userData.name || firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
            preferredLanguage: userData.preferredLanguage || "en",
            createdAt: userData.createdAt?.toDate() || new Date(),
          });
        } else {
          // Define admin email addresses
          const adminEmails = ["brentlf@gmail.com", "vero.bakova@gmail.com"];
          const isAdmin = adminEmails.includes(firebaseUser.email || "");
          
          // Create user document if it doesn't exist
          const newUser: User = {
            uid: firebaseUser.uid,
            role: isAdmin ? "admin" : "client",
            name: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            photoURL: firebaseUser.photoURL || undefined,
            preferredLanguage: "en",
            createdAt: new Date(),
          };
          
          await setDoc(doc(db, "users", firebaseUser.uid), {
            ...newUser,
            createdAt: new Date(),
          });
          
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Handle redirect result for OAuth
    getRedirectResult(auth).catch(console.error);

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    
    // Create user document
    await setDoc(doc(db, "users", result.user.uid), {
      uid: result.user.uid,
      role: "client",
      name,
      email,
      photoURL: null,
      preferredLanguage: "en",
      createdAt: new Date(),
    });
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      throw new Error("Google sign-in failed. Please try again or contact support.");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    await setDoc(doc(db, "users", user.uid), data, { merge: true });
    setUser({ ...user, ...data });
  };

  const setViewingClient = async (clientId: string | null) => {
    if (!clientId) {
      setViewingClientUser(null);
      return;
    }

    try {
      const clientDoc = await getDoc(doc(db, "users", clientId));
      if (clientDoc.exists()) {
        const clientData = clientDoc.data();
        setViewingClientUser({
          uid: clientId,
          role: clientData.role || "client",
          name: clientData.name || "",
          email: clientData.email || "",
          photoURL: clientData.photoURL || undefined,
          preferredLanguage: clientData.preferredLanguage || "en",
          createdAt: clientData.createdAt?.toDate() || new Date(),
        });
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAdminViewingClient,
    viewingClientUser,
    effectiveUser,
    signIn,
    signUp,
    signInWithGoogle,
    signOut: handleSignOut,
    updateUserProfile,
    setViewingClient,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
