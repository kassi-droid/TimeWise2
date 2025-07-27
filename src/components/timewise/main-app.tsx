
"use client";

import { useState } from 'react';
import { useWorkEntries } from '@/hooks/use-work-entries';
import { useScheduledEntries } from '@/hooks/use-scheduled-entries';
import { useToast } from '@/hooks/use-toast';
import AppHeader from './app-header';
import BottomNav from './bottom-nav';
import AddEntryForm from './add-entry-form';
import SpreadsheetView from './spreadsheet-view';
import CalendarView from './calendar-view';
import type { WorkEntry, ScheduledEntry } from '@/types';

export default function MainApp() {
  const [currentTab, setCurrentTab] = useState('add');
  const { entries, addEntry, deleteEntry, togglePaidStatus, isLoading: isLoadingWork } = useWorkEntries();
  const { scheduledEntries, addScheduledEntry, isLoading: isLoadingSchedule } = useScheduledEntries();
  const { toast } = useToast();

  const handleAddEntry = (newEntryData: Omit<WorkEntry, 'id' | 'paid'>) => {
    addEntry({ ...newEntryData, paid: false });
    toast({
      title: "Entry Added!",
      description: `${newEntryData.workHours.toFixed(1)} hours logged.`,
    });
  };

  const handleAddScheduledEntry = (newEntryData: Omit<ScheduledEntry, 'id'>) => {
    addScheduledEntry(newEntryData);
    toast({
      title: "Work Day Scheduled!",
      description: `Added "${newEntryData.title}" to your calendar.`,
    });
  }

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
    toast({
      title: "Entry Deleted",
      description: "The work entry has been removed.",
      variant: "destructive",
    })
  }

  const handleTogglePaidStatus = (id: string) => {
    togglePaidStatus(id);
    const entry = entries.find(e => e.id === id);
    toast({
        title: `Entry updated`,
        description: `Marked as ${entry && !entry.paid ? 'paid' : 'pending'}.`
    });
  }

  if (isLoadingWork || isLoadingSchedule) {
      return <div className="flex-1 flex items-center justify-center"><p>Loading entries...</p></div>
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader entries={entries} />

      <main className="flex-1 overflow-y-auto pb-24">
        <div className={currentTab === 'add' ? 'block' : 'hidden'}>
          <AddEntryForm onAddEntry={handleAddEntry} />
        </div>
        <div className={currentTab === 'spreadsheet' ? 'block' : 'hidden'}>
          <SpreadsheetView 
            entries={entries} 
            deleteEntry={handleDeleteEntry}
            togglePaidStatus={handleTogglePaidStatus}
          />
        </div>
        <div className={currentTab === 'calendar' ? 'block' : 'hidden'}>
          <CalendarView 
            scheduledEntries={scheduledEntries} 
            addScheduledEntry={handleAddScheduledEntry}
          />
        </div>
      </main>

      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
}
