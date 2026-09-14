export function browserNotificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && window.isSecureContext;
}

export function browserPermission(): NotificationPermission | "unsupported" {
  if (!browserNotificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestBrowserPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!browserNotificationsSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function showBrowserNotification(title: string, body: string) {
  if (browserPermission() !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.png" });
  } catch {
    // Some browsers (e.g. Android Chrome) require a service worker; fall back silently.
  }
}
