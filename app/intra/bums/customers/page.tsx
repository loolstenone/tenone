"use client";

import { useState } from "react";
import { Users, Shield, Settings, UserPlus, Search, MoreHorizontal } from "lucide-react";
import clsx from "clsx";

const tabs = [
    { id: "list", label: "고객 목록", icon: Users },
    { id: "staff", label: "운영진", icon: UserPlus },
    { id: "permissions", label: "권한 설정", icon: Shield },
    { id: "settings", label: "가입 설정", icon: Settings },
] as const;

type TabId = typeof tabs[number]["id"];

// Mock data
const mockCustomers = [
    { id: "1", name: "김민수", email: "minsu@example.com", site: "MAD League", type: "회원", joinedAt: "2026-01-15", status: "활성" },
    { id: "2", name: "이지은", email: "jieun@example.com", site: "Badak", type: "회원", joinedAt: "2026-02-03", status: "활성" },
    { id: "3", name: "박서연", email: "seoyeon@example.com", site: "TenOne", type: "파트너", joinedAt: "2025-11-20", status: "활성" },
    { id: "4", name: "최준호", email: "junho@example.com", site: "YouInOne", type: "크루", joinedAt: "2026-03-01", status: "활성" },
    { id: "5", name: "정하윤", email: "hayun@example.com", site: "0gamja", type: "회원", joinedAt: "2026-03-10", status: "비활성" },
];

const mockStaff = [
    { id: "1", name: "전천일", email: "lools@tenone.biz", role: "마스터", sites: "전체", lastLogin: "2026-03-23" },
    { id: "2", name: "운영자A", email: "admin@tenone.biz", role: "관리자", sites: "MAD League, Badak", lastLogin: "2026-03-22" },
];

const statusBadge: Record<string, string> = {
    "활성": "bg-emerald-100 text-emerald-700",
    "비활성": "bg-neutral-100 text-neutral-500",
};

export default function CustomersPage() {
    const [activeTab, setActiveTab] = useState<TabId>("list");
    const [search, setSearch] = useState("");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">고객 관리</h1>
                <p className="text-sm text-neutral-500 mt-1">회원, 운영진, 권한 및 가입 설정을 관리합니다.</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-neutral-200">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                            activeTab === tab.id
                                ? "border-neutral-900 text-neutral-900"
                                : "border-transparent text-neutral-400 hover:text-neutral-600"
                        )}>
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            {(activeTab === "list" || activeTab === "staff") && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="이름, 이메일 검색..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-white" />
                </div>
            )}

            {/* 고객 목록 */}
            {activeTab === "list" && (
                <div className="border border-neutral-200 bg-white overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-left">
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">이름</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">이메일</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">사이트</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">유형</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">가입일</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {mockCustomers.filter(c => !search || c.name.includes(search) || c.email.includes(search)).map(c => (
                                <tr key={c.id} className="hover:bg-neutral-50">
                                    <td className="px-4 py-3 font-medium">{c.name}</td>
                                    <td className="px-4 py-3 text-neutral-500">{c.email}</td>
                                    <td className="px-4 py-3 text-neutral-500 text-xs">{c.site}</td>
                                    <td className="px-4 py-3 text-xs">{c.type}</td>
                                    <td className="px-4 py-3 text-neutral-400 text-xs">{c.joinedAt}</td>
                                    <td className="px-4 py-3">
                                        <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium", statusBadge[c.status])}>{c.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 운영진 */}
            {activeTab === "staff" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                            <UserPlus className="h-4 w-4" /> 운영자 추가
                        </button>
                    </div>
                    <div className="border border-neutral-200 bg-white overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 text-left">
                                    <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">이름</th>
                                    <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">이메일</th>
                                    <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">역할</th>
                                    <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">담당 사이트</th>
                                    <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">최근 로그인</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {mockStaff.map(s => (
                                    <tr key={s.id} className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 font-medium">{s.name}</td>
                                        <td className="px-4 py-3 text-neutral-500">{s.email}</td>
                                        <td className="px-4 py-3 text-xs">
                                            <span className="px-2 py-0.5 bg-neutral-900 text-white rounded-full text-[10px]">{s.role}</span>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500 text-xs">{s.sites}</td>
                                        <td className="px-4 py-3 text-neutral-400 text-xs">{s.lastLogin}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 권한 설정 */}
            {activeTab === "permissions" && (
                <div className="border border-neutral-200 bg-white p-6 space-y-6">
                    <p className="text-sm text-neutral-500">운영진 역할별 권한을 설정합니다.</p>
                    {[
                        { role: "마스터", perms: ["전체 사이트 접근", "운영진 관리", "권한 설정", "사이트 삭제"] },
                        { role: "관리자", perms: ["담당 사이트 접근", "게시글 관리", "회원 관리", "통계 열람"] },
                        { role: "에디터", perms: ["담당 사이트 접근", "게시글 작성/수정", "댓글 관리"] },
                        { role: "기여자", perms: ["담당 사이트 접근", "게시글 작성 (본인 글만 수정)"] },
                    ].map(r => (
                        <div key={r.role} className="border border-neutral-100 rounded-lg p-4">
                            <h3 className="font-semibold text-sm mb-2">{r.role}</h3>
                            <div className="flex flex-wrap gap-2">
                                {r.perms.map(p => (
                                    <span key={p} className="text-xs px-2.5 py-1 bg-neutral-50 text-neutral-600 rounded">{p}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 가입 설정 */}
            {activeTab === "settings" && (
                <div className="border border-neutral-200 bg-white p-6 space-y-6">
                    <p className="text-sm text-neutral-500">사이트별 회원 가입 방식과 그룹/등급을 설정합니다.</p>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-neutral-500 uppercase block mb-1.5">가입 방식</label>
                            <div className="flex gap-3">
                                {["이메일", "Google", "Kakao"].map(m => (
                                    <label key={m} className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" defaultChecked className="rounded" /> {m}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-neutral-500 uppercase block mb-1.5">회원 등급</label>
                            <div className="space-y-2">
                                {["일반 회원", "우수 회원", "VIP"].map(g => (
                                    <div key={g} className="flex items-center justify-between border border-neutral-100 rounded px-4 py-2.5">
                                        <span className="text-sm">{g}</span>
                                        <button className="text-xs text-neutral-400 hover:text-neutral-900">편집</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
