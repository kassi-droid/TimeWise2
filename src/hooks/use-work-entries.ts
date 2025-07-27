"use client";

import { useState, useEffect, useCallback } from 'react';
import type { WorkEntry } from '@/types';

const STORAGE_KEY = 'timewise-workEntries';

export function useWorkEntries() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(STORAGE_KEY);
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.error("Failed to load entries from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch (error) {
        console.error("Failed to save entries to localStorage", error);
      }
    }
  }, [entries, isLoading]);

  const addEntry = useCallback((newEntry: Omit<WorkEntry, 'id'>) => {
    setEntries(prevEntries => {
      const entryWithId: WorkEntry = { ...newEntry, id: Date.now() };
      return [...prevEntries, entryWithId];
    });
  }, []);

  const deleteEntry = useCallback((id: number) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
  }, []);

  const togglePaidStatus = useCallback((id: number) => {
    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === id ? { ...entry, paid: !entry.paid } : entry
      )
    );
  }, []);

  return { entries, addEntry, deleteEntry, togglePaidStatus, isLoading };
}
