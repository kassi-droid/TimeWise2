"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { WorkEntry } from '@/types';

const ENTRIES_COLLECTION = 'workEntries';

export function useWorkEntries() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const q = query(collection(db, ENTRIES_COLLECTION), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const entriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WorkEntry[];
      setEntries(entriesData);
    } catch (error) {
      console.error("Failed to load entries from Firestore", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(async (newEntry: Omit<WorkEntry, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), newEntry);
      const entryWithId: WorkEntry = { ...newEntry, id: docRef.id };
      setEntries(prevEntries => [entryWithId, ...prevEntries]);
    } catch (error) {
        console.error("Failed to save entry to Firestore", error);
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, ENTRIES_COLLECTION, id));
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    } catch (error) {
        console.error("Failed to delete entry from Firestore", error);
    }
  }, []);

  const togglePaidStatus = useCallback(async (id: string) => {
    try {
      const entryToUpdate = entries.find(entry => entry.id === id);
      if (entryToUpdate) {
        const entryRef = doc(db, ENTRIES_COLLECTION, id);
        await updateDoc(entryRef, { paid: !entryToUpdate.paid });
        setEntries(prevEntries =>
          prevEntries.map(entry =>
            entry.id === id ? { ...entry, paid: !entry.paid } : entry
          )
        );
      }
    } catch (error) {
        console.error("Failed to update entry in Firestore", error);
    }
  }, [entries]);

  return { entries, addEntry, deleteEntry, togglePaidStatus, isLoading };
}
