"use client";

import { useEffect, useState } from "react";
import { X, Info } from "lucide-react";
import HitModelGuide from "./HitModelGuide";

/** 검사 설명 모달 — 닫기는 위(고정)·아래 버튼·Esc·바깥 클릭 어디서나 (길게 스크롤해도 닫기가 보이게) */
export default function HitModelGuideModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-600 text-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors"
      >
        <Info className="h-4 w-4" />
        검사 설명
      </button>

      {open && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="HIT 통합 검사 모델 설명"
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-100 shrink-0">
              <p className="text-sm font-bold text-neutral-700">검사 설명</p>
              <button onClick={() => setOpen(false)} aria-label="닫기" className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"><X className="h-5 w-5" /></button>
            </div>
            <div className="overflow-y-auto px-8 py-6">
              <HitModelGuide mode="modal" />
            </div>
            <div className="px-6 py-3 border-t border-neutral-100 shrink-0 flex justify-end">
              <button onClick={() => setOpen(false)} className="px-5 py-2 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700">닫기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
