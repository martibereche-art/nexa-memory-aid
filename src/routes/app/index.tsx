import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Search, User } from "lucide-react";
import { useMemo } from "react";
import { FeatureIcon, SectionTitle } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { FEATURES, FEATURE_CLASS } from "@/lib/categories";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRows } from "@/lib/data/DataProvider";
import { todayISO, tomorrowISO } from "@/lib/data/types";
import { useI18n, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({ component: Dashboard });

function Dashboard() {
  const { t, formatDate, formatRelativeDay } = useI18n();
  const { displayName } = useAuth();
  const places = useRows("saved_items");
  const packing = useRows("packing_lists");
  const waiting = useRows("waiting_items");
  const shopLists = useRows("shopping_lists");
  const shopItems = useRows("shopping_items");
  const tasks = useRows("tasks");
  const notifications = useRows("notifications");

  const hour = new Date().getHours();
  const greet: TKey = hour < 12 ? "dashboard.morning" : hour < 18 ? "dashboard.afternoon" : "dashboard.evening";
  const today = todayISO();
  const tomorrow = tomorrowISO();

  const counts = useMemo(
    () => ({
      places: places.data?.filter((p) => !p.is_archived).length ?? 0,
      packing: packing.data?.filter((l) => !l.is_completed && !l.is_archived).length ?? 0,
      waiting: waiting.data?.filter((w) => w.status === "waiting" || w.status === "follow_up").length ?? 0,
      shopping: shopItems.data?.filter((i) => !i.is_purchased).length ?? 0,
      tasks: tasks.data?.filter((x) => x.status === "pending" || x.status === "in_progress").length ?? 0,
      tomorrow:
        (packing.data?.filter((l) => l.date === tomorrow && !l.is_completed).length ?? 0) +
        (tasks.data?.filter((x) => x.due_date === tomorrow && x.status !== "completed" && x.status !== "archived").length ?? 0),
    }),
    [places.data, packing.data, waiting.data, shopItems.data, tasks.data, tomorrow],
  );

  const upcoming = useMemo(() => {
    const items: { id: string; title: string; when: string; color: "pink" | "orange" | "green"; to: "/app/tasks" | "/app/waiting" | "/app/packing" }[] = [];
    for (const x of tasks.data ?? []) if (x.due_date && x.status !== "completed" && x.status !== "archived") items.push({ id: x.id, title: x.title, when: x.due_date, color: "pink", to: "/app/tasks" });
    for (const w of waiting.data ?? []) if (w.next_reminder && (w.status === "waiting" || w.status === "follow_up")) items.push({ id: w.id, title: w.title, when: w.next_reminder, color: "orange", to: "/app/waiting" });
    for (const l of packing.data ?? []) if (l.date && !l.is_completed) items.push({ id: l.id, title: l.title, when: l.date, color: "green", to: "/app/packing" });
    return items.sort((a, b) => a.when.localeCompare(b.when)).slice(0, 5);
  }, [tasks.data, waiting.data, packing.data]);

  const recent = useMemo(() => {
    const all = [
      ...(places.data ?? []).map((r) => ({ id: r.id, title: r.name, at: r.created_at, color: "blue" as const, to: "/app/places" as const })),
      ...(tasks.data ?? []).map((r) => ({ id: r.id, title: r.title, at: r.created_at, color: "pink" as const, to: "/app/tasks" as const })),
      ...(waiting.data ?? []).map((r) => ({ id: r.id, title: r.title, at: r.created_at, color: "orange" as const, to: "/app/waiting" as const })),
      ...(shopLists.data ?? []).map((r) => ({ id: r.id, title: r.title, at: r.created_at, color: "purple" as const, to: "/app/shopping" as const })),
      ...(packing.data ?? []).map((r) => ({ id: r.id, title: r.title, at: r.created_at, color: "green" as const, to: "/app/packing" as const })),
    ];
    return all.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
  }, [places.data, tasks.data, waiting.data, shopLists.data, packing.data]);

  const unread = notifications.data?.filter((n) => !n.is_read).length ?? 0;

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 animate-fade-up">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold tracking-tight">{t(greet, { name: displayName })}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(new Date(), { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button asChild variant="ghost" size="icon" aria-label={t("nav.notifications")} className="relative">
            <Link to="/app/notifications">
              <Bell className="h-5 w-5" />
              {unread > 0 ? <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-primary" /> : null}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label={t("nav.profile")}>
            <Link to="/app/profile">
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </header>

      <Link to="/app/search" className="surface flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent/40">
        <Search className="h-4 w-4" />
        {t("common.searchPlaceholder")}
      </Link>

      <section>
        <SectionTitle>{t("dashboard.overview")}</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Link
              key={f.key}
              to={f.to}
              className={cn(FEATURE_CLASS[f.color], "press gradient-feature relative overflow-hidden rounded-3xl p-4 text-on-feature shadow-card animate-fade-up")}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="absolute -end-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/20">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-6 text-2xl font-extrabold tabular">{counts[f.key]}</div>
              <div className="text-sm font-semibold leading-tight">{t(`features.${f.key}.title` as TKey)}</div>
              <div className="text-[11px] opacity-80">{f.key === "tomorrow" ? t("features.tomorrow.subtitle") : t("dashboard.pending")}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>{t("dashboard.upcoming")}</SectionTitle>
        {upcoming.length === 0 ? (
          <p className="surface px-4 py-5 text-sm text-muted-foreground">{t("dashboard.noUpcoming")}</p>
        ) : (
          <ul className="surface divide-y divide-border">
            {upcoming.map((u) => (
              <li key={u.id}>
                <Link to={u.to} className="flex items-center gap-3 px-4 py-3">
                  <span className={cn(FEATURE_CLASS[u.color], "h-2.5 w-2.5 shrink-0 rounded-full bg-feature")} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{u.title}</span>
                  <span className={cn("shrink-0 text-xs", u.when < today ? "text-destructive" : "text-muted-foreground")}>{formatRelativeDay(u.when)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle action={<Link to="/app/tomorrow" className="text-xs font-semibold text-primary">{t("common.seeAll")}</Link>}>{t("dashboard.tomorrowSummary")}</SectionTitle>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label={t("dashboard.itemsToTake", { count: packing.data?.filter((l) => l.date === tomorrow && !l.is_completed).length ?? 0 })} color="green" />
          <Stat label={t("dashboard.tasksDue", { count: tasks.data?.filter((x) => x.due_date === tomorrow && x.status !== "completed").length ?? 0 })} color="pink" />
          <Stat label={t("dashboard.toBuy", { count: shopItems.data?.filter((i) => !i.is_purchased && (i.priority === "high" || i.priority === "urgent")).length ?? 0 })} color="purple" />
          <Stat label={t("dashboard.followUps", { count: waiting.data?.filter((w) => w.next_reminder && w.next_reminder <= tomorrow && (w.status === "waiting" || w.status === "follow_up")).length ?? 0 })} color="orange" />
        </div>
      </section>

      <section>
        <SectionTitle>{t("dashboard.recent")}</SectionTitle>
        {recent.length === 0 ? (
          <div className="surface px-4 py-5">
            <p className="text-sm font-semibold">{t("dashboard.helpTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.helpBody")}</p>
          </div>
        ) : (
          <ul className="surface divide-y divide-border">
            {recent.map((r) => (
              <li key={r.id}>
                <Link to={r.to} className="flex items-center gap-3 px-4 py-3">
                  <FeatureIcon icon={FEATURES.find((f) => f.color === r.color)!.icon} color={r.color} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeDay(r.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, color }: { label: string; color: "green" | "pink" | "purple" | "orange" }) {
  return <div className={cn(FEATURE_CLASS[color], "rounded-2xl border border-feature-soft bg-feature-soft px-3 py-2.5 text-xs font-semibold text-feature")}>{label}</div>;
}
