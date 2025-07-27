"use client";

import type { WorkEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkLogTableProps {
  title: string;
  titleClassName?: string;
  entries: WorkEntry[];
  isPaidLog: boolean;
  deleteEntry: (id: string) => void;
  togglePaidStatus: (id: string) => void;
  emptyState: {
    icon: string;
    message: string;
    description: string;
  };
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00'); // Treat as local time
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
};

export default function WorkLogTable({ title, titleClassName, entries, isPaidLog, deleteEntry, togglePaidStatus, emptyState }: WorkLogTableProps) {
  
  const paidTotal = isPaidLog ? entries.reduce((sum, entry) => sum + entry.earnings, 0) : 0;
  
  return (
    <Card className="shadow-xl bg-white/95 backdrop-blur-md overflow-hidden">
      <CardHeader className={cn("p-4 flex-row items-center justify-between", titleClassName)}>
        <CardTitle className="font-headline text-lg">{title}</CardTitle>
        {isPaidLog && (
            <div className="text-sm opacity-90">
                {entries.length} entries • ${paidTotal.toFixed(2)} total
            </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Hours</TableHead>
                <TableHead className="text-center">Earned</TableHead>
                <TableHead className="text-center">Status</TableHead>
                {!isPaidLog && <TableHead className="text-center">Delete</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isPaidLog ? 4 : 5} className="h-48 text-center">
                    <div className="text-4xl mb-2">{emptyState.icon}</div>
                    <p className="font-semibold">{emptyState.message}</p>
                    <p className="text-sm text-muted-foreground">{emptyState.description}</p>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="font-semibold">{formatDate(entry.date)}</div>
                      <div className="text-xs text-muted-foreground">{entry.startTime} - {entry.endTime}</div>
                      <div className="text-xs text-muted-foreground">@{entry.hourlyRate.toFixed(2)}/hr</div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{entry.workHours.toFixed(1)}h</TableCell>
                    <TableCell className="text-center font-medium">${entry.earnings.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                       <Button
                          variant={isPaidLog ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => togglePaidStatus(entry.id)}
                          className={cn("gap-1", isPaidLog ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200")}
                        >
                          {isPaidLog ? <Check size={16} /> : <Clock size={16} />}
                          {isPaidLog ? 'Paid' : 'Pending'}
                        </Button>
                    </TableCell>
                    {!isPaidLog && (
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
