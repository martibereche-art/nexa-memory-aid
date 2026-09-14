import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/app/dialogs";
import { EmptyState, LoadingList, PageHeader } from "@/components/app/primitives";
import { useMutations, useRows } from "@/lib/data/DataProvider";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications")({ component: NotificationsPage });

const LINK: Record<string, "/app/tasks" | "/app/waiting" | "/app/packing"> = { tasks: "/app/tasks", waiting_items: "/app/waiting", packing_lists: "/app/packing" };

function NotificationsPage() {
  const { t, formatRelativeDay } = useI18n();
  const rows = useRows("notifications");
  const m = useMutations("notifications");
  const [clearing, setClearing] = useState(false);
  const list = (rows.data ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
  const unread = list.filter((n) => !n.is_read);

  return (
    <div>
      <PageHeader title={t("notifications.title")} icon={Bell} color="amber"
        action={<div className="flex gap-1">
          <Button variant="ghost" size="sm" disabled={!unread.length} onClick={() => unread.forEach((n) => m.update.mutate({ id: n.id, values: { is_read: true } }))}>{t("notifications.markAllRead")}</Button>
          <Button variant="ghost" size="icon-sm" aria-label={t("notifications.clearAll")} disabled={!list.length} onClick={() => setClearing(true)}><Trash2 className="h-4 w-4" /></Button>
        </div>} />
      {rows.isLoading ? <LoadingList /> : list.length === 0 ? <EmptyState icon={Bell} color="amber" title={t("notifications.emptyTitle")} body={t("notifications.emptyBody")} /> : (
        <ul className="surface divide-y divide-border">
          {list.map((n) => (
            <li key={n.id} className={cn("flex items-start gap-3 px-4 py-3", !n.is_read && "bg-primary/5")}>
              <span className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", n.is_read ? "bg-transparent" : "bg-primary")} />
              <Link to={LINK[n.entity_type ?? ""] ?? "/app"} onClick={() => !n.is_read && m.update.mutate({ id: n.id, values: { is_read: true } })} className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">{formatRelativeDay(n.created_at)}</p>
              </Link>
              <Button variant="ghost" size="icon-sm" aria-label={t("common.delete")} onClick={() => m.remove.mutate(n.id)}><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog open={clearing} onOpenChange={setClearing} title={t("notifications.clearAll")} confirmLabel={t("common.clear")} onConfirm={() => { m.removeMany.mutate(list.map((n) => n.id), { onSuccess: () => toast.success(t("common.deleted")) }); setClearing(false); }} />
    </div>
  );
}
