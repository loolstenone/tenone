// 36가지 브랜드 커뮤니케이션 성격 유형
// SEO/GEO 분석 결과를 기반으로 브랜드의 디지털 성격을 진단
// 4축: Visibility(3) × Tech(2) × Content(2) × Engagement(3) = 36

export interface BrandPersonality {
  type: string;       // 코드 (예: V3-TP-AO-E2)
  name: string;       // 한국어 이름
  emoji: string;
  subtitle: string;   // 한줄 설명
  description: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

// 축 정의
// V: Visibility (검색 가시성)    — V1(미약) / V2(성장) / V3(우수)
// T: Tech (기술 SEO)            — TC(보수) / TP(적극)
// A: Content Activity            — AO(오가닉) / AA(활발)
// E: Engagement (소통 스타일)    — E1(격식) / E2(균형) / E3(캐주얼)

type Vis = 'V1' | 'V2' | 'V3';
type Tech = 'TC' | 'TP';
type Act = 'AO' | 'AA';
type Eng = 'E1' | 'E2' | 'E3';

interface TypeDef {
  name: string;
  emoji: string;
  subtitle: string;
  desc: string;
  str: string[];
  weak: string[];
  rec: string;
}

// 36개 유형 매트릭스
const TYPES: Record<string, TypeDef> = {
  // === V3 (우수한 가시성) ===
  'V3-TP-AA-E1': { name: '디지털 제왕', emoji: '👑', subtitle: '모든 지표가 최상위, 격식 있는 리더', desc: '검색 가시성, 기술 SEO, 콘텐츠 활동, AI 최적화 모두 우수한 최상위 브랜드', str: ['검색 1페이지 상위 노출', 'AI 검색 인용 빈번', '기술적 완성도 최고'], weak: ['소비자와의 감성적 거리감'], rec: '감성 스토리텔링과 인터랙티브 콘텐츠로 소비자 참여 강화' },
  'V3-TP-AA-E2': { name: '전략적 균형자', emoji: '⚖️', subtitle: '모든 영역에서 균형 잡힌 최강 브랜드', desc: '기술과 콘텐츠, 격식과 친근함 모두 균형을 이룬 이상적인 디지털 존재감', str: ['전방위 디지털 마케팅 완성', '소비자 신뢰+친근함 동시 확보'], weak: ['차별화 포인트 모호 가능'], rec: '독보적인 브랜드 개성을 강화하여 경쟁사와 차별화' },
  'V3-TP-AA-E3': { name: '친근한 혁신가', emoji: '🚀', subtitle: '기술적으로 완벽하면서도 유쾌한 소통', desc: '높은 기술력과 활발한 콘텐츠를 기반으로 캐주얼한 소통으로 팬덤을 구축하는 브랜드', str: ['높은 소비자 참여율', '바이럴 콘텐츠 생산력', 'AI 노출 우수'], weak: ['전문성 인식 약화 가능'], rec: 'B2B 또는 전문 분야에서의 신뢰성 보강' },
  'V3-TP-AO-E1': { name: '조용한 지배자', emoji: '🏔️', subtitle: '기술력과 오가닉으로 묵묵히 1등', desc: '광고 없이 순수 SEO와 기술력으로 상위를 점령한 브랜드', str: ['오가닉 트래픽 최강', '안정적 성장 기반', '비용 효율 최고'], weak: ['새로운 채널 확장 느림'], rec: '콘텐츠 다양화와 소셜 미디어 확장으로 성장 가속' },
  'V3-TP-AO-E2': { name: '현명한 관찰자', emoji: '🦉', subtitle: '때를 기다리며 정확히 움직이는 전략가', desc: '오가닉 중심의 안정적 성장과 균형 잡힌 소통으로 효율을 극대화하는 브랜드', str: ['마케팅 ROI 최고', '소비자 신뢰도 높음'], weak: ['공격적 성장에 한계'], rec: '데이터 기반 콘텐츠 마케팅으로 점진적 확장' },
  'V3-TP-AO-E3': { name: '자연주의 인플루언서', emoji: '🌿', subtitle: '자연스러운 매력으로 팬을 모으는 브랜드', desc: '광고 없이 진정성 있는 캐주얼한 소통으로 자연스럽게 영향력을 확대하는 브랜드', str: ['진정성 높은 브랜드 이미지', '자연 유입 충성 고객'], weak: ['성장 속도 제한적'], rec: '커뮤니티 구축과 UGC(사용자 생성 콘텐츠) 활성화' },
  'V3-TC-AA-E1': { name: '콘텐츠 전략가', emoji: '📊', subtitle: '콘텐츠 파워로 가시성을 만든 브랜드', desc: '기술 SEO는 기본 수준이지만 풍부한 콘텐츠로 높은 가시성을 확보한 브랜드', str: ['콘텐츠 양과 질 우수', '키워드 커버리지 넓음'], weak: ['기술 SEO 개선 여지 큼'], rec: 'Core Web Vitals 최적화와 구조화 데이터 적용으로 기술 보강' },
  'V3-TC-AA-E2': { name: '성실한 마라토너', emoji: '🏃', subtitle: '꾸준한 노력으로 정상에 오른 브랜드', desc: '화려하지는 않지만 꾸준한 콘텐츠와 균형 잡힌 소통으로 가시성을 확보한 브랜드', str: ['지속적 콘텐츠 생산', '안정적 트래픽'], weak: ['기술적 도약 필요'], rec: 'SEO 기술 고도화로 다음 단계 도약' },
  'V3-TC-AA-E3': { name: '인기 크리에이터', emoji: '🎬', subtitle: '콘텐츠 양과 친근함으로 승부하는 브랜드', desc: '기술보다 콘텐츠 양과 캐주얼한 소통으로 높은 가시성을 만든 브랜드', str: ['높은 소비자 친밀도', '콘텐츠 생산력 우수'], weak: ['기술 SEO 취약', '사이트 속도 문제 가능'], rec: '사이트 성능 최적화와 구조화 데이터 적용이 시급' },
  'V3-TC-AO-E1': { name: '전통의 명가', emoji: '🏛️', subtitle: '오랜 시간 쌓아온 자연스러운 권위', desc: '오래된 도메인과 기존 콘텐츠로 자연스럽게 가시성을 확보한 전통 브랜드', str: ['도메인 권위 높음', '기존 콘텐츠 자산 풍부'], weak: ['새로운 트렌드 대응 느림', 'AI 검색 미대응'], rec: 'GEO 최적화와 최신 콘텐츠 형식(영상, 인터랙티브) 도입' },
  'V3-TC-AO-E2': { name: '안정적 수성자', emoji: '🛡️', subtitle: '현 위치를 지키며 점진적으로 개선', desc: '이미 확보한 가시성을 안정적으로 유지하면서 균형 잡힌 소통을 하는 브랜드', str: ['안정적 유지 능력', '리스크 관리 우수'], weak: ['혁신 부족'], rec: '신규 채널과 AI 마케팅 실험으로 성장 동력 확보' },
  'V3-TC-AO-E3': { name: '레트로 감성가', emoji: '📻', subtitle: '클래식한 매력에 친근함을 더한 브랜드', desc: '오래된 방식이지만 캐주얼한 소통으로 팬층을 유지하는 브랜드', str: ['충성 고객층 보유', '브랜드 감성 확립'], weak: ['기술적 현대화 필요'], rec: '사이트 리뉴얼 + 모바일 최적화로 새 고객층 확보' },

  // === V2 (성장 중) ===
  'V2-TP-AA-E1': { name: '떠오르는 전문가', emoji: '📈', subtitle: '기술력과 콘텐츠로 빠르게 성장 중', desc: '기술 SEO와 콘텐츠 모두 적극적으로 투자하며 전문적 이미지를 구축 중인 브랜드', str: ['빠른 성장세', '기술+콘텐츠 투자 활발'], weak: ['아직 상위 노출 미달성'], rec: '링크 빌딩과 콘텐츠 허브 전략으로 도메인 권위 확보' },
  'V2-TP-AA-E2': { name: '균형 잡힌 도전자', emoji: '🎯', subtitle: '모든 영역을 고르게 발전시키는 중', desc: '기술, 콘텐츠, 소통 모두 균형 있게 성장하고 있는 유망 브랜드', str: ['성장 잠재력 최고', '균형 잡힌 발전'], weak: ['아직 돌파구 필요'], rec: '한 분야에서 확실한 차별화를 만들어 돌파구 마련' },
  'V2-TP-AA-E3': { name: '활발한 소통가', emoji: '💬', subtitle: '적극적 소통과 콘텐츠로 존재감 확대 중', desc: '친근한 소통과 활발한 콘텐츠로 빠르게 인지도를 높이고 있는 브랜드', str: ['소비자 참여 활발', '콘텐츠 생산 속도 빠름'], weak: ['전문성 이미지 보강 필요'], rec: '전문 콘텐츠(백서, 리서치)로 신뢰도 보강' },
  'V2-TP-AO-E1': { name: '신중한 기술자', emoji: '🔬', subtitle: '기술력은 갖췄지만 콘텐츠가 아쉬운', desc: '기술 SEO 기반은 탄탄하나 콘텐츠 활동이 부족한 성장 잠재 브랜드', str: ['기술 기반 확보', '사이트 성능 양호'], weak: ['콘텐츠 부족', '키워드 커버리지 좁음'], rec: '주 1-2회 정기 콘텐츠 발행과 블로그 전략 수립' },
  'V2-TP-AO-E2': { name: '묵묵한 성장자', emoji: '🌱', subtitle: '조용하지만 확실한 기반을 다지는 중', desc: '기술과 균형 잡힌 소통으로 조용히 성장하는 브랜드', str: ['안정적 성장 기반', '기술적 준비 완료'], weak: ['마케팅 활동 부족'], rec: '콘텐츠 마케팅과 소셜 미디어 시작으로 성장 가속' },
  'V2-TP-AO-E3': { name: '기술 센스있는 친구', emoji: '🤖', subtitle: '기술은 좋고 소통은 친근한', desc: '기술 기반은 있지만 오가닉 위주로 캐주얼하게 운영하는 브랜드', str: ['기술 기반 + 친근한 이미지'], weak: ['콘텐츠 양 부족'], rec: '기술력을 활용한 인터랙티브 콘텐츠 제작 추천' },
  'V2-TC-AA-E1': { name: '콘텐츠 빌더', emoji: '🧱', subtitle: '콘텐츠로 승부, 기술은 보강 필요', desc: '풍부한 콘텐츠로 성장하고 있지만 기술 SEO가 아쉬운 브랜드', str: ['콘텐츠 생산력 우수', '키워드 전략 보유'], weak: ['사이트 속도, 구조화 데이터 부족'], rec: 'Core Web Vitals 개선과 스키마 마크업 적용' },
  'V2-TC-AA-E2': { name: '노력파 마케터', emoji: '💪', subtitle: '부족하지만 열심히 채워나가는 중', desc: '기술은 부족하지만 콘텐츠와 소통으로 꾸준히 성장하는 브랜드', str: ['성실한 콘텐츠 운영', '소비자 반응 양호'], weak: ['기술적 기반 취약'], rec: 'SEO 기술 교육과 사이트 개선에 투자' },
  'V2-TC-AA-E3': { name: '소셜 활동가', emoji: '📱', subtitle: 'SNS와 콘텐츠 중심의 활발한 브랜드', desc: '기술보다 소통과 콘텐츠로 성장하는 소셜 미디어 중심 브랜드', str: ['소셜 미디어 활발', '트렌드 반응 빠름'], weak: ['웹사이트 SEO 취약'], rec: '웹사이트 기본 SEO 개선이 성장의 핵심' },
  'V2-TC-AO-E1': { name: '느린 성장형', emoji: '🐢', subtitle: '천천히 그러나 확실하게 성장', desc: '보수적 기술과 오가닉 성장으로 서서히 존재감을 높이는 브랜드', str: ['안정적 기반', '비용 효율적'], weak: ['성장 속도 느림'], rec: '콘텐츠 마케팅 투자로 성장 속도 가속' },
  'V2-TC-AO-E2': { name: '균형의 견습생', emoji: '📝', subtitle: '기본기를 갖추며 배워가는 브랜드', desc: '아직 뛰어나지는 않지만 기본을 갖추고 균형 있게 운영하는 브랜드', str: ['기본기 확보', '발전 가능성'], weak: ['차별화 요소 없음'], rec: '하나의 강점을 집중 육성하여 차별화 포인트 만들기' },
  'V2-TC-AO-E3': { name: '동네 인기인', emoji: '🏪', subtitle: '친근함으로 지역/니치 시장에서 사랑받는', desc: '큰 규모는 아니지만 친근한 소통으로 탄탄한 팬층을 가진 브랜드', str: ['높은 고객 충성도', '진정성 있는 소통'], weak: ['확장성 제한'], rec: '로컬 SEO 강화와 온라인 리뷰 관리로 영역 확장' },

  // === V1 (가시성 미약) ===
  'V1-TP-AA-E1': { name: '숨겨진 보석', emoji: '💎', subtitle: '실력은 있지만 발견되지 않는 브랜드', desc: '기술과 콘텐츠에 투자하고 있지만 아직 검색에서 발견되지 않는 브랜드', str: ['기술 기반 확보', '콘텐츠 투자 중'], weak: ['검색 가시성 부족', '도메인 권위 낮음'], rec: '링크 빌딩과 소셜 시그널 강화가 최우선' },
  'V1-TP-AA-E2': { name: '열정적 신생아', emoji: '🔥', subtitle: '모든 것을 갖추려 노력하는 신생 브랜드', desc: '의지와 활동은 충분하지만 아직 시장에서 인지도가 없는 브랜드', str: ['높은 의지와 활동량', '성장 잠재력'], weak: ['인지도 0에서 시작'], rec: '니치 키워드부터 공략 → 점진적 확장 전략' },
  'V1-TP-AA-E3': { name: '에너지 넘치는 스타터', emoji: '⚡', subtitle: '열정과 소통으로 시작하는 브랜드', desc: '활발한 소통과 콘텐츠로 시작했지만 아직 검색에서 보이지 않는 브랜드', str: ['소비자 소통 능력', '콘텐츠 생산 의지'], weak: ['SEO 기본기 부족'], rec: 'SEO 기초 교육 + 키워드 리서치부터 체계적으로' },
  'V1-TP-AO-E1': { name: '침묵의 기술자', emoji: '🔧', subtitle: '기술은 있지만 세상이 모르는 브랜드', desc: '사이트 기술은 좋지만 콘텐츠도 소통도 없어 발견되지 않는 브랜드', str: ['기술 기반 탄탄'], weak: ['콘텐츠 전무', '소통 부재'], rec: '주간 블로그 시작 + 소셜 미디어 계정 개설부터' },
  'V1-TP-AO-E2': { name: '기다리는 잠재력', emoji: '🔮', subtitle: '준비는 됐지만 아직 시작 안 한', desc: '기술 기반은 있고 균형감도 있지만 활동이 없어 보이지 않는 브랜드', str: ['성장 준비 완료'], weak: ['실행력 부족'], rec: '콘텐츠 캘린더 수립 후 즉시 실행 시작' },
  'V1-TP-AO-E3': { name: '자유로운 준비생', emoji: '🎒', subtitle: '기술은 갖췄고 소통은 자유로운', desc: '기술 기반에 캐주얼한 성향이지만 아직 콘텐츠가 없는 브랜드', str: ['기술 + 친근한 소통 성향'], weak: ['콘텐츠 절대 부족'], rec: '캐주얼한 강점을 살려 SNS 콘텐츠부터 시작' },
  'V1-TC-AA-E1': { name: '미완의 대작', emoji: '🎭', subtitle: '콘텐츠는 있지만 기술이 받쳐주지 않는', desc: '콘텐츠는 풍부하나 기술 SEO가 부족해 검색에서 보이지 않는 브랜드', str: ['콘텐츠 자산 보유'], weak: ['사이트 기술 전반 개선 필요'], rec: 'SEO 기술 감사 → 사이트 속도, 구조, 메타태그 전면 개선' },
  'V1-TC-AA-E2': { name: '분투하는 도전자', emoji: '🥊', subtitle: '열심히 하지만 결과가 안 나오는', desc: '활동은 많지만 기술과 전략 부족으로 결과를 만들지 못하는 브랜드', str: ['노력과 의지'], weak: ['전략 부재', '기술 부족'], rec: '전문가 컨설팅으로 전략 재수립이 최우선' },
  'V1-TC-AA-E3': { name: '열정 넘치는 아마추어', emoji: '🎸', subtitle: '열정은 최고, 방향이 필요한 브랜드', desc: '활발하고 친근하지만 SEO 지식이 부족해 효과를 못 보는 브랜드', str: ['높은 열정', '소통 능력'], weak: ['SEO 지식 전무'], rec: 'SmarComm 무료 진단으로 현황 파악 → 단계별 개선' },
  'V1-TC-AO-E1': { name: '고요한 장인', emoji: '🔨', subtitle: '제품은 좋지만 디지털이 없는 브랜드', desc: '오프라인에서는 인정받지만 디지털 존재감이 전무한 브랜드', str: ['제품/서비스 품질', '기존 고객 충성도'], weak: ['디지털 마케팅 전무'], rec: '디지털 전환 로드맵 수립 — 웹사이트 → SEO → 콘텐츠 순서' },
  'V1-TC-AO-E2': { name: '디지털 초심자', emoji: '🌱', subtitle: '이제 막 디지털을 시작하려는 브랜드', desc: '디지털에 관심은 있지만 아직 본격적으로 시작하지 못한 브랜드', str: ['새로운 시작의 유연함'], weak: ['모든 디지털 지표 개선 필요'], rec: '기본 SEO 체크리스트부터 하나씩 실행' },
  'V1-TC-AO-E3': { name: '자유로운 방랑자', emoji: '🦋', subtitle: '방향 없이 자유롭게 운영 중인 브랜드', desc: '체계 없이 자유롭게 운영하고 있지만 디지털 성과가 없는 브랜드', str: ['실험 정신', '유연함'], weak: ['방향성 없음', '모든 지표 개선 필요'], rec: '목표 설정 → 키워드 전략 → 콘텐츠 플랜 순서로 체계화' },
};

export function analyzeBrandPersonality(scores: {
  techSeo: number;     // 0~100
  contentSeo: number;  // 0~100
  geoExposure: number; // 0~100
  geoReadiness: number;// 0~100
  keywords: number;    // 키워드 관련도 (0~100)
  contentGap: number;  // 콘텐츠 갭 수 (역산)
}): BrandPersonality {
  const avgSeo = (scores.techSeo + scores.contentSeo) / 2;
  const avgGeo = (scores.geoExposure + scores.geoReadiness) / 2;
  const overall = (avgSeo + avgGeo) / 2;

  // V: Visibility — V1(<35) / V2(35~65) / V3(>65)
  const v: Vis = overall >= 65 ? 'V3' : overall >= 35 ? 'V2' : 'V1';

  // T: Tech — TC(<50) / TP(>=50)
  const t: Tech = scores.techSeo >= 50 ? 'TP' : 'TC';

  // A: Content Activity — AO(갭>=3 or 키워드<40) / AA
  const a: Act = (scores.contentGap >= 3 || scores.keywords < 40) ? 'AO' : 'AA';

  // E: Engagement — 구조화 데이터 + GEO 준비도 기반
  // E1(격식, geoReadiness>=60) / E2(균형, 30~60) / E3(캐주얼, <30)
  const e: Eng = scores.geoReadiness >= 60 ? 'E1' : scores.geoReadiness >= 30 ? 'E2' : 'E3';

  const typeCode = `${v}-${t}-${a}-${e}`;
  const def = TYPES[typeCode];

  if (!def) {
    // fallback
    return { type: typeCode, name: '디지털 초심자', emoji: '🌱', subtitle: '이제 막 시작하려는 브랜드', description: '디지털 마케팅의 첫걸음을 내딛고 있습니다.', strengths: ['성장 잠재력'], weaknesses: ['전반적 개선 필요'], recommendation: '기본 SEO 체크리스트부터 시작하세요.' };
  }

  return {
    type: typeCode,
    name: def.name,
    emoji: def.emoji,
    subtitle: def.subtitle,
    description: def.desc,
    strengths: def.str,
    weaknesses: def.weak,
    recommendation: def.rec,
  };
}
