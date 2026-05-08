"use client";

// 사생활 — 자동 캡처 동의 토글 페이지
// 3티어 원칙 명시: 능동=ON / 자동=OFF·동의필수 / 상시감시=금지

import { useEffect, useState } from "react";
import { Loader2, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { SettingsLayout } from "@/features/myverse/planner/SettingsLayout";

interface ConsentRow {
    key: string;
    label: string;
    description: string;
    risk: "low" | "medium" | "high";
}

const ROWS: ConsentRow[] = [
    { key: "gallery_scan",   label: "갤러리 자동 스캔",     description: "기기 사진·영상을 주기적으로 스캔해 EXIF에서 시간·위치를 추출합니다. 미디어는 기기에만 남고, 메타만 마이버스에 저장됩니다.", risk: "medium" },
    { key: "gps_background", label: "GPS 백그라운드 추적", description: "백그라운드에서 위치 변화를 추적해 이동·거점 방문을 자동 기록합니다. 배터리 영향 있음.", risk: "high" },
    { key: "calendar_sync",  label: "캘린더 동기화",        description: "Google·iCloud 캘린더의 일정을 마이버스 일정 영역으로 가져옵니다.", risk: "low" },
    { key: "healthkit",      label: "Apple Health",         description: "운동·수면·식사 데이터를 BODY 영역으로 가져옵니다.", risk: "medium" },
    { key: "google_fit",     label: "Google Fit",            description: "Android 운동·활동 데이터를 BODY 영역으로 가져옵니다.", risk: "medium" },
    { key: "samsung_health", label: "삼성 헬스",             description: "갤럭시 헬스 데이터 동기화.", risk: "medium" },
    { key: "email_receipts", label: "메일 영수증 임포트",   description: "메일에서 영수증을 자동 파싱해 지출 데이터를 만듭니다.", risk: "high" },
    { key: "stt_recording",  label: "음성 자동 텍스트화",   description: "녹음한 메모를 자동으로 텍스트로 변환합니다 (서버 STT 사용).", risk: "medium" },
    { key: "ocr_auto",       label: "이미지 OCR 자동",      description: "사진 속 글자를 자동 추출해 검색 가능하게 만듭니다.", risk: "low" },
    { key: "vision_classify",label: "이미지 자동 분류",     description: "Vision AI로 사진을 9 영역으로 자동 분류합니다 (Claude Vision 호출).", risk: "medium" },
];

export default function PrivacyPage() {
    const [consent, setConsent] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/myverse/consent");
            if (res.ok) {
                const json = await res.json();
                setConsent(json.consent ?? {});
            }
            setLoading(false);
        })();
    }, []);

    async function toggle(key: string) {
        const next = !consent[key];
        setSaving(key);
        const prev = consent;
        setConsent({ ...consent, [key]: next });
        try {
            const res = await fetch("/api/myverse/consent", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, granted: next }),
            });
            if (!res.ok) {
                setConsent(prev);
                const json = await res.json().catch(() => ({}));
                alert(`변경 실패: ${json.error ?? res.status}`);
            }
        } finally {
            setSaving(null);
        }
    }

    if (loading) {
        return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>;
    }

    return (
        <SettingsLayout>
        <div className="max-w-2xl mx-auto p-6">
            <header className="mb-6">
                <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-widest text-neutral-400">
                    <Shield className="h-3 w-3" /> Privacy
                </div>
                <h1 className="text-2xl font-serif text-neutral-900 mb-1">사생활</h1>
                <p className="text-sm text-neutral-500">
                    내 디지털 흔적은 나의 것. 자동 수집은 기본 OFF, 명시 동의가 필요합니다.
                </p>
            </header>

            {/* 3티어 원칙 안내 */}
            <section className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
                <h2 className="text-xs font-semibold text-indigo-900 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> 마이버스 사생활 3원칙
                </h2>
                <ul className="space-y-1 text-xs text-indigo-700">
                    <li>① <b>능동 입력</b>은 기본 ON — 직접 올린 사진·메모는 즉시 저장</li>
                    <li>② <b>자동 수집</b>은 기본 OFF — 갤러리·GPS·헬스·메일은 명시 동의</li>
                    <li>③ <b>상시 감시</b>는 금지 — 마이크 녹음·화면 캡처는 절대 안 함</li>
                </ul>
            </section>

            {/* 토글 목록 */}
            <div className="space-y-2">
                {ROWS.map(row => {
                    const enabled = consent[row.key] ?? false;
                    const isSaving = saving === row.key;
                    return (
                        <div
                            key={row.key}
                            className="bg-white border border-neutral-200 rounded-lg p-4 flex items-start gap-3"
                        >
                            <div className="shrink-0 mt-0.5">
                                {enabled ? (
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <ShieldOff className="h-4 w-4 text-neutral-300" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="text-sm font-medium text-neutral-900">{row.label}</h3>
                                    {row.risk === "high" && (
                                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-px rounded bg-rose-50 text-rose-600">민감</span>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-500 leading-relaxed">{row.description}</p>
                            </div>
                            <button
                                onClick={() => toggle(row.key)}
                                disabled={isSaving}
                                className={`shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    enabled ? "bg-[#6366F1]" : "bg-neutral-200"
                                } disabled:opacity-50`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    enabled ? "translate-x-4" : "translate-x-0.5"
                                }`} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <p className="text-[11px] text-neutral-400 mt-6 leading-relaxed">
                동의 변경 이력은 <code>myverse_consent_log</code>에 감사 추적됩니다.
                언제든 OFF로 되돌릴 수 있고, 모든 자동 수집 데이터는 일괄 다운로드·영구 삭제 가능합니다.
            </p>
        </div>
        </SettingsLayout>
    );
}
