import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Dictionary } from "./en";
import { ar } from "./ar";
import { fr } from "./fr";

export type Lang = "ar" | "en" | "fr";
export const LANGS: { code: Lang; label: string; native: string; dir: "rtl" | "ltr" }[] = [
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "fr", label: "French", native: "Français", dir: "ltr" },
];
export const LANG_STORAGE_KEY = "nexa:lang";
export const DEFAULT_LANG: Lang = "ar";

const dictionaries: Record<Lang, Dictionary> = { ar, en, fr };

type Leaves<T, P extends string = ""> = T extends string
  ? P
  : { [K in keyof T & string]: Leaves<T[K], P extends "" ? K : `${P}.${K}`> }[keyof T & string];

export type TKey = Leaves<Dictionary>;

function lookup(dict: Dictionary, key: string): string | undefined {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict) as string | undefined;
}

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const raw = lookup(dictionaries[lang], key) ?? lookup(en, key) ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

export function localeFor(lang: Lang): string {
  return lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-GB";
}

export function isLang(v: unknown): v is Lang {
  return v === "ar" || v === "en" || v === "fr";
}

export function readStoredLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
  return isLang(stored) ? stored : DEFAULT_LANG;
}

interface I18nContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  locale: string;
  hydrated: boolean;
  setLang: (lang: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  /** Translate a dynamic key (e.g. built from a category value). Falls back to the raw key. */
  td: (key: string, vars?: Record<string, string | number>) => string;
  formatDate: (value: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions) => string;
  formatRelativeDay: (value: string | Date | null | undefined) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLangState(readStoredLang());
    setHydrated(true);
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const locale = localeFor(lang);
    const t = (key: TKey, vars?: Record<string, string | number>) => translate(lang, key, vars);
    const td = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
    const formatDate = (value: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions) => {
      if (!value) return "";
      const d = typeof value === "string" ? parseDateValue(value) : value;
      if (Number.isNaN(d.getTime())) return "";
      return new Intl.DateTimeFormat(locale, opts ?? { day: "numeric", month: "long" }).format(d);
    };
    const formatRelativeDay = (value: string | Date | null | undefined) => {
      if (!value) return "";
      const d = typeof value === "string" ? parseDateValue(value) : value;
      const diff = dayDiff(d, new Date());
      if (diff === 0) return t("common.today");
      if (diff === 1) return t("common.tomorrow");
      if (diff === -1) return t("common.yesterday");
      if (diff < 0) return t("common.daysAgo", { count: Math.abs(diff) });
      if (diff < 7) return t("common.inDays", { count: diff });
      return formatDate(d);
    };
    return { lang, dir: lang === "ar" ? "rtl" : "ltr", locale, hydrated, setLang, t, td, formatDate, formatRelativeDay };
  }, [lang, hydrated, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Parses YYYY-MM-DD as a local date (not UTC) and ISO timestamps normally. */
export function parseDateValue(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y = 0, m = 1, d = 1] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

export function dayDiff(target: Date, from: Date): number {
  const a = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const b = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  return Math.round((a - b) / 86_400_000);
}
