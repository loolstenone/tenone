// Myverse i18n — 가벼운 한국어/영어 토글 헬퍼
//
// 원칙: next-intl 같은 무거운 라이브러리 미도입. 점진 마이그레이션 가능한 lean 헬퍼.
// 사용:
//   const t = useT();
//   t("안녕하세요", "Hello")
//
// 또는 dict 객체:
//   const m = useMessages({ greet: { ko: "안녕", en: "Hi" } });
//   m.greet
//
// 저장: localStorage("myverse_locale") = "ko" | "en". 기본 "ko".

"use client";

import { useEffect, useState, useCallback } from "react";

export type Locale = "ko" | "en";

const STORAGE_KEY = "myverse_locale";
const DEFAULT_LOCALE: Locale = "ko";
const EVENT_NAME = "myverse-locale-change";

function readLocale(): Locale {
    if (typeof window === "undefined") return DEFAULT_LOCALE;
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "en" || v === "ko" ? v : DEFAULT_LOCALE;
}

export function useLocale(): [Locale, (l: Locale) => void] {
    const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

    useEffect(() => {
        setLocaleState(readLocale());
        const handler = (e: Event) => {
            const detail = (e as CustomEvent<{ locale: Locale }>).detail;
            if (detail?.locale) setLocaleState(detail.locale);
        };
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);

    const setLocale = useCallback((l: Locale) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(STORAGE_KEY, l);
        document.documentElement.lang = l;
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { locale: l } }));
        setLocaleState(l);
    }, []);

    return [locale, setLocale];
}

export function useT() {
    const [locale] = useLocale();
    return useCallback(<T extends string>(ko: T, en: T): T => locale === "en" ? en : ko, [locale]);
}

export type Dict<T extends Record<string, unknown>> = { [K in keyof T]: { ko: string; en: string } };

export function useMessages<T extends Record<string, { ko: string; en: string }>>(dict: T): Record<keyof T, string> {
    const [locale] = useLocale();
    const out = {} as Record<keyof T, string>;
    for (const k in dict) out[k] = dict[k][locale];
    return out;
}

export function getServerLocale(): Locale {
    return DEFAULT_LOCALE;
}
