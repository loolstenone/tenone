import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  return Object.values(rows);
}

export async function POST(req: NextRequest) {
  if (!GA4_PROPERTY_ID || !GA4_SERVICE_ACCOUNT_JSON) {
    return NextResponse.json(
      { error: "GA4_PROPERTY_ID 또는 GA4_SERVICE_ACCOUNT_JSON 환경변수가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const days = Math.min(parseInt(searchParams.get("days") || "7"), 90);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1); // 어제까지
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (days - 1));

  const fmt = (d: Date) => d.toISOString().split("T")[0].replace(/-/g, "");
  const startStr = fmt(startDate);
  const endStr = fmt(endDate);

  try {
    const token = await getGA4AccessToken(GA4_SERVICE_ACCOUNT_JSON);
    const gaRows = await fetchGA4Report(token, GA4_PROPERTY_ID, startStr, endStr);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const results: { brand_id: string; status: "ok" | "error"; rows?: number; error?: string }[] = [];

    // 브랜드별로 upsert
    const byBrand: Record<string, GA4Row[]> = {};
    for (const row of gaRows) {
      if (!byBrand[row.brand_id]) byBrand[row.brand_id] = [];
      byBrand[row.brand_id].push(row);
    }

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
