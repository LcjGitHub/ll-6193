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
  phone?: string;
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

export interface RoomOccupancyStat {
  roomId: string;
  roomName: string;
  occupiedSlots: number;
}

export interface WeeklyOccupancyStats {
  totalBookings: number;
  totalOccupiedSlots: number;
  roomStats: RoomOccupancyStat[];
}

export interface ApplicationFormData {
  bookedBy: string;
  projectName: string;
  phone: string;
}

export interface PendingCell {
  date: string;
  roomId: string;
  startTime: string;
  endTime: string;
}
