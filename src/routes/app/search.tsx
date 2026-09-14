import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { TextField } from "@/components/app/fields";
import { EmptyState, PageHeader, Pill } from "@/components/app/primitives";
import { useRows } from "@/lib/data/DataProvider";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/app/search")({ component: SearchPage });

type Hit = { id: string; title: string; sub: string; type: string; to: "/app/places" | "/app/tasks" | "/app/waiting" | "/app/packing/$listId" | "/app/shopping/$listId" | "/app/tomorrow"; params?: { listId: string } };

function SearchPage() {
  const { t, td } = useI18n();
  const [q, setQ] = useState("");
  const places = useRows("saved_items"), tasks = useRows("tasks"), waiting = useRows("waiting_items");
  const pl = useRows("packing_lists"), pi = useRows("packing_items"), sl = useRows("shopping_lists"), si = useRows("shopping_items"), notes = useRows("notes");

  const hits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 1) return [];
    const has = (...v: (string | null | undefined)[]) => v.some((x) => x?.toLowerCase().includes(s));
    const out: Hit[] = [];
    for (const r of places.data ?? []) if (has(r.name, r.location, r.description, r.tags.join(" "))) out.push({ id: r.id, title: r.name, sub: r.location, type: "saved_items", to: "/app/places" });
    for (const r of tasks.data ?? []) if (has(r.title, r.description, r.notes)) out.push({ id: r.id, title: r.title, sub: r.due_date ?? "", type: "tasks", to: "/app/tasks" });
    for (const r of waiting.data ?? []) if (has(r.title, r.from_whom, r.description)) out.push({ id: r.id, title: r.title, sub: r.from_whom, type: "waiting_items", to: "/app/waiting" });
    for (const r of pl.data ?? []) if (has(r.title, r.destination, r.notes)) out.push({ id: r.id, title: r.title, sub: r.destination, type: "packing_lists", to: "/app/packing/$listId", params: { listId: r.id } });
    for (const r of pi.data ?? []) if (has(r.name)) out.push({ id: r.id, title: r.name, sub: pl.data?.find((l) => l.id === r.list_id)?.title ?? "", type: "packing_items", to: "/app/packing/$listId", params: { listId: r.list_id } });
    for (const r of sl.data ?? []) if (has(r.title, r.notes)) out.push({ id: r.id, title: r.title, sub: "", type: "shopping_lists", to: "/app/shopping/$listId", params: { listId: r.id } });
    for (const r of si.data ?? []) if (has(r.name, r.notes)) out.push({ id: r.id, title: r.name, sub: sl.data?.find((l) => l.id === r.list_id)?.title ?? "", type: "shopping_items", to: "/app/shopping/$listId", params: { listId: r.list_id } });
    for (const r of notes.data ?? []) if (has(r.content)) out.push({ id: r.id, title: r.content, sub: r.for_date ?? "", type: "notes", to: "/app/tomorrow" });
    return out.slice(0, 50);
  }, [q, places.data, tasks.data, waiting.data, pl.data, pi.data, sl.data, si.data, notes.data]);

  return (
    <div>
      <PageHeader title={t("search.title")} subtitle={t("search.hint")} icon={Search} color="indigo" />
      <TextField autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search.placeholder")} />
      {q.trim() && hits.length === 0 ? <div className="mt-4"><EmptyState icon={Search} color="indigo" title={t("search.noResults", { query: q })} /></div> : null}
      {hits.length ? (
        <>
          <p className="mt-4 text-xs text-muted-foreground">{t("search.results", { count: hits.length })}</p>
          <ul className="surface mt-2 divide-y divide-border">
            {hits.map((h) => (
              <li key={`${h.type}-${h.id}`}>
                <Link to={h.to} params={h.params as never} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{h.title}</p>{h.sub ? <p className="truncate text-xs text-muted-foreground">{h.sub}</p> : null}</div>
                  <Pill color="indigo">{td(`search.types.${h.type}`)}</Pill>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
