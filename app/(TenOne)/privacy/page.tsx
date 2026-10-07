import type { Metadata } from "next";
import { COMPANY_INFO, LEGAL_DOCUMENTS } from "@/lib/company-info";

export const metadata: Metadata = { title: "개인정보처리방침" };

// 유니버스 공통 개인정보처리방침 (CLAUDE.md §0.1 데이터 계약 · 법적 검토)
// 전 브랜드 도메인의 /privacy 에서 동일하게 노출된다 (middleware skipPaths).
// 변경 시: 시행일·변경 이력 갱신 + 시행 7일 전 공지 (중요 변경 30일 전)

const EFFECTIVE_DATE = LEGAL_DOCUMENTS.privacy.effectiveDate;

const PROCESSORS = [
    { name: "Supabase, Inc.", country: "미국 (데이터 저장 위치: 대한민국 서울 리전)", task: "회원 데이터베이스·로그인 인증·파일 저장", items: "회원 정보 및 서비스 이용 중 생성되는 정보 전반" },
    { name: "Vercel Inc.", country: "미국", task: "웹 서비스 호스팅·서버 실행", items: "서비스 이용 과정의 요청 정보 (IP, 브라우저·기기 정보, 요청 내용)" },
    { name: "Cloudflare, Inc.", country: "미국", task: "자동 가입·로그인 방지 (봇 탐지)", items: "IP, 브라우저·기기 정보" },
    { name: "Resend, Inc.", country: "미국", task: "이메일 발송 (가입 인증·서비스 안내·뉴스레터)", items: "이메일, 이름" },
    { name: "Google LLC", country: "미국", task: "방문 통계 분석 (Google Analytics)", items: "쿠키 식별자, 서비스 이용 기록, 접속 정보" },
    { name: "Anthropic, PBC · OpenAI, L.L.C.", country: "미국", task: "AI 기능 제공 (진단 결과 해석, AI 코칭·요약 등) — 해당 기능 이용 시에만", items: "이용자가 AI 기능에 입력하거나 해당 기능 처리에 필요한 정보" },
];

const BRAND_ITEMS = [
    { brand: "HeRo", items: "진단(HIT) 응답·결과, 이력서·경력 정보, 희망 직무·산업, 목표·기록" },
    { brand: "MADLeague · MADLeap", items: "소속 학교·전공, 동아리·기수, 활동·대회 이력, 포트폴리오" },
    { brand: "Badak", items: "직무·산업·경력 수준, 모임·커뮤니티 활동 기록" },
    { brand: "뉴스레터", items: "이메일 (회원 가입 없이 구독 가능)" },
    { brand: "RooK (2026년 10월 14일 시행)", items: "RooKie 지원: 이름·이메일·연락처, 이력서·포트폴리오 파일, 참고 URL · 상담 / 문의: 이름·이메일·연락처·회사, 문의 내용" },
    { brand: "문의·제안", items: "이름, 이메일, 연락처, 소속, 문의 내용" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-base font-medium mb-3" style={{ color: "var(--tn-text)" }}>{title}</h2>
            {children}
        </section>
    );
}

const th = "text-left font-medium py-2 pr-3 align-top";
const td = "py-2 pr-3 align-top border-t";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: "var(--tn-bg)", color: "var(--tn-text)" }}>
            <div className="max-w-3xl mx-auto px-6">
                <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "var(--tn-text-sub)" }}>Privacy Policy</p>
                <h1 className="text-3xl font-light tracking-tight mb-4">개인정보처리방침</h1>
                <p className="text-xs mb-3" style={{ color: "var(--tn-text-sub)" }}>시행일: {EFFECTIVE_DATE}</p>
                {/* 변경 예정 공지 — 시행 7일 전부터 (12조). 시행일이 지나면 공지를 지우고 LEGAL_DOCUMENTS.privacy 버전·시행일 갱신 */}
                <p className="text-xs mb-10 px-3 py-2 border" style={{ borderColor: "var(--tn-border)", color: "var(--tn-text-sub)" }}>
                    변경 예정 공지 (2026년 10월 7일): 2026년 10월 14일부터 RooK 서비스의 수집 항목(RooKie 지원 서류 등)이 추가됩니다. 자세한 내용은 2조·3조·12조를 확인해 주세요.
                </p>

                <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--tn-text-sub)" }}>
                    <p>
                        {COMPANY_INFO.legalName}({COMPANY_INFO.brandName}, 사업자등록번호 {COMPANY_INFO.businessNumber}, 이하 &quot;회사&quot;)은 회사가 운영하는 모든 서비스(tenone.biz 및 HeRo, MADLeague, MADLeap, Badak 등
                        회사가 운영하는 각 브랜드 서비스와 그 도메인, 이하 &quot;서비스&quot;)에 이 개인정보처리방침을 공통으로 적용합니다.
                        회사는 「개인정보 보호법」 등 관련 법령을 준수하며, 하나의 Ten:One 계정으로 여러 서비스를 이용하더라도
                        각 서비스는 그 서비스의 목적 범위 안에서만 개인정보를 처리합니다.
                    </p>

                    <Section title="1. 개인정보의 처리 목적">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>회원 가입·관리: 본인 확인, Ten:One 계정 관리, 부정 이용 방지</li>
                            <li>서비스 제공: 각 서비스의 기능 제공, 콘텐츠·커뮤니티 운영, 문의 응대</li>
                            <li>서비스 개선: 이용 통계 분석 (개인을 알아볼 수 없는 형태로)</li>
                            <li>마케팅·소식 안내: 뉴스레터, 이벤트·신규 서비스 안내 — <b>별도 수신 동의한 경우에만</b></li>
                        </ul>
                        <p className="mt-2">
                            한 서비스에서 수집한 정보를 다른 서비스에서 이용하거나 다른 이용자·기업에게 공개하는 경우에는
                            그 목적·항목·기간을 알리고 <b>별도의 동의</b>를 받습니다.
                        </p>
                    </Section>

                    <Section title="2. 처리하는 개인정보 항목 및 수집 방법">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Ten:One 계정 (필수): 이메일, 이름(닉네임), 비밀번호(암호화 저장) — 소셜 로그인(Google, Kakao 등) 이용 시 해당 사업자로부터 이메일·이름·프로필 사진을 제공받습니다</li>
                            <li>공통 프로필 (선택): 전화번호, 소속, 직책, 자기소개, 프로필 사진</li>
                            <li>자동 수집: 접속 IP, 쿠키, 브라우저·기기 정보, 서비스 이용 기록</li>
                        </ul>
                        <p className="mt-3 mb-2">서비스별 추가 항목 (해당 서비스 이용 시 화면에서 고지·동의 후 수집)</p>
                        <table className="w-full text-xs">
                            <thead><tr><th className={th}>서비스</th><th className={th}>항목</th></tr></thead>
                            <tbody>
                                {BRAND_ITEMS.map(r => (
                                    <tr key={r.brand}>
                                        <td className={td} style={{ borderColor: "var(--tn-border)" }}>{r.brand}</td>
                                        <td className={td} style={{ borderColor: "var(--tn-border)" }}>{r.items}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Section>

                    <Section title="3. 개인정보의 처리 및 보유 기간">
                        <p>회원 탈퇴 또는 처리 목적 달성 시 지체 없이 파기합니다. 서비스별 탈퇴(&quot;이 서비스만 탈퇴&quot;)와 계정 전체 탈퇴를 구분하여 처리합니다. 다만 다음의 경우는 예외로 합니다.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>관련 법령에 따른 보관 (해당 기간 동안 분리 보관 후 파기)
                                <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
                                    <li>계약 또는 청약철회에 관한 기록: 5년 (전자상거래법)</li>
                                    <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
                                    <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
                                    <li>서비스 접속 기록: 3개월 (통신비밀보호법)</li>
                                </ul>
                            </li>
                            <li>게시글·댓글: 탈퇴 시 작성자를 &quot;탈퇴한 회원&quot;으로 익명 처리하여 유지하며, 탈퇴 전 본인이 삭제하거나 삭제를 요청할 수 있습니다</li>
                            <li>활동·대회·매칭 이력: 개인을 알아볼 수 없도록 익명 처리한 통계 형태로만 보관합니다</li>
                            <li>수료증: 진위 확인을 위해 이름·발급일·인증번호를 보관합니다 (발급 시 별도 고지·동의)</li>
                            <li>뉴스레터: 구독 해지 시 파기 · 문의(지원 서류·첨부 포함): 처리 완료 후 1년 보관 후 파기</li>
                        </ul>
                    </Section>

                    <Section title="4. 개인정보의 제3자 제공">
                        <p>회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 이용자가 사전에 별도 동의한 경우(예: 인재 매칭 서비스에서 이용자가 동의한 기업에 프로필을 공개하는 경우)와 법령에 특별한 규정이 있는 경우는 예외로 합니다.</p>
                    </Section>

                    <Section title="5. 개인정보 처리의 위탁 및 국외 이전">
                        <p className="mb-2">
                            회사는 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하며, 수탁자가 국외에 있어 개인정보가 국외로 이전됩니다
                            (「개인정보 보호법」 제28조의8 제1항 제3호 — 이용자와의 계약 이행을 위해 필요한 처리 위탁·보관).
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs min-w-[560px]">
                                <thead><tr><th className={th}>수탁자</th><th className={th}>이전 국가</th><th className={th}>위탁 업무</th><th className={th}>이전 항목</th></tr></thead>
                                <tbody>
                                    {PROCESSORS.map(p => (
                                        <tr key={p.name}>
                                            <td className={td} style={{ borderColor: "var(--tn-border)" }}>{p.name}</td>
                                            <td className={td} style={{ borderColor: "var(--tn-border)" }}>{p.country}</td>
                                            <td className={td} style={{ borderColor: "var(--tn-border)" }}>{p.task}</td>
                                            <td className={td} style={{ borderColor: "var(--tn-border)" }}>{p.items}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>이전 시기·방법: 서비스 이용 시점에 암호화된 네트워크(HTTPS)로 전송</li>
                            <li>보유 기간: 회원 탈퇴 또는 위탁 계약 종료 시까지 (각 수탁자의 처리 기간 정책에 따름)</li>
                            <li>국외 이전을 원하지 않는 경우 회원 탈퇴 또는 해당 기능(AI 기능 등)을 이용하지 않음으로써 거부할 수 있으며, 이 경우 해당 서비스 이용이 제한될 수 있습니다</li>
                        </ul>
                    </Section>

                    <Section title="6. 개인정보의 파기 절차 및 방법">
                        <p>파기 사유가 발생한 개인정보는 지체 없이 파기하며, 법령에 따라 보관하는 정보는 별도의 저장 공간에 분리하여 접근을 제한합니다. 전자적 파일은 복구할 수 없는 방법으로 삭제하고, 백업에 남은 정보는 백업 보관 주기가 끝나면 함께 삭제됩니다.</p>
                    </Section>

                    <Section title="7. 이용자의 권리와 행사 방법">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>이용자는 언제든지 개인정보 열람·정정·삭제·처리정지 및 동의 철회를 요구할 수 있습니다</li>
                            <li>프로필 페이지에서 직접 수정하거나, 아래 개인정보 보호책임자에게 이메일로 요청할 수 있으며 회사는 10일 이내에 조치합니다</li>
                            <li>법정대리인 또는 위임받은 자를 통해서도 행사할 수 있습니다</li>
                        </ul>
                    </Section>

                    <Section title="8. 만 14세 미만 아동">
                        <p>회사는 만 14세 미만 아동의 회원 가입을 받지 않습니다. 만 14세 미만 이용이 필요한 서비스를 운영하게 되는 경우 법정대리인의 동의를 받습니다.</p>
                    </Section>

                    <Section title="9. 개인정보의 안전성 확보 조치">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>접근 통제: 데이터베이스 행 단위 접근 제어, 관리 기능의 직원 전용 제한, 최소 인원 접근</li>
                            <li>암호화: 비밀번호 암호화 저장, 전 구간 HTTPS 전송</li>
                            <li>부정 이용 방지: 자동 가입·로그인 차단(봇 탐지), 접속 기록 보관</li>
                        </ul>
                    </Section>

                    <Section title="10. 쿠키의 설치·운영 및 거부">
                        <p>로그인 유지와 방문 통계를 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있으며, 이 경우 로그인 등 일부 기능 이용이 어려울 수 있습니다.</p>
                    </Section>

                    <Section title="11. 개인정보 보호책임자">
                        <p>성명: {COMPANY_INFO.representative} · 직책: 대표 · 이메일: {COMPANY_INFO.privacyOfficerEmail}</p>
                        <p className="mt-1">사업자: {COMPANY_INFO.legalName} ({COMPANY_INFO.brandName}) · 사업자등록번호 {COMPANY_INFO.businessNumber}</p>
                        <p className="mt-2">개인정보 침해에 대한 신고·상담은 아래 기관에 문의할 수 있습니다.</p>
                        <ul className="list-disc pl-5 mt-1 space-y-0.5">
                            <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
                            <li>개인정보침해신고센터: 118 (privacy.kisa.or.kr)</li>
                            <li>대검찰청: 1301 (www.spo.go.kr) · 경찰청: 182 (ecrm.police.go.kr)</li>
                        </ul>
                    </Section>

                    <Section title="12. 개인정보처리방침의 변경">
                        <p>이 방침을 변경하는 경우 시행 7일 전(이용자 권리에 중요한 변경은 30일 전)부터 서비스 화면에 공지합니다.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-0.5">
                            <li>2026년 10월 14일 (10월 7일 공지): RooK 서비스 수집 항목 추가 (RooKie 지원 이력서·포트폴리오 파일·참고 URL, 상담 / 문의)</li>
                            <li>2026년 10월 5일: 유니버스 전 서비스 공통 적용, 처리 위탁·국외 이전, 서비스별 수집 항목, 보유 기간 세분화, 만 14세 미만, 안전성 확보 조치, 쿠키 항목 추가</li>
                            <li>2026년 3월 26일: 최초 시행</li>
                        </ul>
                    </Section>
                </div>
            </div>
        </div>
    );
}
