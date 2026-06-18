import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import roomsConfig from "@/mock/rooms-config.json";
import type { Room } from "@/types/schedule";
import { cn } from "@/lib/utils";

const { rooms } = roomsConfig as { rooms: Room[] };

interface RoomCardProps {
  room: Room;
  index: number;
}

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

export function RoomsOverviewPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

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
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            返回排期首页
          </Button>
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
