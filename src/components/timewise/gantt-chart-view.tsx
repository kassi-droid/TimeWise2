
"use client";

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Rectangle } from 'recharts';
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
    const { x, y, width, height, payload } = props;
    const { entry, color } = payload;
    
    if (!entry) return null;

    // We need to calculate the y and height based on the entry's time
    const yAxisDomain = [6 * 60, 22 * 60]; // 6am to 10pm in minutes
    const yAxisHeight = y.range[0] - y.range[1]; // The pixel height of the y-axis

    const entryStart = timeToMinutes(entry.startTime);
    const entryEnd = timeToMinutes(entry.endTime);
    
    // Only render if the entry is within the visible time range
    if (entryEnd < yAxisDomain[0] || entryStart > yAxisDomain[1]) {
        return null;
    }

    const startPos = ((entryStart - yAxisDomain[0]) / (yAxisDomain[1] - yAxisDomain[0])) * yAxisHeight;
    const endPos = ((entryEnd - yAxisDomain[0]) / (yAxisDomain[1] - yAxisDomain[0])) * yAxisHeight;

    const barY = y.range[1] + startPos;
    const barHeight = Math.max(1, endPos - startPos); // Min height of 1px

    return <Rectangle x={x} y={barY} width={width} height={barHeight} fill={color} />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && payload[0].payload.entry) {
        const { entry } = payload[0].payload;
        return (
            <div className="bg-background p-2 border rounded-md shadow-lg">
                <p className="font-bold">{entry.title}</p>
                <p className="text-sm text-muted-foreground">{`${minutesToTime(timeToMinutes(entry.startTime))} - ${minutesToTime(timeToMinutes(entry.endTime))}`}</p>
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

        let flatData = scheduledEntries.map(entry => ({
            ...entry,
            dateObj: parseISO(entry.date + 'T00:00:00'),
            day: format(parseISO(entry.date + 'T00:00:00'), 'EEE'),
            color: colorScale(entry.title),
        }));

        return weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayEntries = flatData.filter(entry => entry.date === dateStr);
            
            // Recharts needs a placeholder value to render the bar cell.
            // We pass the actual entry data in the payload to the custom shape.
            return {
                name: format(day, 'EEE'),
                // We map each entry to its own object so recharts can render a bar for each
                ...dayEntries.map((entry, i) => ({ [`entry${i}`]: { entry: entry, color: entry.color }}))
                               .reduce((acc, val) => ({ ...acc, ...val }), {})
            };
        });
    }, [scheduledEntries, colorScale]);

    const bars = React.useMemo(() => {
        if (!chartData || chartData.length === 0) return [];
        const maxEntriesPerDay = chartData.reduce((max, day) => {
            return Math.max(max, Object.keys(day).filter(k => k.startsWith('entry')).length);
        }, 0);
        
        return Array.from({ length: maxEntriesPerDay }).map((_, i) => (
            <Bar
                key={`entry${i}`}
                dataKey={`entry${i}`}
                shape={<CustomBar />}
                // A dummy stackId to allow multiple bars per day.
                // But the custom shape handles absolute positioning, so they won't actually stack.
                stackId="a"
            >
            </Bar>
        ));
    }, [chartData]);
    
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
              domain={[6 * 60, 22 * 60]} // 6 AM to 10 PM
              ticks={yTicks}
              tickFormatter={yTickFormatter}
              reversed={true}
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
            {bars}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
