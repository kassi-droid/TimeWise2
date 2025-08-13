
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WorkEntry } from '@/app/page';

interface NewEntryFormProps {
  jobTitles: string[];
  onAddEntry: (entry: Omit<WorkEntry, 'id'>) => void;
}

export function NewEntryForm({ jobTitles, onAddEntry }: NewEntryFormProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakTime, setBreakTime] = useState('0');
  const [hourlyRate, setHourlyRate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !workDate || !startTime || !endTime || !hourlyRate) {
      alert('Please fill out all required fields.');
      return;
    }

    const start = new Date(`${workDate}T${startTime}`);
    const end = new Date(`${workDate}T${endTime}`);
    
    let hoursWorked = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (hoursWorked < 0) {
      hoursWorked += 24; // Handle overnight shifts
    }
    hoursWorked -= (parseInt(breakTime) || 0) / 60;
    hoursWorked = Math.max(0, hoursWorked);

    const rate = parseFloat(hourlyRate);
    const totalPay = hoursWorked * rate;

    onAddEntry({
      jobTitle,
      date: workDate,
      startTime,
      endTime,
      breakTime: parseInt(breakTime) || 0,
      hourlyRate: rate,
      hoursWorked,
      totalPay,
      status: 'pending',
    });
    
    // Reset form
    setJobTitle('');
    setWorkDate(new Date().toISOString().split('T')[0]);
    setStartTime('');
    setEndTime('');
    setBreakTime('0');
    setHourlyRate('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="job-title" className="block text-purple-dark font-medium mb-2">Job Title</Label>
        <Select onValueChange={setJobTitle} value={jobTitle} required>
            <SelectTrigger id="job-title" className="w-full p-3 border-2 border-purple-light rounded-xl focus:border-purple-medium outline-none">
                <SelectValue placeholder="Select job title" />
            </SelectTrigger>
            <SelectContent>
                {jobTitles.map(title => (
                    <SelectItem key={title} value={title}>{title}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="work-date" className="block text-purple-dark font-medium mb-2">Work Date</Label>
        <Input type="date" id="work-date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} required 
               className="w-full p-3 border-2 border-purple-light rounded-xl focus:border-purple-medium outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-time" className="block text-purple-dark font-medium mb-2">Start Time</Label>
          <Input type="time" id="start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required
                 className="w-full p-3 border-2 border-purple-light rounded-xl focus:border-purple-medium outline-none" />
        </div>
        <div>
          <Label htmlFor="end-time" className="block text-purple-dark font-medium mb-2">End Time</Label>
          <Input type="time" id="end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required
                 className="w-full p-3 border-2 border-purple-light rounded-xl focus:border-purple-medium outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="break-time" className="block text-purple-dark font-medium mb-2">Break (min)</Label>
          <Input type="number" id="break-time" value={breakTime} onChange={(e) => setBreakTime(e.target.value)} min="0" placeholder="0"
                 className="w-full p-3 border-2 border-purple-light rounded-xl focus:border-purple-medium outline-none" />
        </div>
        <div>
          <Label htmlFor="hourly-rate" className="block text-purple-dark font-medium mb-2">Hourly Rate ($)</Label>
          <Input type="number" id="hourly-rate" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} min="0" step="0.01" placeholder="15.00" required
                 className="w-full p-3 border-2 border-purple-light rounded-xl focus:border-purple-medium outline-none" />
        </div>
      </div>

      <Button type="submit" className="w-full bg-purple-medium hover:bg-purple-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors h-auto">
        Add Entry
      </Button>
    </form>
  );
}
