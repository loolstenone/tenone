"use client";

// Gmail 연결 관리 — 동기화 + 임포트된 메일 Triage
// OAuth는 Google 캘린더와 같은 토큰 사용 (scope에 gmail.readonly 추가됨)

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Check, AlertCircle, Mail, Inbox } from "lucide-react";

interface Integration {
    id: string;
    provider: string;
    status: string;
    external_email: string | null;
}

interface EmailImport {
    id: string;
    sender_name: string | null;
    sender_email: string | null;
    subject: string | null;
    snippet: string | null;
    received_at: string;
    auto_category: string | null;
    auto_amount: number | null;
    triage_state: string;
}

const CATEGORY_LABEL: Record<string, { label: string; color: string }> = {
    receipt:    { label: "영수증",   color: "bg-rose-50 text-rose-600" },
    invite:     { label: "초대·일정", color: "bg-sky-50 text-sky-600" },
    newsletter: { label: "뉴스레터", color: "bg-neutral-100 text-neutral-500" },
};

export function GmailIntegration() {
    const [integration, setIntegration] = useState<Integration | null>(null);
    const [emails, setEmails] = useState<EmailImport[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [integRes, emailRes] = await Promise.all([
                fetch("/api/myverse/integrations"),
                fetch("/api/myverse/email-imports?state=inbox"),
            ]);
            if (integRes.ok) {
                const d = await integRes.json();
                const integ = (d.integrations as Integration[] | undefined)?.find(
                    i => i.provider === "google_calendar" && i.status === "active"
                ) ?? null;
                setIntegration(integ);
            }
            if (emailRes.ok) {
                const e = await emailRes.json();
                setEmails(e.emails ?? []);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    async function sync() {
        setSyncing(true);
        setToast(null);
        try {
            const res = await fetch("/api/myverse/integrations/gmail/sync", { method: "POST" });
            const d = await res.json();
            if (!res.ok) {
                setToast({ type: "err", msg: `동기화 실패: ${d.error || res.status}` });
                return;
            }
            setToast({ type: "ok", msg: `${d.imported}건 가져옴` });
            await load();
        } finally {
            setSyncing(false);
        }
    }

    async function triage(id: string, state: string) {
        setEmails(prev => prev.filter(e => e.id !== id));
        await fetch("/api/myverse/email-imports", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, triage_state: state }),
        });
    }

    return (
        <div className="bg-white myverse-dark:bg-[#0D0D15] border border-neutral-200 myverse-dark:border-white/8 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900 myverse-dark:text-neutral-100">Gmail</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            최근 메일을 가져와 Inbox에서 Task·일정으로 라우팅합니다 (메타·요약만, 본문은 보관하지 않음)
                        </p>
                    </div>
                </div>
                {integration && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700">
                        <Check className="h-2.5 w-2.5" />
                        연결됨
                    </span>
                )}
            </div>

            {loading ? (
                <p className="text-xs text-neutral-400 italic">불러오는 중…</p>
            ) : !integration ? (
                <div className="bg-neutral-50 myverse-dark:bg-white/5 rounded-lg p-4">
                    <p className="text-xs text-neutral-500 mb-2">
                        Gmail은 Google 캘린더와 같은 계정 연결을 사용합니다. 캘린더를 먼저 연결해주세요.
                    </p>
                    <a
                        href="/api/myverse/integrations/google/connect"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 hover:border-[#6366F1] hover:text-[#6366F1] text-neutral-700 text-xs font-medium rounded-lg transition-colors"
                    >
                        Google 계정 연결
                    </a>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={sync}
                            disabled={syncing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium rounded-lg disabled:opacity-50"
                        >
                            {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                            최근 7일 메일 가져오기
                        </button>
                        {emails.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-neutral-500 px-2">
                                <Inbox className="h-3 w-3" />
                                Inbox {emails.length}건
                            </span>
                        )}
                    </div>

                    {emails.length > 0 && (
                        <div className="space-y-1.5 max-h-80 overflow-y-auto">
                            {emails.map(email => (
                                <EmailRow key={email.id} email={email} onTriage={triage} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {toast && (
                <div className={`mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 ${
                    toast.type === "ok"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                        : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}>
                    {toast.type === "ok" ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}

function EmailRow({ email, onTriage }: { email: EmailImport; onTriage: (id: string, state: string) => void }) {
    const cat = email.auto_category ? CATEGORY_LABEL[email.auto_category] : null;
    return (
        <div className="border border-neutral-200 myverse-dark:border-white/8 rounded-lg p-2.5 hover:bg-neutral-50 myverse-dark:hover:bg-white/5 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-medium text-neutral-900 myverse-dark:text-neutral-100 truncate">
                            {email.sender_name ?? email.sender_email ?? "(발신자 없음)"}
                        </span>
                        {cat && (
                            <span className={`text-[9px] px-1.5 py-px rounded ${cat.color}`}>
                                {cat.label}
                                {email.auto_amount && ` · ${email.auto_amount.toLocaleString()}원`}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-neutral-700 myverse-dark:text-neutral-300 truncate">{email.subject ?? "(제목 없음)"}</p>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{email.snippet}</p>
                </div>
                <span className="shrink-0 text-[10px] text-neutral-400 whitespace-nowrap">
                    {new Date(email.received_at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                </span>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
                <TriageButton label="할 일로" onClick={() => onTriage(email.id, "task")} />
                <TriageButton label="일정으로" onClick={() => onTriage(email.id, "event")} />
                <TriageButton label="보관" onClick={() => onTriage(email.id, "archive")} />
                <TriageButton label="버리기" onClick={() => onTriage(email.id, "discard")} variant="muted" />
            </div>
        </div>
    );
}

function TriageButton({ label, onClick, variant = "primary" }: { label: string; onClick: () => void; variant?: "primary" | "muted" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                variant === "primary"
                    ? "text-[#6366F1] hover:bg-[#6366F1]/10"
                    : "text-neutral-400 hover:bg-neutral-100"
            }`}
        >
            {label}
        </button>
    );
}
