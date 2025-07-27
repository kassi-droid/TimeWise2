
"use client";

import { cn } from '@/lib/utils';
import { Plus, BarChart3, CalendarDays } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const navItems = [
    { id: 'add', label: 'Add Entry', icon: Plus },
    { id: 'spreadsheet', label: 'Spreadsheet', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-2 z-10">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 w-24 h-16 rounded-2xl transition-colors duration-200",
                isActive ? 'bg-primary text-primary-foreground' : 'text-gray-600 hover:bg-primary/50'
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
