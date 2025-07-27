
export type WorkEntry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  lunchBreak: number;
  hourlyRate: number;
  workHours: number;
  earnings: number;
  paid: boolean;
};

export type ScheduledEntry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
};
