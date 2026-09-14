import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Settings, LogOut, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/app/dialogs";
import { OptionPicker, SwitchRow } from "@/components/app/fields";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { PageHeader, SectionTitle } from "@/components/app/primitives";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useData } from "@/lib/data/DataProvider";
import { clearGuestData } from "@/lib/data/local-store";
import { TABLES } from "@/lib/data/types";
import { useI18n } from "@/lib/i18n";
import { browserPermission, requestBrowserPermission } from "@/lib/notifications/browser";
import { readNotifyPrefs, writeNotifyPrefs } from "@/lib/reminders/useReminderEngine";
import { useTheme, type Theme } from "@/lib/theme/ThemeProvider";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { t, td } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user, isGuest, profile, signOut, updateProfile } = useAuth();
  const { store } = useData();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(() => ({ inApp: profile?.notify_in_app ?? readNotifyPrefs().inApp, browser: profile?.notify_browser ?? readNotifyPrefs().browser }));
  const [confirmClear, setConfirmClear] = useState(false);

  const setPref = async (k: "inApp" | "browser", v: boolean): Promise<void> => {
    if (k === "browser" && v) {
      const perm = await requestBrowserPermission();
      if (perm === "unsupported") {
        toast.error(t("notifications.browserUnsupported"));
        return;
      }
      if (perm !== "granted") {
        toast.error(t("notifications.browserDenied"));
        return;
      }
      toast.success(t("notifications.browserEnabled"));
    }
    setPrefs((p) => ({ ...p, [k]: v }));
    writeNotifyPrefs({ [k]: v });
    if (user) void updateProfile(k === "inApp" ? { notify_in_app: v } : { notify_browser: v }).catch(() => undefined);
  };

  const exportData = async () => {
    const out: Record<string, unknown> = { exported_at: new Date().toISOString(), app: "NEXA" };
    for (const tbl of TABLES) out[tbl] = await store.list(tbl);
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nexa-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(t("settings.exported"));
  };

  const logout = async () => {
    await signOut();
    toast.success(t("auth.loggedOut"));
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings.title")} icon={Settings} color="blue" />
      <section><SectionTitle>{t("settings.language")}</SectionTitle><LanguageSwitcher /></section>
      <section><SectionTitle>{t("settings.theme")}</SectionTitle><OptionPicker options={["dark", "light", "system"] as Theme[]} value={theme} onChange={setTheme} render={(v) => td(`settings.themes.${v}`)} /></section>
      <section className="space-y-2">
        <SectionTitle>{t("settings.notifications")}</SectionTitle>
        <SwitchRow label={t("settings.inApp")} checked={prefs.inApp} onCheckedChange={(v) => setPref("inApp", v)} />
        <SwitchRow label={t("settings.browser")} hint={browserPermission() === "unsupported" ? t("notifications.browserUnsupported") : browserPermission() === "denied" ? t("notifications.browserDenied") : undefined} checked={prefs.browser && browserPermission() === "granted"} onCheckedChange={(v) => setPref("browser", v)} disabled={browserPermission() === "unsupported"} />
      </section>
      <section className="space-y-2">
        <SectionTitle>{t("settings.data")}</SectionTitle>
        <Button variant="outline" className="w-full justify-start" onClick={exportData}><Download className="h-4 w-4" />{t("settings.export")}</Button>
        {isGuest ? <Button variant="outline" className="w-full justify-start text-destructive" onClick={() => setConfirmClear(true)}>{t("settings.clearGuest")}</Button> : null}
      </section>
      <section className="space-y-2">
        <SectionTitle>{t("settings.account")}</SectionTitle>
        <Button asChild variant="outline" className="w-full justify-start"><Link to="/app/profile">{t("settings.profile")}</Link></Button>
        {user ? <Button variant="outline" className="w-full justify-start text-destructive" onClick={logout}><LogOut className="h-4 w-4" />{t("settings.logout")}</Button>
          : <Button asChild variant="hero" className="w-full"><Link to="/auth" search={{ mode: "login" }}>{t("settings.signIn")}</Link></Button>}
        {isGuest ? <Button variant="ghost" className="w-full justify-start" onClick={logout}><LogOut className="h-4 w-4" />{t("settings.logout")}</Button> : null}
      </section>
      <section className="surface p-4"><p className="text-sm font-semibold">{t("settings.about")}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("settings.aboutBody")}</p><p className="mt-2 text-[11px] text-muted-foreground/70">{t("settings.version")}: {t("app.version")}</p></section>
      <ConfirmDialog open={confirmClear} onOpenChange={setConfirmClear} title={t("settings.clearGuest")} body={t("settings.clearGuestBody")} onConfirm={() => { clearGuestData(); window.location.reload(); }} />
    </div>
  );
}
