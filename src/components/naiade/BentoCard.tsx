import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  padded?: boolean;
}

export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, title, eyebrow, meta, padded = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm transition-colors hover:border-border",
          className
        )}
        {...props}
      >
        {(title || eyebrow || meta) && (
          <div className="flex items-start justify-between gap-3 px-6 pt-5">
            <div className="flex flex-col gap-1">
              {eyebrow && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">
                  {eyebrow}
                </span>
              )}
              {title && <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>}
            </div>
            {meta && <div className="font-mono text-[10px] text-muted-foreground">{meta}</div>}
          </div>
        )}
        <div className={cn("flex-1", padded ? "p-6" : "")}>{children}</div>
      </div>
    );
  }
);
BentoCard.displayName = "BentoCard";
