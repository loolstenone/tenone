/**
 * AP Deep (적성 심화 — 자기효능감) 30문항 — 7점 리커트
 * module = 'aptitude_deep'
 */

export interface APDeepQuestion {
  id: string;
  module: 'aptitude_deep';
  hollandType: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  text: string;
}

export const apDeepQuestions: APDeepQuestion[] = [
  // R 현실형
  { id: 'apx_r01', module: 'aptitude_deep', hollandType: 'R', text: '기계나 장비의 작동 원리를 빠르게 파악할 수 있다.' },
  { id: 'apx_r02', module: 'aptitude_deep', hollandType: 'R', text: '물리적 공간을 효율적으로 구성하는 것에 자신 있다.' },
  { id: 'apx_r03', module: 'aptitude_deep', hollandType: 'R', text: '손재주가 필요한 작업에서 남들보다 빠르다.' },
  { id: 'apx_r04', module: 'aptitude_deep', hollandType: 'R', text: '안전 규정과 절차를 정확히 따르며 작업할 수 있다.' },
  { id: 'apx_r05', module: 'aptitude_deep', hollandType: 'R', text: '실물을 다루는 프로젝트를 처음부터 끝까지 완수할 수 있다.' },

  // I 탐구형
  { id: 'apx_i01', module: 'aptitude_deep', hollandType: 'I', text: '통계나 수치 데이터를 해석하는 것에 자신 있다.' },
  { id: 'apx_i02', module: 'aptitude_deep', hollandType: 'I', text: '연구 방법론을 이해하고 적용할 수 있다.' },
  { id: 'apx_i03', module: 'aptitude_deep', hollandType: 'I', text: '복잡한 정보를 체계적으로 정리하는 능력이 있다.' },
  { id: 'apx_i04', module: 'aptitude_deep', hollandType: 'I', text: '객관적 근거를 기반으로 결론을 도출할 수 있다.' },
  { id: 'apx_i05', module: 'aptitude_deep', hollandType: 'I', text: '장기간 독립적으로 연구·분석 프로젝트를 수행할 수 있다.' },

  // A 예술형
  { id: 'apx_a01', module: 'aptitude_deep', hollandType: 'A', text: '독창적인 아이디어를 자주 떠올리는 편이다.' },
  { id: 'apx_a02', module: 'aptitude_deep', hollandType: 'A', text: '시각적으로 보기 좋게 정리하는 것에 자신 있다.' },
  { id: 'apx_a03', module: 'aptitude_deep', hollandType: 'A', text: '스토리텔링이나 내러티브 구성 능력이 있다.' },
  { id: 'apx_a04', module: 'aptitude_deep', hollandType: 'A', text: '디자인 도구(포토샵, 피그마, 영상 편집 등)를 다룰 수 있다.' },
  { id: 'apx_a05', module: 'aptitude_deep', hollandType: 'A', text: '컨셉을 시각적/언어적으로 구체화하는 것에 자신 있다.' },

  // S 사회형
  { id: 'apx_s01', module: 'aptitude_deep', hollandType: 'S', text: '갈등 상황에서 중재 역할을 효과적으로 할 수 있다.' },
  { id: 'apx_s02', module: 'aptitude_deep', hollandType: 'S', text: '상대방의 감정 상태를 빠르게 파악할 수 있다.' },
  { id: 'apx_s03', module: 'aptitude_deep', hollandType: 'S', text: '복잡한 개념을 쉽게 설명하는 능력이 있다.' },
  { id: 'apx_s04', module: 'aptitude_deep', hollandType: 'S', text: '다양한 사람들과 신뢰 관계를 빠르게 형성한다.' },
  { id: 'apx_s05', module: 'aptitude_deep', hollandType: 'S', text: '타인의 동기를 북돋우는 것에 자신 있다.' },

  // E 기업형
  { id: 'apx_e01', module: 'aptitude_deep', hollandType: 'E', text: '다수 앞에서 설득력 있는 프레젠테이션을 할 수 있다.' },
  { id: 'apx_e02', module: 'aptitude_deep', hollandType: 'E', text: '전략을 수립하고 실행 계획을 구체화할 수 있다.' },
  { id: 'apx_e03', module: 'aptitude_deep', hollandType: 'E', text: '팀을 조직하고 역할을 배분하는 것에 자신 있다.' },
  { id: 'apx_e04', module: 'aptitude_deep', hollandType: 'E', text: '예산과 자원을 효율적으로 관리할 수 있다.' },
  { id: 'apx_e05', module: 'aptitude_deep', hollandType: 'E', text: '불확실한 상황에서도 의사결정을 내릴 수 있다.' },

  // C 관습형
  { id: 'apx_c01', module: 'aptitude_deep', hollandType: 'C', text: '엑셀이나 스프레드시트를 능숙하게 다룰 수 있다.' },
  { id: 'apx_c02', module: 'aptitude_deep', hollandType: 'C', text: '대량의 정보를 체계적으로 분류하고 관리할 수 있다.' },
  { id: 'apx_c03', module: 'aptitude_deep', hollandType: 'C', text: '오류 없이 정확하게 데이터를 입력하고 처리할 수 있다.' },
  { id: 'apx_c04', module: 'aptitude_deep', hollandType: 'C', text: '복잡한 일정이나 스케줄을 관리하는 것에 자신 있다.' },
  { id: 'apx_c05', module: 'aptitude_deep', hollandType: 'C', text: '규정과 매뉴얼을 정확히 이해하고 적용할 수 있다.' },
];
