
'use client';

import { useState } from 'react';
import type { CalendarJob } from '@/app/page';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { GanttChart } from './GanttChart';

interface CalendarTabProps {
  jobs: CalendarJob[];
  jobTitles: string[];
  onAddJob: (job: Omit<CalendarJob, 'id'>) => void;
  onDeleteJob: (id: number) => void;
}

// Helper to get the start of the week (Sunday)
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

export function CalendarTab({ jobs, jobTitles, onAddJob, onDeleteJob }: CalendarTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const jobsByDate = jobs.reduce((acc, job) => {
    (acc[job.date] = acc[job.date] || []).push(job);
    return acc;
  }, {} as Record<string, CalendarJob[]>);

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingJobs = jobs
    .filter(job => job.date >= todayStr)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  const selectedDateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
  const jobsForSelectedDate = selectedDateStr ? jobsByDate[selectedDateStr] || [] : [];

  const startOfWeek = getStartOfWeek(selectedDate || new Date());
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    return date;
  });

  const weekJobs = jobs.filter(job => {
    const jobDate = new Date(`${job.date}T00:00:00`); // Use local time
    jobDate.setHours(0,0,0,0); // Normalize time
    const weekStart = new Date(week[0]);
    weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(week[6]);
    weekEnd.setHours(0,0,0,0);
    return jobDate >= weekStart && jobDate <= weekEnd;
  });

  const datesWithJobs = Object.keys(jobsByDate).map(dateStr => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  });

  return (
    <div className="space-y-6">
      <ScheduleJobForm jobTitles={jobTitles} onAddJob={onAddJob} />
      
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-xl border bg-gradient-to-br from-pastel-purple to-purple-light p-0"
          classNames={{
              day_selected: "bg-purple-medium text-white",
              day_today: "bg-purple-dark/80 text-white",
              day_outside: "text-muted-foreground opacity-50",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              day_disabled: "text-muted-foreground opacity-50",
              cell: "relative",
              head_cell: "text-purple-dark font-semibold",
              nav_button: "text-purple-dark",
          }}
          modifiers={{
            hasJobs: datesWithJobs,
          }}
          modifiersClassNames={{
            hasJobs: "bg-purple-medium/50 text-purple-dark font-bold",
          }}
        />
      </div>
      
      {selectedDate && (
        <div className="pt-4">
          <h3 className="font-semibold text-purple-dark mb-2">Jobs for {selectedDate.toLocaleDateString()}</h3>
          {jobsForSelectedDate.length > 0 ? (
            <div className="space-y-2">
              {jobsForSelectedDate.map(job => (
                <JobCard key={job.id} job={job} onDelete={onDeleteJob} />
              ))}
            </div>
          ) : (
             <p className="text-purple-medium text-center py-2">No jobs for this day</p>
          )}
        </div>
      )}

      <GanttChart jobs={weekJobs} week={week} jobTitles={jobTitles} />

      <div>
        <h3 className="font-semibold text-purple-dark mb-2">Upcoming Jobs</h3>
        <div className="space-y-2">
          {upcomingJobs.length > 0 ? (
            upcomingJobs.map(job => (
              <JobCard key={job.id} job={job} onDelete={onDeleteJob} />
            ))
          ) : (
            <p className="text-purple-medium text-center py-4">No upcoming jobs</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ScheduleJobFormProps {
  jobTitles: string[];
  onAddJob: (job: Omit<CalendarJob, 'id'>) => void;
}

function ScheduleJobForm({ jobTitles, onAddJob }: ScheduleJobFormProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !date || !startTime || !endTime) {
      alert('Please fill all fields to schedule a job.');
      return;
    }
    onAddJob({ jobTitle, date, startTime, endTime });
    // Reset form
    setJobTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('');
    setEndTime('');
  };

  return (
    <div className="bg-gradient-to-br from-pastel-purple to-purple-light p-4 rounded-xl mb-4">
      <h3 className="font-semibold text-purple-dark mb-3">Schedule New Job</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Select onValueChange={setJobTitle} value={jobTitle} required>
            <SelectTrigger className="w-full p-2 border-2 border-purple-light rounded-lg focus:border-purple-medium outline-none">
                <SelectValue placeholder="Select job title" />
            </SelectTrigger>
            <SelectContent>
                {jobTitles.map(title => (
                    <SelectItem key={title} value={title}>{title}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <div>
          <Label className="block text-purple-dark font-medium mb-1">Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required 
                 className="w-full p-2 border-2 border-purple-light rounded-lg focus:border-purple-medium outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="block text-purple-dark font-medium mb-1">Start Time</Label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required
                   className="p-2 border-2 border-purple-light rounded-lg focus:border-purple-medium outline-none" />
          </div>
          <div>
            <Label className="block text-purple-dark font-medium mb-1">End Time</Label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required
                   className="p-2 border-2 border-purple-light rounded-lg focus:border-purple-medium outline-none" />
          </div>
        </div>
        <Button type="submit" className="w-full bg-purple-medium hover:bg-purple-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors h-auto">
          Schedule Job
        </Button>
      </form>
    </div>
  );
}

const JobCard = ({ job, onDelete }: { job: CalendarJob, onDelete: (id: number) => void }) => (
    <div className="bg-gradient-to-br from-pastel-purple to-purple-light p-3 rounded-lg flex justify-between items-center">
        <div>
            <div className="font-semibold text-purple-dark">{job.jobTitle}</div>
            <div className="text-sm text-purple-medium">{new Date(`${job.date}T00:00:00`).toLocaleDateString()} &bull; {job.startTime} - {job.endTime}</div>
        </div>
        <Button onClick={() => onDelete(job.id)} variant="ghost" size="icon" className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
    </div>
);
