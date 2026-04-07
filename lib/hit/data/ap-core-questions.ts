/**
 * AP core (적성검사 핵심) 30문항 — 7점 리커트
 * module = 'aptitude_core'
 * Holland 6유형 기반
 */

export interface APCoreQuestion {
  id: string;
  module: 'aptitude_core';
  hollandType: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  text: string;
  discCross: string[];
  mbtiCross: string[];
}

export const apCoreQuestions: APCoreQuestion[] = [
  // ── R 현실형 (5문항) ──
  {
    id: 'ap_r01',
    module: 'aptitude_core',
    hollandType: 'R',
    text: '물건을 직접 만들거나 조립하는 작업이 즐겁다.',
    discCross: ['S'],
    mbtiCross: ['S'],
  },
  {
    id: 'ap_r02',
    module: 'aptitude_core',
    hollandType: 'R',
    text: '체력을 쓰거나 야외에서 하는 활동에 끌린다.',
    discCross: ['D'],
    mbtiCross: ['S'],
  },
  {
    id: 'ap_r03',
    module: 'aptitude_core',
    hollandType: 'R',
    text: '도구나 장비를 다루는 것에 흥미가 있다.',
    discCross: ['C'],
    mbtiCross: ['S'],
  },
  {
    id: 'ap_r04',
    module: 'aptitude_core',
    hollandType: 'R',
    text: '결과물이 눈에 보이는 일이 추상적 업무보다 만족스럽다.',
    discCross: ['S'],
    mbtiCross: ['S'],
  },
  {
    id: 'ap_r05',
    module: 'aptitude_core',
    hollandType: 'R',
    text: '기술적 문제를 직접 손으로 해결하는 것이 재미있다.',
    discCross: ['D'],
    mbtiCross: ['S', 'T'],
  },

  // ── I 탐구형 (5문항) ──
  {
    id: 'ap_i01',
    module: 'aptitude_core',
    hollandType: 'I',
    text: '복잡한 문제의 원인을 파고드는 것이 즐겁다.',
    discCross: ['C'],
    mbtiCross: ['N', 'T'],
  },
  {
    id: 'ap_i02',
    module: 'aptitude_core',
    hollandType: 'I',
    text: '데이터를 분석하여 패턴을 발견하는 일에 흥미가 있다.',
    discCross: ['C'],
    mbtiCross: ['N', 'T'],
  },
  {
    id: 'ap_i03',
    module: 'aptitude_core',
    hollandType: 'I',
    text: '전문 자료나 논문을 읽으면서 시간 가는 줄 모른다.',
    discCross: ['C'],
    mbtiCross: ['N'],
  },
  {
    id: 'ap_i04',
    module: 'aptitude_core',
    hollandType: 'I',
    text: '"왜 그럴까?"에서 출발하는 프로젝트가 끌린다.',
    discCross: ['C'],
    mbtiCross: ['N'],
  },
  {
    id: 'ap_i05',
    module: 'aptitude_core',
    hollandType: 'I',
    text: '가설을 세우고 검증하는 과정 자체가 보람 있다.',
    discCross: ['C'],
    mbtiCross: ['N', 'T'],
  },

  // ── A 예술형 (5문항) ──
  {
    id: 'ap_a01',
    module: 'aptitude_core',
    hollandType: 'A',
    text: '무언가를 새롭게 만들어내는 과정이 가장 즐겁다.',
    discCross: ['I'],
    mbtiCross: ['N', 'P'],
  },
  {
    id: 'ap_a02',
    module: 'aptitude_core',
    hollandType: 'A',
    text: '글, 그림, 영상, 음악 등 표현 활동에 끌린다.',
    discCross: ['I'],
    mbtiCross: ['N', 'F'],
  },
  {
    id: 'ap_a03',
    module: 'aptitude_core',
    hollandType: 'A',
    text: '정해진 틀보다 자유로운 방식의 작업을 선호한다.',
    discCross: ['I'],
    mbtiCross: ['N', 'P'],
  },
  {
    id: 'ap_a04',
    module: 'aptitude_core',
    hollandType: 'A',
    text: '일상에서 디자인이나 미적 요소에 관심이 많다.',
    discCross: ['I'],
    mbtiCross: ['N', 'S'],
  },
  {
    id: 'ap_a05',
    module: 'aptitude_core',
    hollandType: 'A',
    text: '콘텐츠(영상, 글, 이미지)를 기획·제작하는 것이 재미있다.',
    discCross: ['I'],
    mbtiCross: ['N'],
  },

  // ── S 사회형 (5문항) ──
  {
    id: 'ap_s01',
    module: 'aptitude_core',
    hollandType: 'S',
    text: '다른 사람의 문제를 함께 해결해주는 것이 보람차다.',
    discCross: ['S'],
    mbtiCross: ['F'],
  },
  {
    id: 'ap_s02',
    module: 'aptitude_core',
    hollandType: 'S',
    text: '가르치거나 설명하는 일에 자연스러운 즐거움이 있다.',
    discCross: ['I'],
    mbtiCross: ['F', 'E'],
  },
  {
    id: 'ap_s03',
    module: 'aptitude_core',
    hollandType: 'S',
    text: '누군가의 성장을 돕는 것이 가장 큰 동기부여다.',
    discCross: ['S'],
    mbtiCross: ['F'],
  },
  {
    id: 'ap_s04',
    module: 'aptitude_core',
    hollandType: 'S',
    text: '상담이나 코칭 활동에 관심이 있다.',
    discCross: ['S'],
    mbtiCross: ['F', 'I'],
  },
  {
    id: 'ap_s05',
    module: 'aptitude_core',
    hollandType: 'S',
    text: '팀의 분위기와 구성원의 감정을 살피는 역할에 끌린다.',
    discCross: ['S'],
    mbtiCross: ['F'],
  },

  // ── E 기업형 (5문항) ──
  {
    id: 'ap_e01',
    module: 'aptitude_core',
    hollandType: 'E',
    text: '사람들을 설득하여 함께 움직이게 하는 것이 즐겁다.',
    discCross: ['D'],
    mbtiCross: ['E', 'T'],
  },
  {
    id: 'ap_e02',
    module: 'aptitude_core',
    hollandType: 'E',
    text: '사업 아이디어를 구상하고 실현하는 과정에 끌린다.',
    discCross: ['D'],
    mbtiCross: ['N', 'J'],
  },
  {
    id: 'ap_e03',
    module: 'aptitude_core',
    hollandType: 'E',
    text: '협상이나 거래 상황에서 흥분되는 에너지를 느낀다.',
    discCross: ['D'],
    mbtiCross: ['E', 'T'],
  },
  {
    id: 'ap_e04',
    module: 'aptitude_core',
    hollandType: 'E',
    text: '프로젝트의 방향을 정하고 이끄는 역할이 자연스럽다.',
    discCross: ['D'],
    mbtiCross: ['E', 'J'],
  },
  {
    id: 'ap_e05',
    module: 'aptitude_core',
    hollandType: 'E',
    text: '시장 트렌드를 분석하고 기회를 포착하는 일에 관심이 있다.',
    discCross: ['D'],
    mbtiCross: ['N', 'T'],
  },

  // ── C 관습형 (5문항) ──
  {
    id: 'ap_c01',
    module: 'aptitude_core',
    hollandType: 'C',
    text: '데이터를 정리하고 분류하는 작업이 편안하다.',
    discCross: ['C'],
    mbtiCross: ['S', 'J'],
  },
  {
    id: 'ap_c02',
    module: 'aptitude_core',
    hollandType: 'C',
    text: '절차와 규칙에 따라 체계적으로 일하는 것이 좋다.',
    discCross: ['C'],
    mbtiCross: ['S', 'J'],
  },
  {
    id: 'ap_c03',
    module: 'aptitude_core',
    hollandType: 'C',
    text: '숫자나 재무 관련 업무에 관심이 있다.',
    discCross: ['C'],
    mbtiCross: ['T', 'J'],
  },
  {
    id: 'ap_c04',
    module: 'aptitude_core',
    hollandType: 'C',
    text: '문서 관리, 기록 유지 같은 일이 성가시지 않다.',
    discCross: ['C'],
    mbtiCross: ['S', 'J'],
  },
  {
    id: 'ap_c05',
    module: 'aptitude_core',
    hollandType: 'C',
    text: '표준화된 프로세스를 만들고 관리하는 것에 흥미가 있다.',
    discCross: ['C'],
    mbtiCross: ['J'],
  },
];
