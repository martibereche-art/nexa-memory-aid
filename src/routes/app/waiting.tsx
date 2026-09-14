import { createFileRoute } from "@tanstack/react-router";
import { Clock, Pencil, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, FormActions, FormSheet } from "@/components/app/dialogs";
import { DateField, Field, OptionPicker, TextAreaField, TextField } from "@/components/app/fields";
import { Chip, ChipRow, EmptyState, ErrorState, FeatureIcon, LoadingList, PageHeader, Pill, PriorityPill } from "@/components/app/primitives";
import { findCategory, PRIORITIES, WAITING_CATEGORIES, WAITING_STATUSES } from "@/lib/categories";
import { useMutations, useRows } from "@/lib/data/DataProvider";
import { todayISO, type WaitingItem } from "@/lib/data/types";
import { dayDiff, parseDateValue, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/waiting")({ component: WaitingPage });

const STATUS_COLOR = { waiting: "orange", follow_up: "pink", received: "green", cancelled: "indigo" } as const;

function WaitingPage() {
  const { t, td, formatDate } = useI18n();
  const rows = useRows("waiting_items");
  const m = useMutations("waiting_items");
  const [status, setStatus] = useState("active");
  const [editing, setEditing] = useState<WaitingItem | null | "new">(null);
  const [deleting, setDeleting] = useState<WaitingItem | null>(null);
  const today = todayISO();

  const items = useMemo(
    () => (rows.data ?? []).filter((r) => (status === "active" ? r.status === "waiting" || r.status === "follow_up" : r.status === status)).sort((a, b) => (a.expected_date ?? "9999").localeCompare(b.expected_date ?? "9999")),
    [rows.data, status],
  );

  return (
    <div>
      <PageHeader title={t("waiting.title")} subtitle={t("features.waiting.subtitle")} icon={Clock} color="orange" action={<Button variant="hero" size="sm" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> {t("common.add")}</Button>} />
      <ChipRow>
        <Chip active={status === "active"} onClick={() => setStatus("active")} color="orange">{t("waiting.statuses.waiting")}</Chip>
        <Chip active={status === "received"} onClick={() => setStatus("received")} color="green">{t("waiting.statuses.received")}</Chip>
        <Chip active={status === "cancelled"} onClick={() => setStatus("cancelled")}>{t("waiting.statuses.cancelled")}</Chip>
      </ChipRow>
      {rows.isLoading ? <LoadingList /> : rows.isError ? <ErrorState onRetry={() => rows.refetch()} /> : items.length === 0 ? (
        <EmptyState icon={Clock} color="orange" title={t("waiting.emptyTitle")} body={t("waiting.emptyBody")} action={<Button variant="soft" onClick={() => setEditing("new")}>{t("waiting.add")}</Button>} />
      ) : (
        <ul className="space-y-2">
          {items.map((w) => {
            const def = findCategory(WAITING_CATEGORIES, w.category);
            const days = Math.max(0, dayDiff(new Date(), parseDateValue(w.start_date)));
            const overdueFollow = w.next_reminder && w.next_reminder <= today && (w.status === "waiting" || w.status === "follow_up");
            const active = w.status === "waiting" || w.status === "follow_up";
            return (
              <li key={w.id} className="surface flex gap-3 p-3.5 animate-fade-up">
                <FeatureIcon icon={def.icon} color={def.color} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{w.title}</h3>
                  {w.from_whom ? <p className="text-sm text-muted-foreground">{w.from_whom}</p> : null}
                  <p className={cn("mt-1 text-xs font-medium", overdueFollow ? "text-destructive" : "text-primary-glow")}>
                    {overdueFollow ? t("waiting.followUpNow") : t("waiting.waitingFor", { days: days === 1 ? t("common.day") : t("common.days", { count: days }) })}
                    {w.expected_date ? ` · ${t("waiting.expectedDate")}: ${formatDate(w.expected_date)}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Pill color={STATUS_COLOR[w.status as keyof typeof STATUS_COLOR] ?? "orange"}>{td(`waiting.statuses.${w.status}`)}</Pill>
                    <PriorityPill priority={w.priority} />
                    {active ? (
                      <>
                        <button type="button" className="ms-auto text-[11px] font-semibold text-muted-foreground hover:text-foreground" onClick={() => m.update.mutate({ id: w.id, values: { last_follow_up: today, status: "waiting", next_reminder: null } }, { onSuccess: () => toast.success(t("waiting.followedUpToday")) })}>{t("waiting.followedUpToday")}</button>
                        <button type="button" aria-label={t("waiting.markReceived")} className="text-feature-green" onClick={() => m.update.mutate({ id: w.id, values: { status: "received" } }, { onSuccess: () => toast.success(t("common.updated")) })}><CheckCircle2 className="h-5 w-5" /></button>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label={t("common.edit")} onClick={() => setEditing(w)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" aria-label={t("common.delete")} onClick={() => setDeleting(w)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {editing ? <WaitingForm item={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} onConfirm={() => { if (deleting) m.remove.mutate(deleting.id, { onSuccess: () => toast.success(t("common.deleted")) }); setDeleting(null); }} />
    </div>
  );
}

function WaitingForm({ item, onClose }: { item: WaitingItem | null; onClose: () => void }) {
  const { t, td } = useI18n();
  const m = useMutations("waiting_items");
  const [f, setF] = useState({
    title: item?.title ?? "", from_whom: item?.from_whom ?? "", description: item?.description ?? "", category: item?.category ?? "personal",
    start_date: item?.start_date ?? todayISO(), expected_date: item?.expected_date ?? "", last_follow_up: item?.last_follow_up ?? "", next_reminder: item?.next_reminder ?? "",
    priority: item?.priority ?? "medium", status: item?.status ?? "waiting", notes: item?.notes ?? "",
  });
  const [error, setError] = useState("");
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.title.trim()) return setError(t("common.required"));
    const values = { ...f, title: f.title.trim().slice(0, 160), from_whom: f.from_whom.trim().slice(0, 120), description: f.description.slice(0, 1000), notes: f.notes.slice(0, 1000), start_date: f.start_date || todayISO(), expected_date: f.expected_date || null, last_follow_up: f.last_follow_up || null, next_reminder: f.next_reminder || null };
    if (item) await m.update.mutateAsync({ id: item.id, values });
    else await m.create.mutateAsync(values);
    toast.success(t("common.saved"));
    onClose();
  };

  return (
    <FormSheet open onOpenChange={(o) => !o && onClose()} title={item ? t("waiting.edit") : t("waiting.add")}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("common.title")} error={error}><TextField autoFocus value={f.title} onChange={(e) => set("title", e.target.value)} placeholder={t("waiting.titlePlaceholder")} maxLength={160} /></Field>
        <Field label={t("waiting.fromWhom")}><TextField value={f.from_whom} onChange={(e) => set("from_whom", e.target.value)} placeholder={t("waiting.fromWhomPlaceholder")} maxLength={120} /></Field>
        <Field label={t("common.category")}><OptionPicker options={WAITING_CATEGORIES.map((c) => c.value)} value={f.category} onChange={(v) => set("category", v)} render={(v) => td(`waiting.categories.${v}`)} defs={WAITING_CATEGORIES} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("waiting.startDate")}><DateField value={f.start_date} onChange={(e) => set("start_date", e.target.value)} /></Field>
          <Field label={t("waiting.expectedDate")} optional><DateField value={f.expected_date} onChange={(e) => set("expected_date", e.target.value)} /></Field>
          <Field label={t("waiting.lastFollowUp")} optional><DateField value={f.last_follow_up} onChange={(e) => set("last_follow_up", e.target.value)} /></Field>
          <Field label={t("waiting.nextReminder")} optional><DateField value={f.next_reminder} onChange={(e) => set("next_reminder", e.target.value)} /></Field>
        </div>
        <Field label={t("common.priority")}><OptionPicker options={PRIORITIES} value={f.priority as (typeof PRIORITIES)[number]} onChange={(v) => set("priority", v)} render={(v) => td(`priority.${v}`)} /></Field>
        <Field label={t("common.status")}><OptionPicker options={WAITING_STATUSES} value={f.status as (typeof WAITING_STATUSES)[number]} onChange={(v) => set("status", v)} render={(v) => td(`waiting.statuses.${v}`)} /></Field>
        <Field label={t("common.description")} optional><TextAreaField value={f.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} /></Field>
        <Field label={t("common.notes")} optional><TextAreaField value={f.notes} onChange={(e) => set("notes", e.target.value)} maxLength={1000} /></Field>
        <FormActions onCancel={onClose} submitting={m.create.isPending || m.update.isPending} />
      </form>
    </FormSheet>
  );
}
