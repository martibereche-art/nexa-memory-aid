import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Home, MoreHorizontal, Plus, Search, Settings, Sunrise, User, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import logo from "@/assets/nexa-logo.png";
import { cn } from "@/lib/utils";
import { useI18n, type TKey } from "@/lib/i18n";
import { FEATURES, FEATURE_CLASS } from "@/lib/categories";
import { useRows } from "@/lib/data/DataProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useReminderEngine } from "@/lib/reminders/useReminderEngine";
import { QuickAdd } from "./QuickAdd";
import { Button } from "@/components/ui/button";

type NavTo = "/app" | "/app/tomorrow" | "/app/notifications" | "/app/more" | "/app/search" | "/app/settings" | "/app/profile";

interface NavItem {
  to: NavTo;
  icon: LucideIcon;
  label: TKey;
  exact?: boolean;
}

const MOBILE_NAV: NavItem[] = [
  { to: "/app", icon: Home, label: "nav.home", exact: true },
  { to: "/app/tomorrow", icon: Sunrise, label: "nav.tomorrow" },
  { to: "/app/notifications", icon: Bell, label: "nav.notifications" },
  { to: "/app/more", icon: MoreHorizontal, label: "nav.more" },
];

const DESKTOP_SECONDARY: NavItem[] = [
  { to: "/app/search", icon: Search, label: "nav.search" },
  { to: "/app/notifications", icon: Bell, label: "nav.notifications" },
  { to: "/app/profile", icon: User, label: "nav.profile" },
  { to: "/app/settings", icon: Settings, label: "nav.settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [quickOpen, setQuickOpen] = useState(false);
  const notifications = useRows("notifications");
  const unread = notifications.data?.filter((n) => !n.is_read).length ?? 0;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useReminderEngine();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-e border-border bg-sidebar/80 px-4 py-6 backdrop-blur-xl lg:flex">
        <Link to="/app" className="flex items-center gap-3 px-2">
          <img src={logo} alt="" className="h-10 w-10" />
          <div>
            <div className="text-lg font-extrabold tracking-tight text-foreground">{t("app.name")}</div>
            <div className="text-[11px] text-muted-foreground">{t("app.tagline")}</div>
          </div>
        </Link>

        <Button variant="hero" className="mt-6 w-full justify-start gap-3" onClick={() => setQuickOpen(true)}>
          <Plus className="h-5 w-5" />
          {t("nav.quickAdd")}
        </Button>

        <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <SideLink to="/app" icon={Home} label={t("nav.home")} active={pathname === "/app" || pathname === "/app/"} />
            <SideLink to="/app/tomorrow" icon={Sunrise} label={t("nav.tomorrow")} active={pathname.startsWith("/app/tomorrow")} />
          </div>
          <div className="space-y-1">
            {FEATURES.filter((f) => f.key !== "tomorrow").map((f) => (
              <SideLink
                key={f.key}
                to={f.to}
                icon={f.icon}
                label={t(`nav.${f.key}` as TKey)}
                active={pathname.startsWith(f.to)}
                colorClass={FEATURE_CLASS[f.color]}
              />
            ))}
          </div>
          <div className="space-y-1">
            {DESKTOP_SECONDARY.map((n) => (
              <SideLink
                key={n.to}
                to={n.to}
                icon={n.icon}
                label={t(n.label)}
                active={pathname.startsWith(n.to)}
                badge={n.to === "/app/notifications" ? unread : 0}
              />
            ))}
          </div>
        </nav>
        <p className="px-2 text-[11px] text-muted-foreground/70">{t("app.version")}</p>
      </aside>

      {/* Main */}
      <div className="flex min-h-dvh flex-col">
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-4 safe-bottom sm:px-6 lg:max-w-5xl lg:px-10 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-sidebar/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl lg:hidden"
        aria-label="main"
      >
        <div className="relative mx-auto grid h-16 max-w-3xl grid-cols-5 items-center px-2">
          {MOBILE_NAV.slice(0, 2).map((n) => (
            <BottomLink key={n.to} item={n} active={n.exact ? pathname === n.to || pathname === `${n.to}/` : pathname.startsWith(n.to)} />
          ))}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              aria-label={t("nav.quickAdd")}
              className="press -mt-7 grid h-14 w-14 place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow ring-4 ring-background"
            >
              <Plus className="h-7 w-7" />
            </button>
          </div>
          {MOBILE_NAV.slice(2).map((n) => (
            <BottomLink key={n.to} item={n} active={pathname.startsWith(n.to)} badge={n.to === "/app/notifications" ? unread : 0} />
          ))}
        </div>
      </nav>

      <QuickAdd open={quickOpen} onOpenChange={setQuickOpen} />
    </div>
  );
}

function SideLink({
  to,
  icon: Icon,
  label,
  active,
  colorClass,
  badge = 0,
}: {
  to: NavTo | (typeof FEATURES)[number]["to"];
  icon: LucideIcon;
  label: string;
  active: boolean;
  colorClass?: string;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-accent text-foreground" : "text-sidebar-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      <span className={cn(colorClass, "grid h-8 w-8 place-items-center rounded-lg", colorClass ? "bg-feature-soft text-feature" : "bg-secondary")}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge > 0 ? <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{badge}</span> : null}
    </Link>
  );
}

function BottomLink({ item, active, badge = 0 }: { item: NavItem; active: boolean; badge?: number }) {
  const { t } = useI18n();
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={cn(
        "relative flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors",
        active ? "text-primary" : "text-sidebar-foreground",
      )}
    >
      <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_var(--color-primary)]")} />
      <span>{t(item.label)}</span>
      {badge > 0 ? (
        <span className="absolute start-1/2 top-2 ms-1 min-w-4 rounded-full bg-primary px-1 text-center text-[9px] font-bold leading-4 text-primary-foreground">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );
}
