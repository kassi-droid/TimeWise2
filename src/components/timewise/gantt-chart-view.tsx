
"use client";

import * as React from 'react';
import { scaleOrdinal } from 'd3-scale';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

import type { ScheduledEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import './gantt-chart-view.css';

interface GanttChartViewProps {
  scheduledEntries: ScheduledEntry[];
  selectedDate?: Date;
}

const START_HOUR = 6; // 6 AM
const END_HOUR = 22; // 10 PM

const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
};


export default function GanttChartView({ scheduledEntries, selectedDate }: GanttChartViewProps) {
    const allJobTitles = React.useMemo(() => 
        Array.from(new Set(scheduledEntries.map(e => e.title))), 
        [scheduledEntries]
    );

    const purpleScheme = ['#8A2BE2', ...schemeTableau10.filter(c => c !== '#8A2BE2')];

    const colorScale = React.useMemo(() => {
        const uniqueTitles = Array.from(new Set(scheduledEntries.map(e => e.title)));
        const domain = uniqueTitles.map(title => title === 'Work Shift' ? 'Work Shift' : title);
        const range = uniqueTitles.map(title => title === 'Work Shift' ? '#8A2BE2' : schemeTableau10[uniqueTitles.indexOf(title) % schemeTableau10.length]);
        
        const scale = scaleOrdinal<string, string>().domain(domain).range(range);
        
        // Ensure "Work Shift" is always purple if it exists
        if (uniqueTitles.includes('Work Shift')) {
            scale.domain([...scale.domain(), 'Work Shift']).range([...scale.range(), '#8A2BE2']);
        } else {
             // Fallback for other jobs to have different colors
            const otherTitles = allJobTitles.filter(t => t !== 'Work Shift');
            const otherColors = schemeTableau10.slice(0, otherTitles.length);
            scale.domain([...scale.domain(), ...otherTitles]).range([...scale.range(), ...otherColors]);
        }

        return scale;
    }, [scheduledEntries, allJobTitles]);

    const today = selectedDate || new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 }); // Saturday
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const timeLabels = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => {
        const hour = START_HOUR + i;
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const ampm = hour < 12 || hour === 24 ? 'AM' : 'PM';
        return `${displayHour} ${ampm}`;
    });

    const entriesByDay = React.useMemo(() => {
        const grouped: { [key: string]: ScheduledEntry[] } = {};
        for (const entry of scheduledEntries) {
            const entryDate = format(parseISO(entry.date + "T00:00:00"), 'yyyy-MM-dd');
            if (!grouped[entryDate]) {
                grouped[entryDate] = [];
            }
            grouped[entryDate].push(entry);
        }
        return grouped;
    }, [scheduledEntries]);
    
    const weekRangeString = `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d, yyyy')}`;

    return (
        <Card className="shadow-xl bg-white/95 backdrop-blur-md overflow-x-auto">
            <CardHeader>
                <CardTitle className="font-headline text-xl">🗓️ Week of {weekRangeString}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="gantt-chart-grid" style={{ gridTemplateRows: `40px repeat(${END_HOUR - START_HOUR}, 40px)` }}>
                    {/* Day Labels */}
                    <div style={{ gridColumn: 1 }}></div> {/* Blank corner */}
                    {weekDays.map(day => (
                        <div key={day.toString()} className="gantt-day-label">
                           <span>{format(day, 'EEE')}</span>
                           <span className="text-xs font-normal text-muted-foreground">{format(day, 'd')}</span>
                        </div>
                    ))}

                    {/* Time Labels & Grid Cells */}
                    {timeLabels.slice(0, -1).map((label, index) => (
                        <React.Fragment key={label}>
                            <div className="gantt-time-label" style={{ gridRow: index + 2 }}>
                                {label}
                            </div>
                        </React.Fragment>
                    ))}
                    
                    {/* Grid Lines */}
                    <div className="gantt-grid-lines" style={{gridRow: '2 / -1'}}>
                         {Array.from({ length: 7 * (END_HOUR - START_HOUR) }).map((_, i) => (
                            <div key={i} className="gantt-grid-row-line">
                                <div className="gantt-grid-line h-full"></div>
                            </div>
                        ))}
                    </div>

                    {/* Scheduled Blocks */}
                    {weekDays.map((day, dayIndex) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayEntries = entriesByDay[dateStr] || [];
                        return (
                            <div key={dateStr} style={{ gridColumn: dayIndex + 2, gridRow: '2 / -1', position: 'relative' }}>
                                {dayEntries.map(entry => {
                                    const startMinutes = timeToMinutes(entry.startTime);
                                    const endMinutes = timeToMinutes(entry.endTime);

                                    const top = ((startMinutes / 60) - START_HOUR) * 40;
                                    const height = ((endMinutes - startMinutes) / 60) * 40;

                                    if (height <= 0) return null;

                                    return (
                                        <div
                                            key={entry.id}
                                            className="gantt-block"
                                            style={{
                                                position: 'absolute',
                                                top: `${top}px`,
                                                height: `${height}px`,
                                                width: '100%',
                                                backgroundColor: colorScale(entry.title),
                                            }}
                                        >
                                           <div className="gantt-block-title">{entry.title}</div>
                                           <div className="gantt-block-time">{minutesToTime(startMinutes)} - {minutesToTime(endMinutes)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
                 <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
                  {allJobTitles.map((title) => (
                    <div key={title} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorScale(title) }} />
                      <span className="text-xs">{title}</span>
                    </div>
                  ))}
                </div>
            </CardContent>
        </Card>
    );
}
