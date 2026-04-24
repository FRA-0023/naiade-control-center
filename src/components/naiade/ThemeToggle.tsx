import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  collapsed = false,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          className
        )}
      >
        {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group relative flex w-full items-center justify-between gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        className
      )}
    >
      <span className="flex items-center gap-1.5">
        {isDark ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      </span>
      <span
        className={cn(
          "relative h-3 w-6 rounded-full border border-sidebar-border bg-background/40 transition-colors",
          isDark ? "bg-sidebar-accent" : "bg-primary/30"
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary transition-all duration-300",
            isDark ? "left-0.5" : "left-[calc(100%-0.625rem)]"
          )}
        />
      </span>
    </button>
  );
}
