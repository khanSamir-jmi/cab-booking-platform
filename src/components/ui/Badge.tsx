import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  tone?: "neutral" | "active" | "success" | "alert";
  className?: string;
}

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-medium tracking-wide",
        tone === "neutral" && "bg-line/50 text-ink/70",
        tone === "active" && "bg-marigold/20 text-marigold-dark",
        tone === "success" && "bg-route/10 text-route",
        tone === "alert" && "bg-alert/10 text-alert",
        className
      )}
    >
      {children}
    </span>
  );
}
