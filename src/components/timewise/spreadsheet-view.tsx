
"use client";

import type { WorkEntry } from '@/types';
import StatsCards from './stats-cards';
import WorkLogTable from './work-log-table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SpreadsheetViewProps {
  entries: WorkEntry[];
  deleteEntry: (id: string) => void;
  togglePaidStatus: (id: string) => void;
}

export default function SpreadsheetView({ entries, deleteEntry, togglePaidStatus }: SpreadsheetViewProps) {
  const pendingEntries = entries.filter(e => !e.paid).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const paidEntries = entries.filter(e => e.paid).sort((a, b) => {
    const dateA = a.datePaid ? new Date(a.datePaid) : new Date(0);
    const dateB = b.datePaid ? new Date(b.datePaid) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  const groupedPendingEntries = pendingEntries.reduce((acc, entry) => {
    const jobTitle = entry.jobTitle || 'Uncategorized';
    if (!acc[jobTitle]) {
      acc[jobTitle] = [];
    }
    acc[jobTitle].push(entry);
    return acc;
  }, {} as Record<string, WorkEntry[]>);

  const pendingJobs = Object.entries(groupedPendingEntries);
  
  const paidEntriesByJob = paidEntries.reduce((acc, entry) => {
    const jobTitle = entry.jobTitle || 'Uncategorized';
    if (!acc[jobTitle]) {
      acc[jobTitle] = [];
    }
    acc[jobTitle].push(entry);
    return acc;
  }, {} as Record<string, WorkEntry[]>);

  const paidJobs = Object.entries(paidEntriesByJob).map(([jobTitle, jobEntries]) => {
    const totalEarnings = jobEntries.reduce((sum, entry) => sum + entry.earnings, 0);
    const totalHours = jobEntries.reduce((sum, entry) => sum + entry.workHours, 0);
    
    const groupedByDate = jobEntries.reduce((acc, entry) => {
      const paidDateKey = entry.datePaid || new Date(entry.date).toISOString().split('T')[0];
      if (!acc[paidDateKey]) {
        acc[paidDateKey] = [];
      }
      acc[paidDateKey].push(entry);
      return acc;
    }, {} as Record<string, WorkEntry[]>);

    const periods = Object.entries(groupedByDate).sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return { jobTitle, periods, totalEarnings, totalHours };
  });

  return (
    <div className="p-4 space-y-6">
      <StatsCards entries={entries} />
      
      <Card className="shadow-xl bg-white/95 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="font-headline text-lg">⏳ Pending Work</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
        {pendingJobs.length > 0 ? (
            <Accordion type="multiple" className="w-full">
            {pendingJobs.map(([jobTitle, jobEntries]) => {
                const totalHours = jobEntries.reduce((sum, entry) => sum + entry.workHours, 0);
                const totalEarnings = jobEntries.reduce((sum, entry) => sum + entry.earnings, 0);

                return (
                <AccordionItem value={jobTitle} key={jobTitle} className="border-b last:border-b-0">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/50 text-base font-semibold">
                    <div className="flex justify-between w-full pr-4">
                        <span>{jobTitle}</span>
                        <span className="text-right text-muted-foreground">
                        ${totalEarnings.toFixed(2)} ({totalHours.toFixed(1)}h)
                        </span>
                    </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                        <WorkLogTable
                            entries={jobEntries}
                            isPaidLog={false}
                            deleteEntry={deleteEntry}
                            togglePaidStatus={togglePaidStatus}
                            hideHeader={true}
                        />
                    </AccordionContent>
                </AccordionItem>
                )
            })}
            </Accordion>
        ) : (
            <div className="text-center p-10">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-semibold">No pending entries</p>
                <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
        )}
        </CardContent>
      </Card>


      <Card className="shadow-xl bg-white/95 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardTitle className="font-headline text-lg">✅ Paid Work</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paidJobs.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {paidJobs.map(({ jobTitle, periods, totalEarnings, totalHours }) => (
                  <AccordionItem value={jobTitle} key={jobTitle} className="border-b last:border-b-0">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/50 text-base font-semibold">
                        <div className="flex justify-between w-full pr-4">
                            <span>{jobTitle}</span>
                            <span className="text-right text-muted-foreground">
                            ${totalEarnings.toFixed(2)} ({totalHours.toFixed(1)}h)
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0 bg-secondary/20">
                      <Accordion type="multiple" className="w-full">
                        {periods.map(([datePaid, periodEntries]) => {
                          const periodTotal = periodEntries.reduce((sum, entry) => sum + entry.earnings, 0);
                          const periodHours = periodEntries.reduce((sum, entry) => sum + entry.workHours, 0);
                          const paidDate = new Date(datePaid + 'T00:00:00');
                          const formattedDate = paidDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

                          return (
                            <AccordionItem value={datePaid} key={datePaid} className="border-b last:border-b-0">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/50 text-sm font-medium">
                                <div className="flex justify-between w-full pr-4">
                                  <span>Paid on {formattedDate}</span>
                                  <span className="text-right text-muted-foreground">
                                    ${periodTotal.toFixed(2)} ({periodHours.toFixed(1)}h)
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="p-0">
                                <WorkLogTable
                                  entries={periodEntries}
                                  isPaidLog={true}
                                  deleteEntry={deleteEntry}
                                  togglePaidStatus={togglePaidStatus}
                                  hideHeader={true}
                                />
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center p-10">
                <div className="text-4xl mb-2">💰</div>
                <p className="font-semibold">No paid entries yet</p>
                <p className="text-sm text-muted-foreground">Mark entries as paid to see them here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
