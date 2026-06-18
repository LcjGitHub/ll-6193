import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ApplicationFormData, PendingCell } from "@/types/schedule";

interface ApplicationDialogProps {
  cell: PendingCell | null;
  roomName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (cell: PendingCell, data: ApplicationFormData) => void;
}

/**
 * 空闲时段申请 Dialog。
 */
export function ApplicationDialog({
  cell,
  roomName,
  open,
  onOpenChange,
  onSubmit,
}: ApplicationDialogProps) {
  const [form, setForm] = useState<ApplicationFormData>({
    bookedBy: "",
    projectName: "",
    phone: "",
    notes: "",
  });

  const resetAndClose = () => {
    setForm({ bookedBy: "", projectName: "", phone: "", notes: "" });
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cell) return;
    if (!form.bookedBy.trim() || !form.projectName.trim() || !form.phone.trim()) return;
    onSubmit(cell, { ...form });
    resetAndClose();
  };

  if (!cell) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>空闲时段申请</DialogTitle>
          <DialogDescription>
            {cell.date} · {cell.startTime} – {cell.endTime}
            {roomName ? ` · ${roomName}` : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 text-sm">
          <div className="grid gap-1.5">
            <label htmlFor="app-bookedBy" className="text-sm font-medium">
              预约人姓名
            </label>
            <input
              id="app-bookedBy"
              type="text"
              required
              value={form.bookedBy}
              onChange={(e) => setForm((f) => ({ ...f, bookedBy: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="请输入预约人姓名"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="app-projectName" className="text-sm font-medium">
              项目名称
            </label>
            <input
              id="app-projectName"
              type="text"
              required
              value={form.projectName}
              onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="请输入项目名称"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="app-phone" className="text-sm font-medium">
              联系电话
            </label>
            <input
              id="app-phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="请输入联系电话"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="app-notes" className="text-sm font-medium">
              备注
            </label>
            <textarea
              id="app-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="选填，可补充特殊需求"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose}>
              取消
            </Button>
            <Button type="submit">提交申请</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
