// 16가지 브랜드 커뮤니케이션 성격 유형 (MBTI 스타일)
// SEO/GEO 분석 결과를 기반으로 브랜드의 디지털 성격을 진단

export interface BrandPersonality {
  type: string;       // 4글자 코드 (예: ICOF)
  name: string;       // 한국어 이름
  emoji: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  communication: string;  // 소비자와의 커뮤니케이션 방식
  relationship: string;   // 소비자와의 관계
  recommendation: string; // 개선 방향
}

// 4개 축 (각 2가지 성향)
// I(Invisible) vs V(Visible) — AI/검색 가시성
// C(Conservative) vs P(Progressive) — 기술/콘텐츠 적극성
// O(Organic) vs A(Ad-driven) — 오가닉 vs 광고 의존
// F(Formal) vs C(Casual) — 톤앤매너 (구조화 데이터 기반)

const PERSONALITIES: Record<string, BrandPersonality> = {
  VCPF: { type: 'VCPF', name: '전략적 리더', emoji: '👑', description: 'SEO와 GEO 모두 우수하며, 체계적이고 전문적인 디지털 존재감을 가진 브랜드', strengths: ['검색 가시성 최상', 'AI 검색에서도 노출', '기술적 완성도 높음'], weaknesses: ['소비자와의 감성적 연결 부족 가능'], communication: '전문적이고 권위 있는 정보 제공 중심', relationship: '소비자가 신뢰하는 전문가 관계', recommendation: '감성적 콘텐츠와 스토리텔링 강화' },
  VCPC: { type: 'VCPC', name: '친근한 혁신가', emoji: '🚀', description: '기술적으로 완성도 높으면서도 친근한 소통을 하는 균형 잡힌 브랜드', strengths: ['기술+감성 균형', '소비자 참여도 높음', 'AI 최적화 우수'], weaknesses: ['브랜드 정체성 분산 가능'], communication: '전문성과 친근함을 오가는 유연한 소통', relationship: '소비자의 든든한 친구 같은 브랜드', recommendation: '일관된 브랜드 보이스 정립' },
  VCOF: { type: 'VCOF', name: '조용한 강자', emoji: '🏔️', description: '오가닉 검색에서 강하고 꾸준한 콘텐츠로 신뢰를 쌓는 브랜드', strengths: ['자연 유입 강함', '콘텐츠 품질 우수', '장기적 성장 기반'], weaknesses: ['새로운 채널 확장 느림'], communication: '깊이 있는 콘텐츠로 가치를 전달', relationship: '오래 알아온 신뢰할 수 있는 파트너', recommendation: 'AI 검색 최적화와 멀티채널 확장' },
  VCOC: { type: 'VCOC', name: '자유로운 탐험가', emoji: '🧭', description: '다양한 콘텐츠로 자유롭게 소통하며 오가닉 성장을 추구하는 브랜드', strengths: ['콘텐츠 다양성', '소비자 공감 능력'], weaknesses: ['체계성 부족', 'SEO 기술 개선 필요'], communication: '자유롭고 실험적인 콘텐츠 중심', relationship: '함께 성장하는 동반자', recommendation: '기술 SEO 보강으로 안정적 기반 확보' },
  VIPF: { type: 'VIPF', name: '보이지 않는 잠재력', emoji: '💎', description: '좋은 콘텐츠를 가졌지만 검색에서 발견되지 않는 숨겨진 보석', strengths: ['콘텐츠 품질 잠재력', '전문성 보유'], weaknesses: ['검색 가시성 부족', 'AI 노출 없음'], communication: '전문적이지만 도달 범위가 제한적', relationship: '알게 되면 충성도 높은 팬 확보 가능', recommendation: 'SEO 기본기부터 체계적으로 개선' },
  VIPC: { type: 'VIPC', name: '숨겨진 매력', emoji: '🌱', description: '친근한 소통 능력은 있지만 디지털에서 발견되기 어려운 브랜드', strengths: ['소비자 소통 능력', '진정성'], weaknesses: ['디지털 가시성 매우 부족'], communication: '진정성 있지만 제한적 도달', relationship: '오프라인에서 강한 관계, 온라인 확장 필요', recommendation: '디지털 존재감 구축이 최우선' },
  VIOF: { type: 'VIOF', name: '고요한 장인', emoji: '🔨', description: '제품/서비스는 좋지만 디지털 마케팅이 부재한 전통적 브랜드', strengths: ['제품 품질', '기존 고객 충성도'], weaknesses: ['디지털 부재', '신규 고객 유입 어려움'], communication: '오프라인 중심, 디지털 전환 필요', relationship: '기존 고객과는 강하지만 신규 확장 제한', recommendation: '디지털 마케팅 전면 도입 필요' },
  VIOC: { type: 'VIOC', name: '디지털 초심자', emoji: '🌿', description: '디지털에 첫발을 내딛고 있는 브랜드. 성장 잠재력이 큼', strengths: ['성장 잠재력', '새로운 시작의 유연함'], weaknesses: ['모든 디지털 지표 개선 필요'], communication: '아직 디지털 소통 채널 미확립', relationship: '소비자와의 디지털 관계 구축 시작', recommendation: '기본 SEO + 콘텐츠 전략부터 단계적 구축' },
  ICPF: { type: 'ICPF', name: '기술적 전문가', emoji: '⚙️', description: 'SEO 기술은 갖췄지만 콘텐츠와 AI 최적화가 부족한 브랜드', strengths: ['기술 SEO 기반 확보'], weaknesses: ['콘텐츠 부족', 'GEO 미대응'], communication: '기술적이고 정보 전달 중심', relationship: '기능적 관계, 감성적 연결 부족', recommendation: '콘텐츠 전략 + GEO 최적화 집중' },
  ICPC: { type: 'ICPC', name: '소통하는 기술자', emoji: '🔧', description: '기술 기반에 친근한 소통을 더한 성장 중인 브랜드', strengths: ['기술+소통 균형 시도'], weaknesses: ['AI 검색 대응 부족'], communication: '기술과 감성의 조화 시도 중', relationship: '발전하는 관계', recommendation: 'GEO 최적화와 콘텐츠 깊이 강화' },
  ICOF: { type: 'ICOF', name: '전통적 수호자', emoji: '🏛️', description: '전통적인 방식을 고수하며 안정적이지만 변화가 필요한 브랜드', strengths: ['안정성', '기존 방식의 숙련도'], weaknesses: ['변화 대응 느림', '디지털 전환 지연'], communication: '전통적이고 격식 있는 소통', relationship: '오래된 신뢰 기반 관계', recommendation: 'AI 시대에 맞는 디지털 전환 가속' },
  ICOC: { type: 'ICOC', name: '감성적 아티스트', emoji: '🎨', description: '독특한 감성은 있지만 디지털 전략이 부재한 브랜드', strengths: ['독특한 브랜드 감성'], weaknesses: ['SEO/GEO 전반적 부족'], communication: '감성적이지만 체계 없음', relationship: '소수 팬과의 깊은 관계', recommendation: '감성을 살리면서 SEO 기반 구축' },
  IIPF: { type: 'IIPF', name: '미완의 대기', emoji: '🔮', description: '잠재력은 있지만 아직 시작 단계인 브랜드', strengths: ['발전 가능성'], weaknesses: ['전반적 개선 필요'], communication: '아직 확립되지 않음', relationship: '관계 구축 초기', recommendation: '진단 결과를 바탕으로 체계적 로드맵 수립' },
  IIPC: { type: 'IIPC', name: '열정적 신생', emoji: '🔥', description: '열정은 있지만 방향 설정이 필요한 신생 브랜드', strengths: ['열정과 의지'], weaknesses: ['방향성 부재', '기술/콘텐츠 모두 개선 필요'], communication: '열정적이지만 산발적', relationship: '잠재 고객 발굴 단계', recommendation: '명확한 마케팅 전략 수립이 최우선' },
  IIOF: { type: 'IIOF', name: '침묵의 관찰자', emoji: '👁️', description: '시장을 관찰하고 있지만 아직 행동으로 옮기지 못한 브랜드', strengths: ['시장 이해도'], weaknesses: ['실행력 부족'], communication: '소극적', relationship: '소비자 인지도 거의 없음', recommendation: '작은 것부터 실행 — 무료 진단으로 시작' },
  IIOC: { type: 'IIOC', name: '자유로운 방랑자', emoji: '🦋', description: '방향 없이 자유롭게 운영 중인 브랜드. 체계가 필요함', strengths: ['자유로움', '실험 정신'], weaknesses: ['방향성 없음', '모든 지표 개선 필요'], communication: '비체계적', relationship: '우연한 만남에 의존', recommendation: '기본기부터 — SEO 진단 → 콘텐츠 → 광고 순서로' },
};

export function analyzeBrandPersonality(scores: {
  techSeo: number;     // 0~100 (기술 SEO 점수율)
  contentSeo: number;  // 0~100
  geoExposure: number; // 0~100 (AI 노출)
  geoReadiness: number;// 0~100
  keywords: number;    // 키워드 관련도 (0~100)
  contentGap: number;  // 콘텐츠 갭 수 (역산)
}): BrandPersonality {
  const avgSeo = (scores.techSeo + scores.contentSeo) / 2;

  // V(Visible) vs I(Invisible)
  const v = avgSeo >= 60 ? 'V' : 'I';

  // C(Conservative) vs I(Invisible in tech)
  const c = scores.techSeo >= 50 ? 'C' : 'I';

  // P(Progressive) vs O(Organic)
  const p = scores.contentSeo >= 50 || scores.geoExposure >= 40 ? 'P' : 'O';

  // F(Formal) vs C(Casual)
  const f = scores.geoReadiness >= 40 ? 'F' : 'C';

  const typeCode = `${v}${c}${p}${f}`;

  return PERSONALITIES[typeCode] || PERSONALITIES['IIOC'];
}
