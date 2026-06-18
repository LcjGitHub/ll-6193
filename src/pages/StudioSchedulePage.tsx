import { ChevronLeft, ChevronRight, LayoutGrid, Printer } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ApplicationDialog } from "@/components/ApplicationDialog";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import scheduleData from "@/mock/studio-schedule.json";
import type {
  ApplicationFormData,
  PendingCell,
  Room,
  ScheduleSlot,
  StudioScheduleData,
  WeeklyOccupancyStats,
} from "@/types/schedule";
import {
  TIME_SLOTS,
  addWeeks,
  buildCellKey,
  buildSlotMap,
  calculateWeeklyOccupancy,
  filterSlotsByKeyword,
  formatDayHeader,
  formatWeekLabel,
  getMockBaseWeek,
  getWeekDays,
  subWeeks,
  toDateKey,
} from "@/lib/schedule-utils";
import { cn } from "@/lib/utils";

const data = scheduleData as StudioScheduleData;

/**
 * 录音棚周视图排期页面。
 */
export function StudioSchedulePage() {
  const { rooms, slots: mockSlots } = data;
  const baseWeek = useMemo(() => getMockBaseWeek(mockSlots), [mockSlots]);
  const [weekAnchor, setWeekAnchor] = useState(baseWeek);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [localSlots, setLocalSlots] = useState<ScheduleSlot[]>([]);
  const [pendingCell, setPendingCell] = useState<PendingCell | null>(null);

  const allSlots = useMemo(() => [...mockSlots, ...localSlots], [mockSlots, localSlots]);

  const weekDays = useMemo(() => getWeekDays(weekAnchor), [weekAnchor]);
  const slotMap = useMemo(() => buildSlotMap(allSlots), [allSlots]);
  const stats = useMemo(
    () => calculateWeeklyOccupancy(allSlots, rooms, weekAnchor),
    [allSlots, rooms, weekAnchor]
  );

  const isSearching = searchKeyword.trim().length > 0;
  const filteredSlots = useMemo(
    () => filterSlotsByKeyword(allSlots, searchKeyword),
    [allSlots, searchKeyword]
  );
  const filteredSlotMap = useMemo(
    () => buildSlotMap(filteredSlots),
    [filteredSlots]
  );
  const hasSearchResults =
    !isSearching || weekDays.some((day) => {
      const dateKey = toDateKey(day);
      return TIME_SLOTS.some((t) =>
        rooms.some((r) => filteredSlotMap.has(`${dateKey}|${r.id}|${t.startTime}`))
      );
    });

  const handlePrevWeek = () => setWeekAnchor((d) => subWeeks(d, 1));
  const handleNextWeek = () => setWeekAnchor((d) => addWeeks(d, 1));

  const handleCellClick = useCallback(
    (date: string, roomId: string, startTime: string) => {
      const key = buildCellKey(date, roomId, startTime);
      const slot = slotMap.get(key);
      if (slot) {
        setSelectedSlot(slot);
        return;
      }
      const ts = TIME_SLOTS.find((t) => t.startTime === startTime);
      setPendingCell({
        date,
        roomId,
        startTime,
        endTime: ts ? ts.endTime : startTime,
      });
    },
    [slotMap]
  );

  const handleApplicationSubmit = useCallback(
    (cell: PendingCell, formData: ApplicationFormData) => {
      const newSlot: ScheduleSlot = {
        id: `local-${Date.now()}`,
        roomId: cell.roomId,
        date: cell.date,
        startTime: cell.startTime,
        endTime: cell.endTime,
        bookedBy: formData.bookedBy,
        projectName: formData.projectName,
        phone: formData.phone,
      };
      setLocalSlots((prev) => [...prev, newSlot]);
    },
    []
  );

  const selectedRoomName = selectedSlot
    ? rooms.find((r) => r.id === selectedSlot.roomId)?.name
    : undefined;
  const pendingRoomName = pendingCell
    ? rooms.find((r) => r.id === pendingCell.roomId)?.name
    : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">录音棚场次排期</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                3 房间 × 周视图 · 点击空闲时段可申请，点击已占用时段查看详情
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/rooms"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LayoutGrid className="h-4 w-4" />
                房间概览
              </Link>
              <Link
                to={`/preview?week=${format(weekAnchor, "yyyy-MM-dd")}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Printer className="h-4 w-4" />
                打印预览
              </Link>
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
          </div>
          <div className="flex justify-start sm:justify-end">
            <SearchInput value={searchKeyword} onChange={setSearchKeyword} />
          </div>
        </header>

        <WeeklyStatsCards stats={stats} />

        {!hasSearchResults && isSearching ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              未找到匹配「{searchKeyword.trim()}」的预约记录
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              请尝试其他关键字，或清空搜索恢复完整视图
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {weekDays.map((day) => (
              <DayGrid
                key={toDateKey(day)}
                date={day}
                rooms={rooms}
                slotMap={slotMap}
                filteredSlotMap={filteredSlotMap}
                onCellClick={handleCellClick}
                isSearching={isSearching}
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm border bg-muted/40" />
            空闲（点击申请）
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm border bg-primary/20 border-primary/40" />
            已占用（点击查看）
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm border bg-emerald-100 border-emerald-300" />
            本地申请
          </span>
          {isSearching && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm border bg-amber-200 ring-2 ring-amber-400" />
              搜索匹配
            </span>
          )}
        </div>
      </div>

      <BookingDialog
        slot={selectedSlot}
        roomName={selectedRoomName}
        open={selectedSlot !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSlot(null);
        }}
      />

      <ApplicationDialog
        cell={pendingCell}
        roomName={pendingRoomName}
        open={pendingCell !== null}
        onOpenChange={(open) => {
          if (!open) setPendingCell(null);
        }}
        onSubmit={handleApplicationSubmit}
      />
    </div>
  );
}

interface DayGridProps {
  date: Date;
  rooms: Room[];
  slotMap: Map<string, ScheduleSlot>;
  filteredSlotMap: Map<string, ScheduleSlot>;
  onCellClick: (date: string, roomId: string, startTime: string) => void;
  isSearching: boolean;
}

/**
 * 单日 Grid：行=时段，列=房间。
 * 搜索激活时仅在有匹配预约的日期渲染。
 */
function DayGrid({
  date,
  rooms,
  slotMap,
  filteredSlotMap,
  onCellClick,
  isSearching,
}: DayGridProps) {
  const dateKey = toDateKey(date);

  const hasMatch = TIME_SLOTS.some((t) =>
    rooms.some((r) => filteredSlotMap.has(`${dateKey}|${r.id}|${t.startTime}`))
  );

  if (isSearching && !hasMatch) return null;

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
            filteredSlotMap={filteredSlotMap}
            onCellClick={onCellClick}
            isLastRow={rowIdx === TIME_SLOTS.length - 1}
            isSearching={isSearching}
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
  filteredSlotMap: Map<string, ScheduleSlot>;
  onCellClick: (date: string, roomId: string, startTime: string) => void;
  isLastRow: boolean;
  isSearching: boolean;
}

function TimeSlotRow({
  dateKey,
  timeSlot,
  rooms,
  slotMap,
  filteredSlotMap,
  onCellClick,
  isLastRow,
  isSearching,
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
        const key = buildCellKey(dateKey, room.id, timeSlot.startTime);
        const occupied = slotMap.has(key);
        const slot = slotMap.get(key);
        const isLocal = slot ? slot.id.startsWith("local-") : false;
        const isMatch = filteredSlotMap.has(key);

        if (isSearching && !isMatch && occupied) {
          return (
            <div
              key={room.id}
              className={cn(
                "min-h-[44px] bg-primary/5",
                !isLastRow && "border-b",
                idx < rooms.length - 1 && "border-r"
              )}
            />
          );
        }

        if (isSearching && !isMatch && !occupied) {
          return (
            <div
              key={room.id}
              className={cn(
                "min-h-[44px] bg-background",
                !isLastRow && "border-b",
                idx < rooms.length - 1 && "border-r"
              )}
            />
          );
        }

        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onCellClick(dateKey, room.id, timeSlot.startTime)}
            className={cn(
              "min-h-[44px] p-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              !isLastRow && "border-b",
              idx < rooms.length - 1 && "border-r",
              occupied
                ? isSearching && isMatch
                  ? "cursor-pointer bg-amber-200 ring-2 ring-amber-400 hover:bg-amber-300"
                  : isLocal
                    ? "cursor-pointer bg-emerald-50 hover:bg-emerald-100"
                    : "cursor-pointer bg-primary/15 hover:bg-primary/25"
                : "cursor-pointer bg-muted/30 hover:bg-muted/50"
            )}
            aria-label={
              occupied && slot
                ? `${dateKey} ${room.name} ${timeSlot.startTime} ${slot.projectName} 已占用`
                : `${dateKey} ${room.name} ${timeSlot.startTime} 空闲，点击申请`
            }
          >
            {occupied && slot && (
              <span
                className={cn(
                  "block truncate px-1 text-xs font-medium",
                  isSearching && isMatch
                    ? "text-amber-900"
                    : isLocal
                      ? "text-emerald-700"
                      : "text-primary"
                )}
              >
                {slot.projectName}
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}

interface WeeklyStatsCardsProps {
  stats: WeeklyOccupancyStats;
}

function WeeklyStatsCards({ stats }: WeeklyStatsCardsProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
        本周占用统计
      </h2>
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="本周总预约"
          value={stats.totalBookings}
          unit="场次"
          variant="primary"
        />
        {stats.roomStats.map((roomStat) => (
          <StatCard
            key={roomStat.roomId}
            label={`${roomStat.roomName} 占用时段`}
            value={roomStat.occupiedSlots}
            unit="时段"
            variant="default"
          />
        ))}
      </div>
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  unit: string;
  variant?: "default" | "primary";
}

function StatCard({ label, value, unit, variant = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-sm",
        variant === "primary"
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card"
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 flex items-baseline gap-1">
        <span
          className={cn(
            "text-2xl font-bold",
            variant === "primary" ? "text-primary" : "text-foreground"
          )}
        >
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </p>
    </div>
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
          {slot.phone && (
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <dt className="text-muted-foreground">联系电话</dt>
              <dd className="font-medium">{slot.phone}</dd>
            </div>
          )}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
