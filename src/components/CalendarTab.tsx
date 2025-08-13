
'use client';

import { useState } from 'react';
import type { CalendarJob } from '@/app/page';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface CalendarTabProps {
  jobs: CalendarJob[];
  jobTitles: string[];
  onAddJob: (job: Omit<CalendarJob, 'id'>) => void;
  onDeleteJob: (id: number) => void;
}

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

  return (
    <div className="space-y-6">
      <ScheduleJobForm jobTitles={jobTitles} onAddJob={onAddJob} />
      
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-xl border bg-gradient-to-br from-pastel-purple to-purple-light p-0"
        classNames={{
            day_selected: "bg-purple-medium text-white",
            day_today: "bg-purple-dark/80 text-white",
            cell: "relative",
        }}
        components={{
            DayContent: (props) => {
                const dateStr = props.date.toISOString().split('T')[0];
                const hasJobs = jobsByDate[dateStr] && jobsByDate[dateStr].length > 0;
                return (
                    <div className="relative">
                        {props.date.getDate()}
                        {hasJobs && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-purple-medium"></div>}
                    </div>
                );
            }
        }}
      />

      {selectedDate && jobsForSelectedDate.length > 0 && (
        <div>
          <h3 className="font-semibold text-purple-dark mb-2">Jobs for {selectedDate.toLocaleDateString()}</h3>
          <div className="space-y-2">
            {jobsForSelectedDate.map(job => (
              <JobCard key={job.id} job={job} onDelete={onDeleteJob} />
            ))}
          </div>
        </div>
      )}

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
            <div className="text-sm text-purple-medium">{new Date(job.date).toLocaleDateString()} &bull; {job.startTime} - {job.endTime}</div>
        </div>
        <Button onClick={() => onDelete(job.id)} variant="ghost" size="icon" className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
    </div>
);
