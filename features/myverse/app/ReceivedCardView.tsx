"use client";

// 받는 사람 시점 디지털 명함 — /myverse/v/[handle]/card
// 인증 불필요. 클린한 받는 사람용 레이아웃 (마이버스 마케팅 헤더 없음).
// vCard 저장으로 모바일 주소록 즉시 등록.

import Link from "next/link";
import { DigitalCard } from "@/components/DigitalCard";

interface Member {
    name: string | null;
    handle: string | null;
    avatar_url: string | null;
    bio: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
}

const ACCENT = "#6366F1";

export function ReceivedCardView({ member }: { member: Member }) {
    // QR 다시 공유용 — 같은 명함 페이지 URL
    const publicUrl = typeof window !== "undefined" && member.handle
        ? `${window.location.protocol}//${window.location.host}/myverse/${member.handle}/card`
        : `https://myverse.kr/${member.handle ?? ""}/card`;

    return (
        <>
            {/* Material Symbols + Hanken Grotesk 폰트 — 마이버스 앱 셸 외부에서도 명함 카드 일관성 */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
        <div
            className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-12 px-5 md:px-10"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
            {/* 상단 브랜드 — 받는 사람이 Myverse를 인지 */}
            <div className="max-w-xl mx-auto mb-6 flex items-center justify-between">
                <Link href="/myverse" className="flex items-center gap-2 group">
                    <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[#6366F1] to-[#A855F7] flex items-center justify-center text-white text-xs font-bold">
                        M
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 tracking-tight group-hover:text-[#6366F1] transition-colors">
                        myverse
                    </span>
                </Link>
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">
                    Received Card
                </span>
            </div>

            <DigitalCard
                name={member.name}
                handle={member.handle}
                email={member.email}
                phone={member.phone}
                company={member.company}
                avatarUrl={member.avatar_url}
                publicUrl={publicUrl}
                accent={ACCENT}
                eyebrow="MYVERSE CARD"
                title={`${member.name ?? "이름 없음"}`}
                description={member.bio ?? `@${member.handle ?? ""} 님의 명함이 도착했어요`}
                noHandleNotice={null}
            />

            {/* 하단 — Myverse 가입 유도 (받는 사람이 미가입자일 가능성) */}
            <div className="max-w-xl mx-auto mt-8 text-center">
                <Link
                    href="/myverse"
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-[#6366F1] transition-colors"
                >
                    Powered by <span className="font-semibold">Myverse</span> — 나를 운영하는 OS
                </Link>
            </div>
        </div>
        </>
    );
}
