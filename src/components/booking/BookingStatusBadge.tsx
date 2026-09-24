import { Badge } from "@/components/ui/Badge";
import type { BookingStatus } from "@/types/database.types";

const STATUS_LABEL: Record<BookingStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  driver_assigned: "Driver Assigned",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<
  BookingStatus,
  "neutral" | "active" | "success" | "alert"
> = {
  requested: "neutral",
  confirmed: "active",
  driver_assigned: "active",
  ongoing: "active",
  completed: "success",
  cancelled: "alert",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
