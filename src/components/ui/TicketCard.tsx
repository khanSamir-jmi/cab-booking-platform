import Link from "next/link";
import { cn } from "@/lib/utils";

interface TicketCardProps {
  /** Short route-style code shown on the stub, e.g. "OUT · 01" */
  code: string;
  title: string;
  description?: string;
  /** Rendered in the bottom-right of the card body, e.g. a price or CTA */
  footer?: React.ReactNode;
  href?: string;
  className?: string;
}

/**
 * Signature element of the "Transit Ticket" design system: a card styled
 * like a physical ticket stub, with a perforated divider and punch-hole
 * notches. Used for service selection, booking summaries, and confirmations
 * — every card in the app that represents "a trip" uses this component.
 */
export function TicketCard({
  code,
  title,
  description,
  footer,
  href,
  className,
}: TicketCardProps) {
  const sharedClassName = cn(
    "group relative flex overflow-hidden rounded-stub border border-line bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
    className
  );

  const content = (
    <>
      {/* Stub */}
      <div className="relative flex w-14 shrink-0 items-center justify-center bg-route">
        <span className="font-mono text-[11px] font-medium tracking-widest text-paper [writing-mode:vertical-rl]">
          {code}
        </span>
      </div>

      {/* Perforation divider with punch-hole notches */}
      <div className="relative w-px shrink-0">
        <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-paper" />
        <span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full bg-paper" />
        <span className="absolute inset-y-0 left-0 border-l border-dashed border-line" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div>
          <h3 className="font-display text-lg font-medium leading-snug text-ink">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-ink/60">{description}</p>
          )}
        </div>
        {footer && <div className="text-sm">{footer}</div>}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={sharedClassName}>
        {content}
      </Link>
    );
  }

  return <div className={sharedClassName}>{content}</div>;
}
