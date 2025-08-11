
"use client";

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Rectangle } from 'recharts';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';
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

export default function GanttChartView({ scheduledEntries }: GanttChartViewProps) {
  const chartData = React.useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
    const end = endOfWeek(today, { weekStartsOn: 0 }); // Saturday
    const weekDays = eachDayOfInterval({ start, end });

    return weekDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayEntries = scheduledEntries
        .filter(entry => entry.date === dateStr)
        .map((entry, index) => ({
          ...entry,
          timeRange: [timeToMinutes(entry.startTime), timeToMinutes(entry.endTime)],
          y: timeToMinutes(entry.startTime),
          height: timeToMinutes(entry.endTime) - timeToMinutes(entry.startTime),
          // Add a dynamic key for Recharts to treat it as a separate series
          [`entry${index}`]: [timeToMinutes(entry.startTime), timeToMinutes(entry.endTime) - timeToMinutes(entry.startTime)],
        }));
      
      const dayData: { name: string, [key: string]: any } = { name: format(day, 'EEE') };
      dayEntries.forEach((entry, index) => {
        dayData[`entry${index}`] = entry[`entry${index}`];
        dayData[`entry${index}_title`] = entry.title;
      });
      return dayData;
    });

  }, [scheduledEntries]);
  
  const allJobTitles = React.useMemo(() => 
    Array.from(new Set(scheduledEntries.map(e => e.title))), 
  [scheduledEntries]);

  const colorScale = React.useMemo(() => 
    scaleOrdinal(schemeTableau10).domain(allJobTitles),
  [allJobTitles]);
  
  const maxEntriesPerDay = React.useMemo(() => 
    chartData.reduce((max, day) => Math.max(max, Object.keys(day).filter(k => k.startsWith('entry')).length / 2), 0),
  [chartData]);


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const titleKey = `${data.dataKey}_title`;
      const title = data.payload[titleKey];
      const [start, duration] = data.value;
      const end = start + duration;

      return (
        <div className="bg-background p-2 border rounded-md shadow-lg">
          <p className="font-bold">{title}</p>
          <p className="text-sm text-muted-foreground">{`${minutesToTime(start)} - ${minutesToTime(end)}`}</p>
        </div>
      );
    }
    return null;
  };

  const yTicks = Array.from({ length: 17 }, (_, i) => (i + 6) * 60); // 6 AM to 10 PM
  const yTickFormatter = (value: number) => minutesToTime(value);

  const CustomBar = (props: any) => {
    const { fill, x, y, width, height, payload, dataKey } = props;
    if (!height || height <= 0) return null;
    
    const titleKey = `${dataKey}_title`;
    const title = payload[titleKey];
    const barColor = colorScale(title);

    return <Rectangle {...props} fill={barColor} />;
  };


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
            {
              Array.from({ length: maxEntriesPerDay }).map((_, index) => (
                 <Bar 
                  key={`bar-${index}`} 
                  dataKey={`entry${index}`} 
                  stackId="a"
                  shape={<CustomBar />}
                 />
              ))
            }
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
