'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Search, Building2, Briefcase, Wrench, Handshake,
  MessageSquare, Settings, Users, Clock, DollarSign, ChevronDown, X
} from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

/* ── Resource 배지 ── */
const RESOURCE_BADGE: Record<string, { label: string; color: string }> = {
  '인간': { label: '인간', color: '#7C6AE8' },
  '시간': { label: '시간', color: '#3B9EE8' },
  '돈': { label: '돈', color: '#2DC98A' },
};

type Module = {
  code: string;
  name: string;
  features: string;
  resources: string[];  // ['인간', '시간', '돈']
};

type Track = {
  num: number;
  name: string;
  sub: string;
  icon: typeof Building2;
  color: string;
  modules: Module[];
};

/* ── 전체 모듈 카탈로그 ── */
const TRACKS: Track[] = [
  {
    num: 1, name: '운영·관리', sub: 'Operations', icon: Building2, color: '#E24B4A',
    modules: [
      { code: 'HR-REC', name: '채용관리', features: '공고, 지원자 추적, 면접, 오퍼', resources: ['인간'] },
      { code: 'HR-ATT', name: '근태관리', features: '출퇴근, 휴가, 초과근무', resources: ['인간', '시간'] },
      { code: 'HR-PAY', name: '급여관리', features: '급여 계산, 4대보험, 원천징수', resources: ['인간', '돈'] },
      { code: 'HR-EVL+', name: '통합평가', features: '성과+역량+다면평가+상시피드백 종합', resources: ['인간', '시간'] },
      { code: 'HR-EDU', name: '교육관리', features: '교육과정, 수강, 이수, 자격증', resources: ['인간', '시간'] },
      { code: 'HR-ORG', name: '조직관리', features: '조직도, 인사발령, 전보', resources: ['인간'] },
      { code: 'HR-REW', name: '보상관리', features: '연봉, 인센티브, 포인트, 승진 기준', resources: ['인간', '돈'] },
      { code: 'FIN-GL', name: '총계정원장', features: '계정과목, 분개, 전표, 시산표', resources: ['돈'] },
      { code: 'FIN-AP', name: '매입관리', features: '구매요청, 발주, 입고, 대금지급', resources: ['돈', '시간'] },
      { code: 'FIN-AR', name: '매출관리', features: '매출인식, 청구, 수금, 채권', resources: ['돈', '시간'] },
      { code: 'FIN-BUD', name: '예산관리', features: '예산편성, 배정, 집행, 이월', resources: ['돈', '시간'] },
      { code: 'FIN-TAX', name: '세무관리', features: '부가세, 법인세, 세금계산서', resources: ['돈'] },
      { code: 'FIN-AST', name: '자산관리', features: '자산등록, 감가상각, 실사', resources: ['돈'] },
      { code: 'AUD-INT', name: '내부감사', features: '감사계획, 수행, 보고, 후속관리', resources: ['인간', '시간', '돈'] },
      { code: 'LEG-CON', name: '계약관리', features: '계약서 작성, 검토, 체결, 만료', resources: ['인간', '시간', '돈'] },
      { code: 'LEG-COM', name: '법규준수', features: '컴플라이언스 체크리스트, 규제 추적', resources: ['인간'] },
      { code: 'CRM-PVY', name: '개인정보관리', features: '동의 관리, 열람/삭제 청구, 컴플라이언스', resources: ['인간'] },
    ],
  },
  {
    num: 2, name: '사업', sub: 'Business', icon: Briefcase, color: '#534AB7',
    modules: [
      { code: 'MKT-STR', name: '마케팅전략', features: '연간/분기 전략, 예산 배분, 타겟, KPI', resources: ['돈', '시간'] },
      { code: 'MKT-CMP', name: '캠페인관리', features: '캠페인 기획, 집행, 성과분석', resources: ['돈', '시간'] },
      { code: 'MKT-MDI', name: '매체관리', features: '매체 마스터, 매체 플랜, 바잉, 정산', resources: ['돈'] },
      { code: 'MKT-PFM', name: '퍼포먼스마케팅', features: '검색/디스플레이/소셜 광고, 최적화', resources: ['돈', '시간'] },
      { code: 'MKT-CNT', name: '콘텐츠관리', features: '콘텐츠 제작, 배포, 버전관리', resources: ['시간'] },
      { code: 'MKT-SOC', name: '소셜미디어관리', features: 'SNS 운영, 콘텐츠 발행, 참여 관리', resources: ['시간'] },
      { code: 'MKT-INF', name: '인플루언서관리', features: '인플루언서 DB, 매칭, 캠페인, 정산', resources: ['돈', '시간'] },
      { code: 'MKT-CRT', name: '크리에이티브관리', features: '소재 제작 요청, 버전관리, 심의, A/B테스트', resources: ['시간'] },
      { code: 'MKT-AUT', name: '마케팅자동화', features: '여정 빌더, 트리거 메시지, 세그먼트 자동 발송', resources: ['시간'] },
      { code: 'MKT-DTA', name: '매체데이터허브', features: '전 매체 데이터 자동 수집, 정규화, 통합 리포팅', resources: [] },
      { code: 'MKT-ATR', name: '어트리뷰션', features: '전환 경로, 다중 어트리뷰션 모델, 기여도', resources: ['돈'] },
      { code: 'MKT-MMM', name: '미디어믹스모델', features: '채널별 기여도, 예산 최적화 시뮬레이션', resources: ['돈'] },
      { code: 'MKT-ABT', name: 'A/B테스트', features: '실험 설계, 실행, 통계적 유의성, 아카이브', resources: ['시간'] },
      { code: 'MKT-SEN', name: '감성분석', features: '소셜/리뷰/뉴스 감성 수집, NLP, 알림', resources: [] },
      { code: 'MKT-OPS', name: '마케팅운영', features: '대행사/벤더 관리, 매체비 정산, 예산 집행', resources: ['돈'] },
      { code: 'MKT-INT', name: '마케팅연동허브', features: '외부 API 연동, 동기화, 모니터링, 매핑', resources: [] },
      { code: 'MKT-ANL', name: '마케팅분석', features: '채널별 ROI, 퍼널분석, Attribution', resources: ['돈', '시간'] },
      { code: 'MKT-BRD', name: '브랜드관리', features: '브랜드 가이드, 자산, 모니터링', resources: ['돈'] },
      { code: 'SAL-PIP', name: '영업파이프라인', features: '리드→기회→제안→수주 추적', resources: ['돈', '시간'] },
      { code: 'SAL-QOT', name: '견적관리', features: '견적 작성, 승인, 발송, 추적', resources: ['돈'] },
      { code: 'SAL-ORD', name: '수주관리', features: '주문 접수, 확인, 이행, 정산', resources: ['돈', '시간'] },
      { code: 'CRM-UNI', name: '통합고객관리', features: 'Golden Record, Identity Resolution, 통합 프로필', resources: ['인간'] },
      { code: 'CRM-CST', name: '고객관리', features: '고객 DB, 세그먼트, 이력, 등급', resources: ['인간'] },
      { code: 'CRM-SVC', name: '고객지원', features: '티켓, SLA, FAQ, 챗봇', resources: ['인간', '시간'] },
      { code: 'CRM-CX', name: '고객경험', features: 'NPS, VOC, 만족도, 여정맵', resources: ['인간', '시간'] },
      { code: 'CRM-MBR', name: '멤버십', features: '통합 등급, 포인트, 크로스 혜택', resources: ['인간', '돈'] },
      { code: 'CRM-CDP', name: '고객데이터플랫폼', features: '접점 통합, 세그먼테이션, 행동 분석', resources: ['인간'] },
      { code: 'BD-PRJ', name: '신사업기획', features: '사업계획, 타당성분석, ROI 추정', resources: ['돈', '시간'] },
    ],
  },
  {
    num: 3, name: '지원', sub: 'Support', icon: Wrench, color: '#1D9E75',
    modules: [
      { code: 'RND-PRJ', name: '연구프로젝트', features: '연구과제, 진척률, 산출물', resources: ['시간', '돈'] },
      { code: 'RND-PAT', name: '특허관리', features: '출원, 등록, 갱신, 라이선싱', resources: ['돈', '시간'] },
      { code: 'DEV-TSK', name: '개발관리', features: '이슈 트래커, 스프린트, 코드리뷰', resources: ['시간'] },
      { code: 'DEV-REL', name: '배포관리', features: 'CI/CD, 릴리즈, 롤백, 환경관리', resources: ['시간'] },
      { code: 'PRD-PLN', name: '생산계획', features: 'MPS, MRP, 작업지시', resources: ['시간', '돈'] },
      { code: 'PRD-MES', name: '공정관리', features: '공정 모니터링, 실적, 불량관리', resources: ['시간'] },
      { code: 'PRD-QC', name: '품질관리', features: '수입검사, 공정검사, 출하검사', resources: ['시간'] },
      { code: 'PRD-EQP', name: '설비관리', features: '설비대장, 예방보전, 고장관리', resources: ['돈', '시간'] },
      { code: 'DSG-PRJ', name: '디자인프로젝트', features: '디자인 요청, 리뷰, 승인, 산출물', resources: ['시간'] },
      { code: 'DSG-AST', name: '디자인자산', features: '로고, 템플릿, 가이드라인 라이브러리', resources: [] },
      { code: 'LOG-WMS', name: '창고관리', features: '입출고, 재고, 로케이션, 피킹', resources: ['돈', '시간'] },
      { code: 'LOG-TMS', name: '운송관리', features: '배차, 배송추적, 운임정산', resources: ['돈', '시간'] },
      { code: 'LOG-SCM', name: '공급망관리', features: '발주, 납품, 공급업체 평가', resources: ['돈', '시간'] },
      { code: 'DAT-PLT', name: '데이터플랫폼', features: '수집, 파이프라인, 데이터레이크, 웨어하우스', resources: [] },
      { code: 'CNT-DAM', name: '디지털자산관리', features: '미디어 파일, 브랜드 자산, 라이선스', resources: [] },
    ],
  },
  {
    num: 4, name: '파트너', sub: 'Partners', icon: Handshake, color: '#BA7517',
    modules: [
      { code: 'PTN-MGT', name: '파트너관리', features: '파트너 등록, 등급, 계약, 평가', resources: ['인간', '돈'] },
      { code: 'PTN-PRT', name: '파트너포털', features: '외부 파트너 전용 접근, 문서공유', resources: ['인간'] },
      { code: 'PTN-SRM', name: '공급업체관리', features: '벤더 평가, 입찰, 선정, 성과관리', resources: ['돈'] },
      { code: 'PTN-FRE', name: '프리랜서관리', features: '인력풀, 매칭, 계약, 정산', resources: ['인간', '돈', '시간'] },
    ],
  },
  {
    num: 5, name: '공통', sub: 'Common Platform', icon: MessageSquare, color: '#378ADD',
    modules: [
      { code: 'COM-MAL', name: '메일', features: '내부/외부 이메일, 그룹메일', resources: [] },
      { code: 'COM-MSG', name: '메신저', features: '1:1, 그룹채팅, 채널, 검색', resources: [] },
      { code: 'COM-BRD', name: '게시판', features: '공지, 자유, 부서별', resources: [] },
      { code: 'COM-DOC', name: '문서관리', features: '문서 작성, 공유, 버전, 검색', resources: [] },
      { code: 'COM-CAL', name: '캘린더', features: '개인/팀/회의실 일정', resources: ['시간'] },
      { code: 'COM-PRJ', name: '프로젝트협업', features: '태스크, 칸반, 간트, 타임라인', resources: ['시간'] },
      { code: 'COM-APR', name: '전자결재', features: '기안, 결재, 합의, 전결, 후결', resources: ['인간', '돈', '시간'] },
      { code: 'COM-AI', name: 'AI어시스턴트', features: '문서요약, 번역, 분석, 자동화', resources: [] },
      { code: 'COM-NTF', name: '알림센터', features: '통합 알림, 구독, 알림 규칙', resources: [] },
      { code: 'COM-RPT', name: '리포트센터', features: '대시보드, BI, 보고서 생성', resources: ['돈', '시간'] },
      { code: 'COM-STR', name: '전산관리', features: '계정, 장비, 라이선스, 네트워크', resources: ['돈'] },
      { code: 'HR-FBK', name: '피드백', features: '상시 피드백 교환, 넛지, 평가 연계', resources: ['인간'] },
      { code: 'HR-RCG', name: '인정/포상', features: 'Spot Award, MVP, 포인트 적립/사용', resources: ['인간', '돈'] },
      { code: 'DAT-BI', name: 'BI 대시보드', features: '계층별 대시보드, 셀프서비스, 시각화', resources: ['돈', '시간'] },
      { code: 'DAT-AI', name: 'AI 분석엔진', features: '자동 인사이트, 이상탐지, 예측, 추천', resources: [] },
      { code: 'CNT-HUB', name: '콘텐츠허브', features: '통합 콘텐츠, 자동 태깅, 검색, 버전', resources: [] },
      { code: 'DAT-ANL', name: '전략분석', features: '기술/진단/예측/처방 분석, 인사이트 보고서', resources: ['돈', '시간'] },
    ],
  },
  {
    num: 6, name: '시스템 관리', sub: 'System Admin', icon: Settings, color: '#D4537E',
    modules: [
      { code: 'SYS-USR', name: '사용자관리', features: '계정 생성/수정/비활성화, SSO', resources: [] },
      { code: 'SYS-ROL', name: '역할/권한관리', features: '역할 템플릿, 권한 매트릭스, 감사', resources: [] },
      { code: 'SYS-ORG', name: '조직관리', features: '트랙/조직 CRUD, 조직도, 인사발령', resources: [] },
      { code: 'SYS-MOD', name: '모듈관리', features: '모듈 활성화/비활성화, 조직별 할당', resources: [] },
      { code: 'SYS-WFL', name: '워크플로우관리', features: '프로세스 설계, 자동화, 모니터링', resources: [] },
      { code: 'SYS-MON', name: '시스템모니터링', features: '서버, 성능, 에러, 사용량', resources: [] },
      { code: 'SYS-SEC', name: '보안관리', features: '접근 정책, IP제한, 2FA, 암호화', resources: [] },
      { code: 'SYS-LOG', name: '감사로그', features: '모든 변경 이력, 접근 기록, 추출', resources: [] },
      { code: 'SYS-CFG', name: '시스템설정', features: '전역 설정, 메타데이터, 코드관리', resources: [] },
      { code: 'SYS-INT', name: '외부연동', features: 'API 게이트웨이, 웹훅, 서드파티', resources: [] },
      { code: 'SYS-CUL', name: 'Culture Engine', features: '기업 철학, 가치, 원칙 관리', resources: [] },
      { code: 'SYS-TPL', name: '양식관리', features: '문서 양식 생성·배포·버전, 가치 연결', resources: [] },
      { code: 'DAT-GOV', name: '데이터거버넌스', features: '카탈로그, 품질, 리니지, 접근정책', resources: [] },
    ],
  },
];

/* ── Resource icon helper ── */
function ResourceIcon({ resource }: { resource: string }) {
  const badge = RESOURCE_BADGE[resource];
  if (!badge) return null;
  const iconMap: Record<string, typeof Users> = { '인간': Users, '시간': Clock, '돈': DollarSign };
  const Icon = iconMap[resource];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
      style={{ background: `${badge.color}15`, color: badge.color }}
    >
      <Icon size={10} />
      {badge.label}
    </span>
  );
}

export default function SolutionsPage() {
  const [search, setSearch] = useState('');
  const [openTracks, setOpenTracks] = useState<number[]>([1]);
  const [filterResource, setFilterResource] = useState<string | null>(null);

  const totalModules = TRACKS.reduce((s, t) => s + t.modules.length, 0);

  /* ── 검색/필터 ── */
  const filteredTracks = useMemo(() => {
    const q = search.toLowerCase().trim();
    return TRACKS.map((track) => {
      const filtered = track.modules.filter((m) => {
        const matchSearch = !q || m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.features.toLowerCase().includes(q);
        const matchResource = !filterResource || m.resources.includes(filterResource);
        return matchSearch && matchResource;
      });
      return { ...track, modules: filtered };
    }).filter((t) => t.modules.length > 0);
  }, [search, filterResource]);

  const filteredTotal = filteredTracks.reduce((s, t) => s + t.modules.length, 0);

  const toggleTrack = (num: number) => {
    setOpenTracks((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  return (
    <>
      <WIOMarketingHeader />

      <div className="pt-20 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/wio" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white mb-6">
            <ArrowLeft size={14} /> WIO
          </Link>

          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold mb-2">모듈 카탈로그</h1>
          <p className="text-slate-400 mb-8">6개 트랙 · {totalModules}개 모듈</p>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="모듈 코드 또는 이름 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#534AB7]/50"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {Object.entries(RESOURCE_BADGE).map(([key, badge]) => {
                const iconMap: Record<string, typeof Users> = { '인간': Users, '시간': Clock, '돈': DollarSign };
                const Icon = iconMap[key];
                const isActive = filterResource === key;
                return (
                  <button
                    key={key}
                    onClick={() => setFilterResource(isActive ? null : key)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors"
                    style={{
                      borderColor: isActive ? `${badge.color}50` : 'rgba(255,255,255,0.1)',
                      background: isActive ? `${badge.color}15` : 'transparent',
                      color: isActive ? badge.color : '#94a3b8',
                    }}
                  >
                    <Icon size={12} />
                    {badge.label}
                  </button>
                );
              })}
              {filterResource && (
                <button onClick={() => setFilterResource(null)} className="text-xs text-slate-500 hover:text-white px-2">
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* Result Count */}
          {(search || filterResource) && (
            <p className="text-xs text-slate-500 mb-4">
              {filteredTotal}개 모듈 표시 (전체 {totalModules}개)
            </p>
          )}

          {/* Track Accordion */}
          <div className="space-y-4">
            {filteredTracks.map((track) => {
              const Icon = track.icon;
              const isOpen = openTracks.includes(track.num);
              return (
                <div key={track.num} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  {/* Track Header */}
                  <button
                    onClick={() => toggleTrack(track.num)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0" style={{ background: `${track.color}15` }}>
                      <Icon size={20} style={{ color: track.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${track.color}20`, color: track.color }}>
                          T{track.num}
                        </span>
                        <h2 className="font-bold text-white">{track.name}</h2>
                        <span className="text-xs text-slate-600 hidden sm:inline">{track.sub}</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium mr-2" style={{ color: track.color }}>{track.modules.length}개</span>
                    <ChevronDown size={16} className={`text-slate-500 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Module List */}
                  {isOpen && (
                    <div className="border-t border-white/5">
                      {/* Desktop Table */}
                      <div className="hidden md:block">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-slate-600 border-b border-white/5">
                              <th className="text-left px-5 py-2.5 font-medium w-28">코드</th>
                              <th className="text-left py-2.5 font-medium w-36">모듈명</th>
                              <th className="text-left py-2.5 font-medium">핵심 기능</th>
                              <th className="text-left py-2.5 font-medium w-32">자원</th>
                            </tr>
                          </thead>
                          <tbody>
                            {track.modules.map((m) => (
                              <tr key={m.code} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                <td className="px-5 py-2.5">
                                  <code className="text-xs px-1.5 py-0.5 rounded bg-white/[0.05] font-mono" style={{ color: track.color }}>
                                    {m.code}
                                  </code>
                                </td>
                                <td className="py-2.5 font-medium text-white">{m.name}</td>
                                <td className="py-2.5 text-slate-500 text-xs">{m.features}</td>
                                <td className="py-2.5">
                                  <div className="flex flex-wrap gap-1">
                                    {m.resources.map((r) => <ResourceIcon key={r} resource={r} />)}
                                    {m.resources.length === 0 && <span className="text-[10px] text-slate-600">-</span>}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden divide-y divide-white/5">
                        {track.modules.map((m) => (
                          <div key={m.code} className="px-5 py-3">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] font-mono" style={{ color: track.color }}>
                                {m.code}
                              </code>
                              <span className="text-sm font-medium text-white">{m.name}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{m.features}</p>
                            <div className="flex flex-wrap gap-1">
                              {m.resources.map((r) => <ResourceIcon key={r} resource={r} />)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredTracks.length === 0 && (
            <div className="text-center py-20">
              <Search size={32} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-500">검색 결과가 없습니다.</p>
              <button
                onClick={() => { setSearch(''); setFilterResource(null); }}
                className="mt-3 text-sm text-[#9B8FE8] hover:text-white transition-colors"
              >
                필터 초기화
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="mt-10 rounded-xl border border-[#534AB7]/20 bg-[#534AB7]/5 p-6 text-center">
            <p className="text-sm text-slate-400 mb-2">
              총 <span className="font-bold text-white">{totalModules}개</span> 모듈 ·
              <span className="font-bold text-white"> 6</span>개 트랙 ·
              <span className="font-bold text-white"> 3</span>대 자원 관리
            </p>
            <p className="text-xs text-slate-600">필요한 모듈만 골라서, 조직에 맞게 조합합니다.</p>
          </div>
        </div>
      </div>
    </>
  );
}
