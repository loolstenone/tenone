/**
 * 춤추는고래 Brand Gravity - Step 5부터 재실행
 */

const PRODUCT_ID = "f192a2a7-bdd6-46bb-8a70-ea0abb5b8733";
const BRAND_NAME = "춤추는고래";
const BASE_URL = "http://localhost:3000";

async function callApi(path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const text = await res.text();
    let json;
    try {
        json = JSON.parse(text);
    } catch {
        throw new Error(`${path}: status=${res.status}, body="${text.slice(0, 200)}"`);
    }
    if (!res.ok) throw new Error(`${path}: ${res.status} ${JSON.stringify(json)}`);
    return json;
}

async function main() {
    // Step 5: gap/run
    console.log("[5] gap/run 실행 (갭 분석)...");
    const gapResult = await callApi("/api/gravity/gap/run", {
        product_id: PRODUCT_ID,
        brand_name: BRAND_NAME,
        competitors: ["댄스아카데미", "유튜브댄스", "원밀리언댄스스튜디오"],
    });
    console.log(`  결과: ${JSON.stringify(gapResult)}\n`);

    // Step 6: source/run
    console.log("[6] source/run 실행 (소스 추적)...");
    const sourceResult = await callApi("/api/gravity/source/run", {
        product_id: PRODUCT_ID,
        brand_name: BRAND_NAME,
        competitors: ["댄스아카데미", "유튜브댄스", "원밀리언댄스스튜디오"],
        limit: 10,
    });
    console.log(`  결과: ${JSON.stringify(sourceResult)}\n`);

    // Step 7: voice/run
    console.log("[7] voice/run 실행 (콘텐츠 브리프 생성)...");
    const voiceResult = await callApi("/api/gravity/voice/run", {
        product_id: PRODUCT_ID,
        brand_name: BRAND_NAME,
        competitors: ["댄스아카데미", "유튜브댄스", "원밀리언댄스스튜디오"],
        limit: 5,
    });
    console.log(`  결과: ${JSON.stringify(voiceResult)}\n`);

    console.log("=== 완료 ===");
    console.log(`리포트 URL: http://localhost:3000/intra/gravity/${PRODUCT_ID}/report`);
}

main().catch(err => {
    console.error("오류:", err.message);
    process.exit(1);
});
