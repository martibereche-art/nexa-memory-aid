import { createFileRoute, Link } from "@tanstack/react-router";
import { Sunrise, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/app/fields";
import { PageHeader, SectionTitle } from "@/components/app/primitives";
import { useMutations, useRows } from "@/lib/data/DataProvider";
import { tomorrowISO } from "@/lib/data/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/tomorrow")({ component: TomorrowPage });

function TomorrowPage() {
  const { t, formatDate } = useI18n();
  const tomorrow = tomorrowISO();
  const packing = useRows("packing_lists");
  const tasks = useRows("tasks");
  const waiting = useRows("waiting_items");
  const shopping = useRows("shopping_items");
  const notes = useRows("notes");
  const nm = useMutations("notes");
  const [text, setText] = useState("");

  const lists = (packing.data ?? []).filter((l) => l.date === tomorrow && !l.is_completed);
  const due = (tasks.data ?? []).filter((x) => x.due_date === tomorrow && x.status !== "completed" && x.status !== "archived");
  const reminders = (tasks.data ?? []).filter((x) => x.reminder_at && x.reminder_at.slice(0, 10) <= tomorrow && x.reminder_at >= new Date().toISOString());
  const buys = (shopping.data ?? []).filter((i) => !i.is_purchased && (i.priority === "high" || i.priority === "urgent"));
  const follow = (waiting.data ?? []).filter((w) => w.next_reminder && w.next_reminder <= tomorrow && (w.status === "waiting" || w.status === "follow_up"));
  const myNotes = (notes.data ?? []).filter((n) => !n.for_date || n.for_date >= tomorrow || !n.is_done);
  const allClear = !lists.length && !due.length && !buys.length && !follow.length;

  const addNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await nm.create.mutateAsync({ content: text.trim().slice(0, 500), for_date: tomorrow });
    setText("");
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("tomorrow.title")} subtitle={t("tomorrow.subtitle", { date: formatDate(tomorrow, { weekday: "long", day: "numeric", month: "long" }) })} icon={Sunrise} color="cyan" />
      {allClear ? <p className="surface px-4 py-4 text-sm text-feature-green">{t("tomorrow.allClear")}</p> : null}

      <Section title={t("tomorrow.take")} empty={t("tomorrow.nothingTake")} items={lists.map((l) => ({ id: l.id, label: l.title }))} to="/app/packing" color="green"
        action={<Button asChild variant="ghost" size="sm"><Link to="/app/packing">{t("tomorrow.createTomorrowList")}</Link></Button>} />
      <Section title={t("tomorrow.tasksDue")} empty={t("tomorrow.nothingTasks")} items={due.map((x) => ({ id: x.id, label: x.title }))} to="/app/tasks" color="pink" />
      <Section title={t("tomorrow.reminders")} empty={t("tomorrow.nothingReminders")} items={reminders.map((x) => ({ id: x.id, label: x.title }))} to="/app/tasks" color="amber" />
      <Section title={t("tomorrow.shopping")} empty={t("tomorrow.nothingShopping")} items={buys.map((i) => ({ id: i.id, label: `${i.name} ×${i.quantity}` }))} to="/app/shopping" color="purple" />
      <Section title={t("tomorrow.followUps")} empty={t("tomorrow.nothingFollowUps")} items={follow.map((w) => ({ id: w.id, label: `${w.title}${w.from_whom ? ` — ${w.from_whom}` : ""}` }))} to="/app/waiting" color="orange" />

      <section>
        <SectionTitle>{t("tomorrow.notes")}</SectionTitle>
        <form onSubmit={addNote} className="flex gap-2">
          <TextField value={text} onChange={(e) => setText(e.target.value)} placeholder={t("tomorrow.notePlaceholder")} maxLength={500} className="flex-1" />
          <Button type="submit" variant="hero" size="icon" aria-label={t("tomorrow.addNote")} disabled={!text.trim()}><Plus className="h-5 w-5" /></Button>
        </form>
        {myNotes.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">{t("tomorrow.nothingNotes")}</p> : (
          <ul className="surface mt-3 divide-y divide-border">
            {myNotes.map((n) => (
              <li key={n.id} className="flex items-center gap-3 px-3 py-2.5">
                <button type="button" onClick={() => nm.update.mutate({ id: n.id, values: { is_done: !n.is_done } })} aria-label={t("common.done")}>
                  {n.is_done ? <CheckCircle2 className="h-5 w-5 text-feature-green" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                </button>
                <span className={cn("flex-1 text-sm", n.is_done && "text-muted-foreground line-through")}>{n.content}</span>
                <Button variant="ghost" size="icon-sm" aria-label={t("common.delete")} onClick={() => nm.remove.mutate(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Section({ title, empty, items, to, color, action }: { title: string; empty: string; items: { id: string; label: string }[]; to: "/app/packing" | "/app/tasks" | "/app/shopping" | "/app/waiting"; color: string; action?: React.ReactNode }) {
  return (
    <section>
      <SectionTitle action={action}>{title}</SectionTitle>
      {items.length === 0 ? <p className="surface px-4 py-3 text-sm text-muted-foreground">{empty}</p> : (
        <ul className="surface divide-y divide-border">
          {items.map((i) => (
            <li key={i.id}><Link to={to} className="flex items-center gap-3 px-4 py-3 text-sm font-medium"><span className={cn(`feature-${color}`, "h-2.5 w-2.5 rounded-full bg-feature")} />{i.label}</Link></li>
          ))}
        </ul>
      )}
    </section>
  );
}
