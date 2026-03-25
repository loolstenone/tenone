'use client';

import Link from 'next/link';
import { ArrowLeft, Check, AlertCircle, Sparkles, Clock } from 'lucide-react';

const CATEGORIES = [
  { num: '01', name: 'HR / 인력관리', wio: 'WIO People + Finance', color: '#378ADD', products: [
    { name: '멤버 프로필 관리', desc: '이름, 소속, 역량 태그, 포트폴리오, 활동 이력 통합 프로필', status: 'done' },
    { name: '포인트 시스템', desc: '활동별 포인트 자동 부여, Bronze~Diamond 등급', status: 'new' },
    { name: '인재 검색/매칭', desc: '역량, 포인트, 경험 기반 필터링. 프로젝트 크루 추천', status: 'new' },
    { name: 'HIT 역량 진단', desc: 'DISC+MBTI+강점 통합 진단, AI 컨설팅', status: 'done' },
    { name: '이력서/퍼스널 브랜딩', desc: '이력서 작성, AI 피드백, 퍼스널 브랜딩 가이드', status: 'done' },
    { name: '근태/급여 관리', desc: '출퇴근, 휴가, 급여 계산', status: 'done' },
    { name: '조직도/인사 관리', desc: '조직 구조, 직원 정보, 교육 이력', status: 'done' },
  ]},
  { num: '02', name: '프로젝트 / 업무 관리', wio: 'WIO Project', color: '#1D9E75', products: [
    { name: '프로젝트 CRUD', desc: '생성, 유형 분류, 상태 관리', status: 'done' },
    { name: 'Job 관리', desc: 'PRJ-YYYY-NNNN 코드 체계, 멀티 투입', status: 'done' },
    { name: '타임시트', desc: '주간 그리드 입력, PM 승인, 손익 자동 계산', status: 'done' },
    { name: '프로젝트 손익', desc: '취급액-외부비=매출-내부비=이익 자동 계산', status: 'done' },
    { name: '프로젝트 GPR', desc: 'Goal/Plan/Result 설정, 중간 리뷰(라인스톱)', status: 'new' },
    { name: 'Vrief 템플릿', desc: '프로젝트 시작 시 조사→가설→전략 자동 제공', status: 'new' },
    { name: '완료 트리거 체인', desc: '완료 → 정산+포인트+아카이브+BI 동시 자동', status: 'new' },
  ]},
  { num: '03', name: '커뮤니케이션 / 협업', wio: 'WIO Home + Talk', color: '#D85830', products: [
    { name: '실시간 메신저', desc: '1:1, 그룹, 프로젝트별 채널', status: 'done' },
    { name: '알림 센터', desc: '프로젝트 초대, 결재, 기회 발견 등 실시간', status: 'new' },
    { name: '공지사항', desc: '공개 대상 선택(전체/Staff/Partner/Crew)', status: 'done' },
    { name: '전체 일정', desc: '캘린더/리스트 뷰, 프로젝트 일정 연동', status: 'done' },
  ]},
  { num: '04', name: 'CRM / 영업', wio: 'WIO Sales', color: '#534AB7', products: [
    { name: '리드/딜 파이프라인', desc: '리드→제안→계약→실행→완료 단계 관리', status: 'done' },
    { name: 'AI 크롤링', desc: '나라장터/지원사업/공모전 자동 수집', status: 'new' },
    { name: 'AI 관련성 분석', desc: '수집 기회의 적합도 자동 스코어링 (Claude API)', status: 'new' },
    { name: '기회→프로젝트 전환', desc: '기회 평가 후 1클릭으로 프로젝트 생성', status: 'new' },
    { name: '캠페인 관리', desc: '마케팅 캠페인 기획/실행/분석', status: 'done' },
  ]},
  { num: '05', name: '마케팅 / 콘텐츠', wio: 'WIO Content', color: '#D4537E', products: [
    { name: '콘텐츠 관리 (CMS)', desc: 'Works/Newsroom 채널, 에디터, 발행', status: 'done' },
    { name: 'AI 콘텐츠 생성', desc: '주제/톤/채널 → Claude API로 자동 생성', status: 'new' },
    { name: '뉴스레터', desc: '발송 관리, 구독자 관리', status: 'done' },
    { name: '라이브러리', desc: '미디어 파일 중앙 관리, 태그, 검색', status: 'done' },
  ]},
  { num: '06', name: '재무 / 경비 / 정산', wio: 'WIO Finance', color: '#BA7517', products: [
    { name: '전자결재', desc: '기안/품의/보고, 결재라인 스텝퍼', status: 'done' },
    { name: '프로젝트 정산', desc: '크루별 시수×단가 자동 계산', status: 'new' },
    { name: '수익분배 엔진', desc: '유형별 분배 비율 설정, 자동 분배', status: 'new' },
    { name: '경비 관리', desc: '경비 신청/승인, 법인카드', status: 'done' },
    { name: '경영관리', desc: '연간/월별 계획, 실적, Gap 분석', status: 'done' },
  ]},
  { num: '07', name: '교육 / LMS', wio: 'WIO Learn', color: '#639922', products: [
    { name: '과정 관리', desc: '필수/전문/심화 과정, 챕터 구조', status: 'done' },
    { name: '퀴즈 시스템', desc: '10문항, 80점 이상 이수', status: 'done' },
    { name: '이수 추적', desc: '미이수→학습중→이수완료 상태', status: 'done' },
    { name: '역량 기반 추천', desc: 'GPR 약점 → 과정 자동 추천', status: 'new' },
  ]},
  { num: '08', name: '지식관리 / 위키', wio: 'WIO Wiki', color: '#888780', products: [
    { name: 'Culture/핸드북', desc: '조직 문화, 온보딩, FAQ', status: 'done' },
    { name: 'Knowledge Library', desc: '게시판형, 권한별 노출, 즐겨찾기', status: 'done' },
    { name: '프로젝트 자동 아카이브', desc: '완료 시 결과물 자동 등록', status: 'new' },
  ]},
  { num: '09', name: 'BI / 데이터 분석', wio: 'WIO Insight', color: '#378ADD', products: [
    { name: '전체 현황 대시보드', desc: '사업별 매출·멤버·프로젝트 한눈에', status: 'new' },
    { name: '프로젝트 분석', desc: '진행/완료, 성공률, 이익률', status: 'new' },
    { name: 'GPR 대시보드', desc: '조직/사업/프로젝트/개인 GPR 시각화', status: 'new' },
  ]},
];

const STATUS = {
  done: { icon: Check, label: 'UI 완성', color: 'text-emerald-400' },
  new: { icon: Sparkles, label: '신규 개발', color: 'text-red-400' },
  plan: { icon: Clock, label: 'Phase 3+', color: 'text-violet-400' },
};

export default function SolutionsPage() {
  const totalProducts = CATEGORIES.reduce((s, c) => s + c.products.length, 0);
  const doneCount = CATEGORIES.reduce((s, c) => s + c.products.filter(p => p.status === 'done').length, 0);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F23]/80 backdrop-blur-xl border-b border-white/5">
        <nav className="mx-auto max-w-6xl px-6 flex h-14 items-center justify-between">
          <Link href="/wio" className="text-xl font-black tracking-tight"><span className="text-indigo-400">W</span>IO</Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/wio/solutions" className="text-sm text-white font-semibold">솔루션</Link>
            <Link href="/wio/framework" className="text-sm text-slate-400 hover:text-white transition-colors">프레임워크</Link>
            <Link href="/wio/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">가격</Link>
            <Link href="/wio/about" className="text-sm text-slate-400 hover:text-white transition-colors">소개</Link>
          </div>
        </nav>
      </header>

      <div className="pt-20 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/wio" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white mb-6"><ArrowLeft size={14} /> WIO</Link>
          <h1 className="text-3xl font-bold mb-2">솔루션 목록</h1>
          <p className="text-slate-400 mb-2">9개 카테고리 · {totalProducts}개 기능 · {doneCount}개 UI 완성</p>
          <div className="flex gap-4 mb-8 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Check size={12} className="text-emerald-400" /> UI 완성</span>
            <span className="flex items-center gap-1"><Sparkles size={12} className="text-red-400" /> 신규 개발</span>
          </div>

          <div className="space-y-6">
            {CATEGORIES.map((cat, ci) => (
              <div key={ci} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5" style={{ background: `${cat.color}10` }}>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${cat.color}20`, color: cat.color }}>{cat.num}</span>
                  <span className="font-semibold text-white text-sm">{cat.name}</span>
                  <span className="text-xs text-slate-500 ml-auto">{cat.wio}</span>
                </div>
                <div className="divide-y divide-white/5">
                  {cat.products.map((p, pi) => {
                    const st = STATUS[p.status as keyof typeof STATUS];
                    const Icon = st.icon;
                    return (
                      <div key={pi} className="flex items-center gap-4 px-5 py-3">
                        <span className="text-sm font-medium text-white w-48 shrink-0">{p.name}</span>
                        <span className="text-xs text-slate-500 flex-1">{p.desc}</span>
                        <span className={`flex items-center gap-1 text-xs shrink-0 ${st.color}`}><Icon size={12} /> {st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
