export interface RoomOverview {
  id: string;
  name: string;
  capacity: number;
  equipment: string;
}

export interface RoomsConfigData {
  rooms: RoomOverview[];
}
