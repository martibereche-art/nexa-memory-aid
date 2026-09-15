import {PrimeBadge} from "@/components/app/Prime";
import { createFileRoute, Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, TextField } from "@/components/app/fields";
import { PageHeader, SectionTitle } from "@/components/app/primitives";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRows } from "@/lib/data/DataProvider";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/app/profile")({ component: ProfilePage });

function ProfilePage() {
  const { t, formatDate } = useI18n();
  const { user, isGuest, displayName, updateProfile } = useAuth();
  const [name, setName] = useState(displayName);
  const [busy, setBusy] = useState(false);
  const places = useRows("saved_items"), pl = useRows("packing_lists"), sl = useRows("shopping_lists"), tasks = useRows("tasks"), waiting = useRows("waiting_items");

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.length > 80) return;
    setBusy(true);
    try { await updateProfile({ display_name: name.trim() }); toast.success(t("common.saved")); } catch { toast.error(t("common.error")); } finally { setBusy(false); }
  };

  const stats = [
    { label: t("profile.savedPlaces"), value: places.data?.length ?? 0 },
    { label: t("profile.lists"), value: (pl.data?.length ?? 0) + (sl.data?.length ?? 0) },
    { label: t("profile.openTasks"), value: tasks.data?.filter((x) => x.status === "pending" || x.status === "in_progress").length ?? 0 },
    { label: t("profile.waitingItems"), value: waiting.data?.filter((w) => w.status === "waiting" || w.status === "follow_up").length ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("profile.title")} icon={User} color="pink" />
      <div className="surface flex items-center gap-4 p-5">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full gradient-primary text-2xl font-extrabold text-primary-foreground">{displayName.slice(0, 1).toUpperCase()}</div>
        <div className="min-w-0"><p className="truncate text-lg font-bold">{displayName}</p><p className="truncate text-sm text-muted-foreground" dir="ltr">{user?.email ?? t("common.guestMode")}</p>{user ? <p className="text-xs text-muted-foreground/70">{t("profile.memberSince", { date: formatDate(user.created_at, { month: "long", year: "numeric" }) })}</p> : null}</div>
      </div>
      {isGuest ? (
        <div className="surface p-5"><p className="font-semibold">{t("profile.guestTitle")}</p><p className="mt-1 text-sm text-muted-foreground">{t("profile.guestBody")}</p><Button asChild variant="hero" className="mt-4"><Link to="/auth" search={{ mode: "signup" }}>{t("auth.signup")}</Link></Button></div>
      ) : (
        <form onSubmit={save} className="surface space-y-4 p-5">
          <Field label={t("profile.displayName")}><TextField value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></Field>
          <Button type="submit" variant="hero" disabled={busy || !name.trim()}>{busy ? t("common.saving") : t("common.save")}</Button>
        </form>
      )}
      <PrimeBadge/>
      <section>
        <SectionTitle>{t("profile.stats")}</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{stats.map((s) => <div key={s.label} className="surface p-4"><p className="text-2xl font-extrabold tabular">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>)}</div>
      </section>
    </div>
  );
}
