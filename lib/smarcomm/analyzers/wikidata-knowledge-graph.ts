// Wikidata SPARQL Knowledge Graph detector
// — AI 시스템(ChatGPT·Perplexity·Google AI Overview)은 Wikidata 엔트리를 1차 인용원으로 활용한다.
// — 도메인이 Wikidata 엔티티의 official website (P856)로 등록되어 있는지 검사.
//
// Endpoint: https://query.wikidata.org/sparql
// 무료, API key 불필요. User-Agent 명시 권장 (Wikimedia 규약).

export interface WikidataEntity {
    qid: string;           // 예: 'Q95'
    label: string;         // 한국어/영어 우선
    description: string | null;
    url: string;           // https://www.wikidata.org/wiki/Q95
}

export interface WikidataResult {
    found: boolean;
    entities: WikidataEntity[];
    queryDomain: string;
    /** AI 시스템의 Knowledge Graph 활용 가능성: 0(없음)~100(완전 등록) */
    kgScore: number;
}

const USER_AGENT = 'SmarComm-Index/1.0 (https://smarcomm.biz; contact@tenone.biz)';
const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

/**
 * 도메인이 Wikidata 엔티티에 official website (P856)로 등록되어 있는지 확인.
 * 무료·인증 불필요. 5초 타임아웃.
 */
export async function fetchWikidataEntity(rawDomain: string): Promise<WikidataResult> {
    const domain = rawDomain.replace(/^www\./, '').toLowerCase();

    // SPARQL: P856 (official website)에 도메인 포함 검색
    const sparql = `
SELECT DISTINCT ?item ?itemLabel ?itemDescription WHERE {
  ?item wdt:P856 ?website .
  FILTER(CONTAINS(LCASE(STR(?website)), "${domain}"))
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ko,en". }
}
LIMIT 5`.trim();

    try {
        const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(sparql)}&format=json`;
        const res = await fetch(url, {
            headers: {
                'Accept': 'application/sparql-results+json',
                'User-Agent': USER_AGENT,
            },
            signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) {
            return { found: false, entities: [], queryDomain: domain, kgScore: 0 };
        }

        const json = await res.json();
        const bindings = json?.results?.bindings ?? [];

        const entities: WikidataEntity[] = bindings.map((b: Record<string, { value?: string }>) => {
            const itemUri = b.item?.value ?? '';
            const qid = itemUri.split('/').pop() || '';
            return {
                qid,
                label: b.itemLabel?.value ?? qid,
                description: b.itemDescription?.value ?? null,
                url: itemUri,
            };
        }).filter((e: WikidataEntity) => e.qid.startsWith('Q'));

        // kgScore: 엔티티가 있으면 기본 60, 한국어 라벨/설명이 있으면 가산
        let kgScore = 0;
        if (entities.length > 0) {
            kgScore = 60;
            const hasDescription = entities.some(e => e.description && e.description.length > 5);
            const hasKoreanLabel = entities.some(e => /[가-힣]/.test(e.label));
            if (hasDescription) kgScore += 20;
            if (hasKoreanLabel) kgScore += 20;
        }

        return {
            found: entities.length > 0,
            entities,
            queryDomain: domain,
            kgScore: Math.min(100, kgScore),
        };
    } catch {
        return { found: false, entities: [], queryDomain: domain, kgScore: 0 };
    }
}
