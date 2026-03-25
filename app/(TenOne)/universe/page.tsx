"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

interface Brand { name: string; domain?: string; meaning: string; role: string; core: string; }
interface Section { title: string; brands: Brand[]; }

const DIRECTORY: Section[] = [
  { title: '컨트롤타워', brands: [
    { name: 'Ten:One™', domain: 'tenone.biz', meaning: '열시 일분', role: '세계관의 중심. 모든 프로젝트의 철학·방향·전략을 관장', core: '"연결은 더 많은 기회를 만들어 낸다"' },
    { name: 'YouInOne', domain: 'youinone.com', meaning: 'Project Group of Thinking Apes (유인원)', role: '실행 중심 프로젝트 그룹. 누구나 프로젝트 발제', core: '신뢰 기반 네트워크 프로젝트 그룹' },
    { name: "Planner's", meaning: "Planner's Planner", role: '기획자 양성 프로그램. 시스템 플래너', core: '기획자를 키우는 시스템 + 도구' },
  ]},
  { title: '커뮤니티', brands: [
    { name: 'MADLeague', domain: 'madleague.net', meaning: 'Marketing, Advertising & Digital League', role: '전국 7개 대학 동아리 연합. 실전 경연 PT로 역량 강화', core: '"실전이 우리를 강하게 하리라"' },
    { name: 'MADLeap', domain: 'madleap.co.kr', meaning: '미치지 않으면 미치지 못한다', role: '서울/경기 거점 대학생 연합 동아리', core: 'MADLeague 핵심 거점' },
    { name: 'YouInOne Alliance', meaning: '유인원 얼라이언스', role: '전국 지역 거점 사업자 협력체', core: '각자의 사업 강점으로 뭉친 협력체' },
    { name: 'Badak', domain: 'badak.biz', meaning: '업계 = 바닥, 바닥은 좁다', role: '업계 네트워킹 커뮤니티. 등록 9,000명', core: '"약한 연결이 만드는 강력한 기회"' },
    { name: 'domo', meaning: '미래를 도모하다', role: '비즈니스 네트워킹. 사업가들의 성장과 성공을 도모', core: '사업가 대상 상위 네트워킹' },
    { name: 'ChangeUp', domain: 'changeup.company', meaning: '창업, 체인지업, 변화구', role: '고등학생·대학생 창업 프로그램', core: '청년 창업을 지역사회가 함께 키운다' },
  ]},
  { title: '인재 · 교육', brands: [
    { name: 'HeRo', meaning: 'We Believe in your talent', role: 'Talent Agency. 인재와 기업 매칭, 커리어 컨설팅', core: '인재 생태계 선순환의 엔진' },
    { name: 'Evolution School', meaning: '진화 학교 — 성장이 필요할 때', role: '마케팅·광고·크리에이티브·기획 직무 전문가 교육', core: '현업 전문가 중심 실전 교육' },
  ]},
  { title: '비즈니스 서비스', brands: [
    { name: 'SmarComm.', domain: 'smarcomm.biz', meaning: 'Smart Marketing Communication', role: 'AI 기반 마케팅·광고 커뮤니케이션 솔루션', core: '세계관 구성원이 참여하는 서비스' },
    { name: 'Brand Gravity', meaning: '소비자는 우주를 떠다니는 유성과 같다', role: '기업 브랜딩 · 퍼스널 브랜딩 컨설팅', core: '브랜드라는 중력으로 소비자를 끌어당기다' },
    { name: 'RooK', domain: 'rook.co.kr', meaning: '새로운 사람, 새로운 방법', role: '인공지능 크리에이터. AI 기반 콘텐츠 제작', core: 'AI로 만드는 새로운 크리에이티브' },
    { name: 'WIO', meaning: 'Work In One', role: '통합 운영 플랫폼. 솔루션 구축과 컨설팅', core: '일의 방식을 통일하는 운영 체계' },
  ]},
  { title: '콘텐츠 · 미디어', brands: [
    { name: '0gamja', domain: '0gamja.com', meaning: '영감자 (0 = 영, gamja = 감자)', role: '공감 콘텐츠. 심리 상담, 중고대학생 대상', core: '공감과 위로를 콘텐츠로 연결' },
    { name: 'FWN', domain: 'fwn.co.kr', meaning: 'Fashion Week Network', role: '전세계 패션위크 소식, 패션 종사자 네트워크', core: '패션 업계 전문 네트워크' },
    { name: 'MoNTZ', meaning: 'Ugly Modeling Agency', role: '독특한 캐릭터 모델 에이전시', core: '개성이 곧 경쟁력' },
    { name: 'TrendHunter', meaning: '트렌드헌터', role: '소비자 연구 및 트렌드 분석 컨설팅', core: '소비자 인사이트 기반 컨설팅' },
    { name: 'Scribble', meaning: '낙서, 자유로운 글쓰기', role: '개인 창작. 소설, 드라마 극본', core: '개인 창작 아카이브' },
  ]},
  { title: '플랫폼 · 프로덕트', brands: [
    { name: 'Myverse', meaning: 'My Universe', role: '개인 세계관 기록 플랫폼', core: '서비스가 개인에 접속하는 구조' },
    { name: 'Townity', meaning: 'Town + Community', role: '지역 커뮤니티. 공동육아 지역 기반 연결', core: '지역 기반 커뮤니티 연결' },
    { name: 'Seoul360', domain: 'seoul360.net', meaning: '서울 360도', role: '서울 자유여행 가이드', core: '서울을 360도로 경험' },
    { name: 'Jakka', meaning: '작가 (JAKKA)', role: '아티스트 포트폴리오 플랫폼', core: '창작자들의 작품 전시·연결' },
    { name: 'Nature Box', meaning: '자연함 (自然函)', role: '강원도 정선. 자연 식품 브랜드', core: '자연에서 온 식품 이야기' },
    { name: 'Mullaesian', meaning: '문래동 + -sian', role: '문래동 창작촌 지역 플랫폼', core: '문래동 사람들의 연결' },
  ]},
  { title: '도구 · 프레임워크', brands: [
    { name: 'Vrief', meaning: 'Vision + Brief', role: '조사분석 → 가설검증 → 전략수립 3단계 기획 프레임워크', core: '일을 시작할 때의 사고 프레임' },
    { name: 'GPR', meaning: 'Goal · Plan · Result', role: '목표 관리 프레임워크. 사업부 → 팀 → 개인', core: '일을 관리하고 평가할 때의 프레임' },
    { name: 'Principle 10', meaning: '일하는 10대 원칙', role: '세계관 전체 행동 강령', core: '"우리는 모두 기획자다"' },
    { name: 'Vision House', meaning: '비전 체계', role: 'Philosophy → Mission → Vision → Goal → Strategy → Core Values', core: '세계관 전체의 방향타' },
    { name: 'HIT', meaning: 'HeRo Integrated Test', role: 'HeRo 인재 매칭을 위한 통합 역량 테스트', core: '인재의 역량을 측정하는 기준' },
    { name: "Planner's Planner", meaning: '기획자를 위한 플래너', role: '시스템 플래너. 아이패드·삼성노트·앱 제공', core: '기획자의 사고와 실행을 담는 도구' },
    { name: 'Career Design', meaning: '커리어 디자인', role: '개인의 커리어를 설계하고 방향을 잡는 프레임워크', core: '내 커리어를 기획하다' },
  ]},
];

export default function UniversePage() {
  const [filter, setFilter] = useState('');
  const total = DIRECTORY.reduce((s, sec) => s + sec.brands.length, 0);
  const filtered = filter
    ? DIRECTORY.map(s => ({ ...s, brands: s.brands.filter(b => `${b.name} ${b.role} ${b.meaning}`.toLowerCase().includes(filter.toLowerCase())) })).filter(s => s.brands.length > 0)
    : DIRECTORY;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* 헤더 */}
      <div className="mb-12">
        <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase mb-3">Service & Brand Directory</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Ten:One™ Universe</h1>
        <p className="text-zinc-500 italic text-sm">가치로 연결된 하나의 거대한 세계관을 만들기로 했다.</p>
        <p className="text-xs text-zinc-600 mt-2">{DIRECTORY.length}개 카테고리 · {total}개 브랜드</p>
      </div>

      {/* 검색 */}
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="브랜드 검색..."
        className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white placeholder-zinc-600 mb-10 focus:border-zinc-600 focus:outline-none" />

      {/* 디렉토리 */}
      <div className="space-y-12">
        {filtered.map((sec, si) => (
          <div key={si}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-600">{String(si + 1).padStart(2, '0')}</span>
              <h2 className="text-sm font-semibold tracking-wide text-zinc-300 uppercase">{sec.title}</h2>
              <span className="text-[10px] text-zinc-700">{sec.brands.length}</span>
            </div>
            <div className="grid gap-px sm:grid-cols-2">
              {sec.brands.map((b, bi) => (
                <div key={bi} className="p-5 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="font-semibold text-white text-[15px]">{b.name}</span>
                    {b.domain && (
                      <a href={`https://${b.domain}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                        {b.domain} <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 mb-2">{b.meaning}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-2">{b.role}</p>
                  <p className="text-xs text-zinc-500 italic">{b.core}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-6 border-t border-zinc-800 text-center text-[11px] text-zinc-700">
        &copy; Ten:One™. All Rights Reserved
      </div>
    </div>
  );
}
