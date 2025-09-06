import { useState, useEffect, useCallback, useRef } from "react";
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
  QueryConstraint,
  FirestoreError
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FirestoreHookResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface FirestoreDocumentResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface FirestoreActionsResult {
  add: (data: any) => Promise<string>;
  update: (documentId: string, data: any) => Promise<void>;
  remove: (documentId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useFirestoreCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: {
    retryAttempts?: number;
    retryDelay?: number;
    onError?: (error: FirestoreError) => void;
    enabled?: boolean;
  } = {}
): FirestoreHookResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const retryCountRef = useRef(0);
  
  const { retryAttempts = 3, retryDelay = 1000, onError, enabled = true } = options;

  const fetchData = useCallback(async () => {
    if (!collectionName) return;
    if (!enabled) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const q = query(collection(db, collectionName), ...constraints);
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as T[];
          setData(items);
          setLoading(false);
          setError(null);
          retryCountRef.current = 0; // Reset retry count on success
        },
        (err: FirestoreError) => {
          console.error(`Firestore error in ${collectionName}:`, err);
          setError(err.message);
          setLoading(false);
          
          // Call custom error handler if provided
          if (onError) {
            onError(err);
          }
          
          // Implement retry logic for transient errors
          if (retryCountRef.current < retryAttempts && 
              (err.code === 'unavailable' || err.code === 'deadline-exceeded')) {
            retryCountRef.current++;
            setTimeout(() => {
              console.log(`Retrying ${collectionName} query (attempt ${retryCountRef.current})`);
              fetchData();
            }, retryDelay * retryCountRef.current);
          }
        }
      );

      // Store unsubscribe function
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      unsubscribeRef.current = unsubscribe;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      console.error(`Error setting up ${collectionName} listener:`, err);
    }
  }, [collectionName, JSON.stringify(constraints), retryAttempts, retryDelay, onError, enabled]);

  useEffect(() => {
    fetchData();

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [fetchData]);

  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

export function useFirestoreDocument<T = DocumentData>(
  collectionName: string,
  documentId: string | null,
  options: {
    retryAttempts?: number;
    retryDelay?: number;
    onError?: (error: FirestoreError) => void;
    enabled?: boolean;
  } = {}
): FirestoreDocumentResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const retryCountRef = useRef(0);
  
  const { retryAttempts = 3, retryDelay = 1000, onError, enabled = true } = options;

  const fetchDocument = useCallback(async () => {
    if (!documentId || !collectionName) {
      setLoading(false);
      return;
    }
    if (!enabled) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setLoading(false);
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const unsubscribe = onSnapshot(
        doc(db, collectionName, documentId),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setData({ id: docSnapshot.id, ...docSnapshot.data() } as T);
          } else {
            setData(null);
          }
          setLoading(false);
          setError(null);
          retryCountRef.current = 0;
        },
        (err: FirestoreError) => {
          console.error(`Firestore error in ${collectionName}/${documentId}:`, err);
          setError(err.message);
          setLoading(false);
          
          if (onError) {
            onError(err);
          }
          
          if (retryCountRef.current < retryAttempts && 
              (err.code === 'unavailable' || err.code === 'deadline-exceeded')) {
            retryCountRef.current++;
            setTimeout(() => {
              console.log(`Retrying ${collectionName}/${documentId} (attempt ${retryCountRef.current})`);
              fetchDocument();
            }, retryDelay * retryCountRef.current);
          }
        }
      );

      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      unsubscribeRef.current = unsubscribe;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      console.error(`Error setting up ${collectionName}/${documentId} listener:`, err);
    }
  }, [collectionName, documentId, retryAttempts, retryDelay, onError, enabled]);

  useEffect(() => {
    fetchDocument();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [fetchDocument]);

  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchDocument();
  }, [fetchDocument]);

  return { data, loading, error, refetch };
}

export function useFirestoreActions(collectionName: string): FirestoreActionsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (data: any): Promise<string> => {
    if (!collectionName) {
      throw new Error('Collection name is required');
    }

    setLoading(true);
    setError(null);
    
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add document';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (documentId: string, data: any): Promise<void> => {
    if (!collectionName || !documentId) {
      throw new Error('Collection name and document ID are required');
    }

    setLoading(true);
    setError(null);
    
    try {
      await updateDoc(doc(db, collectionName, documentId), {
        ...data,
        updatedAt: new Date()
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (documentId: string): Promise<void> => {
    if (!collectionName || !documentId) {
      throw new Error('Collection name and document ID are required');
    }

    setLoading(true);
    setError(null);
    
    try {
      await deleteDoc(doc(db, collectionName, documentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { add, update, remove, loading, error };
}
