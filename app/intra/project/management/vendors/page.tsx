"use client";

import { useState } from "react";
import { Plus, Search, Star, ChevronDown, ChevronRight, Edit2, Building2, Phone, Mail, CreditCard, FileText, MoreVertical } from "lucide-react";
import clsx from "clsx";

type VendorCategory = '제작사' | '매체사' | '프리랜서' | '렙사' | '인쇄사' | '이벤트사' | '촬영스튜디오' | '음향스튜디오' | 'IT/개발사' | '디자인스튜디오' | '기타';
type VendorStatus = '활성' | '휴면' | '블랙리스트' | '신규';

interface VendorEvaluation {
    date: string;
    evaluator: string;
    score: number; // 1-5
    comment: string;
    project: string;
}

interface Vendor {
    id: string;
    category: VendorCategory;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    bizNumber: string; // 사업자 번호
    bankInfo: string; // 계좌 정보
    dealCount: number; // 거래건수 (자동 집계)
    avgRating: number; // 평균 평가
    status: VendorStatus;
    address?: string;
    note?: string;
    evaluations: VendorEvaluation[];
    registeredAt: string;
}

const categories: VendorCategory[] = ['제작사', '매체사', '프리랜서', '렙사', '인쇄사', '이벤트사', '촬영스튜디오', '음향스튜디오', 'IT/개발사', '디자인스튜디오', '기타'];

const statusStyle: Record<VendorStatus, string> = {
    '활성': 'bg-green-50 text-green-600',
    '휴면': 'bg-neutral-100 text-neutral-400',
    '블랙리스트': 'bg-red-50 text-red-500',
    '신규': 'bg-blue-50 text-blue-600',
};

const initialVendors: Vendor[] = [
    {
        id: 'v1', category: '제작사', name: '(주)크리에이팅 프로덕션', contactPerson: '정프로', phone: '02-1234-5678', email: 'jp@creating.co.kr',
        bizNumber: '123-45-67890', bankInfo: '국민은행 123456-78-901234 (주)크리에이팅', dealCount: 12, avgRating: 4.5, status: '활성',
        address: '서울시 강남구 역삼동', registeredAt: '2024-03-15',
        evaluations: [
            { date: '2026-03-10', evaluator: 'Sarah Kim', score: 5, comment: '납기 준수, 퀄리티 우수', project: 'LUKI 2nd Single' },
            { date: '2025-12-20', evaluator: '김콘텐', score: 4, comment: '소통 원활, 일부 수정 필요했음', project: 'LUKI 1st Single' },
        ],
    },
    {
        id: 'v2', category: '매체사', name: '메가미디어', contactPerson: '한매체', phone: '02-2345-6789', email: 'media@mega.co.kr',
        bizNumber: '234-56-78901', bankInfo: '신한은행 234567-89-012345 메가미디어', dealCount: 8, avgRating: 4.0, status: '활성',
        registeredAt: '2024-06-01',
        evaluations: [
            { date: '2026-02-15', evaluator: '유광고', score: 4, comment: '미디어 플래닝 정확, 단가 합리적', project: 'LUKI 2nd Single' },
        ],
    },
    {
        id: 'v3', category: '프리랜서', name: '박영상 PD', contactPerson: '박영상', phone: '010-3456-7890', email: 'park.pd@gmail.com',
        bizNumber: '345-67-89012', bankInfo: '카카오뱅크 3333-01-2345678 박영상', dealCount: 5, avgRating: 4.8, status: '활성',
        registeredAt: '2025-01-10',
        evaluations: [
            { date: '2026-03-05', evaluator: '이영상', score: 5, comment: '촬영 퀄리티 최고, 신뢰할 수 있는 파트너', project: 'LUKI 2nd Single' },
        ],
    },
    {
        id: 'v4', category: '렙사', name: '애드스타 에이전시', contactPerson: '윤렙사', phone: '02-4567-8901', email: 'yoon@adstar.co.kr',
        bizNumber: '456-78-90123', bankInfo: '우리은행 456789-01-234567 애드스타', dealCount: 3, avgRating: 3.5, status: '활성',
        registeredAt: '2025-06-15',
        evaluations: [
            { date: '2026-01-20', evaluator: '한마케', score: 3, comment: '커미션 높은 편, 성과는 보통', project: '리제로스 시즌1' },
        ],
    },
    {
        id: 'v5', category: '인쇄사', name: '프린트올', contactPerson: '최인쇄', phone: '02-5678-9012', email: 'choi@printall.kr',
        bizNumber: '567-89-01234', bankInfo: '하나은행 567890-12-345678 프린트올', dealCount: 6, avgRating: 4.2, status: '활성',
        registeredAt: '2024-09-01',
        evaluations: [],
    },
    {
        id: 'v6', category: '이벤트사', name: '라이브커넥트', contactPerson: '강이벤', phone: '02-6789-0123', email: 'kang@liveconnect.kr',
        bizNumber: '678-90-12345', bankInfo: '기업은행 678901-23-456789 라이브커넥트', dealCount: 4, avgRating: 4.3, status: '활성',
        registeredAt: '2025-03-20',
        evaluations: [
            { date: '2026-02-28', evaluator: '마리그', score: 4, comment: '인사이트 투어링 행사 운영 양호', project: 'MADLeague 투어링' },
        ],
    },
    {
        id: 'v7', category: '촬영스튜디오', name: '스튜디오 W', contactPerson: '임촬영', phone: '02-7890-1234', email: 'lim@studiow.kr',
        bizNumber: '789-01-23456', bankInfo: '국민은행 789012-34-567890 스튜디오W', dealCount: 7, avgRating: 4.6, status: '활성',
        registeredAt: '2024-04-10',
        evaluations: [],
    },
    {
        id: 'v8', category: 'IT/개발사', name: '코드랩', contactPerson: '서개발', phone: '02-8901-2345', email: 'seo@codelab.dev',
        bizNumber: '890-12-34567', bankInfo: '토스뱅크 1000-1234-5678 코드랩', dealCount: 2, avgRating: 4.0, status: '신규',
        registeredAt: '2026-02-01',
        evaluations: [],
    },
    {
        id: 'v9', category: '디자인스튜디오', name: '디자인랩', contactPerson: '류디자', phone: '02-9012-3456', email: 'ryu@designlab.kr',
        bizNumber: '901-23-45678', bankInfo: '신한은행 901234-56-789012 디자인랩', dealCount: 9, avgRating: 4.4, status: '활성',
        registeredAt: '2024-01-20',
        evaluations: [
            { date: '2026-03-15', evaluator: '박디자', score: 5, comment: 'BI/BX 작업 퀄리티 탁월', project: 'Brand Gravity' },
            { date: '2025-11-10', evaluator: '조브랜', score: 4, comment: '일정 준수, 디자인 시안 다양', project: 'Brand Gravity' },
        ],
    },
    {
        id: 'v10', category: '음향스튜디오', name: '사운드팩토리', contactPerson: '노음향', phone: '02-0123-4567', email: 'noh@soundfactory.kr',
        bizNumber: '012-34-56789', bankInfo: '우리은행 012345-67-890123 사운드팩토리', dealCount: 3, avgRating: 4.7, status: '활성',
        registeredAt: '2025-08-05',
        evaluations: [
            { date: '2026-03-01', evaluator: '이영상', score: 5, comment: 'LUKI 음원 믹싱 퀄리티 최상', project: 'LUKI 2nd Single' },
        ],
    },
    {
        id: 'v11', category: '프리랜서', name: '김카피', contactPerson: '김카피', phone: '010-1111-2222', email: 'kim.copy@gmail.com',
        bizNumber: '111-22-33344', bankInfo: '카카오뱅크 3333-02-3456789 김카피', dealCount: 1, avgRating: 0, status: '휴면',
        registeredAt: '2025-05-01', note: '1회 거래 후 연락 두절',
        evaluations: [],
    },
];

function RatingStars({ value, size = "sm" }: { value: number; size?: "sm" | "xs" }) {
    const s = size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3";
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={clsx(s, i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-neutral-200")} />
            ))}
        </div>
    );
}

export default function VendorsPage() {
    const [vendors, setVendors] = useState(initialVendors);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("전체");
    const [statusFilter, setStatusFilter] = useState("전체");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [evalModal, setEvalModal] = useState<string | null>(null);
    const [evalScore, setEvalScore] = useState(0);
    const [evalComment, setEvalComment] = useState("");
    const [evalProject, setEvalProject] = useState("");

    const filtered = vendors.filter(v => {
        if (catFilter !== "전체" && v.category !== catFilter) return false;
        if (statusFilter !== "전체" && v.status !== statusFilter) return false;
        if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.contactPerson.includes(search)) return false;
        return true;
    });

    const submitEval = (vendorId: string) => {
        if (evalScore === 0) return;
        setVendors(prev => prev.map(v => {
            if (v.id !== vendorId) return v;
            const newEval: VendorEvaluation = { date: new Date().toISOString().slice(0, 10), evaluator: 'Cheonil Jeon', score: evalScore, comment: evalComment, project: evalProject || '-' };
            const evals = [...v.evaluations, newEval];
            const avg = evals.reduce((s, e) => s + e.score, 0) / evals.length;
            return { ...v, evaluations: evals, avgRating: Math.round(avg * 10) / 10 };
        }));
        setEvalModal(null);
        setEvalScore(0);
        setEvalComment("");
        setEvalProject("");
    };

    const toggleStatus = (id: string) => {
        setVendors(prev => prev.map(v => {
            if (v.id !== id) return v;
            const next: VendorStatus = v.status === '활성' ? '휴면' : v.status === '휴면' ? '활성' : v.status;
            return { ...v, status: next };
        }));
    };

    const catCounts = categories.reduce((acc, c) => { acc[c] = vendors.filter(v => v.category === c).length; return acc; }, {} as Record<string, number>);

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-bold">협력사</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">프로젝트 협력사 등록 · 평가 · 거래 관리</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800">
                    <Plus className="h-3.5 w-3.5" /> 협력사 등록
                </button>
            </div>

            {/* 요약 */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">전체 협력사</p>
                    <p className="text-xl font-bold">{vendors.length}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">활성</p>
                    <p className="text-xl font-bold text-green-600">{vendors.filter(v => v.status === '활성').length}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">총 거래건수</p>
                    <p className="text-xl font-bold">{vendors.reduce((s, v) => s + v.dealCount, 0)}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">평균 평점</p>
                    <p className="text-xl font-bold">{(vendors.filter(v => v.avgRating > 0).reduce((s, v) => s + v.avgRating, 0) / (vendors.filter(v => v.avgRating > 0).length || 1)).toFixed(1)}</p>
                </div>
            </div>

            {/* 필터 */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="협력사명, 담당자 검색..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                </div>
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                    className="px-2 py-1.5 text-xs border border-neutral-200 rounded bg-white">
                    <option value="전체">분류: 전체</option>
                    {categories.map(c => <option key={c} value={c}>{c} ({catCounts[c] || 0})</option>)}
                </select>
                <div className="flex gap-1">
                    {['전체', '활성', '신규', '휴면', '블랙리스트'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={clsx("px-2 py-1 text-[11px] rounded border", statusFilter === s ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 hover:border-neutral-400")}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* 테이블 */}
            <div className="border border-neutral-200 bg-white">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-neutral-100 text-[11px] text-neutral-400 uppercase tracking-wider">
                    <span className="col-span-1">분류</span>
                    <span className="col-span-2">협력사명</span>
                    <span className="col-span-1">담당자</span>
                    <span className="col-span-2">연락처</span>
                    <span className="col-span-2">사업자번호</span>
                    <span className="col-span-1">평가</span>
                    <span className="col-span-1">거래</span>
                    <span className="col-span-1">상태</span>
                    <span className="col-span-1"></span>
                </div>
                {filtered.map(v => {
                    const isExpanded = expandedId === v.id;
                    return (
                        <div key={v.id}>
                            <div className={clsx("grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-neutral-50 items-center hover:bg-neutral-50 cursor-pointer transition-colors",
                                isExpanded && "bg-neutral-50")}
                                onClick={() => setExpandedId(isExpanded ? null : v.id)}>
                                <span className="col-span-1 text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded w-fit">{v.category}</span>
                                <div className="col-span-2">
                                    <span className="text-xs font-medium">{v.name}</span>
                                </div>
                                <span className="col-span-1 text-xs text-neutral-600">{v.contactPerson}</span>
                                <div className="col-span-2 text-[11px] text-neutral-500">
                                    <div>{v.phone}</div>
                                </div>
                                <span className="col-span-2 text-[11px] font-mono text-neutral-400">{v.bizNumber}</span>
                                <div className="col-span-1">
                                    {v.avgRating > 0 ? (
                                        <div className="flex items-center gap-1">
                                            <RatingStars value={v.avgRating} size="xs" />
                                            <span className="text-[10px] text-neutral-400">{v.avgRating}</span>
                                        </div>
                                    ) : <span className="text-[10px] text-neutral-300">미평가</span>}
                                </div>
                                <span className="col-span-1 text-xs font-medium">{v.dealCount}건</span>
                                <span className={`col-span-1 text-[10px] px-1.5 py-0.5 rounded w-fit ${statusStyle[v.status]}`}>{v.status}</span>
                                <div className="col-span-1 flex justify-end">
                                    {isExpanded ? <ChevronDown className="h-3 w-3 text-neutral-400" /> : <ChevronRight className="h-3 w-3 text-neutral-400" />}
                                </div>
                            </div>

                            {/* 상세 */}
                            {isExpanded && (
                                <div className="px-4 py-4 border-b border-neutral-100 bg-neutral-50/50 space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-xs">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-neutral-400" /> <a href={`mailto:${v.email}`} className="text-blue-600 hover:underline">{v.email}</a></div>
                                            <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-neutral-400" /> {v.phone}</div>
                                            {v.address && <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3 text-neutral-400" /> {v.address}</div>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <div><span className="text-neutral-400">사업자번호:</span> <span className="font-mono">{v.bizNumber}</span></div>
                                            <div className="flex items-center gap-1.5"><CreditCard className="h-3 w-3 text-neutral-400" /> {v.bankInfo}</div>
                                            <div><span className="text-neutral-400">등록일:</span> {v.registeredAt}</div>
                                        </div>
                                        <div className="space-y-1.5">
                                            {v.note && <div><span className="text-neutral-400">비고:</span> {v.note}</div>}
                                            <div className="flex gap-2">
                                                <button onClick={e => { e.stopPropagation(); setEvalModal(v.id); }} className="flex items-center gap-1 px-2 py-1 text-[11px] border border-neutral-200 hover:bg-white rounded">
                                                    <Star className="h-2.5 w-2.5" /> 평가하기
                                                </button>
                                                <button onClick={e => { e.stopPropagation(); toggleStatus(v.id); }} className="flex items-center gap-1 px-2 py-1 text-[11px] border border-neutral-200 hover:bg-white rounded">
                                                    상태 변경
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 평가 이력 */}
                                    {v.evaluations.length > 0 && (
                                        <div>
                                            <p className="text-[11px] font-medium text-neutral-500 mb-2">평가 이력 ({v.evaluations.length}건)</p>
                                            <div className="space-y-1.5">
                                                {v.evaluations.map((ev, i) => (
                                                    <div key={i} className="flex items-start gap-3 bg-white border border-neutral-100 px-3 py-2 rounded">
                                                        <RatingStars value={ev.score} size="xs" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-neutral-600">{ev.comment}</p>
                                                            <p className="text-[10px] text-neutral-300 mt-0.5">{ev.evaluator} · {ev.project} · {ev.date}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-neutral-400 text-right mt-2">{filtered.length}개 표시 / 전체 {vendors.length}개</p>

            {/* 평가 모달 */}
            {evalModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setEvalModal(null)}>
                    <div className="bg-white rounded-lg w-[380px] shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-3 border-b border-neutral-100">
                            <h3 className="text-sm font-bold">협력사 평가</h3>
                            <p className="text-xs text-neutral-400">{vendors.find(v => v.id === evalModal)?.name}</p>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">점수 *</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} onClick={() => setEvalScore(s)}
                                            className={clsx("h-8 w-8 rounded", evalScore === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200")}>
                                            {s}
                                        </button>
                                    ))}
                                    {evalScore > 0 && <span className="text-[11px] text-neutral-400 self-center ml-2">{['', '매우 미흡', '미흡', '보통', '우수', '매우 우수'][evalScore]}</span>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">관련 프로젝트</label>
                                <input value={evalProject} onChange={e => setEvalProject(e.target.value)} placeholder="프로젝트명"
                                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 placeholder:text-neutral-300" />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">코멘트</label>
                                <textarea value={evalComment} onChange={e => setEvalComment(e.target.value)} rows={3} placeholder="납기, 퀄리티, 소통, 단가 등..."
                                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded resize-none focus:outline-none focus:border-neutral-400 placeholder:text-neutral-300" />
                            </div>
                        </div>
                        <div className="px-5 py-3 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => setEvalModal(null)} className="px-4 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 rounded">취소</button>
                            <button onClick={() => submitEval(evalModal)} disabled={evalScore === 0}
                                className="px-4 py-1.5 text-xs bg-neutral-900 text-white disabled:opacity-30">평가 등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
