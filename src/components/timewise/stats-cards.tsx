"use client";

import type { WorkEntry } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, BarChart3, DollarSign } from 'lucide-react';

interface StatsCardsProps {
  entries: WorkEntry[];
}

export default function StatsCards({ entries }: StatsCardsProps) {
  const stats = entries.reduce(
    (acc, entry) => {
      if (!entry.paid) {
        acc.pendingHours += entry.workHours;
        acc.unpaidEarnings += entry.earnings;
      }
      acc.totalRate += entry.hourlyRate;
      return acc;
    },
    { pendingHours: 0, unpaidEarnings: 0, totalRate: 0 }
  );

  const avgRate = entries.length > 0 ? stats.totalRate / entries.length : 0;

  const statItems = [
    {
      icon: <Clock className="w-8 h-8 text-blue-500" />,
      label: 'Pending Hours',
      value: `${stats.pendingHours.toFixed(1)}h`,
      color: 'text-blue-600',
    },
    {
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
      label: 'Unpaid',
      value: `$${stats.unpaidEarnings.toFixed(2)}`,
      color: 'text-green-600',
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
      label: 'Avg Rate',
      value: `$${avgRate.toFixed(2)}`,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {statItems.map((item, index) => (
        <Card key={index} className="text-center shadow-lg bg-white/95 backdrop-blur-md">
          <CardHeader className="p-3 items-center">
            {item.icon}
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xs text-gray-600">{item.label}</p>
            <p className={`font-bold ${item.color}`}>{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
