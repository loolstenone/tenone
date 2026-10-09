import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 120; // 장기간 백필(30일 단위 여러 번 조회)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY_PROD)!;
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const GA4_SERVICE_ACCOUNT_JSON = process.env.GA4_SERVICE_ACCOUNT_JSON;

// brand_id → GA4 dimension value 매핑
const BRAND_DIMENSION_VALUES = [
  "tenone", "madleague", "madleap", "badak", "smarcomm", "hero",
  "mindle", "myverse", "wio", "youinone", "rook", "montz",
  "townity", "scribble", "naturebox", "korea360", "seoul360",
  "changeup", "luki", "domo", "fwn", "planners", "mullaesian", "0gamja",
];

interface GA4Row {
  brand_id: string;
  date: string;
  sessions: number;
  pageviews: number;
  users: number;
  new_users: number;
  avg_session_duration: number;
  bounce_rate: number;
  top_pages: { path: string; views: number }[];
  traffic_sources: { source: string; sessions: number }[];
}

async function getGA4AccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);

  // JWT 헤더
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  // JWT 클레임
  const claim = btoa(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  // RSA 서명 (Web Crypto API)
  const pemBody = sa.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");
  const keyBytes = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", keyBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );
  const sigBytes = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5", cryptoKey,
    new TextEncoder().encode(`${header}.${claim}`)
  );
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBytes)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  // OAuth2 토큰 교환
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${sig}`,
    }),
  });
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function fetchGA4Report(
  token: string,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<GA4Row[]> {
  // 1. 브랜드별 기본 메트릭
  const mainRes = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: "customEvent:brand_id" },
          { name: "date" },
        ],
        metrics: [
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "totalUsers" },
          { name: "newUsers" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
        ],
        limit: 10000,
      }),
    }
  );
  const mainData = await mainRes.json();
  // GA4 오류(권한·속성 ID·API 미사용)를 0건으로 삼키지 않는다 — 2026-10-10 동기화가 반년간 0건이던 원인 추적
  if (!mainRes.ok) throw new Error(`GA4 Data API ${mainRes.status}: ${mainData?.error?.message ?? "응답 오류"}`);

  // 2. 상위 페이지 (brand_id + pagePath)
  const pageRes = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "customEvent:brand_id" }, { name: "date" }, { name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 500,
      }),
    }
  );
  const pageData = await pageRes.json();

  // 3. 유입 소스 (brand_id + sessionDefaultChannelGroup)
  const srcRes = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "customEvent:brand_id" }, { name: "date" }, { name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        limit: 500,
      }),
    }
  );
  const srcData = await srcRes.json();

  // 조립
  const rows: Record<string, GA4Row> = {};

  for (const row of mainData.rows ?? []) {
    const [brandId, date] = row.dimensionValues.map((d: { value: string }) => d.value);
    const [sessions, pageviews, users, newUsers, duration, bounce] = row.metricValues.map(
      (m: { value: string }) => parseFloat(m.value)
    );
    const key = `${brandId}::${date}`;
    rows[key] = {
      brand_id: brandId,
      date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
      sessions: Math.round(sessions),
      pageviews: Math.round(pageviews),
      users: Math.round(users),
      new_users: Math.round(newUsers),
      avg_session_duration: Math.round(duration),
      bounce_rate: parseFloat((bounce * 100).toFixed(2)),
      top_pages: [],
      traffic_sources: [],
    };
  }

  // 페이지 매핑
  const pageMap: Record<string, { path: string; views: number }[]> = {};
  for (const row of pageData.rows ?? []) {
    const [brandId, date, path] = row.dimensionValues.map((d: { value: string }) => d.value);
    const views = Math.round(parseFloat(row.metricValues[0].value));
    const key = `${brandId}::${date}`;
    if (!pageMap[key]) pageMap[key] = [];
    if (pageMap[key].length < 10) pageMap[key].push({ path, views });
  }

  // 소스 매핑
  const srcMap: Record<string, { source: string; sessions: number }[]> = {};
  for (const row of srcData.rows ?? []) {
    const [brandId, date, source] = row.dimensionValues.map((d: { value: string }) => d.value);
    const cnt = Math.round(parseFloat(row.metricValues[0].value));
    const key = `${brandId}::${date}`;
    if (!srcMap[key]) srcMap[key] = [];
    srcMap[key].push({ source, sessions: cnt });
  }

  for (const key of Object.keys(rows)) {
    rows[key].top_pages = pageMap[key] ?? [];
    rows[key].traffic_sources = srcMap[key] ?? [];
  }

  // (not set) = GA4 자동 이벤트(세션 시작·첫 방문·Google 태그 자동 page_view)라 brand_id가 없다 → 같은 방문이 브랜드 행과 겹쳐 합계를 부풀린다. 저장하지 않음
  return Object.values(rows).filter((r) => r.brand_id !== NOT_SET);
}

const NOT_SET = "(not set)";
/** 유니버스 전체 = 브랜드 구분 없이 GA4가 센 값 (중복 없는 세션·사용자). 브랜드별 행을 더하면 한 방문이 여러 번 셀 수 있어 따로 받는다 */
const ALL_BRANDS_ID = "_all";

async function fetchGA4Totals(token: string, propertyId: string, startDate: string, endDate: string): Promise<GA4Row[]> {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "newUsers" }, { name: "averageSessionDuration" }, { name: "bounceRate" }],
      limit: 1000,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`GA4 Data API ${res.status}: ${data?.error?.message ?? "응답 오류"}`);
  return (data.rows ?? []).map((row: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }) => {
    const date = row.dimensionValues[0].value;
    const [sessions, users, newUsers, duration, bounce] = row.metricValues.map((m) => parseFloat(m.value));
    return {
      brand_id: ALL_BRANDS_ID,
      date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
      sessions: Math.round(sessions), pageviews: 0, users: Math.round(users), new_users: Math.round(newUsers),
      avg_session_duration: Math.round(duration), bounce_rate: parseFloat((bounce * 100).toFixed(2)),
      top_pages: [], traffic_sources: [],
    };
  });
}

export async function POST(req: NextRequest) {
  if (!GA4_PROPERTY_ID || !GA4_SERVICE_ACCOUNT_JSON) {
    return NextResponse.json(
      { error: "GA4_PROPERTY_ID 또는 GA4_SERVICE_ACCOUNT_JSON 환경변수가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  // days(어제부터 거꾸로) 또는 start=YYYY-MM-DD(그날부터 어제까지). 최대 400일 — brand_id 등록일(2026-04-13) 이전은 (not set)뿐
  const days = Math.min(parseInt(searchParams.get("days") || "7") || 7, 400);
  const startParam = searchParams.get("start");

  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1); // 어제까지
  let startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (days - 1));
  if (startParam && /^\d{4}-\d{2}-\d{2}$/.test(startParam)) {
    const s = new Date(`${startParam}T00:00:00Z`);
    const floor = new Date(endDate); floor.setDate(floor.getDate() - 399);
    if (!isNaN(s.getTime())) startDate = s < floor ? floor : s;
  }

  // GA4 Data API는 YYYY-MM-DD만 받는다 (YYYYMMDD는 400 — 반년간 0건이던 원인)
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  try {
    const token = await getGA4AccessToken(GA4_SERVICE_ACCOUNT_JSON);
    // 30일씩 나눠 조회 — 상위 페이지·유입 경로 보고서의 500행 제한에 긴 기간이 잘리지 않게
    const gaRows: GA4Row[] = [];
    for (let from = new Date(startDate); from <= endDate; from.setDate(from.getDate() + 30)) {
      const to = new Date(from); to.setDate(to.getDate() + 29);
      const range = [fmt(from), fmt(to > endDate ? endDate : to)] as const;
      gaRows.push(...await fetchGA4Report(token, GA4_PROPERTY_ID, ...range));
      // 전체 페이지뷰 = 브랜드 페이지뷰 합 (Google 태그 자동 page_view까지 세면 한 화면이 두 번 잡힌다)
      const pvByDate: Record<string, number> = {};
      for (const r of gaRows) pvByDate[r.date] = (pvByDate[r.date] ?? 0) + r.pageviews;
      for (const t of await fetchGA4Totals(token, GA4_PROPERTY_ID, ...range)) gaRows.push({ ...t, pageviews: pvByDate[t.date] ?? 0 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const results: { brand_id: string; status: "ok" | "error"; rows?: number; error?: string }[] = [];

    // 브랜드별로 upsert
    const byBrand: Record<string, GA4Row[]> = {};
    for (const row of gaRows) {
      if (!byBrand[row.brand_id]) byBrand[row.brand_id] = [];
      byBrand[row.brand_id].push(row);
    }

    // 예전에 저장된 (not set) 행 정리 (GA4에서 다시 받아 오는 캐시라 지워도 손실 없음)
    await supabase.from("analytics_snapshots").delete().eq("brand_id", NOT_SET);

    for (const [brandId, rows] of Object.entries(byBrand)) {
      const { error } = await supabase
        .from("analytics_snapshots")
        .upsert(
          rows.map((r) => ({ ...r, synced_at: new Date().toISOString() })),
          { onConflict: "brand_id,date" }
        );

      if (error) {
        results.push({ brand_id: brandId, status: "error", error: error.message });
      } else {
        results.push({ brand_id: brandId, status: "ok", rows: rows.length });
      }
    }

    return NextResponse.json({ results, synced_at: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
