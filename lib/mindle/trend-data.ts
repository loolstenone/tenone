export interface TrendArticle {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    status: 'trending' | 'rising' | 'signal' | 'fading';
    date: string;
    readTime: string;
    views: number;
    author?: string;
    content?: string;
}

export const statusBadge: Record<string, { label: string; color: string }> = {
    trending: { label: "급상승", color: "bg-[#F5C518] text-black" },
    rising: { label: "상승중", color: "bg-orange-500/20 text-orange-400" },
    signal: { label: "시그널", color: "bg-blue-500/20 text-blue-400" },
    fading: { label: "소강", color: "bg-neutral-700 text-neutral-400" },
};

export const featured: TrendArticle = {
    id: "f1",
    title: "에이전트 AI가 일하는 방식을 바꾸고 있다 — 2026 생산성의 새로운 공식",
    excerpt: "단순 챗봇을 넘어 자율적으로 업무를 수행하는 에이전트 AI. 기업 도입이 가속화되는 이유와 금융, 마케팅, 크리에이티브 프로덕션 등 각 산업에서 실제 워크플로우가 어떻게 변화하고 있는지 분석합니다.",
    category: "AI / 테크",
    status: "trending",
    date: "2026.03.26",
    readTime: "8분",
    views: 3420,
    author: "Mindle AI",
    content: `Agent AI는 단순 챗봇을 넘어 독립적으로 업무를 수행하는 새로운 형태의 AI입니다.

2026년 현재, 기업 도입이 가속화되고 있는 이유는 명확합니다. 반복적인 업무의 자동화를 넘어, 의사결정 보조와 창의적 업무까지 AI가 담당하기 시작했기 때문입니다.

## 주요 변화

1. **자율 실행**: Agent AI는 사용자의 지시 없이도 목표를 설정하고 실행합니다.
2. **다중 도구 활용**: 이메일, 캘린더, CRM, 문서 작성 등 여러 도구를 동시에 조작합니다.
3. **학습과 적응**: 사용자의 패턴을 학습하여 점점 더 정확한 결과를 제공합니다.

## 산업별 도입 현황

금융, 마케팅, 크리에이티브 프로덕션 등 다양한 산업에서 Agent AI 도입이 급증하고 있습니다. 특히 마케팅 분야에서는 콘텐츠 기획부터 퍼포먼스 분석까지 전 과정에 AI가 참여하고 있습니다.

## 전망

2026년 하반기까지 Fortune 500 기업의 40% 이상이 Agent AI를 도입할 것으로 예상됩니다.`,
};

export const trends: TrendArticle[] = [
    { id: "t2", title: "숏폼 피로감과 '슬로우 콘텐츠'의 부상", excerpt: "TikTok·Reels 체류 시간이 줄어들며 팟캐스트와 롱폼 영상이 다시 주목받고 있다.", category: "콘텐츠", status: "rising", date: "03.25", readTime: "6분", views: 2180,
      content: `숏폼 콘텐츠의 피로감이 데이터로 드러나고 있습니다.\n\nTikTok과 Reels의 체류 시간이 전년 대비 12% 감소한 반면, 팟캐스트와 장문 영상의 소비 시간은 23% 증가했습니다.\n\n## 왜 슬로우 콘텐츠인가\n\n소비자들은 깊이 있는 콘텐츠에 대한 갈증을 느끼기 시작했습니다. 15초 클립으로는 충족되지 않는 '이해의 욕구'가 슬로우 콘텐츠 트렌드를 만들고 있습니다.\n\n## 마케터의 대응\n\n브랜드들은 숏폼과 롱폼을 혼합한 '하이브리드 콘텐츠 전략'을 채택하기 시작했습니다.` },
    { id: "t3", title: "하이퍼로컬 비즈니스가 글로벌로 확장하는 플레이북", excerpt: "동네 가게가 글로벌 브랜드가 되는 시대. 지역→글로벌 성공 패턴을 분석한다.", category: "비즈니스", status: "trending", date: "03.24", readTime: "5분", views: 1890,
      content: `동네 가게가 글로벌 브랜드가 되는 시대.\n\n하이퍼로컬 비즈니스의 글로벌 확장 패턴을 분석합니다. 지역 정체성을 유지하면서 글로벌 시장에 진출하는 전략이 핵심입니다.` },
    { id: "t4", title: "디지털 디톡스 = 새로운 럭셔리?", excerpt: "연결 해제가 프리미엄 소비가 되는 역설. '오프라인 전용' 공간에 돈을 쓰는 이유.", category: "라이프스타일", status: "signal", date: "03.23", readTime: "4분", views: 987,
      content: `디지털 디톡스가 새로운 럭셔리가 되고 있습니다.\n\n연결 해제가 프리미엄 소비가 되는 역설. 고가의 '디지털 프리' 리조트와 '전화 없는 레스토랑'이 인기를 얻고 있습니다.` },
    { id: "t5", title: "Z세대 가치 소비 — 브랜드는 어떻게 적응하고 있나", excerpt: "경험 우선, 가치 중심 소비 패턴이 전 세대로 확산되고 있다.", category: "소비자", status: "trending", date: "03.22", readTime: "7분", views: 2650,
      content: `가치 기반 소비가 Z세대를 넘어 전 세대로 확산되고 있습니다.\n\n경험 우선, 가치 중심의 소비 패턴이 브랜드 전략을 근본적으로 바꾸고 있습니다.` },
    { id: "t6", title: "공간 컴퓨팅: 대중화까지 남은 거리는?", excerpt: "새로운 디바이스 물결과 킬러앱 논쟁. 보급률과 앱 생태계를 진단한다.", category: "AI / 테크", status: "signal", date: "03.21", readTime: "9분", views: 1540,
      content: `공간 컴퓨팅의 대중화는 얼마나 남았을까?\n\n새로운 디바이스들의 등장으로 대중 채택에 대한 논쟁이 활발합니다. 보급률과 앱 생태계를 분석합니다.` },
    { id: "t7", title: "마이크로 SaaS 붐 — 1인 개발자의 시대", excerpt: "AI로 빠르게 만든 MVP가 니치 시장을 장악한다. 인디 해커 성공 사례 분석.", category: "비즈니스", status: "rising", date: "03.20", readTime: "6분", views: 2100,
      content: `AI 기반 빠른 MVP 개발로 니치 시장을 공략하는 마이크로 SaaS 붐.\n\n1인 개발자가 연 매출 수십억을 달성하는 시대. 인디 해커 성공 사례를 분석합니다.` },
    { id: "t8", title: "AI 카피라이팅의 한계와 인간+AI 협업 모델", excerpt: "초기 과열이 품질 논란으로 전환. 브랜드들이 협업 모델로 이동하는 이유.", category: "마케팅", status: "fading", date: "03.19", readTime: "5분", views: 1230,
      content: `AI 카피라이팅의 한계와 인간+AI 협업 모델의 부상.\n\n초기 과대광고가 품질 우려로 전환되면서, 협업 모델로의 전환이 일어나고 있습니다.` },
    { id: "t9", title: "경험 경제 — 이제 우리는 경험을 산다", excerpt: "소유보다 경험. 경험 소비 데이터가 전 연령대에서 확대되고 있다.", category: "소비자", status: "rising", date: "03.18", readTime: "6분", views: 1856,
      content: `소유보다 경험. 경험 소비 데이터가 전 연령대에서 확대되고 있습니다.` },
    { id: "t10", title: "크리에이터 이코노미 × 로컬 = 새로운 공식", excerpt: "지역 기반 크리에이터가 진정성으로 글로벌 팬베이스를 구축하는 방법.", category: "콘텐츠", status: "signal", date: "03.17", readTime: "5분", views: 890,
      content: `지역 기반 크리에이터가 진정성으로 글로벌 팬베이스를 구축하는 방법.` },
    { id: "t11", title: "구독 피로감: 번들링의 귀환", excerpt: "구독 한계에 다다른 소비자. 플랫폼들이 슈퍼 번들과 유연한 티어로 대응한다.", category: "비즈니스", status: "rising", date: "03.16", readTime: "4분", views: 1340,
      content: `구독 피로감이 정점에 달하면서 번들링이 돌아오고 있습니다.\n\n플랫폼들은 슈퍼 번들과 유연한 티어로 대응하고 있습니다.` },
    { id: "t12", title: "AI 생성 UGC: 진정성의 위기", excerpt: "AI가 사용자 콘텐츠를 만들면 신뢰가 무너진다. 플랫폼의 검증 전쟁.", category: "마케팅", status: "signal", date: "03.15", readTime: "7분", views: 1678,
      content: `AI가 사용자 콘텐츠를 생성하면 신뢰가 무너집니다.\n\n플랫폼들이 검증 시스템 구축에 분주합니다.` },
];

export const categories = ["전체", "AI / 테크", "마케팅", "소비자", "비즈니스", "콘텐츠", "라이프스타일"];

export function findArticle(id: string): TrendArticle | undefined {
    if (featured.id === id) return featured;
    return trends.find(t => t.id === id);
}

export function getAllArticles(): TrendArticle[] {
    return [featured, ...trends];
}
