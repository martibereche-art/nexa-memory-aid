import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isGuest as readGuestFlag, setGuest as writeGuestFlag, guestDataCount } from "@/lib/data/local-store";
import { createCloudStore } from "@/lib/data/cloud-store";
import { migrateGuestData } from "@/lib/data/migrate";
import { useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/data/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isGuest: boolean;
  loading: boolean;
  displayName: string;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<Profile, "display_name" | "language" | "theme" | "notify_in_app" | "notify_browser">>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const { t, setLang } = useI18n();
  const migratingRef = useRef(false);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    if (data) {
      setProfile(data);
      return data;
    }
    return null;
  }, []);

  useEffect(() => {
    setIsGuest(readGuestFlag());

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (next?.user) {
        writeGuestFlag(false);
        setIsGuest(false);
        // Defer network calls out of the auth callback.
        setTimeout(() => {
          void loadProfile(next.user.id).then((p) => {
            if (p?.language && (p.language === "ar" || p.language === "en" || p.language === "fr")) {
              const stored = window.localStorage.getItem("nexa:lang");
              if (!stored) setLang(p.language);
            }
          });
          if (event === "SIGNED_IN" && !migratingRef.current && guestDataCount() > 0) {
            migratingRef.current = true;
            migrateGuestData(createCloudStore(next.user.id))
              .then((count) => {
                queryClient.invalidateQueries();
                if (count > 0) toast.success(t("auth.migrated", { count }));
              })
              .catch(() => toast.error(t("common.error")))
              .finally(() => {
                migratingRef.current = false;
              });
          }
        }, 0);
      } else {
        setProfile(null);
      }
      if (event === "SIGNED_OUT") {
        queryClient.clear();
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) void loadProfile(data.session.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile, queryClient, setLang, t]);

  const continueAsGuest = useCallback(() => {
    writeGuestFlag(true);
    setIsGuest(true);
  }, []);

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    writeGuestFlag(false);
    setIsGuest(false);
    setSession(null);
    setProfile(null);
  }, [queryClient]);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (patch) => {
      const user = session?.user;
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, ...patch }, { onConflict: "user_id" })
        .select("*")
        .single();
      if (error) throw error;
      setProfile(data);
    },
    [session],
  );

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    const displayName =
      profile?.display_name ||
      (user?.user_metadata?.display_name as string | undefined) ||
      user?.email?.split("@")[0] ||
      t("common.guest");
    return { user, session, profile, isGuest: !user && isGuest, loading, displayName, continueAsGuest, signOut, updateProfile, refreshProfile };
  }, [session, profile, isGuest, loading, continueAsGuest, signOut, updateProfile, refreshProfile, t]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
