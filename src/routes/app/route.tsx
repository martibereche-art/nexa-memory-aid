import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/lib/auth/AuthProvider";
import logo from "@/assets/nexa-logo.png";

// Client-only: access depends on the browser session or the guest flag in localStorage.
export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { user, isGuest, loading } = useAuth();
  const navigate = useNavigate();
  const allowed = Boolean(user) || isGuest;

  useEffect(() => {
    if (!loading && !allowed) navigate({ to: "/", replace: true });
  }, [loading, allowed, navigate]);

  if (loading || !allowed) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <img src={logo} alt="NEXA" className="h-16 w-16 animate-pulse" />
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
