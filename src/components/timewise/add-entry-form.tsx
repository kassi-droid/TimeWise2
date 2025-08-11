
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { WorkEntry } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  otherJobTitle: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  lunchBreak: z.coerce.number().min(0).default(0),
  hourlyRate: z.coerce.number().positive('Rate must be positive'),
}).refine(data => {
    if (data.jobTitle === 'Other') {
        return !!data.otherJobTitle && data.otherJobTitle.length > 0;
    }
    return true;
}, {
    message: 'Please specify the job title',
    path: ['otherJobTitle'],
});


type FormValues = z.infer<typeof formSchema>;

interface AddEntryFormProps {
  onAddEntry: (entry: Omit<WorkEntry, 'id' | 'paid'>) => void;
  entries: WorkEntry[];
}

const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const defaultJobTitles = [
  "Babysitting Kennedy",
  "Work for Mom",
  "Miss Sharon",
  "Mamaw",
];

const JOB_TITLES_STORAGE_KEY = 'timewise-jobTitles';

export default function AddEntryForm({ onAddEntry, entries }: AddEntryFormProps) {
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [jobTitleOptions, setJobTitleOptions] = useState(defaultJobTitles);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          jobTitle: '',
          otherJobTitle: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          endTime: '',
          lunchBreak: 30,
          hourlyRate: 15.00,
        },
    });

    useEffect(() => {
        try {
            const storedTitles = localStorage.getItem(JOB_TITLES_STORAGE_KEY);
            if (storedTitles) {
                setJobTitleOptions(JSON.parse(storedTitles));
            } else {
                setJobTitleOptions(defaultJobTitles);
            }
        } catch (error) {
            console.warn('Could not read job titles from localStorage:', error);
            setJobTitleOptions(defaultJobTitles);
        }
    }, []);

    const selectedJobTitle = form.watch('jobTitle');

    useEffect(() => {
        setIsOtherSelected(selectedJobTitle === 'Other');
    }, [selectedJobTitle]);

    useEffect(() => {
        const savedRate = localStorage.getItem('timewise-defaultHourlyRate');
        if (savedRate) {
            form.setValue('hourlyRate', parseFloat(savedRate));
        }
        const savedTitle = localStorage.getItem('timewise-defaultJobTitle');
        if (savedTitle && (jobTitleOptions.includes(savedTitle) || defaultJobTitles.includes(savedTitle))) {
            form.setValue('jobTitle', savedTitle);
        }
    }, [form, jobTitleOptions]);

    const onSubmit = (values: FormValues) => {
        let finalJobTitle = values.jobTitle;

        if (values.jobTitle === 'Other' && values.otherJobTitle) {
            finalJobTitle = values.otherJobTitle;
            if (!jobTitleOptions.includes(finalJobTitle)) {
                const updatedTitles = [...jobTitleOptions, finalJobTitle];
                setJobTitleOptions(updatedTitles);
                try {
                    localStorage.setItem(JOB_TITLES_STORAGE_KEY, JSON.stringify(updatedTitles));
                } catch (error) {
                    console.warn('Could not save job titles to localStorage:', error);
                }
            }
        }

        localStorage.setItem('timewise-defaultHourlyRate', values.hourlyRate.toString());
        if (values.jobTitle !== 'Other') {
            localStorage.setItem('timewise-defaultJobTitle', values.jobTitle);
        }
        
        const startMinutes = timeToMinutes(values.startTime);
        const endMinutes = timeToMinutes(values.endTime);

        let totalMinutes = endMinutes - startMinutes;
        if (totalMinutes < 0) totalMinutes += 24 * 60; // Handles overnight shifts

        const workMinutes = totalMinutes - values.lunchBreak;
        const workHours = workMinutes / 60;
        const earnings = workHours * values.hourlyRate;

        onAddEntry({ ...values, jobTitle: finalJobTitle, workHours, earnings });

        form.reset({
            ...form.getValues(),
            startTime: '',
            endTime: '',
            otherJobTitle: '',
            jobTitle: finalJobTitle !== 'Other' ? finalJobTitle : '',
        });
    };

    return (
        <div className="p-4 animate-slide-up">
        <Card className="bg-white/95 backdrop-blur-md shadow-xl">
            <CardHeader>
            <CardTitle className="font-headline text-xl">📝 Add Work Entry</CardTitle>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>💼 Job Title</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="text-base">
                            <SelectValue placeholder="Select a job" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {jobTitleOptions.map(title => (
                            <SelectItem key={title} value={title}>{title}</SelectItem>
                            ))}
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                {isOtherSelected && (
                    <FormField
                        control={form.control}
                        name="otherJobTitle"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Custom Job Title</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter the job title" className="text-base" autoFocus/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>📅 Date</FormLabel>
                        <FormControl>
                        <Input type="date" {...field} className="text-base" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>🌅 Start Time</FormLabel>
                        <FormControl>
                            <Input type="time" {...field} className="text-base" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>🌇 End Time</FormLabel>
                        <FormControl>
                            <Input type="time" {...field} className="text-base" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="lunchBreak"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>🍽️ Lunch (min)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} placeholder="30" className="text-base" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>💰 Rate ($)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} placeholder="15.00" className="text-base" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                
                <Button type="submit" className="w-full text-lg py-6" size="lg">Add Entry</Button>
                </form>
            </Form>
            </CardContent>
        </Card>
        </div>
    );
}
