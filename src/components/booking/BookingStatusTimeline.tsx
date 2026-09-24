import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/database.types";

const STEPS: { key: BookingStatus; label: string }[] = [
  { key: "requested", label: "Requested" },
  { key: "confirmed", label: "Confirmed" },
  { key: "driver_assigned", label: "Driver Assigned" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
];

export function BookingStatusTimeline({ status }: { status: BookingStatus }) {
  if (status === "cancelled") {
    return (
      <p className="rounded-stub bg-alert/10 px-4 py-3 text-sm font-medium text-alert">
        This booking was cancelled.
      </p>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <ol>
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "h-3 w-3 shrink-0 rounded-full border-2",
                  done ? "border-route bg-route" : "border-line bg-white"
                )}
              />
              {!isLast && (
                <span
                  className={cn(
                    "w-px flex-1",
                    i < currentIndex ? "bg-route" : "bg-line"
                  )}
                  style={{ minHeight: "1.5rem" }}
                />
              )}
            </div>
            <p
              className={cn(
                "-mt-0.5 pb-6 text-sm font-medium",
                done ? "text-ink" : "text-ink/40"
              )}
            >
              {step.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
