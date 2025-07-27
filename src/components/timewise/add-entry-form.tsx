"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { WorkEntry } from '@/types';

const formSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  lunchBreak: z.coerce.number().min(0).default(0),
  hourlyRate: z.coerce.number().positive('Rate must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEntryFormProps {
  onAddEntry: (entry: Omit<WorkEntry, 'id' | 'paid'>) => void;
}

const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

export default function AddEntryForm({ onAddEntry }: AddEntryFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      lunchBreak: 30,
      hourlyRate: 15.00,
    },
  });

  useEffect(() => {
    const savedRate = localStorage.getItem('timewise-defaultHourlyRate');
    if (savedRate) {
      form.setValue('hourlyRate', parseFloat(savedRate));
    }
  }, [form]);

  const onSubmit = (values: FormValues) => {
    localStorage.setItem('timewise-defaultHourlyRate', values.hourlyRate.toString());
    
    const startMinutes = timeToMinutes(values.startTime);
    const endMinutes = timeToMinutes(values.endTime);

    let totalMinutes = endMinutes - startMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handles overnight shifts

    const workMinutes = totalMinutes - values.lunchBreak;
    const workHours = workMinutes / 60;
    const earnings = workHours * values.hourlyRate;

    onAddEntry({ ...values, workHours, earnings });

    form.reset({
      ...form.getValues(),
      startTime: '',
      endTime: '',
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
