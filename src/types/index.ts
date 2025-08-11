
export type WorkEntry = {
  id: string;
  jobTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  lunchBreak: number;
  hourlyRate: number;
  workHours: number;
  earnings: number;
  paid: boolean;
  datePaid?: string;
};

export type ScheduledEntry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
};
