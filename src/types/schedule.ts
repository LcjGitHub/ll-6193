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
  notes?: string;
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
  notes: string;
}

export interface PendingCell {
  date: string;
  roomId: string;
  startTime: string;
  endTime: string;
}

export interface PrintPreviewCell {
  roomId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  bookedBy: string;
  projectName: string;
  phone?: string;
  notes?: string;
  isOccupied: boolean;
}

export interface PrintPreviewDay {
  date: string;
  dateLabel: string;
  weekDay: string;
  rooms: {
    roomId: string;
    roomName: string;
    slots: PrintPreviewCell[];
  }[];
}

export interface PrintPreviewData {
  weekLabel: string;
  days: PrintPreviewDay[];
  timeSlots: TimeSlotRow[];
}
