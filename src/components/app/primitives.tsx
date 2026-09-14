import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { FEATURE_CLASS, PRIORITY_COLOR, type FeatureColor } from "@/lib/categories";
import { Button } from "@/components/ui/button";

/* ---------- Icons ---------- */

export function FeatureIcon({
  icon: Icon,
  color,
  size = "md",
  className,
}: {
  icon: LucideIcon;
  color: FeatureColor;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box = size === "sm" ? "h-9 w-9 rounded-xl" : size === "lg" ? "h-14 w-14 rounded-2xl" : "h-11 w-11 rounded-2xl";
  const ic = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
  return (
    <div className={cn(FEATURE_CLASS[color], "grid shrink-0 place-items-center bg-feature-soft text-feature", box, className)}>
      <Icon className={ic} />
    </div>
  );
}

export function DirChevron({ className }: { className?: string }) {
  const { dir } = useI18n();
  const C = dir === "rtl" ? ChevronLeft : ChevronRight;
  return <C className={cn("h-4 w-4 text-muted-foreground", className)} />;
}

export function BackChevron({ className }: { className?: string }) {
  const { dir } = useI18n();
  const C = dir === "rtl" ? ChevronRight : ChevronLeft;
  return <C className={cn("h-5 w-5", className)} />;
}

/* ---------- Page chrome ---------- */

export function PageHeader({
  title,
  subtitle,
  icon,
  color = "blue",
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  color?: FeatureColor;
  action?: ReactNode;
  back?: LinkProps["to"];
}) {
  return (
    <header className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 animate-fade-up">
      <div className="flex min-w-0 items-center gap-3">
        {back ? (
          <Button asChild variant="ghost" size="icon" aria-label="back" className="-ms-2 shrink-0">
            <Link to={back}>
              <BackChevron />
            </Link>
          </Button>
        ) : icon ? (
          <FeatureIcon icon={icon} color={color} />
        ) : null}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function EmptyState({
  icon: Icon,
  color = "blue",
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  color?: FeatureColor;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center px-6 py-12 text-center animate-pop">
      <FeatureIcon icon={Icon} color={color} size="lg" />
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {body ? <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="surface h-20 animate-pulse" />
      ))}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="surface flex flex-col items-center px-6 py-10 text-center">
      <p className="text-sm text-muted-foreground">{t("errors.loadFailed")}</p>
      <Button variant="soft" size="sm" className="mt-4" onClick={onRetry}>
        {t("errors.retry")}
      </Button>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{children}</h2>
      {action}
    </div>
  );
}

/* ---------- Badges ---------- */

export function Pill({ color, children, className }: { color: FeatureColor; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        FEATURE_CLASS[color],
        "inline-flex items-center gap-1 rounded-full bg-feature-soft px-2 py-0.5 text-[11px] font-semibold text-feature",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PriorityPill({ priority }: { priority: string }) {
  const { td } = useI18n();
  const color = PRIORITY_COLOR[priority as keyof typeof PRIORITY_COLOR] ?? "blue";
  return <Pill color={color}>{td(`priority.${priority}`)}</Pill>;
}

export function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  color?: FeatureColor;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
        color ? FEATURE_CLASS[color] : "",
        active
          ? color
            ? "border-feature-soft bg-feature-soft text-feature"
            : "border-primary/40 bg-primary/15 text-primary"
          : "border-border bg-card/50 text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">{children}</div>;
}

export function ProgressBar({ value, color = "green" }: { value: number; color?: FeatureColor }) {
  return (
    <div className={cn(FEATURE_CLASS[color], "h-1.5 w-full overflow-hidden rounded-full bg-feature-soft")}>
      <div className="h-full rounded-full bg-feature transition-[width] duration-300" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
