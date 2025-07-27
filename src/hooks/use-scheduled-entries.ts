
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ScheduledEntry } from '@/types';

const SCHEDULED_ENTRIES_COLLECTION = 'scheduledEntries';

export function useScheduledEntries() {
  const [scheduledEntries, setScheduledEntries] = useState<ScheduledEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScheduledEntries = useCallback(async () => {
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
      const docRef = await addDoc(collection(db, SCHEDULED_ENTRIES_COLLECTION), newEntry);
      const entryWithId: ScheduledEntry = { ...newEntry, id: docRef.id };
      
      setScheduledEntries(prevEntries => {
        const newEntries = [...prevEntries, entryWithId];
        newEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return newEntries;
      });

    } catch (error) {
        console.error("Failed to save scheduled entry to Firestore", error);
    }
  }, []);

  return { scheduledEntries, addScheduledEntry, isLoading };
}
