/**
 * API 인증 가드 — 전 API 공통 SSOT
 *
 * 배경: API 대부분이 service_role 클라이언트로 RLS를 우회하므로
 *       "누가 호출했는가"를 API 레벨에서 반드시 검증해야 한다.
 *
 * 인증 수단 3종 (우선순위 순):
 *   1) 내부 호출 — `Authorization: Bearer ${ADMIN_API_KEY | CRON_SECRET}` (서버간·크론·에이전트)
 *   2) 사용자 Bearer 토큰 — `Authorization: Bearer ${session.access_token}`
 *   3) 사용자 세션 쿠키 — 같은 출처 fetch (storageKey 'tenone-auth')
 *
 * Edge 런타임(middleware)에서도 동작하도록 next/headers를 쓰지 않는다.
 *
 * 사용 패턴:
 *   const auth = await requireMember(req);
 *   if (auth instanceof NextResponse) return auth;
 *   // auth.memberId 로 소유권 강제
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const STAFF_ROLES = new Set(["staff", "manager", "admin", "super_admin", "superadmin"]);
const STAFF_EMAIL_DOMAIN = "@tenone.biz";

export interface ApiUser {
    kind: "user";
    user: User;
    email: string | null;
    /** members.id — 계정에 members row가 없으면 null */
    memberId: string | null;
    isStaff: boolean;
}

export interface InternalCaller {
    kind: "internal";
}

function adminClient(): SupabaseClient {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } },
    );
}

function bearerToken(req: NextRequest): string | null {
    const header = req.headers.get("authorization");
    if (!header) return null;
    const m = header.match(/^Bearer\s+(.+)$/i);
    return m ? m[1].trim() : null;
}

/** 서버간 호출 여부 — ADMIN_API_KEY 또는 CRON_SECRET (미설정 키는 절대 매칭하지 않음) */
export function isInternalRequest(req: NextRequest): boolean {
    const token = bearerToken(req);
    if (!token) return false;
    const keys = [process.env.ADMIN_API_KEY, process.env.CRON_SECRET].filter((k): k is string => !!k && k.length >= 16);
    return keys.includes(token);
}

/** 서버 → 자기 API 내부 호출 시 붙일 헤더 */
export function internalAuthHeaders(): Record<string, string> {
    const key = process.env.ADMIN_API_KEY;
    return key ? { Authorization: `Bearer ${key}` } : {};
}

async function resolveUser(req: NextRequest, admin: SupabaseClient): Promise<User | null> {
    const token = bearerToken(req);
    if (token) {
        const { data, error } = await admin.auth.getUser(token);
        return error ? null : data.user;
    }
    const sb = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return req.cookies.getAll(); },
                setAll() { /* 읽기 전용 — 세션 갱신은 middleware 담당 */ },
            },
            auth: { storageKey: "tenone-auth" },
        },
    );
    const { data, error } = await sb.auth.getUser();
    return error ? null : data.user;
}

async function resolveMember(admin: SupabaseClient, user: User): Promise<{ id: string } | null> {
    const { data: byAuth } = await admin.from("members").select("id").eq("auth_id", user.id).maybeSingle();
    if (byAuth) return byAuth;
    // 이메일 매칭은 아직 auth_id가 연결되지 않은 row + 인증 완료 이메일일 때만 (타인 이메일로 심어둔 row 차단)
    if (!user.email || !user.email_confirmed_at) return null;
    const { data: byEmail } = await admin.from("members").select("id").eq("email", user.email).is("auth_id", null).maybeSingle();
    return byEmail ?? null;
}

async function resolveStaff(admin: SupabaseClient, user: User, member: { id: string } | null): Promise<boolean> {
    // 1) 인증 완료된 @tenone.biz 이메일 (members row 없는 직원 계정 대비)
    if (user.email?.endsWith(STAFF_EMAIL_DOMAIN) && user.email_confirmed_at) return true;
    if (!member) return false;
    // ⚠️ members.roles / account_type 은 본인이 UPDATE 가능한 컬럼 → 권한 판단에 절대 사용 금지
    // 2) member_roles (SSOT — staff만 INSERT/UPDATE 가능)
    const { data: rows } = await admin
        .from("member_roles")
        .select("role")
        .eq("member_id", member.id)
        .eq("is_active", true);
    return (rows ?? []).some(r => STAFF_ROLES.has(r.role as string));
}

/** 호출자 식별 (실패 시 null) */
export async function getApiUser(req: NextRequest): Promise<ApiUser | null> {
    const admin = adminClient();
    const user = await resolveUser(req, admin);
    if (!user) return null;
    const member = await resolveMember(admin, user);
    const isStaff = await resolveStaff(admin, user, member);
    return { kind: "user", user, email: user.email ?? null, memberId: member?.id ?? null, isStaff };
}

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

/** 로그인 필수 */
export async function requireUser(req: NextRequest): Promise<ApiUser | NextResponse> {
    return (await getApiUser(req)) ?? unauthorized();
}

/** 로그인 + members row 필수 (memberId 소유권 검증용) */
export async function requireMember(req: NextRequest): Promise<(ApiUser & { memberId: string }) | NextResponse> {
    const u = await getApiUser(req);
    if (!u) return unauthorized();
    if (!u.memberId) return forbidden();
    return u as ApiUser & { memberId: string };
}

/** 직원(또는 내부 호출) 필수. allowEmails: 베타 등 예외 허용 이메일 */
export async function requireStaff(
    req: NextRequest,
    opts: { allowEmails?: readonly string[] } = {},
): Promise<ApiUser | InternalCaller | NextResponse> {
    if (isInternalRequest(req)) return { kind: "internal" };
    const u = await getApiUser(req);
    if (!u) return unauthorized();
    if (u.isStaff) return u;
    if (u.email && u.user.email_confirmed_at && opts.allowEmails?.includes(u.email)) return u;
    return forbidden();
}

/** id 기반 라우트 소유권 검증 — row의 소유자 컬럼이 세션 memberId와 다르면 403 (직원은 허용) */
export async function assertOwnsRow(
    auth: ApiUser & { memberId: string },
    table: string,
    id: string,
    ownerColumn = "member_id",
): Promise<NextResponse | null> {
    if (auth.isStaff) return null;
    const { data } = await adminClient().from(table).select(ownerColumn).eq("id", id).maybeSingle();
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return (data as unknown as Record<string, unknown>)[ownerColumn] === auth.memberId ? null : forbidden();
}

/** 본인 데이터만 — 요청의 memberId가 세션 memberId와 다르면 403 (직원은 허용) */
export function assertSelf(auth: ApiUser & { memberId: string }, requestedMemberId: string | null | undefined): NextResponse | null {
    if (!requestedMemberId || requestedMemberId === auth.memberId || auth.isStaff) return null;
    return forbidden();
}
