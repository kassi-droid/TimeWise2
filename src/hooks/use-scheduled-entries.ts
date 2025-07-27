
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ScheduledEntry } from '@/types';

const SCHEDULED_ENTRIES_COLLECTION = 'scheduledEntries';

export function useScheduledEntries() {
  const [scheduledEntries, setScheduledEntries] = useState<ScheduledEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScheduledEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, SCHEDULED_ENTRIES_COLLECTION), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const entriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ScheduledEntry[];
      setScheduledEntries(entriesData);
    } catch (error) {
      console.error("Failed to load scheduled entries from Firestore", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduledEntries();
  }, [fetchScheduledEntries]);

  const addScheduledEntry = useCallback(async (newEntry: Omit<ScheduledEntry, 'id'>) => {
    try {
      await addDoc(collection(db, SCHEDULED_ENTRIES_COLLECTION), newEntry);
      await fetchScheduledEntries();
    } catch (error) {
        console.error("Failed to save scheduled entry to Firestore", error);
    }
  }, [fetchScheduledEntries]);

  const deleteScheduledEntry = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, SCHEDULED_ENTRIES_COLLECTION, id));
      setScheduledEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error("Failed to delete scheduled entry from Firestore", error);
    }
  }, []);

  return { scheduledEntries, addScheduledEntry, deleteScheduledEntry, isLoading };
}
