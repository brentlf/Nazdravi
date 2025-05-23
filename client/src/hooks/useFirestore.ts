import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  DocumentData,
  QueryConstraint
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useFirestoreCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`Setting up Firestore listener for ${collectionName} with constraints:`, constraints);
    const q = query(collection(db, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        console.log(`Firestore data received for ${collectionName}:`, items.length, "items");
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}

export function useFirestoreDocument<T = DocumentData>(
  collectionName: string,
  documentId: string | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, collectionName, documentId),
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, documentId]);

  return { data, loading, error };
}

export function useFirestoreActions(collectionName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date()
      });
      setLoading(false);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const update = async (documentId: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, collectionName, documentId), {
        ...data,
        updatedAt: new Date()
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const remove = async (documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, collectionName, documentId));
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { add, update, remove, loading, error };
}
