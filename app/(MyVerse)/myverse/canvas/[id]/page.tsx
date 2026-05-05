/**
 * 캔버스 embed 전용 페이지 — AppLayout(AppTopNav·MobileBottomNav) 없이 렌더
 * iframe src: /myverse/canvas/[id]
 * DailyView, ProjectNotesTab에서 캔버스 노트 팝업 시 이 경로 사용
 */
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { CanvasStudio } from "@/features/myverse/planner/CanvasStudio";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function CanvasEmbedPage({ params }: Props) {
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
        redirect("/login?redirect=/myverse/app");
    }

    const { id } = await params;
    return <CanvasStudio canvasId={id} embed />;
}
