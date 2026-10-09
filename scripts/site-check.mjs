#!/usr/bin/env node
/**
 * 유니버스 공통 가이드 일괄 점검 — 브랜드 사이트를 새로 만들거나 고치거나 도메인을 전환할 때 한 번에 확인한다.
 * CLAUDE.md §2.5 원스톱 체크리스트의 "자동 점검" 부분. 새 공통 규칙이 생기면 여기와 §2.5에 같이 추가한다.
 *
 *   npm run site:check -- rook            코드·DB 점검
 *   npm run site:check -- rook --live     + 공식 도메인 실접속 점검 (https·apex→www·파비콘·noindex·GA4 태그)
 *   npm run site:check -- --all           CANONICAL_HOSTS 전체 브랜드
 *
 * 결과: ✅ 통과 / ⚠️ 확인 필요 / ❌ 위반 / 👤 사람이 해야 하는 외부 작업(자동 확인 불가)
 * DB는 .env.local의 SUPABASE_SERVICE_ROLE_KEY로 ums_sites만 읽는다 (쓰기 없음).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const LIVE = args.includes("--live");
const ALL = args.includes("--all");
const read = (p) => { try { return fs.readFileSync(path.join(ROOT, p), "utf8"); } catch { return null; } };
const exists = (p) => fs.existsSync(path.join(ROOT, p));

// ── 원천 파일 파싱 ──────────────────────────────────────────────
const registrySrc = read("lib/domain-registry.ts") ?? "";
const canonical = {};
for (const m of registrySrc.matchAll(/^\s+(\w+):\s*\{\s*host:\s*'([^']+)',\s*hosting:\s*'(vercel|external)'/gm)) {
    canonical[m[1]] = { host: m[2], hosting: m[3] };
}
const nextConfig = read("next.config.ts") ?? "";
const noindexList = (nextConfig.match(/\.\.\.\[([^\]]*)\]\.map\(brand =>/)?.[1] ?? "")
    .split(",").map(s => s.trim().replace(/'/g, "")).filter(Boolean);
const siteConfigSrc = read("lib/site-config.ts") ?? "";
const menusSrc = read("lib/brand-site-menus.ts") ?? "";
const privacySrc = read("app/(TenOne)/privacy/page.tsx") ?? "";

function env(name) {
    const m = (read(".env.local") ?? "").match(new RegExp(`^${name}=(.*)$`, "m"));
    return m ? m[1].replace(/["\r]/g, "").trim() : process.env[name];
}

async function dbSite(siteId) {
    const url = env("NEXT_PUBLIC_SUPABASE_URL"), key = env("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return { error: "환경변수 없음" };
    try {
        const r = await fetch(`${url}/rest/v1/ums_sites?slug=eq.${siteId}&select=slug,name,tier,lifecycle,hosting,is_open,domain,favicon_url`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
        });
        const rows = await r.json();
        return Array.isArray(rows) ? { row: rows[0] ?? null } : { error: JSON.stringify(rows).slice(0, 120) };
    } catch (e) { return { error: e.message }; }
}

/** app/(Group)/{siteId}/ 를 가진 브랜드 그룹 폴더 찾기 */
function brandGroup(siteId) {
    for (const d of fs.readdirSync(path.join(ROOT, "app"))) {
        if (d.startsWith("(") && exists(`app/${d}/${siteId}`)) return d;
    }
    return null;
}

function walk(dir, out = []) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) return out;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
        const rel = `${dir}/${e.name}`;
        if (e.isDirectory()) walk(rel, out);
        else if (/\.(tsx|ts)$/.test(e.name)) out.push(rel);
    }
    return out;
}

// ── 점검 ────────────────────────────────────────────────────────
async function checkSite(siteId) {
    const results = [];
    const ok = (m) => results.push(["✅", m]);
    const warn = (m) => results.push(["⚠️", m]);
    const fail = (m) => results.push(["❌", m]);
    const human = (m) => results.push(["👤", m]);

    const group = brandGroup(siteId);
    const cfgBlock = siteConfigSrc.match(new RegExp(`\\n    ${siteId}: \\{[\\s\\S]*?\\n    \\},`))?.[0] ?? "";
    const { row, error: dbErr } = await dbSite(siteId);
    const canon = canonical[siteId];

    // 1. 등록 (§2.4)
    cfgBlock ? ok("site-config.ts siteConfigs 등록") : fail("lib/site-config.ts siteConfigs에 없음");
    group ? ok(`브랜드 그룹 app/${group}/${siteId}`) : fail(`app/(Brand)/${siteId}/ 폴더 없음`);
    if (dbErr) warn(`DB ums_sites 조회 실패 (${dbErr})`);
    else if (!row) fail("DB ums_sites row 없음");
    else ok(`DB ums_sites: tier=${row.tier ?? "미지정"} · hosting=${row.hosting ?? "-"} · is_open=${row.is_open}`);
    if (group && !exists(`app/${group}/CLAUDE.md`)) warn(`브랜드 가이드 app/${group}/CLAUDE.md 없음 (§2.2 템플릿)`);

    // 2. 메타·파비콘 (§1.1)
    const layout = group ? read(`app/${group}/layout.tsx`) : null;
    if (layout) {
        /generateMetadata/.test(layout) && /getSiteConfigServer\(/.test(layout) ? ok("layout generateMetadata + getSiteConfigServer") : fail("layout에 generateMetadata/getSiteConfigServer 없음");
        if (/export const metadata/.test(layout)) fail("layout에 정적 export const metadata (금지)");
        /images:/.test(layout) || warn("layout openGraph images(ogImage) spread 없음");
    }
    const favicons = new Set([cfgBlock.match(/faviconUrl:\s*'([^']+)'/)?.[1], cfgBlock.match(/appleTouchIcon:\s*'([^']+)'/)?.[1], row?.favicon_url].filter(Boolean));
    if (favicons.size === 0) fail("파비콘 경로 미지정 (site-config faviconUrl·ums_sites.favicon_url)");
    for (const f of favicons) {
        if (f.startsWith("/")) exists(`public${f}`) ? ok(`파비콘 파일 있음 ${f}`) : fail(`파비콘 파일 없음 public${f} → 404 (브라우저 탭 아이콘 깨짐)`);
        else ok(`파비콘 외부 URL ${f.slice(0, 60)}`);
    }

    // 3. 공통 UI (§1.9.2~1.9.4, §1.3)
    const files = [...walk(`features/${siteId}`), ...(group ? walk(`app/${group}`) : [])];
    const src = Object.fromEntries(files.map(f => [f, read(f) ?? ""]));
    const all = Object.values(src).join("\n");
    const headerFile = files.find(f => /Header\.tsx$/.test(f));
    /UniverseUtilityBar/.test(all) ? ok("UniverseUtilityBar 사용") : fail("헤더에 UniverseUtilityBar 없음 (§1.9.2)");
    /UniverseMobileMenu/.test(all) ? ok("UniverseMobileMenu 사용") : warn("UniverseMobileMenu 미사용 (§1.9.3)");
    /UniverseFooter/.test(all) ? ok("UniverseFooter 사용") : warn("UniverseFooter 미사용 (§1.9.4)");
    if (headerFile) {
        // 유틸리티 바는 currentColor — 어두운 헤더면 감싼 요소에 밝은 글자색이 있어야 보인다 (rook 2026-10-07 사고)
        const h = src[headerFile];
        const darkHeader = /\bbg-(black|neutral-9\d\d|zinc-9\d\d|gray-9\d\d|slate-9\d\d|\[#[0-3][0-9a-f]{5}\])/i.test(h);
        const i = h.indexOf("<UniverseUtilityBar");
        const before = i > 0 ? h.slice(Math.max(0, i - 400), i) : "";
        const lightText = /text-(white|neutral-(50|100|200)|\[#f)/.test(before);
        if (darkHeader && i > 0 && !lightText) fail(`${headerFile}: 어두운 헤더인데 UniverseUtilityBar 감싼 요소에 밝은 글자색 없음 → 로그인·가입이 안 보임 (text-white 지정)`);
        else if (i > 0) ok("유틸리티 바 글자색 대비");
    }
    const myPage = group ? read(`app/${group}/${siteId}/my/page.tsx`) : null;
    if (myPage) /MyProfileCard/.test(myPage) ? ok("마이페이지 MyProfileCard") : fail("마이페이지에 MyProfileCard 없음 (§1.3)");
    const bareLogin = files.filter(f => /href=["']\/login["']|router\.push\(["']\/login["']\)/.test(src[f]));
    bareLogin.length ? fail(`/login 하드코딩 (loginHref 사용, §1.2.1): ${bareLogin.join(", ")}`) : ok("로그인 링크 loginHref 규칙");
    const stuckModal = files.filter(f => /<LoginModal[^>]*onClose=\{\(\) => \{\}\}/.test(src[f]));
    stuckModal.length ? fail(`닫히지 않는 로그인 모달 (LoginRequired 사용, §1.2.1): ${stuckModal.slice(0, 3).join(", ")}`) : ok("로그인 모달 닫기 가능 (LoginRequired 규칙)");
    const comingSoon = files.filter(f => /준비 중|Coming Soon|공사중/.test(src[f]));
    if (comingSoon.length) warn(`"준비 중/Coming Soon" 직접 표시 의심: ${comingSoon.slice(0, 3).join(", ")}`);
    const useSP = files.filter(f => /useSearchParams\(/.test(src[f]) && /^app\//.test(f) && /page\.tsx$/.test(f) && !/Suspense/.test(src[f]));
    if (useSP.length) fail(`page에서 useSearchParams를 Suspense 없이 사용 → 빌드 실패: ${useSP.join(", ")}`);
    // 브랜드 표기 (부록 B) — Ten:One™ 변형 금지: TEN:ONE 대문자·™ 생략·쪼갠 TEN<span>:</span>ONE. 공용 컴포넌트·메일도 함께 본다
    const markFiles = [...files, ...walk("components"), ...walk("lib/email")].filter((f, i, a) => a.indexOf(f) === i);
    const badMark = markFiles.filter(f => /TEN:ONE|TEN<span|>TEN<\//.test(read(f) ?? ""));
    badMark.length ? fail(`Ten:One™ 표기 변형 (부록 B): ${badMark.slice(0, 5).join(", ")}`) : ok("Ten:One™ 표기");

    // 4. 인트라 연계 (§1.9.5)
    const tier = row?.tier;
    const inMenus = new RegExp(`siteId:\\s*["']${siteId}["']`).test(menusSrc);
    if (tier === "focus" || tier === "core") inMenus ? ok("brand-site-menus 등록 (집중 브랜드)") : fail("집중 브랜드인데 lib/brand-site-menus.ts 미등록");
    // 푸터 4열 규칙 (§1.9.4, 2026-10-08) — 메뉴 레지스트리 등록 브랜드는 2열 메뉴를 siteId로 자동 생성 (헤더와 어긋남 방지)
    const footerFile = files.find(f => /Footer\.tsx$/.test(f) && /UniverseFooter/.test(src[f]));
    if (footerFile) {
        if (/hideUniverseColumn/.test(src[footerFile])) warn(`${footerFile}: hideUniverseColumn은 폐지된 옵션 (Universe 열 폐지 §1.9.4) — 지워도 됨`);
        if (inMenus) /siteId=/.test(src[footerFile]) ? ok("푸터 4열 규칙 (메뉴 = 헤더 레지스트리)") : fail(`${footerFile}: 메뉴 레지스트리 등록 브랜드인데 푸터에 siteId 없음 → 2열 메뉴가 헤더와 어긋남 (§1.9.4)`);
    }

    // 5. 공식 주소·검색 노출 (§0.1 원칙 4·6)
    if (canon) {
        ok(`CANONICAL_HOSTS ${canon.host} (${canon.hosting})`);
        const inNoindex = noindexList.includes(siteId);
        if (canon.hosting === "external" && !inNoindex) fail("외부 운영(external)인데 next.config noindex 목록에 없음 (스테이징 검색 노출)");
        if (canon.hosting === "vercel" && inNoindex) fail("Vercel 운영인데 noindex 목록에 남아 있음 (검색 노출 차단됨)");
        if (row?.hosting && row.hosting !== canon.hosting) fail(`hosting 불일치: ums_sites=${row.hosting} · CANONICAL_HOSTS=${canon.hosting}`);
        if (canon.hosting === "vercel" && row && row.is_open === false) {
            // 비공개 유지 결정 브랜드: 가림막 + layout robots(noindex)가 있으면 의도된 상태 (헌법 원칙 6)
            /is_open\s*===\s*false[^\n]*robots/.test(layout ?? "")
                ? warn("비공개 운영 중 (ums_sites.is_open=false · 가림막 + noindex) — 공개 결정 시 인트라에서 열기")
                : fail("Vercel 운영인데 ums_sites.is_open=false (가림막) — 비공개 유지면 layout generateMetadata에 is_open=false → robots noindex (§1.1)");
        }
    } else if (tier === "focus") warn("집중 브랜드인데 CANONICAL_HOSTS 미등록 (공식 주소 없음)");

    // 5-1. GA4 브랜드 구분 (부록 G.1) — 공식 도메인이 domain-registry에 이 siteId로 없으면 그 사이트 방문이 전부 brand_id=tenone으로 집계된다
    if (canon && siteId !== "tenone") {
        const esc = canon.host.replace(/\./g, "\\.");
        const mapped = registrySrc.match(new RegExp(`'${esc}':\\s*\\{[^}]*siteId:\\s*'(\\w+)'`))?.[1];
        mapped === siteId ? ok(`GA4 brand_id: ${canon.host} → ${siteId}`) : fail(`lib/domain-registry.ts에 '${canon.host}' → siteId '${siteId}' 없음 → GA4에 tenone으로 집계됨 (부록 G.1)`);
    }

    // 6. 개인정보처리방침 (§2.4 법적 검토)
    const name = row?.name ?? cfgBlock.match(/name:\s*'([^']+)'/)?.[1] ?? siteId;
    if (tier === "focus" || tier === "core") {
        // 표기 차이(MAD League / MADLeague) 무시 — 공백 제거·소문자로 이름 또는 siteId 매칭
        const flat = privacySrc.replace(/\s/g, "").toLowerCase();
        [name, siteId].some(n => flat.includes(n.replace(/\s/g, "").toLowerCase())) ? ok(`개인정보처리방침에 ${name} 항목`) : warn(`개인정보처리방침에 ${name} 수집 항목 없음 — 폼·회원 데이터를 받으면 추가 (시행 7일 전 공지)`);
    }

    // 7. 실접속 (--live)
    if (LIVE && canon) {
        const host = canon.host, apex = host.replace(/^www\./, "");
        const get = async (u, opt = {}) => { try { return await fetch(u, { redirect: "manual", ...opt }); } catch (e) { return { status: 0, error: e.cause?.code ?? e.message, headers: new Headers() }; } };
        const home = await get(`https://${host}/`);
        home.status === 200 ? ok(`https://${host} 200`) : fail(`https://${host} → ${home.status} ${home.error ?? ""} (DNS·SSL 인증서 확인)`);
        const robots = home.headers.get("x-robots-tag");
        if (canon.hosting === "vercel" && robots?.includes("noindex")) fail("공식 주소에 X-Robots-Tag noindex");
        if (apex !== host && canon.hosting === "vercel") { // external은 옛 서버가 응답하므로 제외
            const a = await get(`https://${apex}/`);
            const loc = a.headers.get("location") ?? "";
            [301, 308].includes(a.status) && loc.includes(host) ? ok(`${apex} → ${host} ${a.status}`) : warn(`${apex} → ${a.status} ${loc || a.error || ""} (apex→www 308 Redirect 확인)`);
        }
        for (const f of favicons) {
            if (!f.startsWith("/")) continue;
            const r = await get(`https://${host}${f}`);
            r.status === 200 && (r.headers.get("content-type") ?? "").startsWith("image/") ? ok(`실서버 파비콘 ${f}`) : fail(`실서버 파비콘 ${f} → ${r.status} (배포 전이면 배포 후 재확인)`);
        }
        // GA4 태그 (부록 G.1) — Vercel 운영 사이트는 공통 GTM 컨테이너가 들어가야 한다
        if (canon.hosting === "vercel" && home.status === 200) {
            const gtm = env("NEXT_PUBLIC_GTM_ID") ?? "GTM-";
            const html = await home.text().catch(() => "");
            html.includes(gtm) ? ok(`GA4 태그 ${gtm} 설치`) : fail(`공식 주소에 GTM(${gtm}) 없음 — Vercel env NEXT_PUBLIC_GTM_ID·components/Analytics.tsx 확인 (부록 G.1)`);
        }
    }

    // 8. 사람이 해야 하는 외부 작업 — 자동 확인 불가, 매번 같이 안내
    if (canon) {
        const apex = canon.host.replace(/^www\./, "");
        human(`Vercel Domains: ${canon.host}(Production) + ${apex}(→www 308) · View DNS configuration 권장값으로 등록업체 DNS (네임서버가 등록업체 것인지 먼저 조회)`);
        human(`Cloudflare Turnstile 위젯 Hostname에 ${apex} — 빠지면 로그인·가입·폼이 "보안 확인 중"으로 막힘 (콘솔 110200)`);
        human(`Supabase Auth Redirect URLs: https://${canon.host}/** · https://${apex}/**`);
        human(`GA4 확인: 공식 주소 접속 → GA4 실시간 보고서에서 brand_id=${siteId} 조회 (다음 날 인트라 Intelligence › 타겟 행동 데이터에 ${siteId} 행). 도메인 추가면 GA4 관리 › 데이터 스트림 › 태그 설정 › 도메인 구성에 ${apex} 추가`);
        if (canon.hosting === "external") human("DNS 전환일: ums_sites.hosting·CANONICAL_HOSTS → vercel, noindex 해제, is_open=true, 옛 서버 종료 절차(§0.1 ①~⑦)");
    }
    return results;
}

// ── 실행 ────────────────────────────────────────────────────────
const targets = ALL ? Object.keys(canonical) : args.filter(a => !a.startsWith("--"));
if (targets.length === 0) {
    console.log("사용법: npm run site:check -- <siteId> [--live]   |   npm run site:check -- --all [--live]");
    process.exit(1);
}
let failed = 0;
for (const siteId of targets) {
    const results = await checkSite(siteId);
    const n = (s) => results.filter(r => r[0] === s).length;
    console.log(`\n━━ ${siteId} ━━  ✅ ${n("✅")}  ⚠️ ${n("⚠️")}  ❌ ${n("❌")}  👤 ${n("👤")}`);
    for (const [s, m] of results) console.log(`${s} ${m}`);
    failed += n("❌");
}
process.exit(failed ? 1 : 0);
