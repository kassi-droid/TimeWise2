
"use client";

import type { WorkEntry } from '@/types';
import StatsCards from './stats-cards';
import WorkLogTable from './work-log-table';

interface SpreadsheetViewProps {
  entries: WorkEntry[];
  deleteEntry: (id: string) => void;
  togglePaidStatus: (id: string) => void;
}

export default function SpreadsheetView({ entries, deleteEntry, togglePaidStatus }: SpreadsheetViewProps) {
  const pendingEntries = entries.filter(e => !e.paid).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const paidEntries = entries.filter(e => e.paid).sort((a, b) => {
    const dateA = a.datePaid ? new Date(a.datePaid) : new Date(0);
    const dateB = b.datePaid ? new Date(b.datePaid) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  const groupedPaidEntries = paidEntries.reduce((acc, entry) => {
    const paidDate = entry.datePaid || 'unknown';
    if (!acc[paidDate]) {
      acc[paidDate] = [];
    }
    acc[paidDate].push(entry);
    return acc;
  }, {} as Record<string, WorkEntry[]>);

  const paidPeriods = Object.entries(groupedPaidEntries).sort(([dateA], [dateB]) => {
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="p-4 space-y-6">
      <StatsCards entries={entries} />
      
      <WorkLogTable
        title="⏳ Pending Work Log"
        titleClassName="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        entries={pendingEntries}
        isPaidLog={false}
        deleteEntry={deleteEntry}
        togglePaidStatus={togglePaidStatus}
        emptyState={{
            icon: "⏳",
            message: "No pending entries",
            description: "All caught up!",
        }}
      />

      {paidPeriods.length > 0 ? (
        paidPeriods.map(([datePaid, periodEntries], index) => (
          <WorkLogTable
            key={datePaid}
            title={`✅ Paid Period ${paidPeriods.length - index}`}
            titleClassName="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            entries={periodEntries}
            isPaidLog={true}
            deleteEntry={deleteEntry}
            togglePaidStatus={togglePaidStatus}
            emptyState={{
                icon: "💰",
                message: "No paid entries yet",
                description: "Mark entries as paid to see them here!",
            }}
          />
        ))
      ) : (
        <WorkLogTable
            title="✅ Paid Work Log"
            titleClassName="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            entries={[]}
            isPaidLog={true}
            deleteEntry={deleteEntry}
            togglePaidStatus={togglePaidStatus}
            emptyState={{
                icon: "💰",
                message: "No paid entries yet",
                description: "Mark entries as paid to see them here!",
            }}
        />
      )}
    </div>
  );
}
