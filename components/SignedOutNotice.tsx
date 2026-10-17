"use client";

/** "로그아웃되었습니다" 안내 — 직접 로그아웃한 뒤 한 번 (lib/sign-out.ts). 루트 레이아웃에 하나 */
import { useEffect, useState } from "react";
import { SIGNED_OUT_EVENT, SIGNED_OUT_KEY } from "@/lib/sign-out";

export function SignedOutNotice() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const check = () => {
            try {
                if (sessionStorage.getItem(SIGNED_OUT_KEY) !== "1") return;
                sessionStorage.removeItem(SIGNED_OUT_KEY);
            } catch { return; }
            setShow(true);
            clearTimeout(timer);
            timer = setTimeout(() => setShow(false), 3000);
        };
        check();
        window.addEventListener(SIGNED_OUT_EVENT, check);
        return () => { window.removeEventListener(SIGNED_OUT_EVENT, check); clearTimeout(timer); };
    }, []);

    if (!show) return null;
    return (
        <div role="status" className="fixed inset-x-0 bottom-6 z-[10000] flex justify-center px-4 pointer-events-none">
            <div className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg">로그아웃되었습니다</div>
        </div>
    );
}
