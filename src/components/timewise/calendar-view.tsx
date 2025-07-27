
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format as formatDate, parseISO } from 'date-fns';
import { Trash2 } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import type { ScheduledEntry } from '@/types';

interface CalendarViewProps {
  scheduledEntries: ScheduledEntry[];
  addScheduledEntry: (newEntry: Omit<ScheduledEntry, 'id'>) => void;
  deleteScheduledEntry: (id: string) => void;
}

const scheduleFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hours12}:${minutesStr} ${ampm}`;
};

export default function CalendarView({ scheduledEntries, addScheduledEntry, deleteScheduledEntry }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      title: 'Work Shift',
      date: formatDate(new Date(), 'yyyy-MM-dd'),
      startTime: '',
      endTime: '',
    },
  });

  React.useEffect(() => {
    if (selectedDate) {
      form.setValue('date', formatDate(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate, form]);

  const scheduledDays = React.useMemo(() => {
    // Add a day to parseISO to account for timezone differences
    return scheduledEntries.map(entry => parseISO(entry.date + 'T00:00:00'));
  }, [scheduledEntries]);
  
  const selectedDayEntries = React.useMemo(() => {
    if (!selectedDate) return [];
    const selectedDateString = formatDate(selectedDate, 'yyyy-MM-dd');
    return scheduledEntries
      .filter(entry => entry.date === selectedDateString)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, scheduledEntries]);

  const allScheduledEntriesSorted = React.useMemo(() => {
    return [...scheduledEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [scheduledEntries]);

  const onSubmit = (values: ScheduleFormValues) => {
    addScheduledEntry(values);
    form.reset({
      ...values,
      startTime: '',
      endTime: '',
    });
  };

  return (
    <div className="p-4 space-y-4 animate-slide-up">
      <Card className="shadow-xl bg-white/95 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="font-headline text-xl">🗓️ Schedule Work Day</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Work Shift" className="text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full text-lg py-6" size="lg">Schedule</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl bg-white/95 backdrop-blur-md">
        <CardContent className="p-2 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ scheduled: scheduledDays }}
            modifiersStyles={{
              scheduled: { 
                fontWeight: 'bold',
                backgroundColor: 'hsl(var(--accent))',
                color: 'hsl(var(--accent-foreground))',
                borderRadius: 'var(--radius)'
              }
            }}
            className="w-full max-w-md"
          />
        </CardContent>
      </Card>
      
      {selectedDate && selectedDayEntries.length > 0 && (
        <Card className="shadow-xl bg-white/95 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="font-headline text-lg">
                    Scheduled on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {selectedDayEntries.map(entry => (
                        <li key={entry.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                            <div>
                              <p className="font-semibold">{entry.title}</p>
                              <p className="text-sm text-muted-foreground">{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</p>
                            </div>
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
                                    This will permanently delete the scheduled shift. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteScheduledEntry(entry.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      )}

      {allScheduledEntriesSorted.length > 0 && (
        <Card className="shadow-xl bg-white/95 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">All Scheduled Work Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {allScheduledEntriesSorted.map(entry => (
                <li key={entry.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-bold">{parseISO(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p className="font-semibold">{entry.title}</p>
                    <p className="text-sm text-muted-foreground">{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</p>
                  </div>
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
                          This will permanently delete the scheduled shift. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteScheduledEntry(entry.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
