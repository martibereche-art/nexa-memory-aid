import {usePrimeWords} from "@/lib/prime/words";
import {Hourglass,Crown} from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Info, Search, Settings, Sunrise, User, MoreHorizontal } from "lucide-react";
import { DirChevron, FeatureIcon, PageHeader } from "@/components/app/primitives";
import { FEATURES } from "@/lib/categories";
import { useI18n, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/app/more")({ component: MorePage });

function MorePage() {
  const { t } = useI18n();
  const w=usePrimeWords();
  const links = [
    {to:"/app/prime",icon:Crown,color:"amber",title:w.prime,sub:""},
    {to:"/app/coming-soon",icon:Hourglass,color:"cyan",title:w.soon,sub:""},
    { to: "/app/tomorrow", icon: Sunrise, color: "cyan", title: t("more.tomorrow"), sub: t("more.tomorrowSub") },
    { to: "/app/search", icon: Search, color: "indigo", title: t("more.search"), sub: t("more.searchSub") },
    { to: "/app/notifications", icon: Bell, color: "amber", title: t("more.notifications"), sub: t("more.notificationsSub") },
    { to: "/app/profile", icon: User, color: "pink", title: t("nav.profile"), sub: "" },
    { to: "/app/settings", icon: Settings, color: "blue", title: t("more.settings"), sub: t("more.settingsSub") },
  ] as const;
  return (
    <div className="space-y-6">
      <PageHeader title={t("more.title")} icon={MoreHorizontal} color="indigo" />
      <ul className="surface divide-y divide-border">
        {FEATURES.filter((f) => f.key !== "tomorrow").map((f) => (
          <li key={f.key}><Link to={f.to} className="flex items-center gap-3 px-4 py-3"><FeatureIcon icon={f.icon} color={f.color} size="sm" /><span className="flex-1 text-sm font-medium">{t(`features.${f.key}.title` as TKey)}</span><DirChevron /></Link></li>
        ))}
      </ul>
      <ul className="surface divide-y divide-border">
        {links.map((l) => (
          <li key={l.to}><Link to={l.to} className="flex items-center gap-3 px-4 py-3"><FeatureIcon icon={l.icon} color={l.color} size="sm" /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{l.title}</span>{l.sub ? <span className="block text-xs text-muted-foreground">{l.sub}</span> : null}</span><DirChevron /></Link></li>
        ))}
      </ul>
      <div className="surface flex gap-3 p-4"><FeatureIcon icon={Info} color="blue" size="sm" /><div><p className="text-sm font-semibold">{t("more.about")}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("settings.aboutBody")}</p><p className="mt-2 text-[11px] text-muted-foreground/70">{t("app.version")}</p></div></div>
    </div>
  );
}
