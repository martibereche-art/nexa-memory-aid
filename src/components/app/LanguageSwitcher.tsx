import { Globe } from "lucide-react";
import { LANGS, useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthProvider";

export function LanguageSwitcher({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { lang, setLang } = useI18n();
  const auth = useAuthOptional();

  const choose = (code: Lang) => {
    setLang(code);
    if (auth?.user) void auth.updateProfile({ language: code }).catch(() => undefined);
  };

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-border bg-card/60 p-1", className)} role="radiogroup">
      {!compact ? <Globe className="ms-2 h-4 w-4 text-muted-foreground" /> : null}
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          role="radio"
          aria-checked={lang === l.code}
          onClick={() => choose(l.code)}
          className={cn(
            "press rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            lang === l.code ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {compact ? l.code.toUpperCase() : l.native}
        </button>
      ))}
    </div>
  );
}

function useAuthOptional() {
  try {
    return useAuth();
  } catch {
    return null;
  }
}
