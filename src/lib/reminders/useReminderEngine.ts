import {usePrime} from "@/lib/prime/usePrime";
import {playPrimeSound} from "@/lib/prime/audio";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/AuthProvider";
import { rowsKey, useData, useRows } from "@/lib/data/DataProvider";
import { todayISO, tomorrowISO, type InsertRow } from "@/lib/data/types";
import { useI18n } from "@/lib/i18n";
import { showBrowserNotification } from "@/lib/notifications/browser";

const IN_APP_KEY = "nexa:notify:inapp";
const BROWSER_KEY = "nexa:notify:browser";

export function readNotifyPrefs() {
  if (typeof window === "undefined") return { inApp: true, browser: false };
  return {
    inApp: window.localStorage.getItem(IN_APP_KEY) !== "0",
    browser: window.localStorage.getItem(BROWSER_KEY) === "1",
  };
}

export function writeNotifyPrefs(p: { inApp?: boolean; browser?: boolean }) {
  if (p.inApp !== undefined) window.localStorage.setItem(IN_APP_KEY, p.inApp ? "1" : "0");
  if (p.browser !== undefined) window.localStorage.setItem(BROWSER_KEY, p.browser ? "1" : "0");
}

/**
 * Periodically scans the user's data and creates in-app notifications for
 * due reminders. Each candidate carries a stable source_key so it is only
 * created once, both locally and in the cloud (partial unique index).
 */
export function useReminderEngine() {
  const prime=usePrime();
  const { store, scope } = useData();
  const { profile } = useAuth();
  const { t, formatRelativeDay, formatDate } = useI18n();
  const qc = useQueryClient();
  const tasks = useRows("tasks");
  const waiting = useRows("waiting_items");
  const packing = useRows("packing_lists");
  const notifications = useRows("notifications");
  const busy = useRef(false);
  const tick = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tick.current += 1;
      qc.invalidateQueries({ queryKey: rowsKey(scope, "notifications") });
    }, 60_000);
    return () => clearInterval(id);
  }, [qc, scope]);

  useEffect(() => {
    if (!tasks.data || !waiting.data || !packing.data || !notifications.data) return;
    if (busy.current) return;
    const prefs = readNotifyPrefs();
    const inApp = profile ? profile.notify_in_app : prefs.inApp;
    if (!inApp) return;
    const browser = profile ? profile.notify_browser : prefs.browser;

    const existing = new Set(notifications.data.map((n) => n.source_key).filter(Boolean));
    const now = new Date();
    const nowISO = now.toISOString();
    const today = todayISO();
    const tomorrow = tomorrowISO();
    const candidates: InsertRow<"notifications">[] = [];

    for (const task of tasks.data) {
      if (task.status !== "pending" && task.status !== "in_progress") continue;
      if (task.due_date && task.due_date <= today) {
        candidates.push({
          kind: "task_due",
          title: t("notifications.kinds.task_due"),
          body: t("notifications.messages.taskDue", { title: task.title, when: formatRelativeDay(task.due_date) }),
          entity_type: "tasks",
          entity_id: task.id,
          source_key: `task_due:${task.id}:${task.due_date}`,
        });
      }
      if (task.reminder_at && task.reminder_at <= nowISO) {
        candidates.push({
          kind: "task",
          title: t("notifications.kinds.task"),
          body: t("notifications.messages.taskReminder", { title: task.title }),
          entity_type: "tasks",
          entity_id: task.id,
          source_key: `task_rem:${task.id}:${task.reminder_at}`,
        });
      }
    }

    for (const w of waiting.data) {
      if (w.status !== "waiting" && w.status !== "follow_up") continue;
      if (w.next_reminder && w.next_reminder <= nowISO) {
        candidates.push({
          kind: "waiting",
          title: t("notifications.kinds.waiting"),
          body: t("notifications.messages.waitingReminder", { title: w.title, who: w.from_whom || "—" }),
          entity_type: "waiting_items",
          entity_id: w.id,
          source_key: `waiting_rem:${w.id}:${w.next_reminder}`,
        });
      }
      if (w.expected_date && w.expected_date < today) {
        candidates.push({
          kind: "waiting_overdue",
          title: t("notifications.kinds.waiting_overdue"),
          body: t("notifications.messages.waitingOverdue", { title: w.title, date: formatDate(w.expected_date) }),
          entity_type: "waiting_items",
          entity_id: w.id,
          source_key: `waiting_overdue:${w.id}:${w.expected_date}`,
        });
      }
    }

    for (const list of packing.data) {
      if (list.is_completed || list.is_archived) continue;
      if (list.reminder_at && list.reminder_at <= nowISO) {
        candidates.push({
          kind: "packing",
          title: t("notifications.kinds.packing"),
          body: t("notifications.messages.packingReminder", { title: list.title }),
          entity_type: "packing_lists",
          entity_id: list.id,
          source_key: `packing_rem:${list.id}:${list.reminder_at}`,
        });
      }
      if (list.date === tomorrow) {
        candidates.push({
          kind: "packing_tomorrow",
          title: t("notifications.kinds.packing_tomorrow"),
          body: t("notifications.messages.packingTomorrow", { title: list.title }),
          entity_type: "packing_lists",
          entity_id: list.id,
          source_key: `packing_tomorrow:${list.id}:${list.date}`,
        });
      }
    }

    const fresh = candidates.filter((c) => c.source_key && !existing.has(c.source_key));
    if (fresh.length === 0) return;

    busy.current = true;
    store
      .insertMany("notifications", fresh)
      .then((rows) => {
        qc.invalidateQueries({ queryKey: rowsKey(scope, "notifications") });
        if(rows.length && profile?.notify_sound) void prime.refetch().then(result=>{if(result.data?.active)void playPrimeSound(profile.notify_sound_id,profile.notify_volume).catch(()=>undefined);}).catch(()=>undefined);
        if (browser) for (const r of rows) showBrowserNotification(r.title, r.body);
      })
      .catch(() => {
        // A concurrent tab may have inserted the same source_key; the next scan reconciles.
        qc.invalidateQueries({ queryKey: rowsKey(scope, "notifications") });
      })
      .finally(() => {
        busy.current = false;
      });
  }, [tasks.data, waiting.data, packing.data, notifications.data, store, scope, qc, profile, t, formatRelativeDay, formatDate]);
}
