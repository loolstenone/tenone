// POST /api/intra/mindle/newsletter/generate
// 최근 published mindle_trends → Claude Haiku → newsletter_issues draft 자동 생성
// 권한: staff / manager / super_admin

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
    try {
        // 1. 인증
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "인증 필요" }, { status: 401 });
        }

        // 2. 권한 — staff/manager/super_admin
        const admin = createAdminClient();
        const { data: member } = await admin
            .from("members")
            .select("id")
            .eq("auth_id", user.id)
            .maybeSingle();
        if (!member) {
            return NextResponse.json({ error: "멤버 정보 없음" }, { status: 404 });
        }
        const { data: roleRow } = await admin
            .from("member_roles")
            .select("role")
            .eq("member_id", member.id)
            .in("role", ["staff", "manager", "super_admin"])
            .eq("is_active", true)
            .maybeSingle();
        if (!roleRow) {
            return NextResponse.json({ error: "권한 없음" }, { status: 403 });
        }

        // 3. 옵션 파싱
        const body = await request.json().catch(() => ({}));
        const days = Number(body.days ?? 7);          // 최근 N일 (기본 7)
        const maxItems = Number(body.maxItems ?? 7);   // 최대 N건

        // 4. 최근 published trends 조회
        const since = new Date(Date.now() - days * 86400_000).toISOString();
        const { data: trends, error: fetchErr } = await admin
            .from("mindle_trends")
            .select("id, title, summary, full_content, category, source_names, source_urls, relevance_score, published_at")
            .eq("status", "published")
            .gte("published_at", since)
            .order("relevance_score", { ascending: false })
            .limit(maxItems);

        if (fetchErr) {
            return NextResponse.json({ error: fetchErr.message }, { status: 500 });
        }
        if (!trends || trends.length === 0) {
            return NextResponse.json({ error: `최근 ${days}일 이내 발행된 트렌드가 없습니다.` }, { status: 400 });
        }

        // 5. Claude Haiku로 뉴스레터 초안 생성
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "ANTHROPIC_API_KEY 미설정" }, { status: 500 });
        }

        const anthropic = new Anthropic({ apiKey });

        const trendSummaries = (trends as Array<{
            id: string; title: string; summary: string; full_content: string | null;
            category: string; source_names: string[]; source_urls: string[];
            relevance_score: number; published_at: string | null;
        }>).map((t, i) =>
            `[${i + 1}] ${t.title}\n카테고리: ${t.category}\n요약: ${t.summary}\n출처: ${t.source_names?.join(", ") ?? ""}`
        ).join("\n\n");

        const msg = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 2048,
            temperature: 0.4,
            system: `너는 Mindle 뉴스레터 에디터다. 제공된 트렌드 카드들을 엮어 마케터·기획자 독자에게 전달할 이메일 뉴스레터 초안을 작성한다.

규칙:
- 제목(title): 이번 주 핵심 메시지를 담은 매력적인 뉴스레터 제목 (20자 이내)
- 본문(content): HTML 형식. 각 트렌드마다 <h3> 소제목 + <p> 본문 2~3문장. 마지막에 짧은 에디터 코멘트(편집자 노트).
- 전체 분량: 300~500자 본문 (HTML 태그 제외)
- 반드시 JSON { "title": "...", "content": "..." } 형태로만 반환.`,
            messages: [{
                role: "user",
                content: `다음 ${trends.length}건의 트렌드로 이번 주 Mindle 뉴스레터를 작성해줘:\n\n${trendSummaries}`,
            }],
        });

        const raw = msg.content
            .filter(b => b.type === "text")
            .map(b => b.type === "text" ? b.text : "")
            .join("");

        let title = "";
        let content = "";
        try {
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("JSON 파싱 실패");
            const parsed = JSON.parse(jsonMatch[0]) as { title: string; content: string };
            title = parsed.title?.trim() ?? "";
            content = parsed.content?.trim() ?? "";
        } catch {
            return NextResponse.json({ error: "AI 응답 파싱 실패: " + raw.slice(0, 200) }, { status: 500 });
        }

        if (!title || !content) {
            return NextResponse.json({ error: "AI가 유효한 뉴스레터를 생성하지 못했습니다." }, { status: 500 });
        }

        // 6. newsletter_issues에 draft 저장
        const { data: issue, error: insertErr } = await admin
            .from("newsletter_issues")
            .insert({
                title,
                content,
                status: "draft",
                from_name: "Mindle",
                target_tags: ["mindle"],
            })
            .select("id, title, status, created_at")
            .single();

        if (insertErr || !issue) {
            return NextResponse.json({ error: insertErr?.message ?? "이슈 저장 실패" }, { status: 500 });
        }

        return NextResponse.json({
            ok: true,
            issue,
            trendCount: trends.length,
        });
    } catch (e) {
        console.error("[mindle/newsletter/generate] error", e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
