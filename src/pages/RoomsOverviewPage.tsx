import { ArrowLeft, Users } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import roomsConfig from "@/mock/rooms-config.json";
import type { RoomOverview, RoomsConfigData } from "@/types/rooms";
import { cn } from "@/lib/utils";

const rooms = (roomsConfig as RoomsConfigData).rooms;

interface RoomCardProps {
  room: RoomOverview;
  index: number;
}

/**
 * 房间卡片组件。
 */
function RoomCard({ room, index }: RoomCardProps) {
  const gradients = [
    "from-primary/20 to-primary/5",
    "from-blue-500/20 to-blue-500/5",
    "from-emerald-500/20 to-emerald-500/5",
  ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-card shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "h-3 bg-gradient-to-r",
          gradients[index % gradients.length]
        )}
      />
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-xl font-bold">{room.name}</h3>
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>容纳 {room.capacity} 人</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {room.equipment}
        </p>
      </div>
    </div>
  );
}

/**
 * 录音棚房间概览页面。
 */
export function RoomsOverviewPage() {
  useEffect(() => {
    document.title = "房间概览";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">房间概览</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {rooms.length} 个录音棚 · 查看房间详情与设备配置
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" />
            返回排期首页
          </Link>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
