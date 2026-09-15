import {lovable} from "@/integrations/lovable";
import {usePrimeWords} from "@/lib/prime/words";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/nexa-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, TextField } from "@/components/app/fields";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { BackChevron } from "@/components/app/primitives";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useI18n } from "@/lib/i18n";

type Mode = "login" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode: Mode } => ({ mode: s['mode'] === "signup" ? "signup" : "login" }),
  head: () => ({
    meta: [
      { title: "Sign in — NEXA" },
      { name: "description", content: "Log in or create your NEXA account to keep your memory synced across devices." },
      { property: "og:title", content: "Sign in — NEXA" },
      { property: "og:description", content: "Log in or create your NEXA account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const w=usePrimeWords();
  const [googleBusy,setGoogleBusy]=useState(false);
  const google=async()=>{setGoogleBusy(true);try{const result=await lovable.auth.signInWithOAuth("google",{redirect_uri:window.location.origin});if(result.error)toast.error(w.error);}catch{toast.error(w.error);}finally{setGoogleBusy(false);}};
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const { user, continueAsGuest } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate({ to: "/app", replace: true });
  }, [user, navigate]);

  useEffect(() => {
    setErrors({});
    setSentTo(null);
  }, [mode]);

  const schema =
    mode === "signup"
      ? z
          .object({
            name: z.string().trim().min(2, t("auth.nameMin")).max(80, t("common.tooLong")),
            email: z.string().trim().email(t("auth.invalidEmail")).max(255),
            password: z.string().min(8, t("auth.passwordMin")).max(72),
            confirm: z.string(),
          })
          .refine((d) => d.password === d.confirm, { path: ["confirm"], message: t("auth.passwordMismatch") })
      : z.object({
          name: z.string().optional(),
          email: z.string().trim().email(t("auth.invalidEmail")).max(255),
          password: z.string().min(1, t("common.required")).max(72),
          confirm: z.string().optional(),
        });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, password, confirm });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const cleanEmail = parsed.data.email;
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { display_name: parsed.data.name, language: lang },
          },
        });
        if (error) {
          if (/already|registered|exists/i.test(error.message)) setErrors({ email: t("auth.emailInUse") });
          else toast.error(error.message);
          return;
        }
        if (data.session) {
          toast.success(t("auth.welcomeBack", { name: parsed.data.name || cleanEmail }));
          navigate({ to: "/app", replace: true });
        } else {
          setSentTo(cleanEmail);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: parsed.data.password });
        if (error) {
          if (/invalid|credentials/i.test(error.message)) setErrors({ password: t("auth.invalidCredentials") });
          else toast.error(error.message);
          return;
        }
        const display = (data.user.user_metadata?.['display_name'] as string | undefined) || cleanEmail.split("@")[0] || cleanEmail;
        toast.success(t("auth.welcomeBack", { name: display }));
        navigate({ to: "/app", replace: true });
      }
    } finally {
      setBusy(false);
    }
  };

  const guest = () => {
    continueAsGuest();
    navigate({ to: "/app" });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="icon" aria-label={t("common.back")} className="-ms-2">
          <Link to="/">
            <BackChevron />
          </Link>
        </Button>
        <LanguageSwitcher compact />
      </div>

      <div className="mt-8 flex items-center gap-3 animate-fade-up">
        <img src={logo} alt="NEXA" className="h-12 w-12" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{mode === "signup" ? t("auth.signupTitle") : t("auth.loginTitle")}</h1>
          <p className="text-sm text-muted-foreground">{mode === "signup" ? t("auth.signupSubtitle") : t("auth.loginSubtitle")}</p>
        </div>
      </div>

      {sentTo ? (
        <div className="surface mt-8 flex flex-col items-center px-6 py-10 text-center animate-pop">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Mail className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">{t("auth.checkEmailTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("auth.checkEmailBody", { email: sentTo })}</p>
          <Button asChild variant="soft" className="mt-6">
            <Link to="/auth" search={{ mode: "login" }}>
              {t("auth.backToLogin")}
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="surface mt-8 space-y-4 p-5 animate-fade-up" noValidate>
          {mode === "signup" ? (
            <Field label={t("auth.name")} error={errors['name']} htmlFor="name">
              <TextField id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
          ) : null}
          <Field label={t("auth.email")} error={errors['email']} htmlFor="email">
            <TextField id="email" type="email" inputMode="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={t("auth.password")} error={errors['password']} htmlFor="password">
            <TextField
              id="password"
              type="password"
              dir="ltr"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {mode === "signup" ? (
            <Field label={t("auth.confirmPassword")} error={errors['confirm']} htmlFor="confirm">
              <TextField id="confirm" type="password" dir="ltr" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </Field>
          ) : null}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
            {busy ? t("common.loading") : mode === "signup" ? t("auth.signup") : t("auth.login")}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? t("auth.haveAccount") : t("auth.noAccount")}{" "}
            <Link to="/auth" search={{ mode: mode === "signup" ? "login" : "signup" }} className="font-semibold text-primary hover:underline">
              {mode === "signup" ? t("auth.login") : t("auth.signup")}
            </Link>
          </p>
        </form>
      )}

      <Button variant="outline" className="mt-6" disabled={busy||googleBusy} onClick={google}>{googleBusy?t("common.loading"):w.google}</Button>
      <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t("common.or")}
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button variant="secondary" className="mt-4" onClick={guest}>
        {t("auth.continueGuest")}
      </Button>
    </div>
  );
}
