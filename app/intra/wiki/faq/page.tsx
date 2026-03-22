"use client";

import { useState, useMemo } from "react";
import {
    HelpCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search,
    Lightbulb, Target, FileCheck, CalendarDays, User, Globe, GraduationCap,
    FileText, BarChart3, Megaphone, Users, CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── 카테고리 정의 ── */
type FaqCategory = "전체" | "일반" | "VRIEF·GPR" | "시스템" | "근무·복지" | "경영기획" | "콘텐츠 제작" | "마케팅·영업" | "커뮤니티" | "인사·재무";
const categories: FaqCategory[] = ["전체", "일반", "VRIEF·GPR", "시스템", "근무·복지", "경영기획", "콘텐츠 제작", "마케팅·영업", "커뮤니티", "인사·재무"];

/* ── FAQ + 업무가이드 통합 데이터 ── */
interface FaqItem {
    icon: LucideIcon;
    question: string;
    answer: string[];
    category: FaqCategory;
    link?: { text: string; href: string } | null;
    author?: string;
    updated?: string;
    views?: number;
}

const faqItems: FaqItem[] = [
    // ── FAQ (기존) ──
    {
        icon: Lightbulb, category: "VRIEF·GPR",
        question: "VRIEF가 뭔가요?",
        answer: [
            "VRIEF는 Ten:One™의 일하는 방식(프레임워크)입니다.",
            "핵심 원칙은 'PPT 먼저 켜지 말고 스토리(서술형)로 먼저 정리한다'입니다.",
            "3단계로 구성됩니다:",
            "Step 1. 조사·분석 — 문제 본질 파악 & 가설 수립",
            "Step 2. 가설 검증 — MVP/파일럿으로 빠르게 테스트",
            "Step 3. 전략 수립 — 실행 가능한 계획 완성",
            "Agile 방식으로 지속 업데이트하며, AI·디지털 도구를 적극 활용합니다.",
        ],
        link: { text: "VRIEF & GPR 교육 페이지", href: "/intra/evolution-school" },
    },
    {
        icon: Target, category: "VRIEF·GPR",
        question: "GPR은 어떻게 작성하나요?",
        answer: [
            "GPR은 Goal(목표) → Plan(계획) → Result(결과) 구조입니다.",
            "",
            "Goal: 달성하고자 하는 목표를 명확하게 서술합니다.",
            "Plan: 시간·비용·수익·인력 4가지 차원을 반드시 포함해 계획합니다.",
            "Result: 실제 결과를 기록하고 회고를 진행합니다.",
            "",
            "GPR I(기업 단위, Yearly/Quarterly), GPR II(팀 단위, Monthly/Weekly), GPR III(개인 단위, Weekly/수시)로 나뉩니다.",
            "처음에는 팀 리드와 함께 GPR III부터 작성하시면 됩니다.",
        ],
        link: { text: "GPR 작성 템플릿 보기", href: "/intra/wiki/library" },
    },
    {
        icon: FileCheck, category: "시스템",
        question: "전자결재는 어떻게 하나요?",
        answer: [
            "전자결재 시스템을 통해 다음 항목을 신청할 수 있습니다:",
            "",
            "- 휴가 신청 (연차, 반차, 경조사 등)",
            "- 경비 처리 (법인카드, 개인 선지급 정산)",
            "- 기안서 (프로젝트 제안, 구매 요청 등)",
            "- 출장 신청",
            "",
            "절차: 신청서 작성 → 팀 리드 승인 → (필요 시) 상위 결재 → 완료",
            "긴급 결재가 필요하면 메신저로 결재자에게 사전 공유하세요.",
        ],
    },
    {
        icon: CalendarDays, category: "근무·복지",
        question: "연차는 어떻게 신청하나요?",
        answer: [
            "전자결재 시스템에서 '휴가 신청'을 선택합니다.",
            "",
            "기본 규칙:",
            "- 1일 이상: 3일 전 신청",
            "- 3일 이상 연속: 1주일 전 신청",
            "- 반차: 오전(09:00~13:00) 또는 오후(14:00~18:00)",
            "",
            "잔여 연차는 Myverse > 내 정보에서 확인 가능합니다.",
            "1년 미만 재직자는 매월 1일씩 연차가 발생합니다.",
        ],
        link: { text: "핸드북 - 휴가 정책", href: "/intra/wiki/handbook" },
    },
    {
        icon: User, category: "시스템",
        question: "Myverse에서 뭘 할 수 있나요?",
        answer: [
            "Myverse는 Ten:One™의 개인 포털입니다.",
            "",
            "주요 기능:",
            "- 프로필 관리 (사진, 자기소개, 연락처)",
            "- 내 GPR 현황 확인",
            "- 소속 팀 · 프로젝트 확인",
            "- 근태 · 잔여 연차 조회",
            "- 알림 및 일정 관리",
            "",
            "입사 첫날 반드시 프로필을 완성해주세요.",
        ],
    },
    {
        icon: Globe, category: "일반",
        question: "Ten:One™ Universe가 뭔가요?",
        answer: [
            "Ten:One™ Universe는 다양한 브랜드가 연결된 멀티 브랜드 생태계입니다.",
            "",
            "주요 브랜드:",
            "- LUKI (AI 그룹)",
            "- RooK (AI 크리에이터)",
            "- Badak (네트워크)",
            "- MAD League (대학 동아리 연합)",
            "- 그 외 패션, 캐릭터, 스타트업 등 다양한 카테고리",
            "",
            "각 브랜드는 독립적으로 운영되면서 세계관으로 연결됩니다.",
        ],
    },
    {
        icon: GraduationCap, category: "일반",
        question: "필수 교육은 몇 개인가요?",
        answer: [
            "온보딩 기간 내 이수해야 할 필수 교육은 총 6개입니다:",
            "",
            "1. VRIEF Orientation (60분) — 일하는 방식",
            "2. GPR 프레임워크 이해 (45분) — 목표 관리 체계",
            "3. Mind Set (30분) — 본질·속도·이행 마인드셋",
            "4. Universe 입문 (45분) — 브랜드 생태계 이해",
            "5. 정보보안 (30분) — 보안 정책 및 데이터 취급",
            "6. 괴롭힘 예방 (30분) — 직장 내 괴롭힘 예방",
            "",
            "총 약 4시간이며, 온보딩 첫 달 내에 완료해야 합니다.",
        ],
        link: { text: "온보딩 가이드", href: "/intra/wiki/onboarding" },
    },

    // ── 업무 가이드 (기존 guides 페이지에서 통합) ──
    {
        icon: FileText, category: "경영기획",
        question: "사업계획서 작성 가이드",
        answer: [
            "사업계획서는 다음 구조를 따릅니다:",
            "",
            "1. 사업 개요 — 핵심 비전, 미션, 목표",
            "2. 시장 분석 — 시장 규모, 경쟁사, 기회 요인",
            "3. 전략 — VRIEF 프레임워크 기반 접근",
            "4. 실행 계획 — 일정, 마일스톤, 담당자",
            "5. 재무 계획 — 예산, 매출 추정, 손익",
            "",
            "VRIEF Step 1~3을 거쳐 최종 전략 문서를 완성합니다.",
        ],
        author: "박기획", updated: "2026-03-15", views: 42,
    },
    {
        icon: Lightbulb, category: "경영기획",
        question: "전략 기획 프레임워크 (VRIEF 활용)",
        answer: [
            "VRIEF를 실무에 적용하는 구체적 가이드입니다.",
            "",
            "Step 1 (조사·분석): 시장 데이터 수집 → 문제 정의 → 가설 수립",
            "Step 2 (가설 검증): MVP/파일럿 설계 → 실행 → 데이터 수집 → 가설 수정",
            "Step 3 (전략 수립): 실행 로드맵 → 예산/인력 배분 → KPI 설정",
            "",
            "각 단계별 산출물과 체크리스트는 Wiki Library에서 확인하세요.",
        ],
        author: "Cheonil Jeon", updated: "2026-03-10", views: 68,
        link: { text: "VRIEF 템플릿 다운로드", href: "/intra/wiki/library" },
    },
    {
        icon: FileText, category: "콘텐츠 제작",
        question: "콘텐츠 제작 프로세스 A to Z",
        answer: [
            "콘텐츠 제작 전체 흐름:",
            "",
            "1. 브리프 수령/작성 — 목적, 대상, 핵심 메시지",
            "2. 리서치 — 레퍼런스, 트렌드, 경쟁사 분석",
            "3. 컨셉 기획 — 핵심 아이디어, 톤앤매너",
            "4. 제작 — 디자인/영상/카피 작업",
            "5. 리뷰 — 내부 검수, 클라이언트 피드백",
            "6. 배포 — 채널별 최적화, 스케줄링",
            "7. 성과 분석 — KPI 대비 실적 리포팅",
        ],
        author: "김콘텐", updated: "2026-03-17", views: 35,
    },
    {
        icon: Lightbulb, category: "콘텐츠 제작",
        question: "AI 이미지 생성 프롬프트 가이드",
        answer: [
            "AI 이미지 생성 도구별 프롬프트 작성법:",
            "",
            "공통 원칙:",
            "- 구체적으로 (색상, 스타일, 구도, 분위기 명시)",
            "- 참조 아티스트/스타일 지정",
            "- 부정 프롬프트로 원치 않는 요소 제거",
            "",
            "활용 사례: 브랜드 키비주얼, SNS 콘텐츠, 컨셉 무드보드",
            "상세 프롬프트 예시는 Wiki Library에서 확인하세요.",
        ],
        author: "조에이", updated: "2026-03-12", views: 89,
    },
    {
        icon: FileText, category: "콘텐츠 제작",
        question: "영상 편집 워크플로우",
        answer: [
            "영상 편집 표준 프로세스:",
            "",
            "1. 소스 정리 — 촬영본 정리, 폴더 구조 통일",
            "2. 러프컷 — 스토리라인 기반 1차 편집",
            "3. 파인컷 — 색보정, 사운드, 자막",
            "4. 리뷰 — PM/클라이언트 피드백 반영",
            "5. 최종 출력 — 채널별 포맷 (16:9, 9:16, 1:1)",
            "",
            "프로젝트 코드로 작업 파일 명명: PRJ-YYYY-NNNN_[내용]_v[버전]",
        ],
        author: "이영상", updated: "2026-03-08", views: 27,
    },
    {
        icon: Megaphone, category: "마케팅·영업",
        question: "리드 발굴부터 딜 클로징까지",
        answer: [
            "영업 파이프라인 전체 흐름:",
            "",
            "1. 리드 소스 확보 — Website, Referral, Event, SNS, Badak",
            "2. 첫 컨택 — 요구사항 파악, 스코프 확인",
            "3. 제안 — VRIEF 기반 맞춤 제안서",
            "4. 협상 — 예산, 일정, 범위 조율",
            "5. 계약 — 법무 검토 후 체결",
            "6. 킥오프 — 프로젝트 등록, 팀 배정",
        ],
        author: "한마케", updated: "2026-03-14", views: 31,
    },
    {
        icon: Megaphone, category: "마케팅·영업",
        question: "SNS 콘텐츠 운영 매뉴얼",
        answer: [
            "채널별 운영 가이드:",
            "",
            "Instagram: 비주얼 중심, 캐러셀 3~5장, 해시태그 10~15개",
            "YouTube: 제목 60자 이내, 썸네일 CTR 최적화, 설명란 SEO",
            "TikTok: 15~60초, 첫 3초 후킹, 트렌드 활용",
            "",
            "주간 콘텐츠 캘린더 기반 운영. 월말 성과 리포트 필수.",
            "브랜드별 톤앤매너는 CMS Library에서 확인하세요.",
        ],
        author: "유광고", updated: "2026-03-11", views: 56,
    },
    {
        icon: Users, category: "커뮤니티",
        question: "MADLeague 시즌 운영 매뉴얼",
        answer: [
            "MADLeague 시즌 운영 전체 프로세스:",
            "",
            "1. 시즌 기획 (D-90) — 테마, 스폰서, 일정 확정",
            "2. 참여 모집 (D-60) — 5개 동아리 연합 참가 확인",
            "3. 리제로스 진행 — 경쟁 PT 3~4라운드",
            "4. 심사 & 시상 — 전문가 심사, 시상식",
            "5. 후기 & 리포트 — 참여자 후기, 스폰서 보고",
        ],
        author: "마리그", updated: "2026-03-13", views: 44,
    },
    {
        icon: Users, category: "커뮤니티",
        question: "리제로스 경쟁PT 진행 가이드",
        answer: [
            "리제로스 경쟁 PT 운영 가이드:",
            "",
            "브리프 배포 → 기획 기간(2주) → 1차 PT → 피드백 → 수정 기간(1주) → 최종 PT",
            "",
            "심사 기준: 전략성(30%), 창의성(25%), 실현가능성(25%), 발표력(20%)",
            "참여 기업 브랜드: 지평막걸리, LG U+ 등 실제 기업 대상",
        ],
        author: "리멘토", updated: "2026-03-09", views: 38,
    },
    {
        icon: Users, category: "커뮤니티",
        question: "Badak 밋업 기획·운영 가이드",
        answer: [
            "Badak 밋업 운영 프로세스:",
            "",
            "1. 기획 — 주제 선정, 연사 섭외, 장소 예약",
            "2. 모집 — 참여자 모집 (20~40명 적정)",
            "3. 진행 — 발표, 네트워킹, QA",
            "4. 후기 — 참여자 피드백, 사진/영상 정리, 콘텐츠화",
            "",
            "약한 연결 고리가 만들어내는 강력한 기회 — 그게 Badak의 핵심입니다.",
        ],
        author: "이수진", updated: "2026-03-07", views: 22,
    },
    {
        icon: FileCheck, category: "인사·재무",
        question: "신규 입사자 온보딩 체크리스트 (HR용)",
        answer: [
            "D-7: 계정 생성 (이메일, Intra, Slack)",
            "D-3: 장비 세팅, 좌석 배정",
            "D-Day: 환영 미팅, 사무실 투어, 팀 소개",
            "W1: 필수 교육 6개 이수 안내",
            "W2: 첫 GPR III 작성 (팀 리드와 함께)",
            "M1: 온보딩 피드백 면담",
            "",
            "상세 체크리스트는 HR 설정에서 관리합니다.",
        ],
        author: "박채용", updated: "2026-03-16", views: 19,
    },
    {
        icon: CreditCard, category: "인사·재무",
        question: "경비 정산 가이드",
        answer: [
            "경비 정산 절차:",
            "",
            "1. 법인카드 사용 시: 사용 내역 자동 연동, 영수증 첨부만 필요",
            "2. 개인 선지급 시: 영수증 + 사용 목적 기재 후 품의 신청",
            "",
            "증빙 요건:",
            "- 세금계산서 또는 현금영수증 필수",
            "- 간이영수증 3만원 초과 불가",
            "- 음식·접대비는 참석자 명단 필수",
            "",
            "정산 마감: 매월 25일",
        ],
        author: "강회계", updated: "2026-03-06", views: 61,
    },
];

/* ── FAQ Accordion Item ── */
function FaqAccordion({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
    const Icon = item.icon;
    return (
        <div className="border border-neutral-200 bg-white">
            <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-50 transition-colors">
                <div className="w-7 h-7 bg-neutral-100 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold">{item.question}</span>
                    {item.author && (
                        <span className="ml-2 text-[10px] text-neutral-300">{item.author} · {item.updated}</span>
                    )}
                </div>
                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-50 text-neutral-400 rounded shrink-0">{item.category === "전체" ? "" : item.category}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />}
            </button>
            {isOpen && (
                <div className="px-4 pb-4 pl-14">
                    <div className="space-y-1">
                        {item.answer.map((line, i) => line === "" ? <div key={i} className="h-2" /> : <p key={i} className="text-xs text-neutral-600">{line}</p>)}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                        {item.link && (
                            <a href={item.link.href} className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-700 transition-colors">
                                {item.link.text} &rarr;
                            </a>
                        )}
                        {item.views !== undefined && (
                            <span className="text-[10px] text-neutral-300">조회 {item.views}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export default function FaqPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [selectedCategory, setSelectedCategory] = useState<FaqCategory>("전체");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const filtered = useMemo(() => {
        return faqItems.filter(item => {
            if (selectedCategory !== "전체" && item.category !== selectedCategory) return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                return item.question.toLowerCase().includes(q) || item.answer.some(a => a.toLowerCase().includes(q));
            }
            return true;
        });
    }, [selectedCategory, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const startIdx = (currentPage - 1) * pageSize + 1;
    const endIdx = Math.min(currentPage * pageSize, filtered.length);

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
                <HelpCircle className="w-5 h-5 text-neutral-400" />
                <h1 className="text-xl font-bold">FAQ & 업무 가이드</h1>
            </div>
            <p className="text-xs text-neutral-400 mb-5">자주 묻는 질문과 업무별 가이드를 한곳에 모았습니다</p>

            {/* 검색 + 카테고리 필터 */}
            <div className="mb-4 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                    <input
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="검색..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => { setSelectedCategory(cat); setOpenIndex(null); setPage(1); }}
                            className={`px-2.5 py-1 text-xs rounded transition-colors ${selectedCategory === cat ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* 결과 수 + 페이지 크기 */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-neutral-400">{filtered.length}개 항목 중 {startIdx}~{endIdx}</p>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-neutral-400">표시:</span>
                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                        className="px-2 py-1 text-xs border border-neutral-200 rounded focus:outline-none">
                        {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}개</option>)}
                    </select>
                </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-2">
                {paged.length === 0 ? (
                    <div className="border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400">검색 결과가 없습니다.</div>
                ) : (
                    paged.map((faq, idx) => {
                        const globalIdx = (currentPage - 1) * pageSize + idx;
                        return <FaqAccordion key={globalIdx} item={faq} isOpen={openIndex === globalIdx} onToggle={() => setOpenIndex(openIndex === globalIdx ? null : globalIdx)} />;
                    })
                )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-4">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 disabled:opacity-30">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                            className={`min-w-[28px] h-7 text-xs rounded ${p === currentPage ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
                            {p}
                        </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 disabled:opacity-30">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* 문의 안내 */}
            <div className="mt-8 border border-neutral-200 bg-neutral-50 p-5 text-center">
                <p className="text-sm font-semibold mb-1">찾는 답변이 없나요?</p>
                <p className="text-xs text-neutral-500">
                    문의: <a href="mailto:lools@tenone.biz" className="font-mono bg-white px-1.5 py-0.5 border border-neutral-200 hover:border-neutral-400">lools@tenone.biz</a>
                </p>
            </div>
        </div>
    );
}
