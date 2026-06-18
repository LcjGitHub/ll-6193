export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface ScheduleSlot {
  id: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  bookedBy: string;
  projectName: string;
}

export interface StudioScheduleData {
  rooms: Room[];
  slots: ScheduleSlot[];
}

export interface TimeSlotRow {
  startTime: string;
  endTime: string;
}

export interface CellKey {
  date: string;
  roomId: string;
  startTime: string;
}
