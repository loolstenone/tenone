/**
 * 프로그램 팀 제출물 (코어) — 팀원(팀장·팀원) 또는 직원 · 클라이언트는 최종 제출물 내려받기만
 *   GET  /api/programs/submission?team_id=&stage=   제출물 + 파일 내려받기 서명 URL(5분)
 *   POST /api/programs/submission                   { action, team_id, stage }
 *        prepare  { file:{name,size,type} }  → 서명 업로드 URL (브라우저가 Storage에 직접 올림)
 *        save     { title, description?, presentation_url?, file?:{path,name,size}, submit, consent? }
 *        withdraw                             → 최종 제출 취소 (임시 저장으로)
 *
 * 단계: prelim(예선) 마감 = end_date · final(본선, 진출 팀만) 마감 = final_deadline — 각 23:59 KST, 회차 '진행 중'일 때만 (직원은 언제나)
 * 최종 제출 = 파일 또는 발표자료 링크 + 전달 동의 필수 · 팀 × 단계 1건 → 운영 담당·팀원·클라이언트에게 사이트 알림
 * 파일 = 비공개 버킷 program-submissions `{brand}/{round}/{team}/{stage}-{ts}.{ext}`
 * (개인 참가 회차 제출은 RooK 실전 프로젝트 단계에서 추가)
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffMember } from "@/lib/api-guard";
import { notify, brandManagerIds } from "@/lib/notify";
import { roundClientIds, sessionMemberId } from "@/lib/programs/access";
import { programRoomPath } from "@/lib/programs/paths";

export const runtime = "nodejs";

const BUCKET = "program-submissions";
const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_EXT = ["pdf", "ppt", "pptx", "key", "zip", "jpg", "jpeg", "png", "webp", "mp4"];
const SUBMISSION_CONSENT_VERSION = "2026-10-08.1";
const CONSENT_TEXT = "제출물은 심사를 위해 과제 기업과 심사위원에게 전달됩니다.";

type Admin = ReturnType<typeof createAdminClient>;
type Stage = "prelim" | "final";
const STAGE_LABEL: Record<Stage, string> = { prelim: "예선", final: "본선" };

interface RoundRow { id: string; brand_id: string; channels: string[]; title: string; status: string; end_date: string | null; final_deadline: string | null }

/** 세션 회원 + 이 팀에 대한 권한 (팀원 · 직원 · 클라이언트) + 단계 마감 여부 */
async function authorize(teamId: unknown, stageRaw: unknown) {
    if (typeof teamId !== "string" || !/^[0-9a-f-]{36}$/i.test(teamId)) return { error: NextResponse.json({ error: "팀을 지정하세요." }, { status: 400 }) };
    const stage: Stage = stageRaw === "final" ? "final" : "prelim";
    const memberId = await sessionMemberId();
    if (!memberId) return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
    const admin = createAdminClient();

    const { data: team } = await admin.from("program_teams").select("id, name, round_id, brand_id, is_finalist").eq("id", teamId).maybeSingle();
    if (!team) return { error: NextResponse.json({ error: "팀을 찾을 수 없습니다." }, { status: 404 }) };
    const { data: round } = await admin.from("program_rounds").select("id, brand_id, channels, title, status, end_date, final_deadline").eq("id", team.round_id).single();
    const r = round as RoundRow;

    const [isStaff, { data: link }] = await Promise.all([
        isStaffMember(admin, memberId),
        admin.from("program_participants").select("role").eq("team_id", teamId).eq("member_id", memberId).maybeSingle(),
    ]);
    const isClient = !isStaff && !link && (await roundClientIds(r.id)).includes(memberId);
    if (!isStaff && !link && !isClient) return { error: NextResponse.json({ error: "이 팀 팀원만 이용할 수 있습니다." }, { status: 403 }) };

    // 본선 제출은 진출 팀만 (직원·클라이언트는 열람)
    if (stage === "final" && !team.is_finalist && !isStaff && !isClient) return { error: NextResponse.json({ error: "본선 진출 팀만 제출할 수 있습니다." }, { status: 403 }) };
    const day = stage === "final" ? r.final_deadline : r.end_date;
    const deadline = day ? new Date(`${day}T23:59:59+09:00`) : null;
    const open = r.status === "ongoing" && (!deadline || Date.now() <= deadline.getTime()) && (stage === "prelim" || team.is_finalist);
    return { admin, memberId, team, round: r, stage, isStaff, isClient, canEdit: !isClient && (isStaff || open), deadline };
}

async function currentSubmission(admin: Admin, teamId: string, stage: Stage) {
    const { data } = await admin.from("program_submissions")
        .select("id, title, description, presentation_url, file_path, file_name, file_size, status, submitted_at, updated_at")
        .eq("team_id", teamId).eq("stage", stage).maybeSingle();
    return data;
}

export async function GET(req: NextRequest) {
    const a = await authorize(req.nextUrl.searchParams.get("team_id"), req.nextUrl.searchParams.get("stage"));
    if ("error" in a) return a.error;
    const found = await currentSubmission(a.admin, a.team.id, a.stage);
    // 클라이언트는 최종 제출한 것만 (임시 저장 비공개)
    const sub = a.isClient && found?.status !== "submitted" ? null : found;
    let download_url: string | null = null;
    if (sub?.file_path) {
        const { data } = await a.admin.storage.from(BUCKET).createSignedUrl(sub.file_path, 300, { download: sub.file_name ?? true });
        download_url = data?.signedUrl ?? null;
    }
    return NextResponse.json({
        submission: sub ? { ...sub, file_path: undefined } : null,
        download_url,
        canEdit: a.canEdit,
        deadline: a.deadline?.toISOString() ?? null,
    });
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const a = await authorize(body.team_id, body.stage);
    if ("error" in a) return a.error;
    if (a.isClient) return NextResponse.json({ error: "클라이언트는 열람만 할 수 있습니다." }, { status: 403 });
    if (!a.canEdit) return NextResponse.json({ error: "마감되었거나 진행 중인 회차가 아닙니다." }, { status: 403 });
    const { admin, memberId, team, round, stage } = a;
    const teamPrefix = `${round.brand_id}/${round.id}/${team.id}/`;

    switch (body.action) {
        case "prepare": {
            const name = String(body.file?.name ?? "");
            const size = Number(body.file?.size ?? 0);
            const ext = name.split(".").pop()?.toLowerCase() ?? "";
            if (!name || !ALLOWED_EXT.includes(ext)) return NextResponse.json({ error: `올릴 수 있는 형식: ${ALLOWED_EXT.join(", ")}` }, { status: 400 });
            if (!(size > 0) || size > MAX_BYTES) return NextResponse.json({ error: "파일은 50MB까지 올릴 수 있습니다." }, { status: 400 });
            const path = `${teamPrefix}${stage}-${Date.now()}.${ext}`;
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

            const prev = await currentSubmission(admin, team.id, stage);
            // 새 파일은 이 팀 경로로 올린 것만 받는다
            let file: { path: string; name: string; size: number } | null = null;
            if (body.file?.path) {
                const path = String(body.file.path);
                if (!path.startsWith(teamPrefix)) return NextResponse.json({ error: "파일 경로가 올바르지 않습니다." }, { status: 400 });
                file = { path, name: String(body.file.name ?? "제출물").slice(0, 200), size: Number(body.file.size ?? 0) };
            }
            const filePath = file?.path ?? prev?.file_path ?? null;

            const submit = body.submit === true;
            if (submit && !filePath && !urlRaw) return NextResponse.json({ error: "최종 제출에는 파일 또는 발표자료 링크가 필요합니다." }, { status: 400 });
            if (submit && body.consent !== true) return NextResponse.json({ error: "전달 동의가 필요합니다." }, { status: 400 });

            const now = new Date().toISOString();
            const row = {
                brand_id: round.brand_id,
                round_id: round.id,
                team_id: team.id,
                stage,
                title,
                description,
                presentation_url: urlRaw || null,
                file_path: filePath,
                file_name: file?.name ?? prev?.file_name ?? null,
                file_size: file?.size ?? prev?.file_size ?? null,
                // 제출 후 내용을 고치면 다시 '최종 제출'을 눌러야 한다 → 임시 저장은 draft로
                status: submit ? "submitted" : "draft",
                submitted_at: submit ? now : null,
                submitted_by: memberId,
                ...(submit && { consent: { version: SUBMISSION_CONSENT_VERSION, agreed_at: now, text: CONSENT_TEXT } }),
                updated_at: now,
            };

            const { error } = prev
                ? await admin.from("program_submissions").update(row).eq("id", prev.id)
                : await admin.from("program_submissions").insert(row);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });

            // 교체된 이전 파일은 지운다
            if (file && prev?.file_path && prev.file_path !== file.path) {
                await admin.storage.from(BUCKET).remove([prev.file_path]);
            }

            // 최종 제출 알림 — 운영 담당(인트라) · 클라이언트 · 같은 팀원
            if (submit) {
                const label = `${round.title} · ${team.name} ${STAGE_LABEL[stage]} 최종 제출`;
                const [{ data: mates }, clients, managers] = await Promise.all([
                    admin.from("program_participants").select("member_id").eq("team_id", team.id),
                    roundClientIds(round.id),
                    brandManagerIds(round.brand_id),
                ]);
                await Promise.all([
                    notify(managers, { brandId: round.brand_id, type: "program_submission", title: label, message: title, link: `/intra/ums/programs/${round.id}` }),
                    notify(clients, { brandId: round.brand_id, type: "program_submission", title: label, message: title, link: programRoomPath(round, "works") }),
                    notify((mates ?? []).map(m => m.member_id).filter(id => id !== memberId), { brandId: round.brand_id, type: "program_submission", title: label, message: title, link: programRoomPath(round, "submit") }),
                ]);
            }
            return NextResponse.json({ ok: true });
        }

        case "withdraw": {
            const prev = await currentSubmission(admin, team.id, stage);
            if (!prev || prev.status !== "submitted") return NextResponse.json({ error: "최종 제출한 자료가 없습니다." }, { status: 400 });
            const { error } = await admin.from("program_submissions")
                .update({ status: "draft", submitted_at: null, updated_at: new Date().toISOString() }).eq("id", prev.id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ ok: true });
        }

        default:
            return NextResponse.json({ error: "알 수 없는 작업입니다." }, { status: 400 });
    }
}
