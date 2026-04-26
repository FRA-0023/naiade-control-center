import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  subtitle?: ReactNode;
  padded?: boolean;
}

export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, title, eyebrow, meta, subtitle, padded = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm transition-colors hover:border-border",
          "light:bg-card light:border-border light:shadow-sm light:backdrop-blur-0 light:hover:shadow-md",
          className
        )}
        {...props}
      >
        {(title || eyebrow || meta) && (
          <div className="flex flex-col gap-1.5 px-4 pt-4 md:px-6 md:pt-5">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
              <div className="flex min-w-0 flex-col gap-1">
                {eyebrow && (
                  <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground/80">
                    {eyebrow}
                  </span>
                )}
                {title && <h3 className="break-words">{title}</h3>}
              </div>
              {meta && (
                <div className="font-mono text-[10px] sm:text-[11px] text-muted-foreground">
                  {meta}
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm font-light leading-snug text-muted-foreground/80">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={cn("flex-1", padded ? "p-4 md:p-6" : "")}>{children}</div>
      </div>
    );
  }
);
BentoCard.displayName = "BentoCard";
