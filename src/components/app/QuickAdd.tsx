import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Backpack, CheckSquare, Clock, MapPin, ShoppingCart, StickyNote, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useI18n, type TKey } from "@/lib/i18n";
import { useMutations, useRows } from "@/lib/data/DataProvider";
import { todayISO, tomorrowISO } from "@/lib/data/types";
import { FEATURE_CLASS, type FeatureColor } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { FormSheet, FormActions } from "./dialogs";
import { Field, TextField, inputClass } from "./fields";

type Kind = "place" | "task" | "shopping" | "waiting" | "packing" | "note";

const KINDS: { kind: Kind; icon: LucideIcon; color: FeatureColor; label: TKey }[] = [
  { kind: "place", icon: MapPin, color: "blue", label: "quickAdd.place" },
  { kind: "task", icon: CheckSquare, color: "pink", label: "quickAdd.task" },
  { kind: "shopping", icon: ShoppingCart, color: "purple", label: "quickAdd.shopping" },
  { kind: "waiting", icon: Clock, color: "orange", label: "quickAdd.waiting" },
  { kind: "packing", icon: Backpack, color: "green", label: "quickAdd.packing" },
  { kind: "note", icon: StickyNote, color: "cyan", label: "quickAdd.note" },
];

const NEW = "__new__";

export function QuickAdd({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useI18n();
  const [kind, setKind] = useState<Kind>("task");
  const [text, setText] = useState("");
  const [secondary, setSecondary] = useState("");
  const [listId, setListId] = useState("");
  const [newList, setNewList] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const shoppingLists = useRows("shopping_lists", open && kind === "shopping");
  const packingLists = useRows("packing_lists", open && kind === "packing");

  const places = useMutations("saved_items");
  const tasks = useMutations("tasks");
  const waiting = useMutations("waiting_items");
  const notes = useMutations("notes");
  const shopLists = useMutations("shopping_lists");
  const shopItems = useMutations("shopping_items");
  const packLists = useMutations("packing_lists");
  const packItems = useMutations("packing_items");

  const lists = useMemo(() => {
    const rows = kind === "shopping" ? shoppingLists.data : kind === "packing" ? packingLists.data : undefined;
    return (rows ?? []).filter((l) => !l.is_archived);
  }, [kind, shoppingLists.data, packingLists.data]);

  useEffect(() => {
    if (!open) {
      setText("");
      setSecondary("");
      setNewList("");
      setError("");
      setListId("");
    }
  }, [open]);

  useEffect(() => {
    if (lists.length && !listId) setListId(lists[0].id);
    if (!lists.length) setListId(NEW);
  }, [lists, listId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return setError(t("common.required"));
    if (value.length > 200) return setError(t("common.tooLong"));
    setError("");
    setBusy(true);
    try {
      if (kind === "place") {
        await places.create.mutateAsync({ name: value, location: secondary.trim(), category: "other" });
      } else if (kind === "task") {
        await tasks.create.mutateAsync({ title: value, due_date: secondary || null });
      } else if (kind === "waiting") {
        await waiting.create.mutateAsync({ title: value, from_whom: secondary.trim(), start_date: todayISO() });
      } else if (kind === "note") {
        await notes.create.mutateAsync({ content: value, for_date: secondary || tomorrowISO() });
      } else if (kind === "shopping") {
        let target = listId;
        if (target === NEW) {
          const name = newList.trim();
          if (!name) return setError(t("common.required"));
          const created = await shopLists.create.mutateAsync({ title: name, category: "custom" });
          target = created.id;
        }
        await shopItems.create.mutateAsync({ list_id: target, name: value });
      } else if (kind === "packing") {
        let target = listId;
        if (target === NEW) {
          const name = newList.trim();
          if (!name) return setError(t("common.required"));
          const created = await packLists.create.mutateAsync({ title: name, list_type: "custom", date: tomorrowISO() });
          target = created.id;
        }
        await packItems.create.mutateAsync({ list_id: target, name: value });
      }
      toast.success(t("quickAdd.added"));
      onOpenChange(false);
    } catch {
      /* surfaced by mutation toast */
    } finally {
      setBusy(false);
    }
  };

  const placeholder: Record<Kind, string> = {
    place: t("places.itemNamePlaceholder"),
    task: t("tasks.titlePlaceholder"),
    shopping: t("shopping.itemPlaceholder"),
    waiting: t("waiting.titlePlaceholder"),
    packing: t("packing.itemPlaceholder"),
    note: t("tomorrow.notePlaceholder"),
  };

  return (
    <FormSheet open={open} onOpenChange={onOpenChange} title={t("quickAdd.title")} description={t("quickAdd.subtitle")}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {KINDS.map((k) => {
            const Icon = k.icon;
            const active = kind === k.kind;
            return (
              <button
                key={k.kind}
                type="button"
                onClick={() => {
                  setKind(k.kind);
                  setSecondary("");
                  setListId("");
                }}
                className={cn(
                  FEATURE_CLASS[k.color],
                  "press flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-xs font-semibold transition-colors",
                  active ? "border-feature-soft bg-feature-soft text-feature" : "border-border bg-background/40 text-muted-foreground",
                )}
                aria-pressed={active}
              >
                <Icon className="h-5 w-5" />
                {t(k.label)}
              </button>
            );
          })}
        </div>

        <Field label={t("common.name")} error={error}>
          <TextField autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder[kind]} maxLength={200} />
        </Field>

        {kind === "place" ? (
          <Field label={t("places.location")} optional>
            <TextField value={secondary} onChange={(e) => setSecondary(e.target.value)} placeholder={t("places.locationPlaceholder")} maxLength={200} />
          </Field>
        ) : null}
        {kind === "task" ? (
          <Field label={t("tasks.dueDate")} optional>
            <TextField type="date" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
          </Field>
        ) : null}
        {kind === "note" ? (
          <Field label={t("common.date")} optional>
            <TextField type="date" value={secondary || tomorrowISO()} onChange={(e) => setSecondary(e.target.value)} />
          </Field>
        ) : null}
        {kind === "waiting" ? (
          <Field label={t("waiting.fromWhom")} optional>
            <TextField value={secondary} onChange={(e) => setSecondary(e.target.value)} placeholder={t("waiting.fromWhomPlaceholder")} maxLength={120} />
          </Field>
        ) : null}
        {kind === "shopping" || kind === "packing" ? (
          <>
            <Field label={t("quickAdd.selectList")}>
              <select value={listId} onChange={(e) => setListId(e.target.value)} className={cn(inputClass, "w-full border bg-background/60")}>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
                <option value={NEW}>+ {t(kind === "shopping" ? "shopping.newList" : "packing.newList")}</option>
              </select>
            </Field>
            {listId === NEW ? (
              <Field label={t("quickAdd.newListName")}>
                <TextField value={newList} onChange={(e) => setNewList(e.target.value)} maxLength={120} />
              </Field>
            ) : null}
          </>
        ) : null}

        <FormActions onCancel={() => onOpenChange(false)} submitting={busy} submitLabel={t("common.add")} />
      </form>
    </FormSheet>
  );
}
