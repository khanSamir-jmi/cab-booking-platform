import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-stub text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-5 py-2.5 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          variant === "primary" &&
            "bg-route text-paper hover:bg-route-dark",
          variant === "secondary" &&
            "border border-line bg-white text-ink hover:bg-paper",
          variant === "ghost" && "text-ink hover:bg-line/40",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
