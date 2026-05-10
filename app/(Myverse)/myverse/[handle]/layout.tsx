// /myverse/[handle] 공통 레이아웃 — 서브탭 [공개 흔적] [프로필] [명함]
// 헤더 없이 children만 감싸고, 페이지 본문 상단에 sticky 서브탭 노출.

import Link from "next/link";
import { HandleSubNav } from "@/features/myverse/handle/HandleSubNav";

interface Props {
    children: React.ReactNode;
    params: Promise<{ handle: string }>;
}

export default async function HandleLayout({ children, params }: Props) {
    const { handle } = await params;
    return (
        <div className="min-h-screen bg-neutral-50">
            <HandleSubNav handle={handle} />
            {children}
            <footer className="max-w-2xl mx-auto px-4 pb-8 text-center">
                <Link
                    href="/myverse"
                    className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-[#6366F1]"
                >
                    Powered by <span className="font-semibold">Myverse</span>
                </Link>
            </footer>
        </div>
    );
}
