
"use client";

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, parse } from 'date-fns';
import { scaleOrdinal } from 'd3-scale';
import { schemeTableau10 } from 'd3-scale-chromatic';

import type { ScheduledEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GanttChartViewProps {
  scheduledEntries: ScheduledEntry[];
}

const timeToMinutes = (timeStr: string) => {
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

export default function GanttChartView({ scheduledEntries }: GanttChartViewProps) {
  const chartData = React.useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
    const end = endOfWeek(today, { weekStartsOn: 0 }); // Saturday
    const weekDays = eachDayOfInterval({ start, end });

    const data = weekDays.map(day => ({
      name: format(day, 'EEE'),
      date: format(day, 'yyyy-MM-dd'),
    }));

    const entriesByDay: { [key: string]: any[] } = {};

    scheduledEntries.forEach(entry => {
      if (!entriesByDay[entry.date]) {
        entriesByDay[entry.date] = [];
      }
      entriesByDay[entry.date].push({
        ...entry,
        timeRange: [timeToMinutes(entry.startTime), timeToMinutes(entry.endTime)],
      });
    });
    
    return data.map(day => ({
      ...day,
      entries: entriesByDay[day.date] || [],
    }));

  }, [scheduledEntries]);
  
  const allJobTitles = React.useMemo(() => 
    Array.from(new Set(scheduledEntries.map(e => e.title))), 
  [scheduledEntries]);

  const colorScale = React.useMemo(() => 
    scaleOrdinal(schemeTableau10).domain(allJobTitles),
  [allJobTitles]);


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const parentPayload = payload[0].payload;
      const entryIndex = parseInt(payload[0].dataKey.split('.')[1]);
      const entry = parentPayload.entries[entryIndex];
      
      if (!entry) return null;

      return (
        <div className="bg-background p-2 border rounded-md shadow-lg">
          <p className="font-bold">{entry.title}</p>
          <p className="text-sm">{`${format(parse(entry.date, 'yyyy-MM-dd', new Date()), 'MMMM d')}`}</p>
          <p className="text-sm text-muted-foreground">{`${minutesToTime(entry.timeRange[0])} - ${minutesToTime(entry.timeRange[1])}`}</p>
        </div>
      );
    }
    return null;
  };

  const yTicks = Array.from({ length: 18 }, (_, i) => (i + 6) * 60); // 6 AM to 11 PM
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
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            barCategoryGap={20}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="category" 
              dataKey="name" 
              orientation="bottom"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="number"
              domain={[6 * 60, 24 * 60]} // 6 AM to Midnight
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
            {
              chartData[0]?.entries.map((_, index) => (
                <Bar key={`bar-${index}`} dataKey={`entries[${index}].timeRange`} stackId="a" fill="#8884d8">
                  {chartData.map((dayData, dayIndex) => {
                    const entry = dayData.entries[index];
                    const color = entry ? colorScale(entry.title) : 'transparent';
                    return <Cell key={`cell-${dayIndex}`} fill={color} />;
                  })}
                </Bar>
              ))
            }
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
