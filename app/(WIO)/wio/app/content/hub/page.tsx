'use client';

import { useState, useMemo } from 'react';
import {
  Search, FileText, BookOpen, Megaphone, StickyNote, Tag, User,
  Calendar, Eye, TrendingUp, Filter, Sparkles, Clock,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── 콘텐츠 유형 ── */
type ContentType = 'all' | 'post' | 'document' | 'wiki' | 'marketing';
const TYPE_FILTERS: { key: ContentType; label: string; icon: any }[] = [
  { key: 'all', label: '전체', icon: Filter },
  { key: 'post', label: '게시글', icon: StickyNote },
  { key: 'document', label: '문서', icon: FileText },
  { key: 'wiki', label: '위키', icon: BookOpen },
  { key: 'marketing', label: '콘텐츠', icon: Megaphone },
];

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  post: { label: '게시글', color: 'text-blue-400 bg-blue-500/10' },
  document: { label: '문서', color: 'text-emerald-400 bg-emerald-500/10' },
  wiki: { label: '위키', color: 'text-violet-400 bg-violet-500/10' },
  marketing: { label: '마케팅', color: 'text-amber-400 bg-amber-500/10' },
};

/* ── Mock 콘텐츠 15개 ── */
interface ContentItem {
  id: string;
  title: string;
  type: 'post' | 'document' | 'wiki' | 'marketing';
  author: string;
  date: string;
  tags: string[];
  aiTags: string[];
  preview: string;
  views: number;
}

const MOCK_CONTENTS: ContentItem[] = [
  { id: '1', title: '2026 Q1 사업 성과 보고', type: 'post', author: '김대표', date: '2026-03-28', tags: ['경영', '분기보고'], aiTags: ['성과분석', '매출성장'], preview: '1분기 매출 12.4억 달성, 전년 대비 22.5% 성장. 주요 성장 동력은 SmarComm 플랫폼과 MADLeague 시즌4...', views: 342 },
  { id: '2', title: '신규 입사자 온보딩 가이드', type: 'post', author: '박인사', date: '2026-03-25', tags: ['HR', '온보딩'], aiTags: ['신입교육', '사내문화'], preview: 'Ten:One Universe에 오신 것을 환영합니다. 이 가이드는 첫 2주간의 온보딩 프로세스를 안내합니다...', views: 215 },
  { id: '3', title: '브랜드 가이드라인 v3.2', type: 'post', author: '이디자인', date: '2026-03-22', tags: ['디자인', '브랜드'], aiTags: ['CI/BI', '가이드라인'], preview: 'Ten:One Universe 브랜드 아이덴티티 최신 가이드라인입니다. 로고 사용 규정, 컬러 팔레트...', views: 189 },
  { id: '4', title: '서비스 이용약관 개정안', type: 'post', author: '최법무', date: '2026-03-20', tags: ['법무', '이용약관'], aiTags: ['규정개정', '개인정보'], preview: '2026년 4월 시행 예정인 서비스 이용약관 개정 사항을 안내드립니다. 주요 변경사항...', views: 98 },
  { id: '5', title: '주간 개발팀 회의록 (3/24)', type: 'post', author: '정개발', date: '2026-03-24', tags: ['개발', '회의록'], aiTags: ['스프린트', '기술부채'], preview: '이번 주 스프린트 리뷰: WIO 모듈 3개 완성, API 성능 개선 30%. 다음 주 목표...', views: 156 },
  { id: '6', title: 'WIO 아키텍처 설계서', type: 'document', author: '정개발', date: '2026-03-15', tags: ['기술', 'WIO'], aiTags: ['시스템설계', '멀티테넌트'], preview: 'WIO(Universe Operating System)의 전체 아키텍처 설계 문서입니다. 멀티테넌트 구조...', views: 487 },
  { id: '7', title: '2026 사업계획서', type: 'document', author: '김대표', date: '2026-01-10', tags: ['경영', '사업계획'], aiTags: ['전략', '목표설정'], preview: '2026년 Ten:One Universe 사업 계획입니다. 매출 목표 150억, 핵심 전략 3대 축...', views: 623 },
  { id: '8', title: 'HeRo 프로젝트 기획서', type: 'document', author: '한기획', date: '2026-02-28', tags: ['프로젝트', 'HeRo'], aiTags: ['AI매칭', '인재플랫폼'], preview: 'HeRo AI 인재 매칭 서비스 기획 문서. 핵심 기능: AI 기반 역량 분석, 자동 매칭...', views: 312 },
  { id: '9', title: 'API 개발 표준 가이드', type: 'document', author: '정개발', date: '2026-03-01', tags: ['기술', 'API'], aiTags: ['개발표준', 'RESTful'], preview: 'WIO API 개발 시 반드시 준수해야 할 표준 가이드입니다. RESTful 원칙, 응답 포맷...', views: 278 },
  { id: '10', title: 'Tailwind CSS 활용 가이드', type: 'wiki', author: '이디자인', date: '2026-03-18', tags: ['기술', 'CSS'], aiTags: ['프론트엔드', '스타일링'], preview: '프로젝트 내 Tailwind CSS 사용 패턴 및 커스텀 유틸리티 정리. 다크 테마 적용 방법...', views: 198 },
  { id: '11', title: 'Supabase RLS 정책 가이드', type: 'wiki', author: '정개발', date: '2026-03-12', tags: ['기술', 'DB'], aiTags: ['보안', '데이터베이스'], preview: 'Supabase Row Level Security 정책 설정 가이드. brand_id 기반 멀티테넌트 격리...', views: 167 },
  { id: '12', title: '사내 용어 사전', type: 'wiki', author: '박인사', date: '2026-02-20', tags: ['사내', '용어'], aiTags: ['온보딩', '커뮤니케이션'], preview: 'Ten:One Universe에서 사용하는 내부 용어 및 약어 정리. GPR, WIO, Orbi, Vrief...', views: 445 },
  { id: '13', title: 'MADLeague 시즌4 캠페인 플랜', type: 'marketing', author: '오마케팅', date: '2026-03-10', tags: ['마케팅', 'MADLeague'], aiTags: ['캠페인', 'SNS'], preview: 'MADLeague 시즌4 마케팅 캠페인 전략. 인스타그램 릴스 + 유튜브 쇼츠 중심...', views: 234 },
  { id: '14', title: 'SmarComm 제품 소개서', type: 'marketing', author: '오마케팅', date: '2026-03-05', tags: ['마케팅', 'SmarComm'], aiTags: ['제품소개', 'B2B'], preview: 'SmarComm 마케팅 커뮤니케이션 솔루션 제품 소개서. AI 기반 콘텐츠 자동 생성...', views: 567 },
  { id: '15', title: '뉴스레터 3월호 — AI가 바꾸는 일하는 방식', type: 'marketing', author: '오마케팅', date: '2026-03-27', tags: ['마케팅', '뉴스레터'], aiTags: ['AI트렌드', '업무자동화'], preview: '이번 달 뉴스레터 주제: AI 에이전트 시대의 업무 혁신. WIO가 제안하는 새로운 방식...', views: 389 },
];

/* ── 인기 콘텐츠 Top 10 ── */
const TOP_CONTENTS = [...MOCK_CONTENTS].sort((a, b) => b.views - a.views).slice(0, 10);

export default function ContentHubPage() {
  const { tenant, isDemo } = useWIO();
  const [typeFilter, setTypeFilter] = useState<ContentType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return MOCK_CONTENTS.filter(c => {
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q) || c.tags.some(t => t.includes(q)) || c.aiTags.some(t => t.includes(q)) || c.author.includes(q);
      }
      return true;
    });
  }, [typeFilter, searchQuery]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">통합 콘텐츠 허브</h1>
          <p className="text-sm text-slate-500 mt-0.5">전 모듈 콘텐츠를 한곳에서</p>
        </div>
        {isDemo && <span className="text-xs text-amber-400/60 bg-amber-500/10 px-2.5 py-1 rounded-full">데모 데이터</span>}
      </div>

      {/* 검색 + 필터 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="제목, 내용, 태그, 작성자 검색..."
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {TYPE_FILTERS.map(f => (
            <button key={f.key} onClick={() => setTypeFilter(f.key)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs whitespace-nowrap transition-all ${typeFilter === f.key ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              <f.icon size={12} /> {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 메인: 카드 그리드 */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
              <Search size={36} className="mx-auto mb-3 text-slate-700" />
              <p className="text-sm text-slate-400">검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {filtered.map(c => {
                const badge = TYPE_BADGE[c.type];
                return (
                  <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${badge.color}`}>{badge.label}</span>
                      <span className="text-[10px] text-slate-600 ml-auto flex items-center gap-1"><Eye size={10} />{c.views}</span>
                    </div>
                    <h3 className="text-sm font-semibold mb-1.5 line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.preview}</p>

                    {/* AI 태그 */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {c.aiTags.map((t, i) => (
                        <span key={i} className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                          <Sparkles size={8} />{t}
                        </span>
                      ))}
                      {c.tags.map((t, i) => (
                        <span key={`t-${i}`} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-600">
                      <span className="flex items-center gap-1"><User size={10} />{c.author}</span>
                      <span className="flex items-center gap-1"><Calendar size={10} />{c.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 사이드바 */}
        <div className="lg:w-72 shrink-0 space-y-6">
          {/* 인기 콘텐츠 Top 10 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-amber-400" />
              <h3 className="text-sm font-semibold">인기 콘텐츠</h3>
            </div>
            <div className="space-y-2">
              {TOP_CONTENTS.map((c, i) => {
                const badge = TYPE_BADGE[c.type];
                return (
                  <div key={c.id} className="flex items-start gap-2 cursor-pointer hover:bg-white/[0.03] rounded-lg px-2 py-1.5 -mx-2 transition-all">
                    <span className="text-xs font-bold text-slate-600 w-4 mt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[9px] px-1 py-0 rounded ${badge.color}`}>{badge.label}</span>
                        <span className="text-[9px] text-slate-600 flex items-center gap-0.5"><Eye size={8} />{c.views}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 최근 업데이트 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-blue-400" />
              <h3 className="text-sm font-semibold">최근 업데이트</h3>
            </div>
            <div className="space-y-2">
              {MOCK_CONTENTS.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-start gap-2 cursor-pointer hover:bg-white/[0.03] rounded-lg px-2 py-1.5 -mx-2 transition-all">
                  <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">{c.title}</p>
                    <span className="text-[9px] text-slate-600">{c.date} | {c.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
