
"use client";

import * as React from 'react';
import type { WorkEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Check, Clock, FileUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { exportToSheet } from '@/ai/flows/export-to-sheet-flow';

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

const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hours12}:${minutesStr} ${ampm}`;
};

export default function WorkLogTable({ title, titleClassName, entries, isPaidLog, deleteEntry, togglePaidStatus, emptyState }: WorkLogTableProps) {
  
  const { toast } = useToast();
  const [isExporting, setIsExporting] = React.useState(false);
  
  const paidTotal = isPaidLog ? entries.reduce((sum, entry) => sum + entry.earnings, 0) : 0;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportToSheet(entries);
      if (result.spreadsheetUrl) {
        toast({
          title: "Export Successful!",
          description: "Paid entries exported to Google Sheets.",
        });
        window.open(result.spreadsheetUrl, '_blank');
      } else {
        throw new Error("Export failed to return a URL.");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Could not export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Card className="shadow-xl bg-white/95 backdrop-blur-md overflow-hidden">
      <CardHeader className={cn("p-4 flex-row items-center justify-between", titleClassName)}>
        <div className="flex items-center gap-4">
          <CardTitle className="font-headline text-lg">{title}</CardTitle>
          {isPaidLog && entries.length > 0 && (
             <Button size="sm" variant="secondary" onClick={handleExport} disabled={isExporting}>
              {isExporting ? <Loader2 className="animate-spin" /> : <FileUp />}
              Export
            </Button>
          )}
        </div>
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
                      <div className="text-xs text-muted-foreground">{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</div>
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the work entry.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteEntry(entry.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
