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
      setEntries(prevEntries => [entryWithId, ...prevEntries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
        const newPaidStatus = !entryToUpdate.paid;
        const updateData: { paid: boolean; datePaid?: string } = { paid: newPaidStatus };

        if (newPaidStatus) {
          updateData.datePaid = new Date().toISOString().split('T')[0];
        } else {
          // If toggling back to unpaid, you might want to remove the datePaid field.
          // This depends on the desired logic. For now, we'll just set it.
          // In Firestore, you can use `deleteField()` to remove a field.
          // For simplicity here, we leave it, but a `null` value could also work.
        }
        
        await updateDoc(entryRef, updateData);

        setEntries(prevEntries =>
          prevEntries.map(entry =>
            entry.id === id ? { ...entry, ...updateData } : entry
          )
        );
      }
    } catch (error) {
        console.error("Failed to update entry in Firestore", error);
    }
  }, [entries]);

  return { entries, addEntry, deleteEntry, togglePaidStatus, isLoading };
}
