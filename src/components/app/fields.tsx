import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FEATURE_CLASS, type CategoryDef } from "@/lib/categories";
import { useI18n } from "@/lib/i18n";

export function Field({
  label,
  hint,
  error,
  optional,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  optional?: boolean | undefined;
  children: ReactNode;
  htmlFor?: string | undefined;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="flex items-baseline gap-1.5 text-xs font-semibold text-muted-foreground">
        {label}
        {optional ? <span className="font-normal opacity-70">({t("common.optional")})</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground/80">{hint}</p> : null}
    </div>
  );
}

export const inputClass =
  "h-11 rounded-xl border-border bg-background/60 px-3.5 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/50";

export function TextField(props: React.ComponentProps<typeof Input>) {
  return <Input {...props} className={cn(inputClass, props.className)} />;
}

export function TextAreaField(props: React.ComponentProps<typeof Textarea>) {
  return <Textarea {...props} className={cn("min-h-20 rounded-xl border-border bg-background/60 px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/50", props.className)} />;
}

export function DateField(props: React.ComponentProps<typeof Input>) {
  return <Input type="date" {...props} className={cn(inputClass, "tabular", props.className)} />;
}

export function DateTimeField(props: React.ComponentProps<typeof Input>) {
  return <Input type="datetime-local" {...props} className={cn(inputClass, "tabular", props.className)} />;
}

/** Horizontal chip picker used for categories, priorities and statuses. */
export function OptionPicker<T extends string>({
  options,
  value,
  onChange,
  render,
  defs,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  render: (v: T) => string;
  defs?: CategoryDef[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const def = defs?.find((d) => d.value === opt);
        const Icon = def?.icon;
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              def ? FEATURE_CLASS[def.color] : "",
              active
                ? def
                  ? "border-feature-soft bg-feature-soft text-feature"
                  : "border-primary/40 bg-primary/15 text-primary"
                : "border-border bg-background/40 text-muted-foreground hover:bg-accent",
            )}
            aria-pressed={active}
          >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {render(opt)}
          </button>
        );
      })}
    </div>
  );
}

export function SwitchRow({
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  hint?: string | undefined;
  checked: boolean;
  onCheckedChange: (v: boolean) => void | Promise<unknown>;
  disabled?: boolean | undefined;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/40 px-3.5 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </label>
  );
}

export function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDateTimeLocal(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
