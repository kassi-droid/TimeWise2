
'use client';

import type { WorkEntry } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface StatsTabProps {
  entries: WorkEntry[];
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-gradient-to-br from-pastel-purple to-purple-light p-3 rounded-xl text-center">
    <div className="text-lg font-bold text-purple-dark">{value}</div>
    <div className="text-xs text-purple-medium">{title}</div>
  </div>
);

export function StatsTab({ entries, onDelete, onToggleStatus }: StatsTabProps) {
  const pendingEntries = entries.filter(e => e.status === 'pending');
  const paidEntries = entries.filter(e => e.status === 'paid');

  const totalHours = pendingEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
  const totalPay = pendingEntries.reduce((sum, entry) => sum + entry.totalPay, 0);
  const avgRate = pendingEntries.length > 0
    ? pendingEntries.reduce((sum, entry) => sum + entry.hourlyRate, 0) / pendingEntries.length
    : 0;

  const groupEntriesByJob = (entryList: WorkEntry[]) => {
    return entryList.reduce((acc, entry) => {
      (acc[entry.jobTitle] = acc[entry.jobTitle] || []).push(entry);
      return acc;
    }, {} as Record<string, WorkEntry[]>);
  };
  
  const groupedPending = groupEntriesByJob(pendingEntries);
  const groupedPaid = groupEntriesByJob(paidEntries);


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard title="Hours To Be Paid" value={totalHours.toFixed(1)} />
        <StatCard title="Total To Be Paid" value={`$${totalPay.toFixed(2)}`} />
        <StatCard title="Avg Rate" value={`$${avgRate.toFixed(2)}`} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-purple-dark mb-3">⏳ Pending</h3>
        <Accordion type="multiple" className="w-full space-y-2">
          {Object.entries(groupedPending).length > 0 ? Object.entries(groupedPending).map(([jobTitle, jobEntries]) => {
              const jobTotalHours = jobEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
              const jobTotalPay = jobEntries.reduce((sum, entry) => sum + entry.totalPay, 0);
              return (
                <AccordionItem value={jobTitle} key={jobTitle} className="bg-white/80 rounded-xl border-b-0">
                  <AccordionTrigger className="p-3 bg-gradient-to-br from-pastel-purple to-purple-light rounded-xl hover:no-underline">
                      <div className="flex justify-between items-center w-full">
                          <h4 className="font-semibold text-purple-dark text-left">{jobTitle}</h4>
                          <span className="text-sm text-purple-medium whitespace-nowrap pl-2">{jobTotalHours.toFixed(1)}h &bull; ${jobTotalPay.toFixed(2)}</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                      <EntryTable entries={jobEntries} onDelete={onDelete} onToggleStatus={onToggleStatus} />
                  </AccordionContent>
                </AccordionItem>
              )
          }) : <p className="text-purple-medium text-center py-4">No pending entries</p>}
        </Accordion>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-purple-dark mb-3">✅ Paid</h3>
        <Accordion type="multiple" className="w-full space-y-2">
        {Object.entries(groupedPaid).length > 0 ? Object.entries(groupedPaid).map(([jobTitle, jobEntries]) => {
            const jobTotalHours = jobEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
            const jobTotalPay = jobEntries.reduce((sum, entry) => sum + entry.totalPay, 0);
            return (
              <AccordionItem value={`paid-${jobTitle}`} key={`paid-${jobTitle}`} className="bg-white/80 rounded-xl border-b-0">
                <AccordionTrigger className="p-3 bg-gradient-to-br from-pastel-purple to-purple-light rounded-xl hover:no-underline">
                    <div className="flex justify-between items-center w-full">
                        <h4 className="font-semibold text-purple-dark text-left">{jobTitle}</h4>
                        <span className="text-sm text-purple-medium whitespace-nowrap pl-2">{jobTotalHours.toFixed(1)}h &bull; ${jobTotalPay.toFixed(2)}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                    <EntryTable entries={jobEntries} onDelete={onDelete} onToggleStatus={onToggleStatus} />
                </AccordionContent>
              </AccordionItem>
            )
        }) : <p className="text-purple-medium text-center py-4">No paid entries</p>}
        </Accordion>
      </div>
    </div>
  );
}

const EntryTable = ({ entries, onDelete, onToggleStatus }: Omit<StatsTabProps, 'entries'>) => (
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead className="text-purple-dark font-semibold text-sm">Date</TableHead>
                    <TableHead className="text-purple-dark font-semibold text-sm">Hours</TableHead>
                    <TableHead className="text-purple-dark font-semibold text-sm">Status</TableHead>
                    <TableHead className="text-purple-dark font-semibold text-sm text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {entries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                    <TableRow key={entry.id} className="border-purple-light hover:bg-pastel-purple/50">
                        <TableCell className="text-sm text-purple-dark">{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm text-purple-dark">{entry.hoursWorked.toFixed(1)}</TableCell>
                        <TableCell>
                            <Button
                                onClick={() => onToggleStatus(entry.id)}
                                variant="outline"
                                className={`text-xs px-2 py-1 h-auto rounded-full transition-colors ${
                                entry.status === 'pending'
                                    ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300 border-yellow-300'
                                    : 'bg-green-200 text-green-800 hover:bg-green-300 border-green-300'
                                }`}
                            >
                                {entry.status}
                            </Button>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button onClick={() => onDelete(entry.id)} variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
)
