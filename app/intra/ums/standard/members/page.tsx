"use client";

import Link from "next/link";
import { Users, ArrowRight, Database } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

const LAYERS = [
    { tier: "Layer 1", title: "기본 정보", storage: "auth.users", owner: "Supabase Auth",
      fields: ["email", "password", "provider"] },
    { tier: "Layer 2", title: "공통 프로필", storage: "members 테이블", owner: "유니버스 전체",
      fields: ["name", "phone", "company", "bio", "avatar_url", "affiliations", "handle", "interests_industry", "interests_job"] },
    { tier: "Layer 3", title: "특화 프로필", storage: "서비스별 테이블", owner: "각 브랜드",
      fields: ["mad_applications (MADLeague)", "badak_profiles (Badak)", "career_profiles (HeRo)", "jakka_profiles (Jakka)"] },
];

export default function MembersStandardPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="회원 표준"
                description="3계층 프로필 체계 — 양방향 동기화 원칙"
            />

            {/* 3 Layer 구조 */}
            <div className="space-y-3">
                {LAYERS.map((l, i) => (
                    <div key={l.tier} className="bg-white border border-neutral-200 rounded-lg p-5 flex gap-4">
                        <div className="shrink-0">
                            <div className={`h-10 w-10 rounded-lg ${i === 0 ? "bg-neutral-900" : i === 1 ? "bg-violet-500" : "bg-amber-500"} text-white flex items-center justify-center text-xs font-bold`}>
                                L{i + 1}
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-semibold text-neutral-900">{l.title}</h3>
                                <span className="text-[10px] text-neutral-400">{l.tier}</span>
                            </div>
                            <p className="text-[11px] text-neutral-500 mb-2">
                                <Database className="inline h-3 w-3 mr-1" />
                                <span className="font-mono">{l.storage}</span>
                                <span className="mx-2">·</span>
                                <span>{l.owner}</span>
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {l.fields.map((f) => (
                                    <span key={f} className="text-[10px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded font-mono">{f}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 동기화 원칙 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">동기화 규칙</h3>
                <ul className="text-[11px] text-neutral-700 space-y-1 list-disc ml-4">
                    <li>공통 필드는 <strong>어디서 수정하든</strong> `members`에 반영</li>
                    <li>특화 필드는 <strong>해당 서비스 테이블만</strong> 수정</li>
                    <li>유니버스 프로필(/profile)은 특화 필드를 <strong>읽기만</strong> 함</li>
                    <li>`members.affiliations[]`로 이용 중인 서비스 목록 관리</li>
                </ul>
            </div>

            {/* 관리 링크 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/intra/ums/members/list" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <Users className="h-4 w-4 text-violet-600 mb-2" />
                    <p className="text-xs font-semibold">전체 회원</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">실데이터 관리 →</p>
                </Link>
                <Link href="/intra/ums/members/invite" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <Users className="h-4 w-4 text-neutral-600 mb-2" />
                    <p className="text-xs font-semibold">초대</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">멤버 초대 →</p>
                </Link>
                <Link href="/intra/ums/members/guests" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <Users className="h-4 w-4 text-neutral-600 mb-2" />
                    <p className="text-xs font-semibold">게스트</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">게스트 관리 →</p>
                </Link>
                <Link href="/intra/ums/members/privacy" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <Users className="h-4 w-4 text-rose-600 mb-2" />
                    <p className="text-xs font-semibold">개인정보</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">탈퇴 요청 <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
            </div>
        </div>
    );
}
