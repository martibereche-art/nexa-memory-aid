import { Link } from "@tanstack/react-router";
import { Copy, Pencil, Plus, Trash2, type LucideIcon } from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, FormActions, FormSheet } from "@/components/app/dialogs";
import { DateField, DateTimeField, Field, OptionPicker, TextAreaField, TextField, fromDateTimeLocal, toDateTimeLocal } from "@/components/app/fields";
import { Chip, ChipRow, DirChevron, EmptyState, ErrorState, FeatureIcon, LoadingList, PageHeader, Pill, ProgressBar } from "@/components/app/primitives";
import { findCategory, type CategoryDef, type FeatureColor } from "@/lib/categories";
import { useMutations, useRows } from "@/lib/data/DataProvider";
import type { PackingList, ShoppingList } from "@/lib/data/types";
import { useI18n } from "@/lib/i18n";

type Kind = "packing" | "shopping";
type AnyList = PackingList | ShoppingList;

interface Props {
  kind: Kind;
  icon: LucideIcon;
  color: FeatureColor;
  defs: CategoryDef[];
}

function typeOf(kind: Kind, l: AnyList) {
  return kind === "packing" ? (l as PackingList).list_type : (l as ShoppingList).category;
}

/** Shared list index for packing and shopping lists. */
export function ChecklistIndex({ kind, icon, color, defs }: Props) {
  const { t, td, formatRelativeDay } = useI18n();
  const listsTable = kind === "packing" ? "packing_lists" : "shopping_lists";
  const itemsTable = kind === "packing" ? "packing_items" : "shopping_items";
  const lists = useRows(listsTable);
  const items = useRows(itemsTable);
  const lm = useMutations(listsTable);
  const im = useMutations(itemsTable);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<AnyList | null | "new">(null);
  const [deleting, setDeleting] = useState<AnyList | null>(null);
  const prefix = kind;

  const visible = useMemo(
    () => ((lists.data ?? []) as AnyList[]).filter((l) => !l.is_archived).filter((l) => filter === "all" || typeOf(kind, l) === filter),
    [lists.data, filter, kind],
  );

  const stats = (listId: string) => {
    const rows = (items.data ?? []).filter((i) => i.list_id === listId);
    const done = rows.filter((i) => ("is_checked" in i ? i.is_checked : i.is_purchased)).length;
    return { total: rows.length, done };
  };

  const duplicate = async (l: AnyList) => {
    const { id: _id, user_id: _u, created_at: _c, updated_at: _up, ...rest } = l as Record<string, unknown>;
    const created = await lm.create.mutateAsync({ ...(rest as object), title: `${l.title} (2)`, ...(kind === "packing" ? { is_completed: false, date: null } : {}) } as never);
    const children = (items.data ?? []).filter((i) => i.list_id === l.id);
    if (children.length) {
      await im.createMany.mutateAsync(
        children.map((c) => {
          const { id: _i, user_id: _uu, created_at: _cc, updated_at: _uuu, list_id: _l, ...restItem } = c as Record<string, unknown>;
          return { ...(restItem as object), list_id: created.id, ...("is_checked" in c ? { is_checked: false } : { is_purchased: false }) } as never;
        }),
      );
    }
    toast.success(t("packing.duplicated"));
  };

  return (
    <div>
      <PageHeader title={t(`${prefix}.title`)} subtitle={t(`features.${prefix}.subtitle`)} icon={icon} color={color} action={<Button variant="hero" size="sm" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> {t(`${prefix}.newList`)}</Button>} />
      <ChipRow>
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>{t("common.all")}</Chip>
        {defs.map((d) => <Chip key={d.value} active={filter === d.value} onClick={() => setFilter(d.value)} color={d.color}>{td(`${prefix}.${kind === "packing" ? "types" : "categories"}.${d.value}`)}</Chip>)}
      </ChipRow>
      {lists.isLoading ? <LoadingList /> : lists.isError ? <ErrorState onRetry={() => lists.refetch()} /> : visible.length === 0 ? (
        <EmptyState icon={icon} color={color} title={t(`${prefix}.emptyTitle`)} body={t(`${prefix}.emptyBody`)} action={<Button variant="soft" onClick={() => setEditing("new")}>{t(`${prefix}.newList`)}</Button>} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((l) => {
            const def = findCategory(defs, typeOf(kind, l));
            const s = stats(l.id);
            const pct = s.total ? (s.done / s.total) * 100 : 0;
            return (
              <li key={l.id} className="surface p-4 animate-fade-up">
                <div className="flex items-start gap-3">
                  <Link to={kind === "packing" ? "/app/packing/$listId" : "/app/shopping/$listId"} params={{ listId: l.id }} className="flex min-w-0 flex-1 items-start gap-3">
                    <FeatureIcon icon={def.icon} color={def.color} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{l.title}</h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {kind === "packing" && (l as PackingList).date ? `${formatRelativeDay((l as PackingList).date)} · ` : ""}
                        {kind === "packing" && (l as PackingList).destination ? `${(l as PackingList).destination} · ` : ""}
                        {t(kind === "packing" ? "packing.progress" : "shopping.purchasedCount", { done: s.done, total: s.total })}
                      </p>
                    </div>
                    <DirChevron className="mt-1" />
                  </Link>
                </div>
                <div className="mt-3"><ProgressBar value={pct} color={def.color} /></div>
                <div className="mt-3 flex items-center gap-1">
                  <Pill color={def.color}>{td(`${prefix}.${kind === "packing" ? "types" : "categories"}.${typeOf(kind, l)}`)}</Pill>
                  {kind === "packing" && (l as PackingList).is_completed ? <Pill color="green">{t("packing.complete")}</Pill> : null}
                  <span className="flex-1" />
                  <Button variant="ghost" size="icon-sm" aria-label={t("common.duplicate")} onClick={() => duplicate(l)}><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" aria-label={t("common.edit")} onClick={() => setEditing(l)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" aria-label={t("common.delete")} onClick={() => setDeleting(l)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {editing ? <ListForm kind={kind} defs={defs} list={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} onConfirm={() => { if (deleting) lm.remove.mutate(deleting.id, { onSuccess: () => toast.success(t("common.deleted")) }); setDeleting(null); }} />
    </div>
  );
}

export function ListForm({ kind, defs, list, onClose }: { kind: Kind; defs: CategoryDef[]; list: AnyList | null; onClose: () => void }) {
  const { t, td } = useI18n();
  const listsTable = kind === "packing" ? "packing_lists" : "shopping_lists";
  const lm = useMutations(listsTable);
  const p = list as PackingList | null;
  const [title, setTitle] = useState(list?.title ?? "");
  const [type, setType] = useState(list ? typeOf(kind, list) : (defs[0]?.value ?? "custom"));
  const [date, setDate] = useState(p?.date ?? "");
  const [destination, setDestination] = useState(p?.destination ?? "");
  const [reminder, setReminder] = useState(toDateTimeLocal(p?.reminder_at));
  const [notes, setNotes] = useState(list?.notes ?? "");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError(t("common.required"));
    const values = kind === "packing"
      ? { title: title.trim().slice(0, 120), list_type: type, date: date || null, destination: destination.trim().slice(0, 120), reminder_at: fromDateTimeLocal(reminder), notes: notes.slice(0, 1000) }
      : { title: title.trim().slice(0, 120), category: type, notes: notes.slice(0, 1000) };
    if (list) await lm.update.mutateAsync({ id: list.id, values: values as never });
    else await lm.create.mutateAsync(values as never);
    toast.success(t("common.saved"));
    onClose();
  };

  return (
    <FormSheet open onOpenChange={(o) => !o && onClose()} title={list ? t(`${kind}.editList`) : t(`${kind}.newList`)}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t(`${kind}.listTitle`)} error={error}><TextField autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t(`${kind}.listTitlePlaceholder`)} maxLength={120} /></Field>
        <Field label={kind === "packing" ? t("packing.type") : t("common.category")}><OptionPicker options={defs.map((d) => d.value)} value={type} onChange={setType} render={(v) => td(`${kind}.${kind === "packing" ? "types" : "categories"}.${v}`)} defs={defs} /></Field>
        {kind === "packing" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("common.date")} optional><DateField value={date} onChange={(e) => setDate(e.target.value)} /></Field>
              <Field label={t("common.reminderAt")} optional><DateTimeField value={reminder} onChange={(e) => setReminder(e.target.value)} /></Field>
            </div>
            <Field label={t("packing.destination")} optional><TextField value={destination} onChange={(e) => setDestination(e.target.value)} placeholder={t("packing.destinationPlaceholder")} maxLength={120} /></Field>
          </>
        ) : null}
        <Field label={t("common.notes")} optional><TextAreaField value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} /></Field>
        <FormActions onCancel={onClose} submitting={lm.create.isPending || lm.update.isPending} />
      </form>
    </FormSheet>
  );
}

export function DetailShell({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
