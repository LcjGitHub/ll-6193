import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import scheduleData from "@/mock/studio-schedule.json";
import type { Room, ScheduleSlot, StudioScheduleData } from "@/types/schedule";
import {
  TIME_SLOTS,
  addWeeks,
  buildSlotMap,
  formatDayHeader,
  formatWeekLabel,
  getMockBaseWeek,
  getWeekDays,
  isSlotOccupied,
  subWeeks,
  toDateKey,
} from "@/lib/schedule-utils";
import { cn } from "@/lib/utils";

const data = scheduleData as StudioScheduleData;

/**
 * 录音棚周视图排期页面。
 */
export function StudioSchedulePage() {
  const { rooms, slots } = data;
  const baseWeek = useMemo(() => getMockBaseWeek(slots), [slots]);
  const [weekAnchor, setWeekAnchor] = useState(baseWeek);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);

  const weekDays = useMemo(() => getWeekDays(weekAnchor), [weekAnchor]);
  const slotMap = useMemo(() => buildSlotMap(slots), [slots]);

  const handlePrevWeek = () => setWeekAnchor((d) => subWeeks(d, 1));
  const handleNextWeek = () => setWeekAnchor((d) => addWeeks(d, 1));

  const handleCellClick = (
    date: string,
    roomId: string,
    startTime: string
  ) => {
    const slot = slotMap.get(`${date}|${roomId}|${startTime}`);
    if (slot) setSelectedSlot(slot);
  };

  const roomName = selectedSlot
    ? rooms.find((r) => r.id === selectedSlot.roomId)?.name
    : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">录音棚场次排期</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              3 房间 × 周视图 · 点击已占用时段查看详情
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevWeek}
              aria-label="上一周"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[220px] text-center text-sm font-medium">
              {formatWeekLabel(weekAnchor)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextWeek}
              aria-label="下一周"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="space-y-6">
          {weekDays.map((day) => (
            <DayGrid
              key={toDateKey(day)}
              date={day}
              rooms={rooms}
              slotMap={slotMap}
              onCellClick={handleCellClick}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm border bg-muted/40" />
            空闲
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm border bg-primary/20 border-primary/40" />
            已占用（可点击）
          </span>
        </div>
      </div>

      <BookingDialog
        slot={selectedSlot}
        roomName={roomName}
        open={selectedSlot !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSlot(null);
        }}
      />
    </div>
  );
}

interface DayGridProps {
  date: Date;
  rooms: Room[];
  slotMap: Map<string, ScheduleSlot>;
  onCellClick: (date: string, roomId: string, startTime: string) => void;
}

/**
 * 单日 Grid：行=时段，列=房间。
 */
function DayGrid({ date, rooms, slotMap, onCellClick }: DayGridProps) {
  const dateKey = toDateKey(date);

  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <h2 className="border-b bg-muted/60 px-4 py-2 text-sm font-semibold">
        {formatDayHeader(date)}
      </h2>
      <div
        className="grid text-sm"
        style={{
          gridTemplateColumns: `88px repeat(${rooms.length}, 1fr)`,
        }}
      >
        <div className="border-b border-r bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
          时段
        </div>
        {rooms.map((room) => (
          <div
            key={room.id}
            className="border-b border-r px-3 py-2 text-center text-xs font-medium last:border-r-0"
          >
            {room.name}
          </div>
        ))}

        {TIME_SLOTS.map((timeSlot, rowIdx) => (
          <TimeSlotRow
            key={timeSlot.startTime}
            dateKey={dateKey}
            timeSlot={timeSlot}
            rooms={rooms}
            slotMap={slotMap}
            onCellClick={onCellClick}
            isLastRow={rowIdx === TIME_SLOTS.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

interface TimeSlotRowProps {
  dateKey: string;
  timeSlot: { startTime: string; endTime: string };
  rooms: Room[];
  slotMap: Map<string, ScheduleSlot>;
  onCellClick: (date: string, roomId: string, startTime: string) => void;
  isLastRow: boolean;
}

function TimeSlotRow({
  dateKey,
  timeSlot,
  rooms,
  slotMap,
  onCellClick,
  isLastRow,
}: TimeSlotRowProps) {
  return (
    <>
      <div
        className={cn(
          "border-r bg-muted/30 px-3 py-3 text-xs text-muted-foreground",
          !isLastRow && "border-b"
        )}
      >
        {timeSlot.startTime}
        <span className="text-muted-foreground/60"> – {timeSlot.endTime}</span>
      </div>
      {rooms.map((room, idx) => {
        const occupied = isSlotOccupied(
          slotMap,
          dateKey,
          room.id,
          timeSlot.startTime
        );
        const slot = slotMap.get(`${dateKey}|${room.id}|${timeSlot.startTime}`);

        return (
          <button
            key={room.id}
            type="button"
            disabled={!occupied}
            onClick={() => onCellClick(dateKey, room.id, timeSlot.startTime)}
            className={cn(
              "min-h-[44px] p-1 text-left transition-colors",
              !isLastRow && "border-b",
              idx < rooms.length - 1 && "border-r",
              occupied
                ? "cursor-pointer bg-primary/15 hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                : "cursor-default bg-background"
            )}
            aria-label={
              occupied
                ? `${dateKey} ${room.name} ${timeSlot.startTime} 已占用`
                : `${dateKey} ${room.name} ${timeSlot.startTime} 空闲`
            }
          >
            {occupied && slot && (
              <span className="block truncate px-1 text-xs font-medium text-primary">
                {slot.projectName}
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}

interface BookingDialogProps {
  slot: ScheduleSlot | null;
  roomName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 预约详情 Dialog。
 */
function BookingDialog({
  slot,
  roomName,
  open,
  onOpenChange,
}: BookingDialogProps) {
  if (!slot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>预约详情</DialogTitle>
          <DialogDescription>
            {slot.date} · {slot.startTime} – {slot.endTime}
            {roomName ? ` · ${roomName}` : ""}
          </DialogDescription>
        </DialogHeader>
        <dl className="grid gap-3 text-sm">
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <dt className="text-muted-foreground">预约人</dt>
            <dd className="font-medium">{slot.bookedBy}</dd>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <dt className="text-muted-foreground">项目名</dt>
            <dd className="font-medium">{slot.projectName}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
