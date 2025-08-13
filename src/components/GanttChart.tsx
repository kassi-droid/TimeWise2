
'use client';

import type { CalendarJob } from '@/app/page';

interface GanttChartProps {
  jobs: CalendarJob[];
  week: Date[];
  jobTitles: string[];
}

const jobColors = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', 
  '#F44336', '#E91E63', '#673AB7', '#009688',
  '#FFC107', '#795548', '#607D8B', '#3F51B5'
];

const getJobColor = (jobTitle: string, allTitles: string[]) => {
  const index = allTitles.indexOf(jobTitle);
  return jobColors[index % jobColors.length] || 'gray';
};

const startHour = 6;
const endHour = 22; // 10 PM
const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function GanttChart({ jobs, week, jobTitles }: GanttChartProps) {

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-purple-dark mb-3">📅 Weekly Schedule</h3>
      <div 
        className="grid relative border border-gray-300" 
        style={{ 
          gridTemplateColumns: '80px repeat(7, 1fr)', 
          gridTemplateRows: `60px repeat(${hours.length}, 40px)` 
        }}
      >
        {/* Day Labels (Header) */}
        <div className="day bg-gray-100 border-b border-gray-300"></div>
        {week.map((date, index) => (
            <div key={index} className="day bg-gray-100 border-b border-r border-gray-300 text-center font-bold pt-2">
                <div>{daysOfWeek[index]}</div>
                <div className="text-xs font-normal">{date.getDate()}</div>
            </div>
        ))}

        {/* Time Labels & Grid Cells */}
        {hours.map(hour => (
          <div key={hour} className="contents">
            <div className="time bg-gray-100 border-b border-r border-gray-300 flex items-center justify-center text-xs">
              {`${(hour % 12) || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`}
            </div>
            {daysOfWeek.map(day => <div key={`${day}-${hour}`} className="cell border border-gray-200"></div>)}
          </div>
        ))}

        {/* Job Blocks */}
        {jobs.map(job => {
          const [startH, startM] = job.startTime.split(':').map(Number);
          const [endH, endM] = job.endTime.split(':').map(Number);

          // Fix for timezone issue: parse date string as local time.
          // The 'T00:00' ensures it's parsed as midnight local time, not UTC.
          const jobDate = new Date(`${job.date}T00:00`);
          const dayIndex = jobDate.getDay();

          const top = ((startH + startM / 60) - startHour) * 40 + 60; // +60 for header
          const height = ((endH + endM / 60) - (startH + startM / 60)) * 40;

          if (height <= 0) return null;

          return (
            <div
              key={job.id}
              className="absolute text-white p-1 text-xs rounded-md opacity-90 overflow-hidden"
              style={{
                top: `${top}px`,
                height: `${height}px`,
                left: `calc((100% - 80px) / 7 * ${dayIndex} + 80px)`,
                width: `calc((100% - 80px) / 7)`,
                backgroundColor: getJobColor(job.jobTitle, jobTitles),
              }}
            >
              {job.jobTitle}
              <div className="text-[10px]">{job.startTime} - {job.endTime}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
