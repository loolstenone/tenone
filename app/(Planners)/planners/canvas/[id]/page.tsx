/**
 * 캔버스 embed 전용 페이지 — AppLayout(AppTopNav·MobileBottomNav) 없이 렌더
 * iframe src: /planners/canvas/[id]
 * DailyView, ProjectNotesTab에서 캔버스 노트 팝업 시 이 경로 사용
 */
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { CanvasStudio } from "@/features/planners/CanvasStudio";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function CanvasEmbedPage({ params }: Props) {
    // 인증 확인 (AppLayout의 auth gate와 동일 로직)
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
    if (!user) {
        redirect("/login?redirect=/planners/app");
    }

    const { id } = await params;
    // embed=true 고정 — 이 라우트는 embed 전용 (PlannersChrome에서 header/footer 제외됨)
    return <CanvasStudio canvasId={id} embed />;
}
