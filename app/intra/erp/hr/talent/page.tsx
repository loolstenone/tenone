"use client";

import { useState, useEffect } from "react";
import { Users, Search, Plus, Star, Mail, ExternalLink, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";

interface Talent {
    id: string;
    name: string;
    specialty: string;
    source: "내부" | "외부" | "프리랜서" | "추천";
    skills: string[];
    rating: number;
    lastContact: string;
    status: "활성" | "대기" | "비활성";
}

const initialTalents: Talent[] = [
    { id: "1", name: "박영상", specialty: "영상 PD / 편집", source: "프리랜서", skills: ["Premiere", "After Effects", "DaVinci"], rating: 5, lastContact: "2026-03-15", status: "활성" },
    { id: "2", name: "이디자인", specialty: "그래픽 디자이너", source: "외부", skills: ["Figma", "Illustrator", "Photoshop"], rating: 4, lastContact: "2026-02-20", status: "활성" },
    { id: "3", name: "김개발", specialty: "풀스택 개발", source: "추천", skills: ["React", "Node.js", "Python"], rating: 5, lastContact: "2026-03-01", status: "대기" },
    { id: "4", name: "최음악", specialty: "작곡 / 편곡", source: "외부", skills: ["Logic Pro", "Ableton", "작곡"], rating: 4, lastContact: "2025-12-10", status: "비활성" },
    { id: "5", name: "정마케", specialty: "디지털 마케팅", source: "내부", skills: ["SEO", "Google Ads", "콘텐츠 기획"], rating: 3, lastContact: "2026-03-18", status: "활성" },
];

const sourceColor: Record<string, string> = {
    "내부": "bg-blue-50 text-blue-600",
    "외부": "bg-green-50 text-green-600",
    "프리랜서": "bg-purple-50 text-purple-600",
    "추천": "bg-orange-50 text-orange-600",
};

const statusColor: Record<string, string> = {
    "활성": "bg-green-50 text-green-600",
    "대기": "bg-yellow-50 text-yellow-600",
    "비활성": "bg-neutral-100 text-neutral-400",
};

export default function TalentPoolPage() {
    const [talents, setTalents] = useState<Talent[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const supabase = createClient();
                const { data, error } = await supabase.from('talent_pool').select('*').order('name');
                if (!cancelled && data && data.length > 0 && !error) {
                    setTalents(data.map((r: Record<string, unknown>) => ({
                        id: r.id as string,
                        name: (r.name as string) || '',
                        specialty: (r.specialty as string) || '',
                        source: ((r.source as string) || '외부') as Talent['source'],
                        skills: (r.skills as string[]) || [],
                        rating: (r.rating as number) || 3,
                        lastContact: ((r.last_contact as string) || '').split('T')[0],
                        status: ((r.status as string) || '활성') as Talent['status'],
                    })));
                } else if (!cancelled) {
                    setTalents(initialTalents);
                }
            } catch {
                if (!cancelled) setTalents(initialTalents);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filtered = talents.filter(t =>
        t.name.includes(search) || t.specialty.includes(search) || t.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <PageHeader title="Talent Pool" description="내·외부 인재 풀을 관리합니다.">
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 인재 등록
                </button>
            </PageHeader>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "전체 인재", value: `${talents.length}명` },
                    { label: "활성", value: `${talents.filter(t => t.status === "활성").length}명` },
                    { label: "프리랜서", value: `${talents.filter(t => t.source === "프리랜서").length}명` },
                    { label: "외부", value: `${talents.filter(t => t.source === "외부").length}명` },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400"
                    placeholder="이름, 전문 분야, 스킬로 검색..." />
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">이름</th>
                            <th className="text-left p-3 font-medium">전문 분야</th>
                            <th className="text-left p-3 font-medium">출처</th>
                            <th className="text-left p-3 font-medium">스킬</th>
                            <th className="text-center p-3 font-medium">평가</th>
                            <th className="text-left p-3 font-medium">최근 연락</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(t => (
                            <tr key={t.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 font-medium">{t.name}</td>
                                <td className="p-3 text-neutral-600">{t.specialty}</td>
                                <td className="p-3">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${sourceColor[t.source]}`}>{t.source}</span>
                                </td>
                                <td className="p-3">
                                    <div className="flex flex-wrap gap-1">
                                        {t.skills.slice(0, 3).map(s => (
                                            <span key={s} className="text-[11px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">{s}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center gap-0.5">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Star key={i} className={`h-3 w-3 ${i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-200"}`} />
                                        ))}
                                    </div>
                                </td>
                                <td className="p-3 text-xs text-neutral-500">{t.lastContact}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[t.status]}`}>{t.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
