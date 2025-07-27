
"use client";

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkEntry } from '@/types';
import { addDays, parseISO } from 'date-fns';

interface CalendarViewProps {
  entries: WorkEntry[];
}

export default function CalendarView({ entries }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const scheduledDays = React.useMemo(() => {
    return entries.map(entry => {
      // The `parseISO` function doesn't handle timezone offsets well from just a date string.
      // `new Date(entry.date)` creates a date at midnight UTC.
      // We add a day to correct for this and display it properly in the user's local timezone on the calendar.
      const date = new Date(entry.date);
      return addDays(date,1);
    });
  }, [entries]);
  
  const selectedDayEntries = React.useMemo(() => {
    if (!selectedDate) return [];
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    return entries
      .filter(entry => entry.date === selectedDateString)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, entries]);

  return (
    <div className="p-4 space-y-4 animate-slide-up">
      <Card className="shadow-xl bg-white/95 backdrop-blur-md">
        <CardContent className="p-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ scheduled: scheduledDays }}
            modifiersStyles={{
              scheduled: { 
                fontWeight: 'bold',
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                borderRadius: 'var(--radius)'
              }
            }}
            className="w-full"
          />
        </CardContent>
      </Card>
      
      {selectedDate && selectedDayEntries.length > 0 && (
        <Card className="shadow-xl bg-white/95 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="font-headline text-lg">
                    Work on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {selectedDayEntries.map(entry => (
                        <li key={entry.id} className="p-3 bg-secondary rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{entry.startTime} - {entry.endTime}</p>
                                <p className="text-sm text-muted-foreground">({entry.workHours.toFixed(1)} hrs)</p>
                            </div>
                            <div className="font-bold text-green-600">
                                +${entry.earnings.toFixed(2)}
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      )}

      {selectedDate && selectedDayEntries.length === 0 && (
         <Card className="shadow-xl bg-white/95 backdrop-blur-md text-center">
            <CardContent className="p-6">
                 <p className="text-muted-foreground">No work scheduled for this day.</p>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
