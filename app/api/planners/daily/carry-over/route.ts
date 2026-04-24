// Daily 자동 이월: 어제 Daily의 미완료(todo)·이월(carried) 태스크를 오늘로 옮긴다.
// - 어제 Daily의 해당 태스크는 status='carried'로 변경
// - 오늘 Daily에 같은 텍스트의 태스크를 추가 (중복 방지)

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

async function getMemberId(): Promise<string | null> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: member } = await supabase.from('members').select('id').eq('email', user.email!).maybeSingle();
    return member?.id ?? null;
}

interface Task {
    id: string;
    text: string;
    status: string;
    parent_id?: string | null;
    priority?: string | null;
    time?: string | null;
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const today = (body.date as string) || new Date().toISOString().slice(0, 10);

    const yDate = new Date(today + "T00:00:00Z");
    yDate.setUTCDate(yDate.getUTCDate() - 1);
    const yesterday = yDate.toISOString().slice(0, 10);

    const admin = createAdminClient();

    // 1. 어제 Daily 로드
    const { data: yRow } = await admin
        .from("planners_daily")
        .select("tasks")
        .eq("member_id", memberId)
        .eq("date", yesterday)
        .maybeSingle();

    const yTasks = ((yRow?.tasks as Task[]) || []);
    const toCarry = yTasks.filter((t) => t.status === "todo" || t.status === "carried");

    if (toCarry.length === 0) {
        return NextResponse.json({ carried: 0 });
    }

    // 2. 오늘 Daily 로드
    const { data: tRow } = await admin
        .from("planners_daily")
        .select("tasks")
        .eq("member_id", memberId)
        .eq("date", today)
        .maybeSingle();

    const existing = ((tRow?.tasks as Task[]) || []);
    const existingTexts = new Set(existing.map((t) => t.text.trim()));

    // 3. 중복 제외하고 오늘에 추가
    const newTasks: Task[] = [];
    for (const t of toCarry) {
        if (existingTexts.has(t.text.trim())) continue;
        newTasks.push({
            id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            text: t.text,
            status: "todo",
            parent_id: null,
            priority: t.priority ?? null,
            time: null,
        });
    }

    if (newTasks.length === 0) {
        return NextResponse.json({ carried: 0, already_present: toCarry.length });
    }

    const mergedToday = [...existing, ...newTasks];

    // 4. 어제 태스크의 상태를 carried로 변경 (원래 todo였던 것만)
    const yTasksUpdated = yTasks.map((t) =>
        (t.status === "todo") ? { ...t, status: "carried" } : t
    );

    await Promise.all([
        admin.from("planners_daily").upsert(
            { member_id: memberId, date: today, tasks: mergedToday, updated_at: new Date().toISOString() },
            { onConflict: "member_id,date" }
        ),
        yRow
            ? admin.from("planners_daily").update({ tasks: yTasksUpdated, updated_at: new Date().toISOString() })
                .eq("member_id", memberId).eq("date", yesterday)
            : Promise.resolve({ error: null }),
    ]);

    return NextResponse.json({ carried: newTasks.length, from: yesterday, to: today });
}
