import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Plus, Star, Trash2, Pencil } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, FormActions, FormSheet } from "@/components/app/dialogs";
import { Field, OptionPicker, TextAreaField, TextField } from "@/components/app/fields";
import { Chip, ChipRow, EmptyState, ErrorState, FeatureIcon, LoadingList, PageHeader, Pill } from "@/components/app/primitives";
import { findCategory, PLACE_CATEGORIES } from "@/lib/categories";
import { useMutations, useRows } from "@/lib/data/DataProvider";
import type { SavedItem } from "@/lib/data/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/places")({ component: PlacesPage });

const CATS = PLACE_CATEGORIES.map((c) => c.value);

function PlacesPage() {
  const { t, td, formatRelativeDay } = useI18n();
  const rows = useRows("saved_items");
  const m = useMutations("saved_items");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<SavedItem | null | "new">(null);
  const [deleting, setDeleting] = useState<SavedItem | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows.data ?? [])
      .filter((r) => !r.is_archived)
      .filter((r) => cat === "all" || (cat === "fav" ? r.is_favorite : r.category === cat))
      .filter((r) => !q || [r.name, r.location, r.description, ...r.tags].some((s) => s.toLowerCase().includes(q)))
      .sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite) || b.updated_at.localeCompare(a.updated_at));
  }, [rows.data, query, cat]);

  return (
    <div>
      <PageHeader
        title={t("places.title")}
        subtitle={t("features.places.subtitle")}
        icon={MapPin}
        color="blue"
        action={
          <Button variant="hero" size="sm" onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> {t("common.add")}
          </Button>
        }
      />
      <TextField value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("places.examples")} className="mb-3" />
      <ChipRow>
        <Chip active={cat === "all"} onClick={() => setCat("all")}>{t("common.all")}</Chip>
        <Chip active={cat === "fav"} onClick={() => setCat("fav")} color="amber">★ {t("common.favorites")}</Chip>
        {PLACE_CATEGORIES.map((c) => (
          <Chip key={c.value} active={cat === c.value} onClick={() => setCat(c.value)} color={c.color}>{td(`places.categories.${c.value}`)}</Chip>
        ))}
      </ChipRow>

      {rows.isLoading ? (
        <LoadingList />
      ) : rows.isError ? (
        <ErrorState onRetry={() => rows.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={MapPin} color="blue" title={t("places.emptyTitle")} body={t("places.emptyBody")} action={<Button variant="soft" onClick={() => setEditing("new")}>{t("places.add")}</Button>} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const def = findCategory(PLACE_CATEGORIES, item.category);
            return (
              <li key={item.id} className="surface flex gap-3 p-4 animate-fade-up">
                {item.image_url ? <img src={item.image_url} alt="" className="h-11 w-11 shrink-0 rounded-2xl object-cover" /> : <FeatureIcon icon={def.icon} color={def.color} />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <h3 className="min-w-0 flex-1 truncate font-semibold">{item.name}</h3>
                    <button type="button" aria-label={t("common.favorite")} onClick={() => m.update.mutate({ id: item.id, values: { is_favorite: !item.is_favorite } })} className="press shrink-0">
                      <Star className={cn("h-4 w-4", item.is_favorite ? "fill-feature-amber text-feature-amber" : "text-muted-foreground")} />
                    </button>
                  </div>
                  {item.location ? <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-primary-glow"><MapPin className="h-3.5 w-3.5 shrink-0" />{item.location}</p> : null}
                  {item.description ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p> : null}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Pill color={def.color}>{td(`places.categories.${item.category}`)}</Pill>
                    {item.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">#{tag}</span>)}
                    <span className="ms-auto text-[11px] text-muted-foreground">{formatRelativeDay(item.updated_at)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label={t("common.edit")} onClick={() => setEditing(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" aria-label={t("common.delete")} onClick={() => setDeleting(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing ? <PlaceForm item={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        onConfirm={() => {
          if (deleting) m.remove.mutate(deleting.id, { onSuccess: () => toast.success(t("common.deleted")) });
          setDeleting(null);
        }}
      />
    </div>
  );
}

function PlaceForm({ item, onClose }: { item: SavedItem | null; onClose: () => void }) {
  const { t, td } = useI18n();
  const m = useMutations("saved_items");
  const [name, setName] = useState(item?.name ?? "");
  const [location, setLocation] = useState(item?.location ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [category, setCategory] = useState(item?.category ?? "other");
  const [tags, setTags] = useState(item?.tags.join(", ") ?? "");
  const [image, setImage] = useState(item?.image_url ?? "");
  const [fav, setFav] = useState(item?.is_favorite ?? false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError(t("common.required"));
    if (name.length > 120) return setError(t("common.tooLong"));
    const values = {
      name: name.trim(),
      location: location.trim().slice(0, 200),
      description: description.trim().slice(0, 1000),
      category,
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10),
      image_url: /^https?:\/\//.test(image.trim()) ? image.trim() : null,
      is_favorite: fav,
    };
    if (item) await m.update.mutateAsync({ id: item.id, values });
    else await m.create.mutateAsync(values);
    toast.success(t("common.saved"));
    onClose();
  };

  return (
    <FormSheet open onOpenChange={(o) => !o && onClose()} title={item ? t("places.edit") : t("places.add")}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("places.itemName")} error={error}><TextField autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t("places.itemNamePlaceholder")} maxLength={120} /></Field>
        <Field label={t("places.location")}><TextField value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("places.locationPlaceholder")} maxLength={200} /></Field>
        <Field label={t("common.category")}><OptionPicker options={CATS} value={category} onChange={setCategory} render={(v) => td(`places.categories.${v}`)} defs={PLACE_CATEGORIES} /></Field>
        <Field label={t("common.description")} optional><TextAreaField value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("places.descriptionPlaceholder")} maxLength={1000} /></Field>
        <Field label={t("common.tags")} optional hint={t("common.tagsHint")}><TextField value={tags} onChange={(e) => setTags(e.target.value)} /></Field>
        <Field label={t("places.image")} optional><TextField dir="ltr" value={image} onChange={(e) => setImage(e.target.value)} placeholder={t("places.imagePlaceholder")} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={fav} onChange={(e) => setFav(e.target.checked)} className="h-4 w-4 accent-primary" />{t("common.favorite")}</label>
        <FormActions onCancel={onClose} submitting={m.create.isPending || m.update.isPending} />
      </form>
    </FormSheet>
  );
}
