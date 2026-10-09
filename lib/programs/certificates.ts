/**
 * 코어 프로그램 모듈 — 인증서 (서버 전용, 3단계) · sql/program-certificates.sql
 *   발급 가능: ① 프로그램 회차 — 팀으로 참가 + 결과 발표(또는 종료)된 회차  ② 브랜드 활동 인증 (brands.ts brandActivityCerts)
 *   발급: 본인이 로그인해 직접. 첫 발급 때만 생년월일·출신 대학·전공을 받고 이후엔 직전 발급값을 기본값으로.
 *   snapshot = 발급 시점 값 고정 (이후 이름·소속이 바뀌어도 인증서 내용은 그대로)
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { brandActivityCerts, brandCertExtras } from "@/lib/programs/brands";
import { CERT_TYPE_LABEL } from "@/lib/programs/certificate-labels";

export interface CertProfile { birthdate: string; university: string; major: string }

export interface EligibleCert {
    key: string;
    type: "participation" | "award" | "activity" | "completion";
    label: string;          // 구분 (참가 확인서 · 수상 확인서 · 활동 인증서 · 수료증 · 참여 확인서)
    title: string;
    result: string;
    year: number | null;
    round_id: string | null;
    team_name: string | null;
    issued_code: string | null;
}

export interface CertSnapshot {
    name: string; birthdate: string | null; university: string | null; major: string | null;
    group_label: string | null; group_name: string | null; cohort: string | null;
    team_name: string | null; round_title: string | null; kind: string | null; year: number | null;
    client_name: string | null; brand_name: string; label: string; title: string;
}

const CODE_PREFIX: Record<string, string> = { madleague: "MAD", hero: "HERO", rook: "ROOK", madleap: "LEAP", planners: "PLAN" };

/** 인증서 코드 — {접두}{연도2}-{6자} (혼동 문자 제외) */
export function newCertCode(brand: string): string {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    const prefix = CODE_PREFIX[brand] ?? brand.slice(0, 4).toUpperCase();
    return `${prefix}${String(new Date().getFullYear()).slice(2)}-${Array.from(bytes, b => chars[b % chars.length]).join("")}`;
}

/** 진위 확인 화면용 이름 마스킹 — 홍길동 → 홍*동, 홍길 → 홍*, John Smith → J*** S**** */
export function maskName(name: string): string {
    const n = name.trim();
    if (!n) return "—";
    if (/^[가-힣]+$/.test(n)) return n.length <= 2 ? `${n[0]}*` : `${n[0]}${"*".repeat(n.length - 2)}${n[n.length - 1]}`;
    return n.split(/\s+/).map(w => w[0] + "*".repeat(Math.max(0, w.length - 1))).join(" ");
}

function programCertType(kind: string, award: boolean): EligibleCert["type"] {
    if (award) return "award";
    return kind === "course" ? "completion" : "participation";
}

/** 발급 가능 + 이미 발급 목록 (브랜드 기준 — 창구가 다른 회차도 주인 브랜드 인증서) */
export async function eligibleCertificates(brand: string, memberId: string): Promise<EligibleCert[]> {
    const admin = createAdminClient();
    const [{ data: parts }, activity, { data: issued }] = await Promise.all([
        admin.from("program_participants")
            .select("team_id, round:program_rounds(id, brand_id, kind, title, year, status, client_name, results_published_at), team:program_teams(id, name, is_finalist)")
            .eq("member_id", memberId).eq("brand_id", brand).not("team_id", "is", null),
        brandActivityCerts(brand, memberId),
        admin.from("program_certificates").select("cert_key, code").eq("member_id", memberId).eq("brand_id", brand).is("revoked_at", null),
    ]);
    const codeOf = new Map((issued ?? []).map((c: { cert_key: string; code: string }) => [c.cert_key, c.code]));

    type Round = { id: string; brand_id: string; kind: string; title: string; year: number; status: string; client_name: string | null; results_published_at: string | null };
    const rows = ((parts ?? []) as unknown as { team_id: string; round: Round | null; team: { id: string; name: string; is_finalist: boolean } | null }[])
        .filter(p => p.round && p.team && (p.round.results_published_at || p.round.status === "completed"));
    const { data: results } = rows.length
        ? await admin.from("program_results").select("round_id, team_id, rank, award_name").in("team_id", rows.map(r => r.team_id))
        : { data: [] as { round_id: string; team_id: string; rank: number | null; award_name: string | null }[] };

    const out: EligibleCert[] = rows.map(p => {
        const r = p.round!;
        const res = r.results_published_at ? (results ?? []).find(x => x.team_id === p.team_id) : null;
        const award = !!(res && (res.award_name || res.rank));
        const type = programCertType(r.kind, award);
        const result = res?.award_name ?? (res?.rank ? `${res.rank}위` : p.team!.is_finalist ? "본선 진출" : r.kind === "course" ? "수료" : r.kind === "competition" ? "참가" : "참여");
        const key = `round:${r.id}`;
        return {
            key, type, label: CERT_TYPE_LABEL[type](r.kind), title: r.title, result, year: r.year,
            round_id: r.id, team_name: p.team!.name, issued_code: codeOf.get(key) ?? null,
        };
    });
    for (const a of activity) {
        out.push({
            key: a.key, type: "activity", label: CERT_TYPE_LABEL.activity(""), title: `${a.year}년 활동`, result: "활동 완료",
            year: a.year, round_id: null, team_name: null, issued_code: codeOf.get(a.key) ?? null,
        });
    }
    return out.sort((x, y) => (y.year ?? 0) - (x.year ?? 0));
}

/** 첫 발급 입력 기본값 — 직전 인증서(전 브랜드) → 브랜드 기록(지원서) */
export async function certProfileDefaults(brand: string, memberId: string): Promise<{ profile: Partial<CertProfile>; hasPrevious: boolean }> {
    const admin = createAdminClient();
    const { data: last } = await admin.from("program_certificates").select("snapshot")
        .eq("member_id", memberId).order("issued_at", { ascending: false }).limit(1).maybeSingle();
    const s = (last?.snapshot ?? null) as Partial<CertSnapshot> | null;
    if (s?.birthdate) return { profile: { birthdate: s.birthdate, university: s.university ?? "", major: s.major ?? "" }, hasPrevious: true };
    const extras = await brandCertExtras(brand, memberId, null, null);
    return { profile: { birthdate: "", university: extras.university ?? "", major: extras.major ?? "" }, hasPrevious: false };
}

export function validProfile(p: unknown): CertProfile | null {
    const o = (p ?? {}) as Record<string, unknown>;
    const birthdate = String(o.birthdate ?? "").trim();
    const university = String(o.university ?? "").trim().slice(0, 60);
    const major = String(o.major ?? "").trim().slice(0, 60);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) return null;
    const d = new Date(`${birthdate}T00:00:00Z`);
    if (Number.isNaN(d.getTime()) || d.getUTCFullYear() < 1940 || d > new Date()) return null;
    if (!university || !major) return null;
    return { birthdate, university, major };
}

/** 발급 (이미 있으면 그 인증서) */
export async function issueCertificate(brand: string, memberId: string, key: string, profile: CertProfile): Promise<{ code?: string; error?: string; status?: number }> {
    const eligible = (await eligibleCertificates(brand, memberId)).find(e => e.key === key);
    if (!eligible) return { error: "발급할 수 있는 인증서가 아닙니다.", status: 403 };
    if (eligible.issued_code) return { code: eligible.issued_code };

    const admin = createAdminClient();
    let groupId: string | null = null;
    type RoundBits = { title: string; kind: string; year: number; client_name: string | null };
    let round = null as RoundBits | null;
    if (eligible.round_id) {
        const [{ data: rr }, { data: part }] = await Promise.all([
            admin.from("program_rounds").select("title, kind, year, client_name").eq("id", eligible.round_id).single(),
            admin.from("program_participants").select("team:program_teams(context)").eq("round_id", eligible.round_id).eq("member_id", memberId).maybeSingle(),
        ]);
        round = rr as RoundBits | null;
        groupId = ((part as unknown as { team: { context: { club_id?: string } | null } | null } | null)?.team?.context?.club_id) ?? null;
    } else {
        groupId = (await brandActivityCerts(brand, memberId)).find(a => a.key === key)?.group_id ?? null;
    }
    const [{ data: me }, { data: site }, extras] = await Promise.all([
        admin.from("members").select("name").eq("id", memberId).single(),
        admin.from("ums_sites").select("name").eq("slug", brand).maybeSingle(),
        brandCertExtras(brand, memberId, groupId, eligible.year),
    ]);
    const snapshot: CertSnapshot = {
        name: (me as { name: string | null } | null)?.name ?? "",
        birthdate: profile.birthdate, university: profile.university, major: profile.major,
        group_label: extras.group_label, group_name: extras.group_name, cohort: extras.cohort,
        team_name: eligible.team_name, round_title: round?.title ?? null, kind: round?.kind ?? null,
        year: eligible.year, client_name: round?.client_name ?? null,
        brand_name: (site as { name: string } | null)?.name ?? brand,
        label: eligible.label, title: eligible.title,
    };
    if (!snapshot.name) return { error: "프로필에 이름을 먼저 입력해 주세요.", status: 400 };

    for (let i = 0; i < 5; i++) {
        const code = newCertCode(brand);
        const { error } = await admin.from("program_certificates").insert({
            brand_id: brand, round_id: eligible.round_id, member_id: memberId, cert_key: key,
            type: eligible.type, code, result: eligible.result, snapshot,
        });
        if (!error) return { code };
        if (error.code !== "23505") return { error: error.message, status: 500 };
        // 같은 키가 이미 발급됐으면(동시 요청) 그것을 돌려준다
        const again = (await eligibleCertificates(brand, memberId)).find(e => e.key === key);
        if (again?.issued_code) return { code: again.issued_code };
    }
    return { error: "코드 생성에 실패했습니다. 다시 시도해 주세요.", status: 500 };
}

export interface CertificateRow {
    id: string; brand_id: string; round_id: string | null; member_id: string | null; type: string; code: string;
    result: string | null; note: string | null; snapshot: CertSnapshot; issued_at: string; revoked_at: string | null; revoked_reason: string | null;
}

/** 코드로 인증서 (대소문자 무시) — 화면별 노출 범위는 호출 측이 정한다 (진위 확인 = 마스킹·생년월일 비공개) */
/** 코드 정규화 — URL 인코딩·대소문자·공백 흡수. 수료증 관리 대장 코드는 `2025-COA 000001` 형식(가운데 공백 1칸) */
export function normalizeCertCode(code: string): string {
    let c = code;
    try { c = decodeURIComponent(code); } catch { /* 이미 디코딩됨 */ }
    c = c.trim().toUpperCase().replace(/\s+/g, " ");
    const ledger = c.match(/^(\d{4}-[A-Z]{3})\s?(\d{6})$/);
    return ledger ? `${ledger[1]} ${ledger[2]}` : c;
}

export async function getCertificateByCode(code: string): Promise<CertificateRow | null> {
    const c = normalizeCertCode(code);
    if (!/^[A-Z0-9 -]{6,20}$/.test(c)) return null;
    const { data } = await createAdminClient().from("program_certificates")
        .select("id, brand_id, round_id, member_id, type, code, result, note, snapshot, issued_at, revoked_at, revoked_reason")
        .eq("code", c).maybeSingle();
    return (data as CertificateRow | null) ?? null;
}

export interface PublicCertificate {
    code: string; type: string; result: string | null; issued_at: string; revoked_at: string | null; revoked_reason: string | null;
    masked_name: string | null; label: string | null; title: string | null; group_label: string | null; group_name: string | null; cohort: string | null;
    round_title: string | null; team_name: string | null; year: number | null; brand_name: string | null;
}

/** 진위 확인용 — 생년월일·대학·전공은 조회 자체를 하지 않는다 (개발 모드 디버그 정보에도 남지 않게) */
export async function getPublicCertificate(code: string): Promise<PublicCertificate | null> {
    const c = normalizeCertCode(code);
    if (!/^[A-Z0-9 -]{6,20}$/.test(c)) return null;
    const { data } = await createAdminClient().from("program_certificates")
        .select("code, type, result, issued_at, revoked_at, revoked_reason, name:snapshot->>name, label:snapshot->>label, title:snapshot->>title, group_label:snapshot->>group_label, group_name:snapshot->>group_name, cohort:snapshot->>cohort, round_title:snapshot->>round_title, team_name:snapshot->>team_name, year:snapshot->>year, brand_name:snapshot->>brand_name")
        .eq("code", c).maybeSingle();
    if (!data) return null;
    const { name, year, ...rest } = data as unknown as Omit<PublicCertificate, "masked_name" | "year"> & { name: string | null; year: string | null };
    return { ...rest, masked_name: name ? maskName(name) : null, year: year ? Number(year) : null };
}
