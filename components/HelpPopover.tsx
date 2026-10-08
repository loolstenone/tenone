"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { HelpCircle, X } from "lucide-react";

/**
 * (?) 버튼 + 작은 안내창 — 클릭·터치로 열고, 바깥 클릭·X·Esc로 닫는다.
 * Esc는 안내창만 닫는다 (감싼 모달까지 닫히지 않게 캡처 단계에서 멈춤).
 * onOpen: 처음 열릴 때 필요한 데이터를 불러오는 용도
 */
export function HelpPopover({ title, label, size = 14, align = "center", onOpen, children }: {
    title: string;
    /** 스크린리더용 버튼 이름 */
    label: string;
    size?: number;
    /** center = 버튼 가운데 · end = 버튼 오른쪽 끝에 맞춤 (화면·모달 오른쪽 끝에 붙은 버튼) */
    align?: "center" | "end";
    onOpen?: () => void;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!open) return;
        onOpen?.();
        const close = (e: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
        document.addEventListener("mousedown", close);
        document.addEventListener("touchstart", close);
        document.addEventListener("keydown", esc, true);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("touchstart", close);
            document.removeEventListener("keydown", esc, true);
        };
    }, [open, onOpen]);

    return (
        <span ref={ref} className="relative inline-flex align-middle">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-label={label}
                aria-expanded={open}
                className="inline-flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 transition-colors"
            >
                <HelpCircle style={{ width: size, height: size }} />
            </button>

            {open && (
                <span role="dialog" aria-label={title}
                    className={`absolute top-full z-10 mt-2 w-64 ${align === "end" ? "right-0" : "left-1/2 -translate-x-1/2"} rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-lg`}>
                    <button type="button" onClick={() => setOpen(false)} aria-label="닫기"
                        className="absolute right-2 top-2 p-1 text-neutral-400 hover:text-neutral-700">
                        <X className="h-3.5 w-3.5" />
                    </button>
                    <span className="block text-xs font-bold text-neutral-900">{title}</span>
                    <span className="mt-1.5 block text-xs leading-relaxed text-neutral-600">{children}</span>
                </span>
            )}
        </span>
    );
}
