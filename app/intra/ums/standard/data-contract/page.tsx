/**
 * 데이터 계약 5조 + 서비스 종료 표준 절차 + 법적 검토 기준 — CLAUDE.md §0.1 (2026-10-05 확정)
 */
import { FileSignature, Scale, Power } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

const CONTRACTS = [
    { n: 1, title: "바뀌지 않는 ID", rule: "회원 데이터의 유일한 열쇠는 members.id(UUID). 이메일·이름은 속성일 뿐 연결 키로 쓰지 않고, 계정 정보(이름·이메일·사진)를 브랜드 테이블에 복사하지 않는다. 회원이 아닌 사람(구독자·문의자·지원자·CRM 연락처)만 email로 식별", risk: "이메일 변경 시 데이터 단절, 이메일로 남의 데이터 덮어쓰기" },
    { n: 2, title: "권한은 한 곳에서", rule: "권한 판단은 member_roles + 공통 함수(lib/api-guard.ts, auth_is_staff())로만. 브랜드 자체 권한 컬럼 금지, 본인이 수정 가능한 컬럼으로 권한 판단 금지", risk: "브랜드마다 다른 권한 판단 → 권한 상승" },
    { n: 3, title: "데이터는 서비스가 소유", rule: "저장소는 공유하지만 테이블 주인은 한 브랜드. 다른 브랜드 테이블은 공통 API·뷰로만. 공통 기능은 집중 브랜드 2곳 이상이 실제로 필요할 때 코어로 끌어올림", risk: "한 서비스 종료·변경이 다른 서비스를 깨뜨림" },
    { n: 4, title: "동의는 서비스별", rule: "개인정보처리방침은 하나(운영사 TenOne). 브랜드 첫 진입 시 약관 동의를 member_brand_joins에 버전과 함께 기록. 한 브랜드 데이터를 다른 브랜드에서 쓰거나 노출하려면 별도 동의", risk: "Google Buzz(2010) — 동의 없는 연락처 노출 → FTC 20년 감사" },
    { n: 5, title: "생애주기 절차", rule: "출시: 체크리스트 + 개인정보·보안 점검. 탈퇴: \"이 브랜드만\" / \"계정 전체\" 구분, 브랜드별 탈퇴 처리 사전 정의(docs/Data_Lifecycle.md). 종료: 아래 절차", risk: "종료 시 데이터 방치·무단 삭제, 탈퇴 후 데이터 잔존" },
];

const SUNSET_STEPS = [
    "종료 결정·공지 (회원 있으면 최소 30일 전, 이메일 + 사이트 배너)",
    "신규 가입·결제 중단",
    "읽기 전용 전환",
    "데이터 내보내기 또는 후속 브랜드로 이전 안내 (동의 받은 경우만 이전)",
    "종료일 접속 차단 (ums_sites 상태 변경, CANONICAL/라우팅 정리, API 차단)",
    "보관 기간 경과 후 삭제 (백업 포함)",
    "개인정보처리방침·CLAUDE.md Tier 표 갱신",
];

const LEGAL = [
    { when: "개인정보 수집·이용", law: "개인정보보호법 제15·16조", key: "목적·항목·보관기간 고지 + 동의, 최소 수집" },
    { when: "수집 목적과 다른 용도 (브랜드 간 활용 포함)", law: "개인정보보호법 제18조", key: "별도 동의 없이는 금지 — 같은 운영사라도 브랜드 간 목적이 다르면 해당" },
    { when: "다른 사람·기업에게 제공", law: "개인정보보호법 제17조", key: "제공받는 자·목적·항목·기간을 밝힌 별도 동의" },
    { when: "탈퇴·목적 달성 후 보관", law: "개인정보보호법 제21조 · 제58조의2", key: "지체 없이 파기. 영구 보관은 익명화 정보만, 법정 보관 기록은 그 기간만" },
    { when: "만 14세 미만", law: "개인정보보호법 제22조의2", key: "법정대리인 동의" },
    { when: "광고성 메일·알림", law: "정보통신망법 제50조", key: "수신 동의 별도, 야간(21~08시) 별도 동의, 수신거부 수단" },
    { when: "결제·환불", law: "전자상거래법", key: "계약·결제 기록 5년, 소비자 불만 3년, 청약철회" },
    { when: "구인·구직 연결, 인재 매칭", law: "직업안정법 · 채용절차법", key: "직업소개·직업정보제공사업 등록·신고, 장부 보존, 서류 반환·파기" },
    { when: "약관", law: "약관규제법", key: "불공정 조항 무효, 중요 내용 설명" },
    { when: "위치 정보", law: "위치정보법", key: "별도 동의·사업 신고" },
];

export default function DataContractPage() {
    return (
        <div className="space-y-8">
            <PageHeader title="데이터 계약 · 생애주기" description="각 서비스 내부는 자유, 공통 계약은 강제 — 모든 브랜드 예외 없이 (2026-10-05 확정)" />

            <section>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2"><FileSignature className="h-4 w-4" /> 데이터 계약 5조</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600 w-40">계약</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">규칙</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600 w-56">위반 시 사고</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CONTRACTS.map(c => (
                                <tr key={c.n} className="border-b border-neutral-100 last:border-0 align-top">
                                    <td className="px-3 py-2.5 font-semibold text-neutral-900">{c.n}. {c.title}</td>
                                    <td className="px-3 py-2.5 text-neutral-700 leading-relaxed">{c.rule}</td>
                                    <td className="px-3 py-2.5 text-rose-700 leading-relaxed">{c.risk}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-[11px] text-neutral-500 mt-2">
                    브랜드 간 API: 필요한 필드만 · 인증 필수 · 본인 데이터만. 관리용 API는 lib/api-access-policy.ts로 직원 전용.
                </p>
            </section>

            <section>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2"><Power className="h-4 w-4" /> 서비스 종료 표준 절차</h2>
                <ol className="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                    {SUNSET_STEPS.map((s, i) => (
                        <li key={s} className="px-4 py-2.5 text-xs text-neutral-700 flex gap-3">
                            <span className="font-mono text-neutral-400">{"①②③④⑤⑥⑦"[i]}</span>{s}
                        </li>
                    ))}
                </ol>
                <p className="text-[11px] text-neutral-500 mt-2">
                    회원 0인 브랜드는 ①·④ 생략 가능, ⑤~⑦은 동일. 실행 장치: ums_sites.tier/lifecycle/hosting/sunset_at · member_brand_withdrawals.scope
                </p>
            </section>

            <section>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2"><Scale className="h-4 w-4" /> 법적 검토 기준</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">상황</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">확인할 법</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">핵심</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LEGAL.map(l => (
                                <tr key={l.when} className="border-b border-neutral-100 last:border-0">
                                    <td className="px-3 py-2 text-neutral-900">{l.when}</td>
                                    <td className="px-3 py-2 text-neutral-600">{l.law}</td>
                                    <td className="px-3 py-2 text-neutral-600">{l.key}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-[11px] text-neutral-500 mt-2">
                    적용 시점: 기능 기획 → 테이블 설계 → 출시 체크리스트 → 종료 절차. 방침·약관 문안과 신규 사업 등록 요건은 출시 전 법률 검토 권고.
                </p>
            </section>
        </div>
    );
}
