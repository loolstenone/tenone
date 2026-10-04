"use client";

import { LEGAL_DOCUMENTS } from "@/lib/company-info";
import type { MemberConsent } from "@/types/auth";

/**
 * 가입 동의 UI — 전 가입 경로 공통 (/signup · LoginModal · ConsentGate).
 * [필수] 만 14세 이상 · [필수] 이용약관 · [선택] 소식·혜택 수신(정보통신망법 제50조).
 * 개인정보처리방침은 계약 이행에 필요한 수집이라 동의가 아닌 고지 (개인정보보호법 제15조 제1항 제4호).
 */
export interface SignupConsentValue {
    age: boolean;
    terms: boolean;
    marketing: boolean;
}

export const EMPTY_CONSENT: SignupConsentValue = { age: false, terms: false, marketing: false };

export const CONSENT_REQUIRED_MESSAGE = "필수 항목(만 14세 이상, 이용약관)에 동의해주세요";

export function isConsentValid(v: SignupConsentValue): boolean {
    return v.age && v.terms;
}

export function buildMemberConsent(v: SignupConsentValue, channel: MemberConsent["channel"]): MemberConsent {
    return {
        terms_version: LEGAL_DOCUMENTS.terms.version,
        privacy_version: LEGAL_DOCUMENTS.privacy.version,
        age_14_plus: true,
        marketing: v.marketing,
        agreed_at: new Date().toISOString(),
        channel,
        origin_site: typeof window !== "undefined" ? window.location.hostname : "tenone.biz",
    };
}

interface SignupConsentProps {
    value: SignupConsentValue;
    onChange: (next: SignupConsentValue) => void;
    accentColor?: string;
    dark?: boolean;
}

export function SignupConsent({ value, onChange, accentColor = "#171717", dark = false }: SignupConsentProps) {
    const all = value.age && value.terms && value.marketing;
    const text = dark ? "text-neutral-200" : "text-neutral-700";
    const sub = dark ? "text-neutral-400" : "text-neutral-500";
    const border = dark ? "border-neutral-700" : "border-neutral-200";

    const Row = ({ checked, onToggle, children }: { checked: boolean; onToggle: () => void; children: React.ReactNode }) => (
        <label className={`flex items-start gap-2 text-xs ${text} cursor-pointer`}>
            <input type="checkbox" checked={checked} onChange={onToggle}
                className="mt-0.5 w-4 h-4 shrink-0 rounded" style={{ accentColor }} />
            <span className="leading-relaxed">{children}</span>
        </label>
    );

    return (
        <div className={`rounded-xl border ${border} p-3 space-y-2`}>
            <Row checked={all} onToggle={() => onChange(all ? EMPTY_CONSENT : { age: true, terms: true, marketing: true })}>
                <span className="font-semibold">전체 동의</span>
            </Row>
            <div className={`border-t ${border}`} />
            <Row checked={value.age} onToggle={() => onChange({ ...value, age: !value.age })}>
                [필수] 만 14세 이상입니다
            </Row>
            <Row checked={value.terms} onToggle={() => onChange({ ...value, terms: !value.terms })}>
                [필수]{" "}
                <a href={LEGAL_DOCUMENTS.terms.path} target="_blank" rel="noopener noreferrer" className="underline" onClick={e => e.stopPropagation()}>
                    Ten:One 이용약관
                </a>
                에 동의합니다
            </Row>
            <Row checked={value.marketing} onToggle={() => onChange({ ...value, marketing: !value.marketing })}>
                [선택] 이벤트·혜택 등 광고성 정보를 이메일로 받겠습니다
            </Row>
            <p className={`text-[11px] ${sub} leading-relaxed pt-1`}>
                가입 시 수집하는 개인정보와 이용 목적은{" "}
                <a href={LEGAL_DOCUMENTS.privacy.path} target="_blank" rel="noopener noreferrer" className="underline">개인정보처리방침</a>
                에서 확인할 수 있습니다. 소식 수신은 언제든 프로필에서 철회할 수 있습니다.
            </p>
        </div>
    );
}
