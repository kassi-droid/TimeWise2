
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ScheduledEntry } from '@/types';

interface CalendarViewProps {
  scheduledEntries: ScheduledEntry[];
  addScheduledEntry: (newEntry: Omit<ScheduledEntry, 'id'>) => void;
}

const scheduleFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export default function CalendarView({ scheduledEntries, addScheduledEntry }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      title: 'Work Shift',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
    },
  });

  const scheduledDays = React.useMemo(() => {
    return scheduledEntries.map(entry => {
      // The `entry.date` is 'YYYY-MM-DD'. We need to parse it as UTC to avoid timezone issues.
      const [year, month, day] = entry.date.split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    });
  }, [scheduledEntries]);
  
  const selectedDayEntries = React.useMemo(() => {
    if (!selectedDate) return [];
    // Format selectedDate to 'YYYY-MM-DD' to match the entry date format
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    return scheduledEntries
      .filter(entry => entry.date === selectedDateString)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, scheduledEntries]);

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
            className="w-full max-w-md" // Set max-width to control calendar size
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
                        <li key={entry.id} className="p-3 bg-secondary rounded-lg">
                            <p className="font-semibold">{entry.title}</p>
                            <p className="text-sm text-muted-foreground">{entry.startTime} - {entry.endTime}</p>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
