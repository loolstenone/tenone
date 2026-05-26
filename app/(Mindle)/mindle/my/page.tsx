"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MyProfileCard } from "@/components/MyProfileCard";
import HitProfileBadge from "@/features/hit/HitProfileBadge";
import { CapabilitySection } from "@/components/CapabilitySection";
import Link from "next/link";
import { Bookmark, Bell, Settings, Eye, Plus, X, TrendingUp } from "lucide-react";

// 정직성 회복 (세션 152): mock trends/savedIds/alerts/interests 제거.
// Phase 2에서 mindle_user_saves · mindle_user_alerts · mindle_user_interests DB 테이블 + API 도입 예정.

const INTEREST_OPTIONS = ["AI / Tech", "Marketing", "Consumer", "Business", "Content", "Lifestyle", "Startup", "Design", "Finance"];

export default function MindleMyPage() {
    const { isAuthenticated, user } = useAuth();
    const [activeTab, setActiveTab] = useState<"saved" | "alerts" | "interests">("saved");
    // Phase 2 DB 연동 전까지 빈 상태로 시작 (mock 데이터 노출 금지)
    const [alerts, setAlerts] = useState<string[]>([]);
    const [newAlert, setNewAlert] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const savedArticles: never[] = []; // Phase 2 DB 연동 예정

    if (!isAuthenticated) {
        return (
            <div className="bg-[#0A0A0A] min-h-[60vh] flex items-center justify-center px-6">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#6366F1]/10 flex items-center justify-center mx-auto mb-4">
                        <Bookmark className="w-6 h-6 text-[#6366F1]" />
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2">로그인이 필요합니다</h2>
                    <p className="text-neutral-400 text-sm mb-6">MY 페이지를 이용하려면 로그인해주세요.</p>
                    <Link href="/login?redirect=/mindle/my"
                        className="px-6 py-2.5 bg-[#F5C518] text-black text-sm font-bold rounded hover:bg-[#F5C518]/90 transition-colors">
                        로그인
                    </Link>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "saved" as const, label: "저장한 트렌드", icon: Bookmark, count: savedArticles.length },
        { id: "alerts" as const, label: "키워드 알림", icon: Bell, count: alerts.length },
        { id: "interests" as const, label: "관심사 설정", icon: Settings, count: interests.length },
    ];

    return (
        <div className="bg-[#0A0A0A]">
            <div className="mx-auto max-w-4xl px-6 py-10">
                {user?.id && (
                    <div className="mb-4">
                        <HitProfileBadge memberId={user.id} respectOptIn />
                    </div>
                )}
                <MyProfileCard accentColor="#6366F1" />

                {user?.id && <CapabilitySection memberId={user.id} brandId="mindle" accentColor="#6366F1" className="mb-6" />}

                {/* Activity Stats */}
                <div className="grid grid-cols-4 gap-3 mb-8">
                    {[
                        { icon: Eye, value: "—", label: "조회한 트렌드 (Phase 2)", color: "text-neutral-500" },
                        { icon: Bookmark, value: String(savedArticles.length), label: "저장됨 (Phase 2)", color: "text-neutral-500" },
                        { icon: Bell, value: String(alerts.length), label: "키워드 알림", color: "text-blue-400" },
                        { icon: TrendingUp, value: "—", label: "이번 주 읽음 (Phase 2)", color: "text-neutral-500" },
                    ].map(stat => (
                        <div key={stat.label} className="p-4 bg-neutral-900/50 border border-neutral-800/50 rounded-xl text-center">
                            <stat.icon className={`w-4 h-4 mx-auto mb-2 ${stat.color}`} />
                            <div className="text-lg font-bold text-white">{stat.value}</div>
                            <div className="text-[10px] text-neutral-500 mt-0.5">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 border-b border-neutral-800/50">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? "border-[#F5C518] text-white"
                                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                            }`}>
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                activeTab === tab.id ? "bg-[#F5C518] text-black" : "bg-neutral-800 text-neutral-400"
                            }`}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Saved Trends — Phase 2 DB 연동 예정 */}
                {activeTab === "saved" && (
                    <div className="text-center py-16">
                        <Bookmark className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                        <p className="text-neutral-400 text-sm mb-2">저장한 트렌드가 없습니다</p>
                        <p className="text-[11px] text-neutral-600 mb-4">
                            🚧 저장 기능은 Phase 2에서 도입 예정 (mindle_user_saves 테이블 + 카드 저장 버튼)
                        </p>
                        <Link href="/mindle/trends" className="text-[#F5C518] text-sm hover:underline">
                            트렌드 둘러보기
                        </Link>
                    </div>
                )}

                {/* Keyword Alerts */}
                {activeTab === "alerts" && (
                    <div>
                        <p className="text-neutral-500 text-sm mb-5">
                            등록한 키워드가 포함된 트렌드가 올라오면 알림을 보내드립니다.
                        </p>
                        <form onSubmit={e => {
                            e.preventDefault();
                            const trimmed = newAlert.trim();
                            if (trimmed && !alerts.includes(trimmed)) {
                                setAlerts([...alerts, trimmed]);
                                setNewAlert("");
                            }
                        }} className="flex gap-2 mb-6">
                            <input type="text" value={newAlert} onChange={e => setNewAlert(e.target.value)}
                                placeholder="키워드를 입력하세요..."
                                className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#F5C518]/50" />
                            <button type="submit" disabled={!newAlert.trim()}
                                className="px-4 py-2.5 bg-[#F5C518] text-black text-sm font-bold rounded-lg hover:bg-[#F5C518]/90 transition-colors disabled:opacity-30 flex items-center gap-1">
                                <Plus className="w-4 h-4" /> 추가
                            </button>
                        </form>
                        <div className="flex flex-wrap gap-2">
                            {alerts.map(alert => (
                                <div key={alert} className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg">
                                    <Bell className="w-3 h-3 text-[#F5C518]" />
                                    <span className="text-white text-sm">{alert}</span>
                                    <button onClick={() => setAlerts(alerts.filter(a => a !== alert))}
                                        className="text-neutral-600 hover:text-red-400 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {alerts.length === 0 && (
                            <div className="text-center py-12 text-neutral-600">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">등록된 키워드 알림이 없습니다</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Interests */}
                {activeTab === "interests" && (
                    <div>
                        <p className="text-neutral-500 text-sm mb-5">
                            관심 분야를 선택하면 맞춤 트렌드를 추천합니다.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {INTEREST_OPTIONS.map(interest => {
                                const isSelected = interests.includes(interest);
                                return (
                                    <button key={interest}
                                        onClick={() => setInterests(isSelected ? interests.filter(i => i !== interest) : [...interests, interest])}
                                        className={`p-4 rounded-xl border text-left transition-all ${
                                            isSelected
                                                ? "border-[#F5C518]/50 bg-[#F5C518]/5"
                                                : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-600"
                                        }`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm font-medium ${isSelected ? "text-[#F5C518]" : "text-white"}`}>{interest}</span>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-[#F5C518]" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
