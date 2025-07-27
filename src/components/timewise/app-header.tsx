"use client";

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import type { WorkEntry } from '@/types';

interface AppHeaderProps {
  entries: WorkEntry[];
}

export default function AppHeader({ entries }: AppHeaderProps) {
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayEarnings = entries
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + entry.earnings, 0);

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-lg px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center">
          <Clock className="text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold font-headline text-gray-800">TimeWise</h1>
          <p className="text-xs text-gray-500">{currentDate}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-500">Today's Earnings</div>
        <div className="text-sm font-bold text-green-600">${todayEarnings.toFixed(2)}</div>
      </div>
    </header>
  );
}
