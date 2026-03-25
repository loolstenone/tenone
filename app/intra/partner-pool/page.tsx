"use client";

import { useState } from "react";
import {
    Plus, Search, Star, Building2, User, MapPin, ExternalLink, X,
    Briefcase, Phone, Mail, Globe, Tag, Filter,
} from "lucide-react";
import clsx from "clsx";

type PartnerType = 'company' | 'freelancer';
type RateType = 'hourly' | 'project' | 'monthly';

interface Partner {
    id: string;
    type: PartnerType;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    skills: string[];
    speciality?: string;
    portfolioUrl?: string;
    rating: number;
    totalProjects: number;
    rateType?: RateType;
    rateAmount?: number;
    isActive: boolean;
    notes?: string;
    createdAt: string;
}

const skillOptions = ['디자인', '영상', '개발', '사진', '인쇄', '카피라이팅', '번역', '3D', 'AI', '마케팅', '기획', '일러스트', '음악', '모션그래픽'];
const rateLabels: Record<RateType, string> = { hourly: '시급', project: '건당', monthly: '월정액' };

const mockPartners: Partner[] = [
    { id: 'p1', type: 'freelancer', name: '김디자인', contactName: '김디자인', email: 'kim@design.kr', phone: '010-1234-5678', skills: ['디자인', '일러스트', 'UI/UX'], speciality: '브랜드 아이덴티티 디자인', portfolioUrl: 'https://behance.net/kimdesign', rating: 4.8, totalProjects: 12, rateType: 'project', rateAmount: 3000000, isActive: true, createdAt: '2025-06-01' },
    { id: 'p2', type: 'company', name: '비주얼웍스', contactName: '박대표', email: 'info@visualworks.co.kr', phone: '02-1234-5678', skills: ['영상', '모션그래픽', '3D'], speciality: 'MV/광고 영상 제작', rating: 4.5, totalProjects: 8, rateType: 'project', rateAmount: 15000000, isActive: true, createdAt: '2025-03-15' },
    { id: 'p3', type: 'freelancer', name: '이개발', email: 'lee@dev.com', skills: ['개발', 'AI'], speciality: 'Next.js + AI 서비스 개발', rating: 4.9, totalProjects: 5, rateType: 'hourly', rateAmount: 80000, isActive: true, createdAt: '2025-09-01' },
    { id: 'p4', type: 'company', name: '포토스튜디오A', contactName: '최실장', email: 'studio@photo-a.com', skills: ['사진'], speciality: '제품/인물 사진 촬영', rating: 4.2, totalProjects: 15, rateType: 'project', rateAmount: 2000000, isActive: true, createdAt: '2024-11-01' },
    { id: 'p5', type: 'freelancer', name: '박카피', email: 'park@copy.kr', skills: ['카피라이팅', '마케팅', '기획'], speciality: '광고 카피 + SNS 콘텐츠', rating: 4.6, totalProjects: 20, rateType: 'monthly', rateAmount: 4000000, isActive: true, createdAt: '2025-01-10' },
    { id: 'p6', type: 'company', name: '프린트원', contactName: '강팀장', email: 'print@printone.kr', phone: '02-9876-5432', skills: ['인쇄'], speciality: '대형 인쇄물, 패키지, 명함', rating: 4.0, totalProjects: 30, rateType: 'project', isActive: true, createdAt: '2024-05-01' },
    { id: 'p7', type: 'freelancer', name: '정번역', email: 'jung@translator.com', skills: ['번역'], speciality: '영/일/중 마케팅 번역', rating: 4.7, totalProjects: 10, rateType: 'hourly', rateAmount: 50000, isActive: false, notes: '2026년 상반기 휴직', createdAt: '2025-04-01' },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} className={clsx("h-3 w-3", n <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-neutral-200")} />
            ))}
            <span className="text-xs text-neutral-500 ml-1">{rating.toFixed(1)}</span>
        </div>
    );
}

export default function PartnerPoolPage() {
    const [partners] = useState(mockPartners);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | PartnerType>('all');
    const [skillFilter, setSkillFilter] = useState<string>('all');
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [showAdd, setShowAdd] = useState(false);

    const filtered = partners.filter(p => {
        if (typeFilter !== 'all' && p.type !== typeFilter) return false;
        if (skillFilter !== 'all' && !p.skills.includes(skillFilter)) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            return p.name.toLowerCase().includes(q) || (p.speciality || '').toLowerCase().includes(q) || p.skills.some(s => s.toLowerCase().includes(q));
        }
        return true;
    });

    const activeCount = partners.filter(p => p.isActive).length;
    const companyCount = partners.filter(p => p.type === 'company').length;
    const freelancerCount = partners.filter(p => p.type === 'freelancer').length;
    const avgRating = partners.length > 0 ? (partners.reduce((s, p) => s + p.rating, 0) / partners.length) : 0;

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">Partner Pool</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">외부 협력사 · 프리랜서 등록 · 검색 · 프로젝트 투입</p>
                </div>
                <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800">
                    <Plus className="h-4 w-4" /> 파트너 등록
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">전체 파트너</p>
                    <p className="text-xl font-bold">{partners.length}<span className="text-xs font-normal text-neutral-400 ml-1">({activeCount} 활성)</span></p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">회사</p>
                    <p className="text-xl font-bold text-blue-600">{companyCount}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">프리랜서</p>
                    <p className="text-xl font-bold text-green-600">{freelancerCount}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">평균 평점</p>
                    <p className="text-xl font-bold text-amber-500">{avgRating.toFixed(1)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 전문분야, 역량 검색..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                </div>
                <div className="flex gap-1">
                    {([['all', '전체'], ['company', '회사'], ['freelancer', '프리랜서']] as const).map(([k, l]) => (
                        <button key={k} onClick={() => setTypeFilter(k)}
                            className={clsx("px-3 py-1.5 text-xs rounded transition-colors",
                                typeFilter === k ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200")}>{l}</button>
                    ))}
                </div>
                <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none bg-white">
                    <option value="all">전체 역량</option>
                    {skillOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Partner List */}
            <div className="space-y-2">
                {filtered.length === 0 ? (
                    <div className="border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400">파트너가 없습니다.</div>
                ) : filtered.map(p => (
                    <button key={p.id} onClick={() => setSelectedPartner(p)}
                        className="w-full text-left border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                p.type === 'company' ? "bg-blue-50" : "bg-green-50")}>
                                {p.type === 'company' ? <Building2 className="h-5 w-5 text-blue-400" /> : <User className="h-5 w-5 text-green-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-neutral-800">{p.name}</span>
                                    <span className={clsx("text-[10px] px-1.5 py-0.5 rounded",
                                        p.type === 'company' ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600")}>
                                        {p.type === 'company' ? '회사' : '프리랜서'}
                                    </span>
                                    {!p.isActive && <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-400 rounded">비활성</span>}
                                </div>
                                {p.speciality && <p className="text-xs text-neutral-500 mb-1.5">{p.speciality}</p>}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {p.skills.map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">{s}</span>)}
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <StarRating rating={p.rating} />
                                <p className="text-[10px] text-neutral-400 mt-1">프로젝트 {p.totalProjects}건</p>
                                {p.rateAmount && <p className="text-xs text-neutral-600 mt-0.5">{p.rateAmount.toLocaleString()}원/{rateLabels[p.rateType!]}</p>}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-md mx-4 shadow-xl rounded">
                        <div className="p-5 border-b border-neutral-100 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center",
                                    selectedPartner.type === 'company' ? "bg-blue-50" : "bg-green-50")}>
                                    {selectedPartner.type === 'company' ? <Building2 className="h-6 w-6 text-blue-400" /> : <User className="h-6 w-6 text-green-400" />}
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold">{selectedPartner.name}</h2>
                                    <p className="text-xs text-neutral-400">{selectedPartner.type === 'company' ? '회사' : '프리랜서'}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPartner(null)}><X className="h-4 w-4 text-neutral-400" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <StarRating rating={selectedPartner.rating} />
                            {selectedPartner.speciality && (
                                <div><p className="text-xs text-neutral-500 mb-1">전문 분야</p><p className="text-sm">{selectedPartner.speciality}</p></div>
                            )}
                            <div className="flex gap-1.5 flex-wrap">
                                {selectedPartner.skills.map(s => <span key={s} className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">{s}</span>)}
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><p className="text-xs text-neutral-500 mb-0.5">완료 프로젝트</p><p className="font-medium">{selectedPartner.totalProjects}건</p></div>
                                {selectedPartner.rateAmount && (
                                    <div><p className="text-xs text-neutral-500 mb-0.5">단가</p><p className="font-medium">{selectedPartner.rateAmount.toLocaleString()}원/{rateLabels[selectedPartner.rateType!]}</p></div>
                                )}
                            </div>
                            {(selectedPartner.email || selectedPartner.phone) && (
                                <div className="space-y-1.5">
                                    {selectedPartner.contactName && <p className="text-xs text-neutral-500">담당: {selectedPartner.contactName}</p>}
                                    {selectedPartner.email && <p className="text-xs flex items-center gap-1"><Mail className="h-3 w-3 text-neutral-400" />{selectedPartner.email}</p>}
                                    {selectedPartner.phone && <p className="text-xs flex items-center gap-1"><Phone className="h-3 w-3 text-neutral-400" />{selectedPartner.phone}</p>}
                                </div>
                            )}
                            {selectedPartner.portfolioUrl && (
                                <a href={selectedPartner.portfolioUrl} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" />포트폴리오</a>
                            )}
                            {selectedPartner.notes && <p className="text-xs text-neutral-400 bg-neutral-50 p-2 rounded">{selectedPartner.notes}</p>}
                        </div>
                        <div className="p-5 border-t border-neutral-100 flex justify-end gap-2">
                            <button className="px-4 py-2 text-xs border border-neutral-200 rounded hover:bg-neutral-50">프로젝트 투입</button>
                            <button onClick={() => setSelectedPartner(null)} className="px-4 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800">닫기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-lg mx-4 shadow-xl rounded max-h-[80vh] overflow-y-auto">
                        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-sm font-bold">파트너 등록</h2>
                            <button onClick={() => setShowAdd(false)}><X className="h-4 w-4 text-neutral-400" /></button>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">유형 *</label>
                                    <select className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none bg-white">
                                        <option value="company">회사</option>
                                        <option value="freelancer">프리랜서</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">이름 *</label>
                                    <input className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">전문 분야</label>
                                <input className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none" placeholder="예: 브랜드 디자인, 영상 제작" />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">역량 (클릭 선택)</label>
                                <div className="flex gap-1.5 flex-wrap">
                                    {skillOptions.map(s => (
                                        <button key={s} className="px-2 py-1 text-xs border border-neutral-200 rounded hover:bg-neutral-100 transition-colors">{s}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">이메일</label>
                                    <input type="email" className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">연락처</label>
                                    <input className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">단가 유형</label>
                                    <select className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none bg-white">
                                        <option value="project">건당</option>
                                        <option value="hourly">시급</option>
                                        <option value="monthly">월정액</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">단가 (원)</label>
                                    <input type="number" className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">포트폴리오 URL</label>
                                <input className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none" placeholder="https://" />
                            </div>
                        </div>
                        <div className="p-5 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-neutral-500">취소</button>
                            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800">등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
