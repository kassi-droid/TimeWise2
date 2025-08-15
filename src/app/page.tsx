
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Settings, Calendar as CalendarIcon, BarChart2, FileText } from 'lucide-react';

import { NewEntryForm } from '@/components/NewEntryForm';
import { StatsTab } from '@/components/StatsTab';
import { CalendarTab } from '@/components/CalendarTab';
import { ManageJobsDialog } from '@/components/ManageJobsDialog';

export type WorkEntry = {
  id: number;
  jobTitle: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  hourlyRate: number;
  hoursWorked: number;
  totalPay: number;
  status: 'pending' | 'paid';
  date: string;
  datePaid?: string;
};

export type CalendarJob = {
  id: number;
  jobTitle: string;
  startTime: string;
  endTime: string;
  date: string;
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [calendarJobs, setCalendarJobs] = useState<CalendarJob[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [isManageJobsOpen, setManageJobsOpen] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    setIsClient(true);
    const savedEntries = localStorage.getItem('timeWiseEntries');
    if (savedEntries) {
      setWorkEntries(JSON.parse(savedEntries));
    }
    const savedJobs = localStorage.getItem('timeWiseCalendar');
    if (savedJobs) {
      setCalendarJobs(JSON.parse(savedJobs));
    }
    const savedJobTitles = localStorage.getItem('timeWiseJobTitles');
    if (savedJobTitles) {
      setJobTitles(JSON.parse(savedJobTitles));
    } else {
      setJobTitles(['Default Job']);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('timeWiseEntries', JSON.stringify(workEntries));
    }
  }, [workEntries, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('timeWiseCalendar', JSON.stringify(calendarJobs));
    }
  }, [calendarJobs, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('timeWiseJobTitles', JSON.stringify(jobTitles));
    }
  }, [jobTitles, isClient]);
  
  if (!isClient) {
    return null; // or a loading spinner
  }

  const addWorkEntry = (entry: Omit<WorkEntry, 'id'>) => {
    setWorkEntries(prev => [...prev, { ...entry, id: Date.now() }]);
  };

  const deleteWorkEntry = (id: number) => {
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      setWorkEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const toggleWorkEntryStatus = (id: number) => {
    setWorkEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const isNowPaid = entry.status === 'pending';
        return { 
          ...entry, 
          status: isNowPaid ? 'paid' : 'pending',
          datePaid: isNowPaid ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return entry;
    }));
  };
  
  const addCalendarJob = (job: Omit<CalendarJob, 'id'>) => {
    setCalendarJobs(prev => [...prev, { ...job, id: Date.now() }]);
  };

  const deleteCalendarJob = (id: number) => {
    if (window.confirm('Are you sure you want to delete this calendar job? This action cannot be undone.')) {
      setCalendarJobs(prev => prev.filter(job => job.id !== id));
    }
  };

  return (
    <div className="bg-gradient-to-br from-pastel-purple to-purple-light min-h-screen font-sans">
        <div className="h-full flex flex-col p-4 max-w-2xl mx-auto">
            <header className="text-center mb-4 flex-shrink-0">
                <h1 className="text-3xl font-bold text-purple-dark mb-2">⏰ TimeWise</h1>
                <p className="text-purple-medium">Track your time, maximize your earnings</p>
            </header>

            <main className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-1 sm:p-4 mb-4 flex-1 flex flex-col min-h-0">
                 <Tabs defaultValue="entry" className="w-full flex-1 flex flex-col min-h-0">
                    <TabsContent value="entry" className="flex-1 overflow-y-auto p-2 sm:p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-purple-dark">📝 New Entry</h2>
                            <Button variant="ghost" size="icon" onClick={() => setManageJobsOpen(true)}>
                                <Settings className="h-5 w-5 text-purple-medium" />
                            </Button>
                        </div>
                        <NewEntryForm jobTitles={jobTitles} onAddEntry={addWorkEntry} />
                    </TabsContent>
                    <TabsContent value="stats" className="flex-1 overflow-y-auto p-2 sm:p-4">
                        <h2 className="text-2xl font-semibold text-purple-dark mb-4">📊 Statistics</h2>
                        <StatsTab 
                            entries={workEntries} 
                            onDelete={deleteWorkEntry} 
                            onToggleStatus={toggleWorkEntryStatus} 
                        />
                    </TabsContent>
                    <TabsContent value="calendar" className="flex-1 overflow-y-auto p-2 sm:p-4">
                        <h2 className="text-2xl font-semibold text-purple-dark mb-4">📅 Calendar</h2>
                        <CalendarTab 
                            jobs={calendarJobs} 
                            jobTitles={jobTitles} 
                            onAddJob={addCalendarJob} 
                            onDeleteJob={deleteCalendarJob}
                        />
                    </TabsContent>
                    
                    <footer className="bg-white rounded-2xl shadow-lg p-2 flex-shrink-0 mt-4">
                        <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 h-auto">
                            <TabsTrigger value="entry" className="data-[state=active]:bg-purple-medium data-[state=active]:text-white text-purple-dark py-3 px-2 sm:px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm">
                                <FileText className="h-4 w-4" /> Entry
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-medium data-[state=active]:text-white text-purple-dark py-3 px-2 sm:px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm">
                                <BarChart2 className="h-4 w-4" /> Statistics
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-medium data-[state=active]:text-white text-purple-dark py-3 px-2 sm:px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm">
                                <CalendarIcon className="h-4 w-4" /> Calendar
                            </TabsTrigger>
                        </TabsList>
                    </footer>
                </Tabs>
            </main>
        </div>
        <ManageJobsDialog 
            isOpen={isManageJobsOpen} 
            setIsOpen={setManageJobsOpen}
            jobTitles={jobTitles}
            setJobTitles={setJobTitles}
        />
    </div>
  );
}
