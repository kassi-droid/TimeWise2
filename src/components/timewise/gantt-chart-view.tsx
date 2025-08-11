
"use client";

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, parseISO } from 'date-fns';
import { scaleOrdinal } from 'd3-scale';
import { schemeTableau10 } from 'd3-scale-chromatic';

import type { ScheduledEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GanttChartViewProps {
  scheduledEntries: ScheduledEntry[];
}

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

// This component will render a single scheduled block
const CustomBar = (props: any) => {
    const { x, y, width, height, payload, value } = props;
    
    // In this setup, `value` is the array of entries for the day
    if (!value || value.length === 0) {
      return null;
    }

    const yAxisDomain = [6 * 60, 22 * 60]; // 6am to 10pm in minutes
    
    return (
      <g>
        {value.map((item: any, index: number) => {
            const { entry, color } = item;
            
            const entryStart = timeToMinutes(entry.startTime);
            const entryEnd = timeToMinutes(entry.endTime);

            // Using the y-scale function passed implicitly via the y prop
            const barY = y(entryStart);
            const barEndY = y(entryEnd);
            const barHeight = Math.abs(barY - barEndY);

            // Only render if the entry is within the visible time range
            if (entryEnd < yAxisDomain[0] || entryStart > yAxisDomain[1] || barHeight <= 0) {
                return null;
            }

            return (
                <rect 
                    key={index}
                    x={x} 
                    y={barY}
                    width={width} 
                    height={barHeight}
                    fill={color} 
                />
            );
        })}
      </g>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && payload[0].payload.entries) {
        const { entries } = payload[0].payload;
        // Tooltip can't easily determine which specific bar is hovered in a group
        // So we just show all entries for that day.
        return (
            <div className="bg-background p-2 border rounded-md shadow-lg">
                <p className="font-bold mb-2">{label}</p>
                {entries.map((item: any) => (
                    <div key={item.entry.id} className="text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <div>
                            <p className="font-semibold">{item.entry.title}</p>
                            <p className="text-muted-foreground">{`${minutesToTime(timeToMinutes(item.entry.startTime))} - ${minutesToTime(timeToMinutes(item.entry.endTime))}`}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};


export default function GanttChartView({ scheduledEntries }: GanttChartViewProps) {
    
    const allJobTitles = React.useMemo(() => 
        Array.from(new Set(scheduledEntries.map(e => e.title))), 
    [scheduledEntries]);

    const colorScale = React.useMemo(() => 
        scaleOrdinal(schemeTableau10).domain(allJobTitles),
    [allJobTitles]);

    const chartData = React.useMemo(() => {
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
        const end = endOfWeek(today, { weekStartsOn: 0 }); // Saturday
        const weekDays = eachDayOfInterval({ start, end });

        return weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayEntries = scheduledEntries
                .filter(entry => entry.date === dateStr)
                .map(entry => ({
                    entry,
                    color: colorScale(entry.title),
                }));
            
            return {
                name: format(day, 'EEE'),
                entries: dayEntries,
            };
        });
    }, [scheduledEntries, colorScale]);
    
    const yTicks = Array.from({ length: 17 }, (_, i) => (i + 6) * 60); // 6 AM to 10 PM
    const yTickFormatter = (value: number) => minutesToTime(value);

  return (
    <Card className="shadow-xl bg-white/95 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="font-headline text-xl">🗓️ This Week's Schedule</CardTitle>
      </CardHeader>
      <CardContent style={{ height: '500px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tickLine={false}
              axisLine={false}
              scale="band" // Important for categorical data
            />
            <YAxis
              type="number"
              domain={[22 * 60, 6 * 60]} // Reversed: 10 PM to 6 AM
              ticks={yTicks}
              tickFormatter={yTickFormatter}
              width={80}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}/>
            <Legend
              content={() => (
                <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
                  {allJobTitles.map((title) => (
                    <div key={title} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorScale(title) }} />
                      <span className="text-xs">{title}</span>
                    </div>
                  ))}
                </div>
              )}
              wrapperStyle={{ bottom: -5 }}
            />
            <Bar dataKey="entries" shape={<CustomBar />} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
