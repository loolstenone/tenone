// 프로젝트 추적 메트릭 시계열 — Daily 트래킹과 자동 연동
// 프로젝트의 tracking_metrics 배열에 있는 메트릭만 반환
// 범위: project.start_date ~ end_date (없으면 최근 90일)
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

const METRIC_FIELDS: Record<string, string> = {
    energy: "energy_level",
    satisfaction: "satisfaction_level",
    mood: "mood_level",
    study: "study_level",
    faith: "faith_level",
    exercise: "exercise_minutes",
    health: "body_weight",
};

const NOTE_FIELDS: Record<string, string | null> = {
    energy: null,
    satisfaction: null,
    mood: null,
    study: "study_note",
    faith: "faith_note",
    exercise: "exercise_note",
    health: "health_note",
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();

    const { data: project } = await admin
        .from("myverse_projects")
        .select("id, start_date, end_date, tracking_metrics")
        .eq("id", projectId)
        .eq("member_id", memberId)
        .maybeSingle();
    if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const metrics: string[] = Array.isArray(project.tracking_metrics) ? project.tracking_metrics : [];
    if (metrics.length === 0) {
        return NextResponse.json({ metrics: [], series: {}, stats: {} });
    }

    // 날짜 범위
    const from = project.start_date ?? (() => {
        const d = new Date(); d.setDate(d.getDate() - 90);
        return d.toISOString().slice(0, 10);
    })();
    const to = project.end_date ?? new Date().toISOString().slice(0, 10);

    // 필요한 컬럼만 선택
    const fields = ["date", ...metrics.flatMap(m => [METRIC_FIELDS[m], NOTE_FIELDS[m]]).filter(Boolean)];
    const { data: daily } = await admin
        .from("myverse_daily")
        .select(fields.join(","))
        .eq("member_id", memberId)
        .gte("date", from)
        .lte("date", to)
        .order("date", { ascending: true });

    // 시계열 + 통계
    const series: Record<string, Array<{ date: string; value: number; note?: string | null }>> = {};
    const stats: Record<string, { avg: number | null; min: number | null; max: number | null; count: number }> = {};

    for (const m of metrics) {
        const field = METRIC_FIELDS[m];
        const noteField = NOTE_FIELDS[m];
        if (!field) continue;
        const points: Array<{ date: string; value: number; note?: string | null }> = [];
        for (const row of (daily ?? []) as unknown as Array<Record<string, unknown>>) {
            const v = row[field];
            if (v === null || v === undefined) continue;
            const num = typeof v === "number" ? v : parseFloat(String(v));
            if (isNaN(num)) continue;
            points.push({
                date: String(row.date),
                value: num,
                note: noteField ? (row[noteField] as string | null) ?? null : null,
            });
        }
        series[m] = points;
        if (points.length > 0) {
            const vals = points.map(p => p.value);
            stats[m] = {
                avg: Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10,
                min: Math.min(...vals),
                max: Math.max(...vals),
                count: vals.length,
            };
        } else {
            stats[m] = { avg: null, min: null, max: null, count: 0 };
        }
    }

    return NextResponse.json({ metrics, series, stats, range: { from, to } });
}
