/**
 * 경쟁 PT 팀 제출물 — 팀원(팀장·팀원) 또는 직원 (매드리거 구조 개편 3단계)
 *   GET  /api/madleague/pt/submission?team_id=   내 팀 제출물 + 파일 내려받기 서명 URL(5분)
 *   POST /api/madleague/pt/submission            { action }
 *        prepare  { team_id, file:{name,size,type} }  → 서명 업로드 URL (브라우저가 Storage에 직접 올림)
 *        save     { team_id, title, description?, presentation_url?, file?:{path,name,size}, submit, consent? }
 *        withdraw { team_id }                          → 최종 제출 취소 (임시 저장으로)
 *
 * 규칙: 회차가 '진행 중'이고 마감일(end_date) 23:59 KST 전에만 팀원이 수정 가능 (직원은 언제나)
 *       최종 제출 = 파일 또는 발표자료 링크 + 전달 동의 필수. 팀당 1건 (team_id UNIQUE)
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffMember } from "@/lib/api-guard";

export const runtime = "nodejs";

const BUCKET = "mad-submissions";
const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_EXT = ["pdf", "ppt", "pptx", "key", "zip", "jpg", "jpeg", "png", "webp", "mp4"];
const SUBMISSION_CONSENT_VERSION = "2026-10-08.1";
const CONSENT_TEXT = "제출물은 심사를 위해 과제 기업과 심사위원에게 전달됩니다.";

type Admin = ReturnType<typeof createAdminClient>;

/** 세션 회원 + 이 팀에 대한 권한 (팀원 또는 직원) + 회차 마감 여부 */
async function authorize(teamId: unknown) {
    if (typeof teamId !== "string") return { error: NextResponse.json({ error: "팀을 지정하세요." }, { status: 400 }) };
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
    const admin = createAdminClient();
    const { data: me } = await admin.from("members").select("id").eq("auth_id", user.id).maybeSingle();
    if (!me) return { error: NextResponse.json({ error: "회원 정보가 없습니다." }, { status: 403 }) };

    const { data: team } = await admin.from("mad_competition_teams")
        .select("id, competition_id, mad_competitions(status, end_date)").eq("id", teamId).maybeSingle();
    if (!team) return { error: NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 }) };

    const [isStaff, { data: link }] = await Promise.all([
        isStaffMember(admin, me.id),
        admin.from("mad_team_members").select("role").eq("team_id", teamId).eq("member_id", me.id).maybeSingle(),
    ]);
    if (!isStaff && !link) return { error: NextResponse.json({ error: "이 팀 팀원만 이용할 수 있습니다." }, { status: 403 }) };

    const comp = (team as unknown as { mad_competitions: { status: string; end_date: string | null } | null }).mad_competitions;
    const deadline = comp?.end_date ? new Date(`${comp.end_date}T23:59:59+09:00`) : null;
    const open = comp?.status === "ongoing" && (!deadline || Date.now() <= deadline.getTime());
    return { admin, me, team, isStaff, canEdit: isStaff || open, deadline };
}

async function currentSubmission(admin: Admin, teamId: string) {
    const { data } = await admin.from("mad_submissions")
        .select("id, title, description, presentation_url, file_url, file_name, file_size, status, submitted_at, updated_at")
        .eq("team_id", teamId).maybeSingle();
    return data;
}

export async function GET(req: NextRequest) {
    const a = await authorize(req.nextUrl.searchParams.get("team_id"));
    if ("error" in a) return a.error;
    const sub = await currentSubmission(a.admin, a.team.id);
    let download_url: string | null = null;
    if (sub?.file_url) {
        const { data } = await a.admin.storage.from(BUCKET).createSignedUrl(sub.file_url, 300, { download: sub.file_name ?? true });
        download_url = data?.signedUrl ?? null;
    }
    return NextResponse.json({
        submission: sub ? { ...sub, file_url: undefined } : null,
        download_url,
        canEdit: a.canEdit,
        deadline: a.deadline?.toISOString() ?? null,
    });
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const a = await authorize(body.team_id);
    if ("error" in a) return a.error;
    const { admin, me, team } = a;
    if (!a.canEdit) return NextResponse.json({ error: "마감되었거나 진행 중인 회차가 아닙니다." }, { status: 403 });

    switch (body.action) {
        case "prepare": {
            const name = String(body.file?.name ?? "");
            const size = Number(body.file?.size ?? 0);
            const ext = name.split(".").pop()?.toLowerCase() ?? "";
            if (!name || !ALLOWED_EXT.includes(ext)) return NextResponse.json({ error: `올릴 수 있는 형식: ${ALLOWED_EXT.join(", ")}` }, { status: 400 });
            if (!(size > 0) || size > MAX_BYTES) return NextResponse.json({ error: "파일은 50MB까지 올릴 수 있습니다." }, { status: 400 });
            const path = `${team.competition_id}/${team.id}/${Date.now()}.${ext}`;
            const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
            if (error || !data) return NextResponse.json({ error: "업로드 준비에 실패했습니다." }, { status: 500 });
            return NextResponse.json({ path: data.path, token: data.token, bucket: BUCKET });
        }

        case "save": {
            const title = String(body.title ?? "").trim().slice(0, 200);
            if (!title) return NextResponse.json({ error: "제출물 제목을 적어 주세요." }, { status: 400 });
            const description = String(body.description ?? "").trim().slice(0, 2000) || null;
            const urlRaw = String(body.presentation_url ?? "").trim();
            if (urlRaw && !/^https:\/\/\S+$/i.test(urlRaw)) return NextResponse.json({ error: "발표자료 링크는 https:// 주소여야 합니다." }, { status: 400 });

            const prev = await currentSubmission(admin, team.id);
            // 새 파일은 이 팀 경로로 올린 것만 받는다
            let file: { path: string; name: string; size: number } | null = null;
            if (body.file?.path) {
                const path = String(body.file.path);
                if (!path.startsWith(`${team.competition_id}/${team.id}/`)) return NextResponse.json({ error: "파일 경로가 올바르지 않습니다." }, { status: 400 });
                file = { path, name: String(body.file.name ?? "제출물").slice(0, 200), size: Number(body.file.size ?? 0) };
            }
            const fileUrl = file?.path ?? prev?.file_url ?? null;

            const submit = body.submit === true;
            if (submit && !fileUrl && !urlRaw) return NextResponse.json({ error: "최종 제출에는 파일 또는 발표자료 링크가 필요합니다." }, { status: 400 });
            if (submit && body.consent !== true) return NextResponse.json({ error: "전달 동의가 필요합니다." }, { status: 400 });

            const now = new Date().toISOString();
            const row = {
                tenant_id: "tenone",
                team_id: team.id,
                competition_id: team.competition_id,
                title,
                description,
                presentation_url: urlRaw || null,
                file_url: fileUrl,
                file_name: file?.name ?? prev?.file_name ?? null,
                file_size: file?.size ?? prev?.file_size ?? null,
                status: submit ? "submitted" : (prev?.status === "submitted" ? "submitted" : "draft"),
                submitted_at: submit ? now : (prev?.status === "submitted" ? prev.submitted_at : null),
                submitted_by: me.id,
                ...(submit && { consent: { version: SUBMISSION_CONSENT_VERSION, agreed_at: now, text: CONSENT_TEXT } }),
                updated_at: now,
            };
            // 제출 후 내용을 고치면 다시 '최종 제출'을 눌러야 한다 → 임시 저장은 draft로
            if (!submit && prev?.status === "submitted") { row.status = "draft"; row.submitted_at = null; }

            const { error } = prev
                ? await admin.from("mad_submissions").update(row).eq("id", prev.id)
                : await admin.from("mad_submissions").insert(row);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });

            // 교체된 이전 파일은 지운다 (팀 경로 안에서만)
            if (file && prev?.file_url && prev.file_url !== file.path) {
                await admin.storage.from(BUCKET).remove([prev.file_url]);
            }
            return NextResponse.json({ ok: true });
        }

        case "withdraw": {
            const prev = await currentSubmission(admin, team.id);
            if (!prev || prev.status !== "submitted") return NextResponse.json({ error: "최종 제출한 자료가 없습니다." }, { status: 400 });
            const { error } = await admin.from("mad_submissions")
                .update({ status: "draft", submitted_at: null, updated_at: new Date().toISOString() }).eq("id", prev.id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ ok: true });
        }

        default:
            return NextResponse.json({ error: "알 수 없는 작업입니다." }, { status: 400 });
    }
}
