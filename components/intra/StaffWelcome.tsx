"use client";

/**
 * 직원 첫 로그인 확인 (2026-10-10) — app/intra/layout.tsx가 입사 상태 invited·onboarding일 때 메뉴 대신 이 화면만 보여준다
 *   ① (초대받은 새 계정) 비밀번호 설정 ② 인사 정보 처리 안내 확인 ③ 보안 서약 → /api/intra/staff/onboard → 재직(active)
 *   문안 SSOT: lib/staff-presets.ts (바꾸면 버전을 올린다)
 */
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { HR_NOTICE_ITEMS, SECURITY_PLEDGE_ITEMS } from "@/lib/staff-presets";

export function StaffWelcome({ needsPassword }: { needsPassword: boolean }) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [hrNotice, setHrNotice] = useState(false);
    const [pledge, setPledge] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const pwOk = !needsPassword || (password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password) && password === confirm);

    const submit = async () => {
        setBusy(true); setError("");
        const supabase = createClient();
        if (needsPassword) {
            const { error: pwErr } = await supabase.auth.updateUser({ password });
            if (pwErr) { setError(`비밀번호를 저장하지 못했습니다: ${pwErr.message}`); setBusy(false); return; }
        }
        const res = await fetch("/api/intra/staff/onboard", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hrNotice, pledge }),
        }).catch(() => null);
        if (!res?.ok) {
            setError((await res?.json().catch(() => null))?.error ?? "저장하지 못했습니다. 다시 시도해 주세요.");
            setBusy(false); return;
        }
        window.location.href = "/intra/workspace";
    };

    const logout = async () => { await createClient().auth.signOut(); window.location.href = "/intra"; };

    return (
        <div className="min-h-screen bg-neutral-50 px-4 py-10">
            <div className="mx-auto max-w-xl space-y-6">
                <div>
                    <p className="text-xs text-neutral-500">Ten:One™ Intra</p>
                    <h1 className="mt-1 text-xl font-semibold text-neutral-900">함께하게 되어 반갑습니다</h1>
                    <p className="mt-1 text-sm text-neutral-600">시작하기 전에 {needsPassword ? "비밀번호를 정하고 " : ""}아래 두 가지를 확인해 주세요.</p>
                </div>

                {needsPassword && (
                    <section className="space-y-2 rounded-lg border border-neutral-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-neutral-900">1. 비밀번호 설정</h2>
                        <input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="8자 이상 · 영문과 숫자 포함" className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
                        <input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)}
                            placeholder="비밀번호 확인" className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
                        {confirm && password !== confirm && <p className="text-xs text-rose-600">비밀번호가 서로 다릅니다.</p>}
                    </section>
                )}

                <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
                    <h2 className="text-sm font-semibold text-neutral-900">{needsPassword ? "2" : "1"}. 인사 정보 처리 안내</h2>
                    <dl className="space-y-2 text-xs">
                        {HR_NOTICE_ITEMS.map(([k, v]) => (
                            <div key={k} className="grid grid-cols-[72px_1fr] gap-2">
                                <dt className="text-neutral-500">{k}</dt><dd className="text-neutral-800">{v}</dd>
                            </div>
                        ))}
                    </dl>
                    <label className="flex items-center gap-2 text-sm text-neutral-800">
                        <input type="checkbox" checked={hrNotice} onChange={e => setHrNotice(e.target.checked)} className="h-4 w-4 accent-neutral-900" />
                        [필수] 위 안내를 확인했습니다
                    </label>
                </section>

                <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
                    <h2 className="text-sm font-semibold text-neutral-900">{needsPassword ? "3" : "2"}. 정보보안 서약</h2>
                    <ul className="list-disc space-y-1 pl-5 text-xs text-neutral-800">
                        {SECURITY_PLEDGE_ITEMS.map(t => <li key={t}>{t}</li>)}
                    </ul>
                    <label className="flex items-center gap-2 text-sm text-neutral-800">
                        <input type="checkbox" checked={pledge} onChange={e => setPledge(e.target.checked)} className="h-4 w-4 accent-neutral-900" />
                        [필수] 위 내용을 지키겠습니다
                    </label>
                </section>

                {error && <p className="text-sm text-rose-600">{error}</p>}
                <div className="flex items-center justify-between">
                    <button onClick={logout} className="text-xs text-neutral-500 hover:text-neutral-900">로그아웃</button>
                    <button onClick={submit} disabled={!pwOk || !hrNotice || !pledge || busy}
                        className="flex items-center gap-2 bg-neutral-900 px-5 py-2.5 text-sm text-white disabled:opacity-40">
                        {busy && <Loader2 className="h-4 w-4 animate-spin" />} 시작하기
                    </button>
                </div>
            </div>
        </div>
    );
}
