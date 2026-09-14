import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, Circle, CheckCircle2, Pencil, Plus, Trash2, Repeat } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, FormActions, FormSheet } from "@/components/app/dialogs";
import { DateField, DateTimeField, Field, OptionPicker, SwitchRow, TextAreaField, TextField, fromDateTimeLocal, toDateTimeLocal } from "@/components/app/fields";
import { Chip, ChipRow, EmptyState, ErrorState, LoadingList, PageHeader, Pill, PriorityPill } from "@/components/app/primitives";
import { findCategory, PRIORITIES, RECURRENCES, TASK_CATEGORIES, TASK_STATUSES } from "@/lib/categories";
import { useMutations, useRows } from "@/lib/data/DataProvider";
import { todayISO, type Task } from "@/lib/data/types";
import { parseDateValue, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/tasks")({ component: TasksPage });

function nextDue(due: string, rec: string): string {
  const d = parseDateValue(due);
  if (rec === "daily") d.setDate(d.getDate() + 1);
  else if (rec === "weekly") d.setDate(d.getDate() + 7);
  else if (rec === "monthly") d.setMonth(d.getMonth() + 1);
  return todayISO(d);
}

function TasksPage() {
  const { t, td, formatRelativeDay } = useI18n();
  const rows = useRows("tasks");
  const m = useMutations("tasks");
  const [status, setStatus] = useState<string>("open");
  const [editing, setEditing] = useState<Task | null | "new">(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const today = todayISO();

  const items = useMemo(() => {
    const order: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    return (rows.data ?? [])
      .filter((r) => (status === "open" ? r.status === "pending" || r.status === "in_progress" : r.status === status))
      .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999") || order[a.priority] - order[b.priority]);
  }, [rows.data, status]);

  const toggle = (task: Task) => {
    if (task.status === "completed") {
      m.update.mutate({ id: task.id, values: { status: "pending", completed_at: null } }, { onSuccess: () => toast.success(t("tasks.reopened")) });
      return;
    }
    if (task.is_recurring && task.recurrence !== "none" && task.due_date) {
      m.update.mutate({ id: task.id, values: { due_date: nextDue(task.due_date, task.recurrence), status: "pending" } }, { onSuccess: () => toast.success(t("tasks.completed")) });
      return;
    }
    m.update.mutate({ id: task.id, values: { status: "completed", completed_at: new Date().toISOString() } }, { onSuccess: () => toast.success(t("tasks.completed")) });
  };

  return (
    <div>
      <PageHeader title={t("tasks.title")} subtitle={t("features.tasks.subtitle")} icon={CheckSquare} color="pink" action={<Button variant="hero" size="sm" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> {t("common.add")}</Button>} />
      <ChipRow>
        <Chip active={status === "open"} onClick={() => setStatus("open")} color="pink">{t("tasks.statuses.pending")} + {t("tasks.statuses.in_progress")}</Chip>
        <Chip active={status === "completed"} onClick={() => setStatus("completed")} color="green">{t("tasks.statuses.completed")}</Chip>
        <Chip active={status === "archived"} onClick={() => setStatus("archived")}>{t("tasks.statuses.archived")}</Chip>
      </ChipRow>

      {rows.isLoading ? <LoadingList /> : rows.isError ? <ErrorState onRetry={() => rows.refetch()} /> : items.length === 0 ? (
        <EmptyState icon={CheckSquare} color="pink" title={t("tasks.emptyTitle")} body={t("tasks.emptyBody")} action={<Button variant="soft" onClick={() => setEditing("new")}>{t("tasks.add")}</Button>} />
      ) : (
        <ul className="space-y-2">
          {items.map((task) => {
            const def = findCategory(TASK_CATEGORIES, task.category);
            const overdue = task.due_date && task.due_date < today && task.status !== "completed";
            return (
              <li key={task.id} className="surface flex items-start gap-3 p-3.5 animate-fade-up">
                <button type="button" onClick={() => toggle(task)} aria-label={t("common.done")} className="press mt-0.5 shrink-0 text-primary">
                  {task.status === "completed" ? <CheckCircle2 className="h-6 w-6 text-feature-green" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className={cn("font-semibold", task.status === "completed" && "text-muted-foreground line-through")}>{task.title}</h3>
                  {task.description ? <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{task.description}</p> : null}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Pill color={def.color}>{td(`tasks.categories.${task.category}`)}</Pill>
                    <PriorityPill priority={task.priority} />
                    {task.status === "in_progress" ? <Pill color="cyan">{t("tasks.statuses.in_progress")}</Pill> : null}
                    {task.is_recurring && task.recurrence !== "none" ? <Pill color="indigo"><Repeat className="h-3 w-3" />{td(`tasks.recurrences.${task.recurrence}`)}</Pill> : null}
                    {task.due_date ? <span className={cn("ms-auto text-[11px] font-medium", overdue ? "text-destructive" : "text-muted-foreground")}>{overdue ? `${t("common.overdue")} · ` : ""}{formatRelativeDay(task.due_date)}</span> : null}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label={t("common.edit")} onClick={() => setEditing(task)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" aria-label={t("common.delete")} onClick={() => setDeleting(task)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing ? <TaskForm task={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} onConfirm={() => { if (deleting) m.remove.mutate(deleting.id, { onSuccess: () => toast.success(t("common.deleted")) }); setDeleting(null); }} />
    </div>
  );
}

function TaskForm({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { t, td } = useI18n();
  const m = useMutations("tasks");
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [category, setCategory] = useState(task?.category ?? "personal");
  const [due, setDue] = useState(task?.due_date ?? "");
  const [reminder, setReminder] = useState(toDateTimeLocal(task?.reminder_at));
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [status, setStatus] = useState(task?.status ?? "pending");
  const [recurring, setRecurring] = useState(task?.is_recurring ?? false);
  const [recurrence, setRecurrence] = useState(task?.recurrence ?? "weekly");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError(t("common.required"));
    const values = {
      title: title.trim().slice(0, 160),
      description: description.trim().slice(0, 1000),
      category,
      due_date: due || null,
      reminder_at: fromDateTimeLocal(reminder),
      priority,
      status,
      is_recurring: recurring,
      recurrence: recurring ? recurrence : "none",
      notes: notes.trim().slice(0, 1000),
      completed_at: status === "completed" ? (task?.completed_at ?? new Date().toISOString()) : null,
    };
    if (task) await m.update.mutateAsync({ id: task.id, values });
    else await m.create.mutateAsync(values);
    toast.success(t("common.saved"));
    onClose();
  };

  return (
    <FormSheet open onOpenChange={(o) => !o && onClose()} title={task ? t("tasks.edit") : t("tasks.add")}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("common.title")} error={error}><TextField autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("tasks.titlePlaceholder")} maxLength={160} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("tasks.dueDate")} optional><DateField value={due} onChange={(e) => setDue(e.target.value)} /></Field>
          <Field label={t("common.reminderAt")} optional><DateTimeField value={reminder} onChange={(e) => setReminder(e.target.value)} /></Field>
        </div>
        <Field label={t("common.category")}><OptionPicker options={TASK_CATEGORIES.map((c) => c.value)} value={category} onChange={setCategory} render={(v) => td(`tasks.categories.${v}`)} defs={TASK_CATEGORIES} /></Field>
        <Field label={t("common.priority")}><OptionPicker options={PRIORITIES} value={priority as (typeof PRIORITIES)[number]} onChange={setPriority} render={(v) => td(`priority.${v}`)} /></Field>
        {task ? <Field label={t("common.status")}><OptionPicker options={TASK_STATUSES} value={status as (typeof TASK_STATUSES)[number]} onChange={setStatus} render={(v) => td(`tasks.statuses.${v}`)} /></Field> : null}
        <SwitchRow label={t("tasks.recurring")} checked={recurring} onCheckedChange={setRecurring} />
        {recurring ? <Field label={t("tasks.recurrence")}><OptionPicker options={RECURRENCES.filter((r) => r !== "none")} value={recurrence as (typeof RECURRENCES)[number]} onChange={setRecurrence} render={(v) => td(`tasks.recurrences.${v}`)} /></Field> : null}
        <Field label={t("common.description")} optional><TextAreaField value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} /></Field>
        <Field label={t("common.notes")} optional><TextAreaField value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} /></Field>
        <FormActions onCancel={onClose} submitting={m.create.isPending || m.update.isPending} />
      </form>
    </FormSheet>
  );
}
