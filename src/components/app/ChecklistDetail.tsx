import { Link } from "@tanstack/react-router";
import { Backpack, CheckCircle2, Circle, Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, FormActions, FormSheet } from "@/components/app/dialogs";
import { Field, OptionPicker, SwitchRow, TextField } from "@/components/app/fields";
import { EmptyState, LoadingList, PageHeader, PriorityPill, ProgressBar } from "@/components/app/primitives";
import { ListForm } from "@/components/app/ChecklistPage";
import { PACKING_TYPES, PRIORITIES, SHOPPING_CATEGORIES } from "@/lib/categories";
import { useMutations, useRows } from "@/lib/data/DataProvider";
import type { PackingList, ShoppingItem, ShoppingList } from "@/lib/data/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ChecklistDetail({ kind, listId }: { kind: "packing" | "shopping"; listId: string }) {
  const { t, formatRelativeDay } = useI18n();
  const listsTable = kind === "packing" ? "packing_lists" : "shopping_lists";
  const itemsTable = kind === "packing" ? "packing_items" : "shopping_items";
  const lists = useRows(listsTable);
  const items = useRows(itemsTable);
  const lm = useMutations(listsTable);
  const im = useMutations(itemsTable);
  const [text, setText] = useState("");
  const [editList, setEditList] = useState(false);
  const [editItem, setEditItem] = useState<ShoppingItem | null>(null);
  const [clearing, setClearing] = useState(false);

  const list = (lists.data as (PackingList | ShoppingList)[] | undefined)?.find((l) => l.id === listId);
  const rows = useMemo(() => (items.data ?? []).filter((i) => i.list_id === listId).sort((a, b) => a.created_at.localeCompare(b.created_at)), [items.data, listId]);
  const isDone = (i: (typeof rows)[number]) => ("is_checked" in i ? i.is_checked : i.is_purchased);
  const done = rows.filter(isDone).length;
  const backTo = kind === "packing" ? "/app/packing" : "/app/shopping";

  if (lists.isLoading || items.isLoading) return <LoadingList />;
  if (!list) return <EmptyState icon={kind === "packing" ? Backpack : ShoppingCart} title={t("common.noResults")} action={<Button asChild variant="soft"><Link to={backTo}>{t("common.back")}</Link></Button>} />;

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const name = text.trim();
    if (!name) return;
    await im.create.mutateAsync({ list_id: listId, name: name.slice(0, 120) } as never);
    setText("");
  };

  const toggle = (i: (typeof rows)[number]) =>
    im.update.mutate({ id: i.id, values: ("is_checked" in i ? { is_checked: !i.is_checked } : { is_purchased: !i.is_purchased }) as never });

  const p = kind === "packing" ? (list as PackingList) : null;

  return (
    <div>
      <PageHeader
        title={list.title}
        subtitle={[p?.date ? formatRelativeDay(p.date) : null, p?.destination || null, t(kind === "packing" ? "packing.progress" : "shopping.purchasedCount", { done, total: rows.length })].filter(Boolean).join(" · ")}
        back={backTo}
        action={<Button variant="ghost" size="icon" aria-label={t("common.edit")} onClick={() => setEditList(true)}><Pencil className="h-4 w-4" /></Button>}
      />
      <ProgressBar value={rows.length ? (done / rows.length) * 100 : 0} color={kind === "packing" ? "green" : "purple"} />

      <form onSubmit={add} className="mt-4 flex gap-2">
        <TextField value={text} onChange={(e) => setText(e.target.value)} placeholder={t(`${kind}.itemPlaceholder`)} maxLength={120} className="flex-1" />
        <Button type="submit" variant="hero" size="icon" aria-label={t(`${kind}.addItem`)} disabled={!text.trim()}><Plus className="h-5 w-5" /></Button>
      </form>

      {rows.length === 0 ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">{t(`${kind}.emptyItems`)}</p>
      ) : (
        <ul className="surface mt-4 divide-y divide-border">
          {rows.map((i) => (
            <li key={i.id} className="flex items-center gap-3 px-3 py-2.5">
              <button type="button" onClick={() => toggle(i)} aria-label={t("common.done")} className="press shrink-0">
                {isDone(i) ? <CheckCircle2 className="h-6 w-6 text-feature-green" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
              </button>
              <div className="min-w-0 flex-1">
                <span className={cn("block truncate text-sm font-medium", isDone(i) && "text-muted-foreground line-through")}>{i.name}</span>
                {"quantity" in i ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    ×{i.quantity} {i.notes ? `· ${i.notes}` : ""} <PriorityPill priority={i.priority} /> {i.is_recurring ? "↻" : ""}
                  </span>
                ) : null}
              </div>
              {"quantity" in i ? <Button variant="ghost" size="icon-sm" aria-label={t("common.edit")} onClick={() => setEditItem(i)}><Pencil className="h-4 w-4" /></Button> : null}
              <Button variant="ghost" size="icon-sm" aria-label={t("common.delete")} onClick={() => im.remove.mutate(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {kind === "packing" ? (
          <>
            <Button variant={p?.is_completed ? "outline" : "soft"} size="sm" onClick={() => lm.update.mutate({ id: list.id, values: { is_completed: !p?.is_completed } as never }, { onSuccess: () => toast.success(t("common.updated")) })}>
              {p?.is_completed ? t("packing.markIncomplete") : t("packing.markComplete")}
            </Button>
            <Button variant="outline" size="sm" disabled={done === 0} onClick={() => rows.filter(isDone).forEach((i) => im.update.mutate({ id: i.id, values: { is_checked: false } as never }))}>{t("packing.resetChecks")}</Button>
          </>
        ) : (
          <Button variant="outline" size="sm" disabled={done === 0} onClick={() => setClearing(true)}>{t("shopping.clearPurchased")}</Button>
        )}
      </div>

      {editList ? <ListForm kind={kind} defs={kind === "packing" ? PACKING_TYPES : SHOPPING_CATEGORIES} list={list} onClose={() => setEditList(false)} /> : null}
      {editItem ? <ShoppingItemForm item={editItem} onClose={() => setEditItem(null)} /> : null}
      <ConfirmDialog
        open={clearing}
        onOpenChange={setClearing}
        title={t("shopping.clearPurchased")}
        body={t("shopping.recurringHint")}
        confirmLabel={t("common.clear")}
        onConfirm={() => {
          const purchased = rows.filter((i) => "is_purchased" in i && i.is_purchased) as ShoppingItem[];
          const toDelete = purchased.filter((i) => !i.is_recurring).map((i) => i.id);
          if (toDelete.length) im.removeMany.mutate(toDelete);
          purchased.filter((i) => i.is_recurring).forEach((i) => im.update.mutate({ id: i.id, values: { is_purchased: false } as never }));
          toast.success(t("shopping.cleared"));
          setClearing(false);
        }}
      />
    </div>
  );
}

function ShoppingItemForm({ item, onClose }: { item: ShoppingItem; onClose: () => void }) {
  const { t, td } = useI18n();
  const im = useMutations("shopping_items");
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity);
  const [notes, setNotes] = useState(item.notes);
  const [priority, setPriority] = useState(item.priority);
  const [recurring, setRecurring] = useState(item.is_recurring);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await im.update.mutateAsync({ id: item.id, values: { name: name.trim().slice(0, 120), quantity: quantity.slice(0, 20) || "1", notes: notes.slice(0, 300), priority, is_recurring: recurring } });
    toast.success(t("common.saved"));
    onClose();
  };
  return (
    <FormSheet open onOpenChange={(o) => !o && onClose()} title={t("shopping.editItem")}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("common.name")}><TextField autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("shopping.quantity")}><TextField value={quantity} onChange={(e) => setQuantity(e.target.value)} maxLength={20} /></Field>
          <Field label={t("common.notes")} optional><TextField value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} /></Field>
        </div>
        <Field label={t("common.priority")}><OptionPicker options={PRIORITIES} value={priority as (typeof PRIORITIES)[number]} onChange={setPriority} render={(v) => td(`priority.${v}`)} /></Field>
        <SwitchRow label={t("shopping.recurring")} hint={t("shopping.recurringHint")} checked={recurring} onCheckedChange={setRecurring} />
        <FormActions onCancel={onClose} submitting={im.update.isPending} />
      </form>
    </FormSheet>
  );
}
