"use client";

import { UserPlus, Users, Trash2, ArrowRightCircle, AlertTriangle } from "lucide-react";

/* ── Stats ── */
const stats = [
    { label: "전체 게스트", value: "234명", icon: UserPlus },
    { label: "삭제 예정 (7일 이내)", value: "18명", icon: Trash2 },
    { label: "회원 전환율", value: "12.3%", icon: ArrowRightCircle },
];

/* ── Guests ── */
const guests = [
    { id: "1", name: "장민호", contact: "010-1234-5678", brand: "MADLeague", purpose: "DAM Party 참가", marketing: true, created: "2026-03-15", autoDelete: "2026-04-14" },
    { id: "2", name: "안소희", contact: "sohee@email.com", brand: "ChangeUp", purpose: "스타트업 네트워킹", marketing: true, created: "2026-03-20", autoDelete: "2026-04-19" },
    { id: "3", name: "홍진우", contact: "010-9876-5432", brand: "Badak", purpose: "CEO 라운드테이블", marketing: false, created: "2026-03-22", autoDelete: "2026-04-21" },
    { id: "4", name: "나연수", contact: "yeonsu@email.com", brand: "Evolution School", purpose: "데이터 분석 체험", marketing: true, created: "2026-03-25", autoDelete: "2026-04-24" },
    { id: "5", name: "이시현", contact: "010-5555-1234", brand: "SmarComm", purpose: "AI 세미나 참관", marketing: true, created: "2026-03-10", autoDelete: "2026-04-09" },
    { id: "6", name: "권도현", contact: "dohyun@email.com", brand: "HeRo", purpose: "HIT 검사 체험", marketing: false, created: "2026-03-08", autoDelete: "2026-04-07" },
    { id: "7", name: "문서연", contact: "010-3333-7777", brand: "MADLeap", purpose: "5기 OT 참관", marketing: true, created: "2026-03-28", autoDelete: "2026-04-27" },
    { id: "8", name: "양현지", contact: "hyunji@email.com", brand: "Mindle", purpose: "트렌드 리포트 열람", marketing: false, created: "2026-02-28", autoDelete: "2026-03-30" },
    { id: "9", name: "서준호", contact: "010-8888-2222", brand: "Planner's", purpose: "기획 워크숍 참관", marketing: true, created: "2026-03-01", autoDelete: "2026-03-31" },
    { id: "10", name: "차은별", contact: "eunbyul@email.com", brand: "RooK", purpose: "AI 크리에이터 데모", marketing: true, created: "2026-03-05", autoDelete: "2026-04-04" },
];

const aboutToDelete = guests.filter((g) => {
    const deleteDate = new Date(g.autoDelete);
    const now = new Date("2026-03-29");
    const diff = (deleteDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
});

const brandColor: Record<string, string> = {
    MADLeague: "bg-violet-100 text-violet-700",
    MADLeap: "bg-indigo-100 text-indigo-700",
    ChangeUp: "bg-lime-100 text-lime-700",
    Badak: "bg-amber-100 text-amber-700",
    "Evolution School": "bg-orange-100 text-orange-700",
    SmarComm: "bg-emerald-100 text-emerald-700",
    HeRo: "bg-rose-100 text-rose-700",
    Mindle: "bg-cyan-100 text-cyan-700",
    "Planner's": "bg-teal-100 text-teal-700",
    RooK: "bg-pink-100 text-pink-700",
};

export default function UniverseGuests() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <UserPlus className="h-5 w-5" /> 게스트 관리
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">비회원 게스트 관리 및 자동삭제</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white border border-neutral-200 rounded-lg p-4">
                        <s.icon className="h-4 w-4 text-neutral-400 mb-2" />
                        <p className="text-lg font-bold text-neutral-900">{s.value}</p>
                        <p className="text-[11px] text-neutral-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Auto-delete warning */}
            {aboutToDelete.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <h3 className="text-sm font-medium text-amber-800">자동삭제 예정 ({aboutToDelete.length}명)</h3>
                    </div>
                    <p className="text-xs text-amber-700 mb-3">7일 이내에 자동 삭제될 게스트입니다. 회원 전환이 필요한 경우 조치하세요.</p>
                    <div className="space-y-1">
                        {aboutToDelete.map((g) => (
                            <div key={g.id} className="flex items-center justify-between py-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-amber-900">{g.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${brandColor[g.brand] || "bg-neutral-100 text-neutral-600"}`}>{g.brand}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-amber-600">삭제일: {g.autoDelete}</span>
                                    <button className="text-[10px] px-2 py-0.5 bg-amber-600 text-white rounded hover:bg-amber-700">회원 전환</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Guests Table */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">게스트 목록</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">이름</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">연락처</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">브랜드</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">목적</th>
                                    <th className="text-center px-4 py-3 text-xs font-medium text-neutral-500">마케팅 동의</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">생성일</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">자동삭제일</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">액션</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {guests.map((g) => (
                                    <tr key={g.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-neutral-900">{g.name}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{g.contact}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${brandColor[g.brand] || "bg-neutral-100 text-neutral-600"}`}>
                                                {g.brand}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-700">{g.purpose}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-[11px] ${g.marketing ? "text-green-600" : "text-neutral-400"}`}>
                                                {g.marketing ? "동의" : "미동의"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{g.created}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{g.autoDelete}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">전환</button>
                                                <button className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">삭제</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
