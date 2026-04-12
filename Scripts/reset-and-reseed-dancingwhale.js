/**
 * 춤추는고래 Brand Gravity 데이터 초기화 + 재시드 + 파이프라인 재실행
 *
 * 춤추는고래: 여성 위생용품(생리대/팬티라이너) 브랜드
 * - 핵심 제품: 18cm 날개형 롱라이너 (국내 유일)
 * - 연매출 17억, 고정 고객 약 1만명 (35~45세 여성 주력)
 * - 중국 제조 (고품질 공장, 유한킴벌리와 동급 시설)
 * - 6월 신제품 출시 예정 (유기농 + 슈퍼소프트 롱라이너)
 */

const PRODUCT_ID = "f192a2a7-bdd6-46bb-8a70-ea0abb5b8733";
const BRAND_NAME = "춤추는고래";
const BASE_URL = "http://localhost:3000";

const SUPABASE_URL = "https://ziotlxkdctlhiwkgmmsh.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY;

// 실제 경쟁사: 대기업 생리대/팬티라이너 브랜드
const COMPETITORS = ["좋은느낌", "화이트", "라엘"];

// 춤추는고래 실제 리뷰 데이터 (여성 위생용품 - 생리대/팬티라이너)
const REVIEWS = [
    {
        platform: "naver_blog",
        raw_text: "춤추는고래 날개형 롱라이너 써봤는데 진짜 좋아요. 일반 팬티라이너는 활동하다 보면 자꾸 삐뚤어지거나 접히는데 날개가 있으니까 고정이 확실히 잘 돼요. 하루종일 돌아다녀도 위치가 안 변해서 편했습니다.",
        rating: 5,
        author: "라이너추천녀"
    },
    {
        platform: "naver_blog",
        raw_text: "생리 끝물에 소형생리대 대신 춤추는고래 롱라이너 쓰고 있어요. 18cm라 길이가 딱 좋고 흡수력도 충분해요. 대기업 소형생리대보다 가격도 착하고 오히려 더 편해서 이제 이것만 씁니다. 날개 접착력도 괜찮아요.",
        rating: 5,
        author: "끝물라이너"
    },
    {
        platform: "kakao",
        raw_text: "춤추는고래 처음 들어보고 반신반의했는데 써보니까 괜찮아요. 다만 중국산이라는 점이 좀 걸리긴 해요. 요즘 유기농 제품들이 대세인데 원재료 원산지가 명확하지 않아서 아쉬워요. 착용감 자체는 나쁘지 않습니다.",
        rating: 3,
        author: "원산지걱정"
    },
    {
        platform: "naver_cafe",
        raw_text: "남편이 쿠팡에서 잘못 주문해서 알게 된 브랜드인데 써보니까 의외로 좋아요 ㅋㅋ 날개형 팬티라이너가 국내에 이거밖에 없다길래 써봤더니 진짜 안 움직여요. 운동할 때 특히 좋았어요. 근데 브랜드 인지도가 너무 없어서 주변에 추천해도 '그게 뭐야?' 반응이에요.",
        rating: 4,
        author: "우연히발견"
    },
    {
        platform: "google",
        raw_text: "평소 팬티라이너를 매일 쓰는데 일반 라이너가 자꾸 뭉치고 접혀서 불편했거든요. 춤추는고래 날개형은 확실히 다릅니다. 날개가 팬티 바깥쪽으로 접혀서 고정되니까 하루 종일 제자리. 흡수력도 괜찮고 보풀도 안 생겨요.",
        rating: 5,
        author: "매일라이너"
    },
    {
        platform: "naver_blog",
        raw_text: "가격이 좀 비싸요. 대기업 제품이랑 비교하면 크게 차이 안 나거나 더 비쌀 때도 있어서... 중국산인데 이 가격이면 좀 애매하지 않나 싶어요. 품질은 인정하는데 가격 대비 메리트가 확 와닿지는 않아요.",
        rating: 3,
        author: "가격비교녀"
    },
    {
        platform: "naver_blog",
        raw_text: "민감성 피부라 생리대 고르기가 정말 까다로운데, 춤추는고래 롱라이너는 피부 트러블이 안 생겼어요. 순면 느낌의 탑시트가 부드럽고 통기성도 괜찮은 편이에요. 하루에 2~3번 교체하면서 쓰면 쾌적하게 유지됩니다.",
        rating: 5,
        author: "민감성피부"
    },
    {
        platform: "instagram",
        raw_text: "생리 아닌 날에도 라이너 쓰는 습관이 있는데 춤추는고래가 제 인생라이너에요. 얇은데 흡수 잘 되고 날개 때문에 움직여도 안심. 패키지 디자인도 귀여워서 파우치에 넣고 다니기 좋아요.",
        rating: 5,
        author: "인생라이너"
    },
    {
        platform: "naver_blog",
        raw_text: "네이버 쇼핑에서 '날개형 팬티라이너' 검색했더니 춤추는고래가 거의 유일하더라고요. 대기업은 왜 안 만드는지 모르겠지만 있으면 확실히 편한 기능인데. 써보면 날개 없는 라이너로 못 돌아가요. 단점은 오프라인 매장에서 못 산다는 것.",
        rating: 4,
        author: "온라인전용"
    },
    {
        platform: "kakao",
        raw_text: "출산 후에 팬티라이너를 자주 쓰게 됐는데 춤추는고래 추천받아서 써봤어요. 길이가 18cm라 일반 라이너보다 넉넉하고 날개 고정이 돼서 육아하면서 움직여도 편해요. 다만 대형마트에 없어서 매번 온라인 주문해야 하는게 번거로워요.",
        rating: 4,
        author: "출산후맘"
    },
    {
        platform: "naver_cafe",
        raw_text: "40대인데 갱년기 시작되면서 냉이 많아져서 매일 라이너를 쓰고 있어요. 춤추는고래는 보풀이 안 생기는 점이 제일 좋아요. 다른 브랜드는 오래 착용하면 보풀이 일어나는데 이건 괜찮더라고요. 피부가 약해서 보풀 없는게 정말 중요해요.",
        rating: 5,
        author: "40대직장맘"
    },
    {
        platform: "google",
        raw_text: "솔직히 생리대는 유한킴벌리나 깨끗한나라 같은 대기업 제품이 안심되는데, 춤추는고래는 브랜드 자체를 처음 들어봐서 망설였어요. 근데 날개형 롱라이너라는 콘셉트가 독특해서 한번 써봤는데 착용감은 확실히 좋았습니다. 신뢰도만 높아지면 계속 쓸 것 같아요.",
        rating: 4,
        author: "대기업신뢰"
    },
    {
        platform: "naver_blog",
        raw_text: "유기농 생리대 유행이라 유기농 라이너도 찾아봤는데, 춤추는고래는 유기농 라인이 없어서 아쉬워요. 날개형이라는 기능은 좋은데 요즘 소비자들이 원하는 건 유기농/친환경 소재거든요. 이 부분이 보완되면 훨씬 경쟁력 있을 것 같아요.",
        rating: 3,
        author: "유기농추구"
    },
    {
        platform: "naver_blog",
        raw_text: "생리대 정기배송 하다가 춤추는고래도 추가했어요. 롱라이너는 생리 시작 전이나 끝물에 쓰기 딱 좋은 사이즈에요. 소형생리대 따로 안 사도 되니까 오히려 절약이 됩니다. 날개 있어서 밤에 잘 때도 밀리지 않아요.",
        rating: 5,
        author: "정기배송맘"
    },
    {
        platform: "instagram",
        raw_text: "헬스장 다니면서 운동할 때 일반 라이너가 자꾸 접혀서 짜증났는데, 춤추는고래 날개형으로 바꾸고 나서 완전 해결됐어요. 스쿼트 하든 러닝 하든 안 움직여요. 운동하는 여성분들한테 강추합니다.",
        rating: 5,
        author: "헬스녀"
    },
    {
        platform: "naver_cafe",
        raw_text: "국민행복몰에서 춤추는고래를 발견했어요. 바우처로 살 수 있어서 경제적으로 부담이 덜했고, 써보니까 품질도 괜찮아요. 다만 종류가 롱라이너밖에 없어서 일반 사이즈 생리대는 다른 브랜드를 사야 해요. 라인업이 좀 더 다양했으면 좋겠어요.",
        rating: 4,
        author: "바우처구매"
    },
    {
        platform: "naver_blog",
        raw_text: "직장에서 하루 8시간 이상 앉아있는데 일반 라이너는 꼭 뒤로 밀리거나 뭉쳐요. 춤추는고래 날개형은 앉아있어도 안정적이에요. 착용감이 얇아서 이물감도 적고요. 사무직 여성분들한테 추천해요.",
        rating: 5,
        author: "사무직여성"
    },
    {
        platform: "kakao",
        raw_text: "딸이 대학생인데 제가 쓰는 걸 보고 따라 쓰기 시작했어요. 젊은 애들은 브랜드 인지도를 많이 보는데, 춤추는고래를 아는 친구가 없대요. SNS 마케팅이나 대학생 타겟 홍보를 더 해야 하지 않을까 싶어요. 제품은 좋은데 알려지지 않아서 안타까워요.",
        rating: 4,
        author: "모녀사용"
    },
    {
        platform: "google",
        raw_text: "생리대 성분 따져보는 편인데 춤추는고래 성분표가 홈페이지에 자세히 안 나와있어요. 요즘은 전성분 공개가 기본인데 이 부분이 부족해요. 제품 자체는 피부 트러블 없이 잘 맞았지만, 정보 공개가 더 투명했으면 신뢰가 높아질 것 같아요.",
        rating: 3,
        author: "성분파"
    },
    {
        platform: "naver_blog",
        raw_text: "춤추는고래 3년째 쓰고 있는 충성 고객입니다. 날개형 롱라이너라는 카테고리 자체가 이 브랜드가 개척한 거라 대체재가 없어요. 한번 쓰면 다른 라이너로 못 돌아가요. 가격이 조금 올랐지만 그래도 계속 살 거예요. 신제품 나온다는 소식 들었는데 기대됩니다.",
        rating: 5,
        author: "3년충성"
    }
];

async function supabaseDelete(table, filter) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
            "apikey": SERVICE_ROLE_KEY,
        },
    });
    if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(`DELETE ${table}: ${res.status} ${text}`);
    }
    console.log(`  ✓ DELETE ${table} (${filter})`);
}

async function supabasePatch(table, filter, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
            "apikey": SERVICE_ROLE_KEY,
            "Prefer": "return=minimal",
        },
        body: JSON.stringify(body),
    });
    if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(`PATCH ${table}: ${res.status} ${text}`);
    }
}

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
        throw new Error(`${path}: status=${res.status}, body="${text.slice(0, 300)}"`);
    }
    if (!res.ok) throw new Error(`${path}: ${res.status} ${JSON.stringify(json)}`);
    return json;
}

async function main() {
    console.log("=== 춤추는고래 Brand Gravity 초기화 + 재실행 ===");
    console.log("    (여성위생용품 - 생리대/팬티라이너 브랜드)\n");

    // Step 0: 기존 데이터 삭제
    console.log("[0] 기존 데이터 초기화...");
    const pid = `product_id=eq.${PRODUCT_ID}`;
    await supabaseDelete("bg_voice_briefs", pid);
    await supabaseDelete("bg_source_traces", pid);
    await supabaseDelete("bg_gravity_scores", pid);
    await supabaseDelete("bg_ai_probe_results", pid);
    await supabaseDelete("bg_question_patterns", pid);
    await supabaseDelete("bg_pain_points", pid);
    await supabaseDelete("bg_pain_sources", pid);
    console.log("  완료\n");

    // Step 0.5: 제품 카테고리 수정
    console.log("[0.5] 제품 카테고리 수정 (교육/코칭 → 여성위생용품)...");
    await supabasePatch("bg_products", `id=eq.${PRODUCT_ID}`, {
        category: "여성위생용품",
        competitors: COMPETITORS,
        target_keywords: ["팬티라이너", "날개형라이너", "롱라이너", "생리대", "여성위생"],
    });
    console.log("  완료\n");

    // Step 1: 데이터 시드
    console.log("[1] 춤추는고래 리뷰 데이터 시드...");
    const seedResult = await callApi("/api/gravity/pain/seed", {
        product_id: PRODUCT_ID,
        reviews: REVIEWS,
    });
    console.log(`  삽입: ${seedResult.inserted}개\n`);

    // Step 2: pain/run (pain-classify)
    console.log("[2] pain/run 실행 (페인포인트 분류)...");
    const painResult = await callApi("/api/gravity/pain/run", {
        product_id: PRODUCT_ID,
        brand_name: BRAND_NAME,
    });
    console.log(`  결과: ${JSON.stringify(painResult)}\n`);

    // Step 3: question/run (question-mapper)
    console.log("[3] question/run 실행 (질문 패턴 클러스터링)...");
    const questionResult = await callApi("/api/gravity/question/run", {
        product_id: PRODUCT_ID,
        top_n: 15,
    });
    console.log(`  결과: ${JSON.stringify(questionResult)}\n`);

    // Step 4: probe/run (ai-prober)
    console.log("[4] probe/run 실행 (AI 프로브)...");
    const probeResult = await callApi("/api/gravity/probe/run", {
        product_id: PRODUCT_ID,
        brand_name: BRAND_NAME,
        competitors: COMPETITORS,
        pattern_limit: 10,
    });
    console.log(`  결과: ${JSON.stringify(probeResult)}\n`);

    // Step 5: gap/run (gap-analyzer)
    console.log("[5] gap/run 실행 (갭 분석)...");
    const gapResult = await callApi("/api/gravity/gap/run", {
        product_id: PRODUCT_ID,
        brand_name: BRAND_NAME,
        competitors: COMPETITORS,
    });
    console.log(`  결과: ${JSON.stringify(gapResult)}\n`);

    // Step 6: source/run (source-tracer)
    console.log("[6] source/run 실행 (소스 추적)...");
    const sourceResult = await callApi("/api/gravity/source/run", {
        product_id: PRODUCT_ID,
        brand_name: BRAND_NAME,
        competitors: COMPETITORS,
        limit: 10,
    });
    console.log(`  결과: ${JSON.stringify(sourceResult)}\n`);

    // Step 7: voice/run (voice-designer)
    console.log("[7] voice/run 실행 (콘텐츠 브리프 생성)...");
    const voiceResult = await callApi("/api/gravity/voice/run", {
        product_id: PRODUCT_ID,
        brand_name: BRAND_NAME,
        competitors: COMPETITORS,
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
