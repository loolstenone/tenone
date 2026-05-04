// 음식 검색·바코드 조회 — Open Food Facts API 프록시
// GET /api/myverse/food?q=비빔밥          — 이름 검색
// GET /api/myverse/food?barcode=8801234... — 바코드 조회
//
// CORS·Rate Limit 우회 + 응답 정규화 (이름·칼로리·단백질·탄수·지방)
//
// 응답:
//   { items: [{ name, brand?, calories, protein, carbs, fat, source: 'openfoodfacts:{code}' }] }

import { NextResponse } from "next/server";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

interface OFFNutriments {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
}

interface OFFProduct {
    code?: string;
    product_name?: string;
    product_name_ko?: string;
    brands?: string;
    nutriments?: OFFNutriments;
}

function normalize(p: OFFProduct) {
    const n = p.nutriments ?? {};
    return {
        name: p.product_name_ko ?? p.product_name ?? "(이름 없음)",
        brand: p.brands?.split(",")[0]?.trim() ?? null,
        calories: n["energy-kcal_100g"] ?? null,
        protein: n.proteins_100g ?? null,
        carbs: n.carbohydrates_100g ?? null,
        fat: n.fat_100g ?? null,
        source: p.code ? `openfoodfacts:${p.code}` : "openfoodfacts",
        per: "100g",
    };
}

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const barcode = url.searchParams.get("barcode")?.trim();

    if (!q && !barcode) return NextResponse.json({ error: "missing_query" }, { status: 400 });

    try {
        if (barcode) {
            const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=code,product_name,product_name_ko,brands,nutriments`, {
                headers: { "User-Agent": "Myverse/1.0" },
            });
            if (!res.ok) return NextResponse.json({ items: [] });
            const json = await res.json();
            if (json.status !== 1 || !json.product) return NextResponse.json({ items: [] });
            return NextResponse.json({ items: [normalize(json.product as OFFProduct)] });
        }

        // 이름 검색 (한국어 + 영어)
        const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q!)}&search_simple=1&action=process&json=1&page_size=10&fields=code,product_name,product_name_ko,brands,nutriments`;
        const res = await fetch(searchUrl, { headers: { "User-Agent": "Myverse/1.0" } });
        if (!res.ok) return NextResponse.json({ items: [] });
        const json = await res.json();
        const products = (json.products as OFFProduct[] | undefined) ?? [];
        return NextResponse.json({ items: products.slice(0, 10).map(normalize) });
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
