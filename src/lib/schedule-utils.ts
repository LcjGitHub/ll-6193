import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import type {
  CellKey,
  PrintPreviewData,
  PrintPreviewDay,
  Room,
  ScheduleSlot,
  TimeSlotRow,
  WeeklyOccupancyStats,
  RoomOccupancyStat,
} from "@/types/schedule";

/** 每日营业时段（09:00–17:00，每小时一格） */
export const TIME_SLOTS: TimeSlotRow[] = [
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "10:00", endTime: "11:00" },
  { startTime: "11:00", endTime: "12:00" },
  { startTime: "12:00", endTime: "13:00" },
  { startTime: "13:00", endTime: "14:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "15:00", endTime: "16:00" },
  { startTime: "16:00", endTime: "17:00" },
];

/**
 * 获取指定日期所在周的起止日期（周一至周日）。
 */
export function getWeekRange(anchorDate: Date) {
  const start = startOfWeek(anchorDate, { weekStartsOn: 1 });
  const end = endOfWeek(anchorDate, { weekStartsOn: 1 });
  return { start, end };
}

/**
 * 获取周区间内的所有日期。
 */
export function getWeekDays(anchorDate: Date): Date[] {
  const { start, end } = getWeekRange(anchorDate);
  return eachDayOfInterval({ start, end });
}

/**
 * 格式化周标题，如「2026年6月16日 – 6月22日」。
 */
export function formatWeekLabel(anchorDate: Date): string {
  const { start, end } = getWeekRange(anchorDate);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = format(start, "yyyy年M月d日", { locale: zhCN });
  const endLabel = sameMonth
    ? format(end, "d日", { locale: zhCN })
    : format(end, "M月d日", { locale: zhCN });
  return `${startLabel} – ${endLabel}`;
}

/**
 * 格式化日期列头，如「周一 6/16」。
 */
export function formatDayHeader(date: Date): string {
  return format(date, "EEE M/d", { locale: zhCN });
}

/**
 * 将日期格式化为 ISO 日期字符串（yyyy-MM-dd）。
 */
export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * 构建单元格唯一键。
 */
export function buildCellKey(
  date: string,
  roomId: string,
  startTime: string
): string {
  return `${date}|${roomId}|${startTime}`;
}

/**
 * 解析单元格键。
 */
export function parseCellKey(key: string): CellKey {
  const [date, roomId, startTime] = key.split("|");
  return { date, roomId, startTime };
}

/**
 * 判断某时段是否被预约占用。
 */
export function isSlotOccupied(
  slotMap: Map<string, ScheduleSlot>,
  date: string,
  roomId: string,
  startTime: string
): boolean {
  return slotMap.has(buildCellKey(date, roomId, startTime));
}

/**
 * 将预约列表索引为单元格 Map。
 */
export function buildSlotMap(slots: ScheduleSlot[]): Map<string, ScheduleSlot> {
  const map = new Map<string, ScheduleSlot>();
  for (const slot of slots) {
    map.set(buildCellKey(slot.date, slot.roomId, slot.startTime), slot);
  }
  return map;
}

/**
 * 获取 Mock 数据的基准周（数据中最早预约所在周）。
 */
export function getMockBaseWeek(slots: ScheduleSlot[]): Date {
  if (slots.length === 0) {
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }
  const earliest = slots.reduce(
    (min, s) => (s.date < min ? s.date : min),
    slots[0].date
  );
  return startOfWeek(parseISO(earliest), { weekStartsOn: 1 });
}

/**
 * 获取当前周的锚点日期（今天所在周的周一）。
 */
export function getCurrentWeekAnchor(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 });
}

/**
 * 判断指定日期是否为今天。
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return today.getTime() === target.getTime();
}

/**
 * 判断指定日期所在周是否为当前周（包含今天）。
 */
export function isCurrentWeek(anchorDate: Date): boolean {
  const { start, end } = getWeekRange(anchorDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = new Date(start);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(end);
  endOfDay.setHours(23, 59, 59, 999);
  return today >= startOfDay && today <= endOfDay;
}

export { addWeeks, subWeeks };

/**
 * 根据关键字筛选预约记录。
 * 匹配预约人姓名（bookedBy）或项目名称（projectName）中包含关键字的预约。
 * 不区分大小写。
 *
 * @param slots - 所有预约记录
 * @param keyword - 搜索关键字，为空时返回全部记录
 * @returns 匹配的预约记录数组
 */
export function filterSlotsByKeyword(
  slots: ScheduleSlot[],
  keyword: string
): ScheduleSlot[] {
  const trimmed = keyword.trim();
  if (!trimmed) return slots;
  const lower = trimmed.toLowerCase();
  return slots.filter(
    (slot) =>
      slot.bookedBy.toLowerCase().includes(lower) ||
      slot.projectName.toLowerCase().includes(lower)
  );
}

/**
 * 计算单个预约记录跨越的时段数量。
 * 根据 TIME_SLOTS 定义的时段粒度，按开始/结束时间匹配索引并计数。
 */
function countOccupiedSlotsForSlot(slot: ScheduleSlot): number {
  const startIdx = TIME_SLOTS.findIndex((t) => t.startTime === slot.startTime);
  const endIdx = TIME_SLOTS.findIndex((t) => t.endTime === slot.endTime);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return 0;
  return endIdx - startIdx + 1;
}

/**
 * 计算指定周的占用统计数据。
 *
 * @param slots - 所有预约记录
 * @param rooms - 所有房间列表
 * @param weekAnchor - 目标周的锚点日期（该周内任意一天均可）
 * @returns 本周统计结果，包含总预约场次、总占用时段以及各房间占用时段数
 */
export function calculateWeeklyOccupancy(
  slots: ScheduleSlot[],
  rooms: Room[],
  weekAnchor: Date
): WeeklyOccupancyStats {
  const weekDays = getWeekDays(weekAnchor);
  const weekDateKeys = weekDays.map((d) => toDateKey(d));

  const weekSlots = slots.filter((slot) => weekDateKeys.includes(slot.date));

  const totalBookings = weekSlots.length;

  const roomStatMap = new Map<string, RoomOccupancyStat>();
  for (const room of rooms) {
    roomStatMap.set(room.id, {
      roomId: room.id,
      roomName: room.name,
      occupiedSlots: 0,
    });
  }

  let totalOccupiedSlots = 0;
  for (const slot of weekSlots) {
    const slotCount = countOccupiedSlotsForSlot(slot);
    totalOccupiedSlots += slotCount;
    const stat = roomStatMap.get(slot.roomId);
    if (stat) {
      stat.occupiedSlots += slotCount;
    }
  }

  return {
    totalBookings,
    totalOccupiedSlots,
    roomStats: Array.from(roomStatMap.values()),
  };
}

/**
 * 将指定周次的排期数据整理为打印预览所需的结构化数据。
 *
 * 按天分组，每天包含所有房间在各个时段的占用情况，
 * 每个单元格标注是否被预约、对应的项目名称、预约人及联系电话。
 *
 * @param slots - 所有预约记录（包括本地申请的预约）
 * @param rooms - 所有房间列表
 * @param weekAnchor - 目标周的锚点日期（该周内任意一天均可）
 * @returns 结构化的打印预览数据，包含周标签、按天分组的房间时段占用表
 */
export function buildPrintPreviewData(
  slots: ScheduleSlot[],
  rooms: Room[],
  weekAnchor: Date
): PrintPreviewData {
  const weekDays = getWeekDays(weekAnchor);
  const slotMap = buildSlotMap(slots);
  const weekLabel = formatWeekLabel(weekAnchor);

  const days: PrintPreviewDay[] = weekDays.map((date) => {
    const dateKey = toDateKey(date);
    const dateLabel = format(date, "M月d日", { locale: zhCN });
    const weekDay = format(date, "EEEE", { locale: zhCN });

    const dayRooms = rooms.map((room) => {
      const daySlots = TIME_SLOTS.map((timeSlot) => {
        const key = buildCellKey(dateKey, room.id, timeSlot.startTime);
        const slot = slotMap.get(key);

        return {
          roomId: room.id,
          roomName: room.name,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          bookedBy: slot?.bookedBy ?? "",
          projectName: slot?.projectName ?? "",
          phone: slot?.phone,
          notes: slot?.notes,
          isOccupied: !!slot,
        };
      });

      return {
        roomId: room.id,
        roomName: room.name,
        slots: daySlots,
      };
    });

    return {
      date: dateKey,
      dateLabel,
      weekDay,
      rooms: dayRooms,
    };
  });

  return {
    weekLabel,
    days,
    timeSlots: TIME_SLOTS,
  };
}

const LOCAL_SLOTS_KEY = "studio-schedule-local-slots";

/**
 * 从 localStorage 读取本地申请的预约记录。
 * 如果不存在或解析失败，返回空数组。
 */
export function loadLocalSlots(): ScheduleSlot[] {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(LOCAL_SLOTS_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ScheduleSlot[];
  } catch {
    return [];
  }
}

/**
 * 将本地申请的预约记录保存到 localStorage。
 */
export function saveLocalSlots(slots: ScheduleSlot[]): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_SLOTS_KEY, JSON.stringify(slots));
    }
  } catch {
    // 忽略存储错误
  }
}
