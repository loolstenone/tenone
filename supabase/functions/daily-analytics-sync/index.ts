/**
 * daily-analytics-sync — 매일 새벽 3시 GA4 → Supabase 동기화
 *
 * 스케줄: cron "0 18 * * *" (UTC 18:00 = KST 03:00)
 *
 * 흐름:
 *   1. GA4 서비스 계정으로 Access Token 발급
 *   2. GA4 Data API → 어제 하루 brand_id별 메트릭 조회
 *   3. analytics_snapshots upsert
 */

const GA4_PROPERTY_ID = Deno.env.get("GA4_PROPERTY_ID");
const GA4_SERVICE_ACCOUNT_JSON = Deno.env.get("GA4_SERVICE_ACCOUNT_JSON");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);

  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const claim = btoa(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

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

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${sig}`,
    }),
  });
  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (_req) => {
  if (!GA4_PROPERTY_ID || !GA4_SERVICE_ACCOUNT_JSON) {
    return new Response(
      JSON.stringify({ error: "GA4 환경변수 미설정" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // 어제 날짜
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0];
  const ga4Date = dateStr.replace(/-/g, "");

  try {
    const token = await getAccessToken(GA4_SERVICE_ACCOUNT_JSON);

    // GA4 리포트 조회
    const reportRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: ga4Date, endDate: ga4Date }],
          dimensions: [{ name: "customEvent:brand_id" }],
          metrics: [
            { name: "sessions" },
            { name: "screenPageViews" },
            { name: "totalUsers" },
            { name: "newUsers" },
            { name: "averageSessionDuration" },
            { name: "bounceRate" },
          ],
          limit: 1000,
        }),
      }
    );
    const reportData = await reportRes.json();

    // 상위 페이지
    const pageRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate: ga4Date, endDate: ga4Date }],
          dimensions: [{ name: "customEvent:brand_id" }, { name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 200,
        }),
      }
    );
    const pageData = await pageRes.json();

    // 유입 소스
    const srcRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate: ga4Date, endDate: ga4Date }],
          dimensions: [{ name: "customEvent:brand_id" }, { name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }],
          limit: 100,
        }),
      }
    );
    const srcData = await srcRes.json();

    // 페이지 맵
    const pageMap: Record<string, { path: string; views: number }[]> = {};
    for (const row of pageData.rows ?? []) {
      const [brandId, path] = row.dimensionValues.map((d: { value: string }) => d.value);
      const views = Math.round(parseFloat(row.metricValues[0].value));
      if (!pageMap[brandId]) pageMap[brandId] = [];
      if (pageMap[brandId].length < 10) pageMap[brandId].push({ path, views });
    }

    // 소스 맵
    const srcMap: Record<string, { source: string; sessions: number }[]> = {};
    for (const row of srcData.rows ?? []) {
      const [brandId, source] = row.dimensionValues.map((d: { value: string }) => d.value);
      const cnt = Math.round(parseFloat(row.metricValues[0].value));
      if (!srcMap[brandId]) srcMap[brandId] = [];
      srcMap[brandId].push({ source, sessions: cnt });
    }

    // Supabase upsert
    const rows = (reportData.rows ?? []).map((row: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }) => {
      const [brandId] = row.dimensionValues.map((d) => d.value);
      const [sessions, pageviews, users, newUsers, duration, bounce] =
        row.metricValues.map((m) => parseFloat(m.value));
      return {
        brand_id: brandId,
        date: dateStr,
        sessions: Math.round(sessions),
        pageviews: Math.round(pageviews),
        users: Math.round(users),
        new_users: Math.round(newUsers),
        avg_session_duration: Math.round(duration),
        bounce_rate: parseFloat((bounce * 100).toFixed(2)),
        top_pages: pageMap[brandId] ?? [],
        traffic_sources: srcMap[brandId] ?? [],
        synced_at: new Date().toISOString(),
      };
    });

    const res = await fetch(`${SUPABASE_URL}/rest/v1/analytics_snapshots`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(rows),
    });

    return new Response(
      JSON.stringify({ ok: true, date: dateStr, brands: rows.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "알 수 없는 오류" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
