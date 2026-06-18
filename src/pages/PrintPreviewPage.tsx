import { ArrowLeft, Printer } from "lucide-react";
import { parseISO } from "date-fns";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import scheduleData from "@/mock/studio-schedule.json";
import type { PrintPreviewData, StudioScheduleData } from "@/types/schedule";
import {
  buildPrintPreviewData,
  getMockBaseWeek,
} from "@/lib/schedule-utils";
import { cn } from "@/lib/utils";

const data = scheduleData as StudioScheduleData;

export function PrintPreviewPage() {
  const { rooms, slots } = data;
  const [searchParams] = useSearchParams();
  const weekParam = searchParams.get("week");

  const weekAnchor = useMemo(() => {
    if (weekParam) {
      try {
        return parseISO(weekParam);
      } catch {
        return getMockBaseWeek(slots);
      }
    }
    return getMockBaseWeek(slots);
  }, [weekParam, slots]);

  const previewData: PrintPreviewData = useMemo(
    () => buildPrintPreviewData(slots, rooms, weekAnchor),
    [slots, rooms, weekAnchor]
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回排期页
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {previewData.weekLabel}
            </span>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              打印预览
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 print:max-w-none print:px-0 print:py-4">
        <div className="print:text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight print:text-3xl">
            录音棚排期周报表
          </h1>
          <p className="mt-2 text-muted-foreground print:text-base">
            {previewData.weekLabel}
          </p>
        </div>

        <div className="space-y-6 print:space-y-4">
          {previewData.days.map((day) => (
            <section
              key={day.date}
              className="overflow-hidden rounded-lg border bg-card shadow-sm print:rounded-none print:shadow-none print:break-inside-avoid"
            >
              <div className="border-b bg-muted/60 px-4 py-2 print:px-2 print:py-1.5">
                <h2 className="text-sm font-semibold print:text-base">
                  {day.weekDay} · {day.dateLabel}
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm print:text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="w-24 border-r px-3 py-2 text-left font-medium text-muted-foreground print:w-20 print:px-2 print:py-1">
                        时段
                      </th>
                      {day.rooms.map((room) => (
                        <th
                          key={room.roomId}
                          className="border-r px-3 py-2 text-center font-medium text-muted-foreground last:border-r-0 print:px-2 print:py-1"
                        >
                          {room.roomName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.timeSlots.map((timeSlot, rowIdx) => (
                      <tr
                        key={timeSlot.startTime}
                        className={cn(
                          "border-b last:border-b-0",
                          rowIdx % 2 === 0 && "bg-background"
                        )}
                      >
                        <td className="border-r px-3 py-2 text-xs text-muted-foreground print:px-2 print:py-1.5">
                          <div>{timeSlot.startTime}</div>
                          <div className="text-muted-foreground/60">
                            – {timeSlot.endTime}
                          </div>
                        </td>
                        {day.rooms.map((room) => {
                          const cell = room.slots.find(
                            (s) => s.startTime === timeSlot.startTime
                          );
                          return (
                            <td
                              key={room.roomId}
                              className={cn(
                                "border-r px-2 py-1.5 align-top last:border-r-0 print:px-1.5",
                                cell?.isOccupied
                                  ? "bg-primary/5"
                                  : "bg-muted/10"
                              )}
                            >
                              {cell?.isOccupied ? (
                                <div className="text-xs">
                                  <div className="font-medium text-primary print:text-foreground">
                                    {cell.projectName}
                                  </div>
                                  <div className="text-muted-foreground mt-0.5">
                                    预约人：{cell.bookedBy}
                                  </div>
                                  {cell.phone && (
                                    <div className="text-muted-foreground">
                                      电话：{cell.phone}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground/40 italic">
                                  空闲
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground print:mt-4 print:justify-center">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm border bg-muted/10" />
            空闲
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm border bg-primary/5 border-primary/20" />
            已占用
          </span>
        </div>
      </div>
    </div>
  );
}
