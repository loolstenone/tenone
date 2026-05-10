// 오늘 — Lane 1차 진입점 + 대시보드 (세션 122)
// Stitch 디자인 기반: AI Coach 카드 + 오늘의 흔적 + 다음 4시간 일정
// 데이터 fetch는 client에서 (TodayDashboard).
// /daily, /index URL은 별칭 redirect 유지 (LANE_PATHS.today 매핑).

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TodayDashboard } from "@/features/myverse/app/TodayDashboard";

export const dynamic = "force-dynamic";

function todayKST(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
}

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const params = await searchParams;
    const date = params.date || todayKST();

    // 이름은 layout에서 이미 받지만 dashboard 인사용으로 빠르게 재조회
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
            auth: { storageKey: "tenone-auth" },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    let userName: string | null = null;
    if (user) {
        const { data: m } = await supabase
            .from("members")
            .select("name")
            .eq("auth_id", user.id)
            .maybeSingle();
        userName = (m as { name: string | null } | null)?.name ?? null;
    }

    return <TodayDashboard initialDate={date} userName={userName} />;
}
