// 플래너'스 AI 연결 서버 (MCP) — 사용자가 자기 AI(Claude·ChatGPT 등)에 Planner's를 연결해 쓴다 (2026-10-14)
// 주소: https://www.planners.ai.kr/api/planners-mcp  (Streamable HTTP)
// 로그인 승인: Supabase OAuth 2.1 서버 (자동 클라이언트 등록) → 승인 화면 /oauth/consent → 이 서버는 받은 토큰의 사용자로만 동작
// 허용 범위 = 읽기 + 할 일 추가 (사용자 결정) · 지우기·고치기 없음 · 본인 기록만 · 데이터 함수 lib/planners/mcp-data.ts
// AI 비용은 사용자의 AI가 부담 — 여기서는 Anthropic을 부르지 않는다
// 사용 기록 myverse_ai_usage(kind='mcp_*') — 연결 사용량을 본다 (개인정보처리방침: '사용자가 연결을 승인한 AI 서비스로 제공')

import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDay, listTasks, searchRecords, weeklySummary, listProjects, addTask } from "@/lib/planners/mcp-data";

// mcp-handler가 받는 토큰 정보 형식 (패키지 내부 경로에 기대지 않고 함수 시그니처에서 가져온다)
type AuthInfo = NonNullable<Awaited<ReturnType<Parameters<typeof withMcpAuth>[1]>>>;

export const maxDuration = 60;

const json = (data: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(data) }] });
const fail = (msg: string) => ({ content: [{ type: "text" as const, text: msg }], isError: true });

// 도구 실행 맥락의 http.authInfo = verifyToken이 돌려준 값
function memberOf(ctx: { http?: { authInfo?: AuthInfo } }): string {
    const id = (ctx.http?.authInfo?.extra as { memberId?: string } | undefined)?.memberId;
    if (!id) throw new Error("unauthorized");
    return id;
}

async function logUse(memberId: string, tool: string) {
    try { await createAdminClient().from("myverse_ai_usage").insert({ member_id: memberId, kind: `mcp_${tool}`, used_at: new Date().toISOString() }); } catch { /* 기록 실패는 무시 */ }
}

const handler = createMcpHandler(
    (server) => {
        server.registerTool("get_day", {
            title: "하루 보기",
            description: "Planner's 플래너의 하루: 할 일(상태·시각·중요), 일정, 오늘의 Top 3, 하루 결과, 저녁 회고 답. date 없으면 오늘(한국 시간).",
            inputSchema: { date: z.string().optional().describe("YYYY-MM-DD") },
            annotations: { readOnlyHint: true },
        }, async ({ date }, extra) => {
            const m = memberOf(extra); void logUse(m, "get_day");
            return json(await getDay(m, date));
        });

        server.registerTool("list_tasks", {
            title: "할 일 목록",
            description: "기간의 할 일 목록 (최대 62일). status: todo=남은 일, done=끝낸 일, all=전부(기본).",
            inputSchema: {
                from: z.string().optional().describe("YYYY-MM-DD, 없으면 to의 6일 전"),
                to: z.string().optional().describe("YYYY-MM-DD, 없으면 오늘"),
                status: z.enum(["todo", "done", "all"]).optional(),
            },
            annotations: { readOnlyHint: true },
        }, async ({ from, to, status }, extra) => {
            const m = memberOf(extra); void logUse(m, "list_tasks");
            return json(await listTasks(m, from, to, status ?? "all"));
        });

        server.registerTool("search_records", {
            title: "기록 찾기",
            description: "할 일·하루 결과·저녁 회고·일정에서 낱말로 찾는다. 사용자의 질문을 기록에 적혀 있을 법한 낱말(동의어 포함)로 바꿔 넘기고, 기간을 알면 from/to를 준다 (기본 최근 1년, 최대 2년).",
            inputSchema: {
                words: z.array(z.string()).min(1).max(12).describe("찾을 낱말들 (한 단어씩)"),
                from: z.string().optional().describe("YYYY-MM-DD"),
                to: z.string().optional().describe("YYYY-MM-DD"),
            },
            annotations: { readOnlyHint: true },
        }, async ({ words, from, to }, extra) => {
            const m = memberOf(extra); void logUse(m, "search_records");
            return json(await searchRecords(m, words, from, to));
        });

        server.registerTool("weekly_summary", {
            title: "주간 숫자",
            description: "한 주(월~일)의 요일별 할 일 완료율, 오늘의 Top 3 달성, 컨디션(에너지·기분) 좋은 날과 낮은 날의 완료율 비교. week는 그 주의 아무 날짜(기본 이번 주).",
            inputSchema: { week: z.string().optional().describe("YYYY-MM-DD") },
            annotations: { readOnlyHint: true },
        }, async ({ week }, extra) => {
            const m = memberOf(extra); void logUse(m, "weekly_summary");
            return json(await weeklySummary(m, week));
        });

        server.registerTool("list_projects", {
            title: "프로젝트 목록",
            description: "진행 중인 프로젝트 (id·제목·상태·기간). add_task에 project_id로 쓸 수 있다.",
            inputSchema: {},
            annotations: { readOnlyHint: true },
        }, async (_args, extra) => {
            const m = memberOf(extra); void logUse(m, "list_projects");
            return json(await listProjects(m));
        });

        server.registerTool("add_task", {
            title: "할 일 추가",
            description: "플래너에 할 일 하나를 넣는다. 사용자가 넣어 달라고 한 것만, 하나씩. 지우거나 고치는 기능은 없다.",
            inputSchema: {
                text: z.string().min(1).max(200).describe("할 일 (짧은 동사형)"),
                date: z.string().optional().describe("YYYY-MM-DD, 없으면 오늘(한국 시간)"),
                time: z.string().optional().describe("HH:MM 24시간"),
                important: z.boolean().optional(),
                project_id: z.string().optional().describe("list_projects의 id"),
            },
            annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
        }, async (args, extra) => {
            const m = memberOf(extra); void logUse(m, "add_task");
            try { return json(await addTask(m, args)); } catch (e) { return fail(e instanceof Error ? e.message : "add_task failed"); }
        });
    },
    {
        serverInfo: { name: "planners", version: "1.0.0" },
        instructions: "Planner's(플래너'스) 플래너 · 사용자의 할 일·일정·회고 기록. 읽기와 할 일 추가만 할 수 있다. 날짜는 한국 시간 기준 YYYY-MM-DD. 사용자에게는 존댓말로, 기록에 없는 사실은 지어내지 않는다.",
    },
);

/** Supabase OAuth 토큰 → 회원 (토큰이 가짜·만료면 거절) */
async function verifyToken(_req: Request, bearer?: string): Promise<AuthInfo | undefined> {
    if (!bearer) return undefined;
    const admin = createAdminClient();
    const { data, error } = await admin.auth.getUser(bearer);
    if (error || !data.user) return undefined;
    const { data: member } = await admin.from("members").select("id").eq("auth_id", data.user.id).maybeSingle();
    if (!member) return undefined;
    let clientId = "planners-session";
    try { clientId = JSON.parse(Buffer.from(bearer.split(".")[1], "base64url").toString()).client_id ?? clientId; } catch { /* 일반 세션 토큰 */ }
    return { token: bearer, clientId, scopes: [], extra: { memberId: member.id as string, userId: data.user.id } };
}

const authed = withMcpAuth(handler, verifyToken, { required: true });

export { authed as GET, authed as POST, authed as DELETE };
