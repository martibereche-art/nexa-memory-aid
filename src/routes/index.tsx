import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import logo from "@/assets/nexa-logo.png";
import hero from "@/assets/welcome-hero.jpg";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { FeatureIcon } from "@/components/app/primitives";
import { FEATURES } from "@/lib/categories";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useI18n, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXA — ذاكرتك خارج رأسك | Your memory, outside your head" },
      { name: "description", content: "NEXA is an external memory assistant: where you put things, what to take with you, what you're waiting for, what to buy, and the tasks you forget." },
      { property: "og:title", content: "NEXA — Your memory, outside your head" },
      { property: "og:description", content: "An external memory assistant for everyday life. Arabic, English and French." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const { t, dir } = useI18n();
  const { user, isGuest, loading, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    if (!loading && (user || isGuest)) navigate({ to: "/app", replace: true });
  }, [loading, user, isGuest, navigate]);

  const guest = () => {
    continueAsGuest();
    navigate({ to: "/app" });
  };

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[46dvh] lg:h-dvh lg:w-1/2">
        <img src={hero} alt="" className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background lg:bg-gradient-to-r lg:from-transparent lg:via-background/40 lg:to-background" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-6 pb-10 pt-6 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex items-center justify-between lg:absolute lg:end-6 lg:top-6">
          <LanguageSwitcher compact className="lg:hidden" />
          <LanguageSwitcher className="hidden lg:inline-flex" />
        </div>

        <div className="hidden lg:block lg:flex-1" />

        <section className="mt-[30dvh] flex flex-1 flex-col lg:mt-0 lg:max-w-xl animate-fade-up">
          <div className="flex items-center gap-4">
            <img src={logo} alt="NEXA" className="h-16 w-16 drop-shadow-[0_8px_24px_oklch(0.62_0.2_258/0.5)]" />
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">{t("app.name")}</h1>
              <p className="text-base font-medium text-primary-glow">{t("app.tagline")}</p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">{t("welcome.intro")}</p>

          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FEATURES.filter((f) => f.key !== "tomorrow").map((f, i) => (
              <li key={f.key} className="surface flex items-center gap-3 px-3 py-2.5">
                <FeatureIcon icon={f.icon} color={f.color} size="sm" />
                <span className="text-sm font-medium">{t(`welcome.feature${i + 1}` as TKey)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-3">
            <Button asChild variant="hero" size="lg" className="w-full">
              <Link to="/auth" search={{ mode: "signup" }}>
                {t("welcome.getStarted")}
                <Arrow className="h-5 w-5" />
              </Link>
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" size="lg">
                <Link to="/auth" search={{ mode: "login" }}>
                  {t("welcome.login")}
                </Link>
              </Button>
              <Button variant="secondary" size="lg" onClick={guest}>
                {t("welcome.guest")}
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">{t("welcome.guestHint")}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
