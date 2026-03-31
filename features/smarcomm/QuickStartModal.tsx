'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, Globe, Palette, Megaphone, BarChart3, Users, BookOpen, Activity, FileBarChart, GitBranch, Route, Mail, Bell, MessageSquare } from 'lucide-react';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  {
    id: 'recommend',
    label: '추천',
    items: [
      { icon: Globe, title: 'GEO/SEO 진단으로 시작하기', desc: 'URL 하나로 AI 검색 노출 상태와 검색 최적화를 동시에 점검하세요.', href: '/dashboard/scan', highlight: true },
      { icon: GitBranch, title: '퍼널 분석으로 이탈 구간 찾기', desc: '방문→진단→가입→유료 전환까지 어디서 고객을 잃고 있는지 파악하세요.', href: '/dashboard/funnel' },
      { icon: Mail, title: '자동 이메일로 재방문 유도하기', desc: '가입 후 이메일 자동화 시나리오를 설정하여 지속적인 관계를 유지하세요.', href: '/dashboard/crm/email' },
      { icon: Bell, title: '푸시 메시지로 점수 변화 알리기', desc: '사이트 점수 변화를 실시간으로 알려 재방문과 참여를 유도하세요.', href: '/dashboard/crm/push' },
      { icon: MessageSquare, title: '카카오 알림톡으로 전환율 높이기', desc: '카카오 알림톡을 활용해 92%+ 열람률로 고객에게 직접 전달하세요.', href: '/dashboard/crm/kakao' },
    ],
  },
  {
    id: 'analysis',
    label: '사이트 분석',
    items: [
      { icon: Globe, title: '첫 사이트 진단하기', desc: '무료 GEO/SEO 통합 진단으로 현재 사이트 상태를 파악하세요.', href: '/dashboard/scan', highlight: true },
      { icon: BarChart3, title: 'SmarComm. Index 리포트 이해하기', desc: '6각형 레이더 차트와 브랜드 성격 분석으로 사이트를 종합 평가합니다.', href: '/dashboard/scan' },
      { icon: Activity, title: '경쟁사 사이트와 비교하기', desc: '경쟁사 URL을 입력하고 점수를 직접 비교해보세요.', href: '/dashboard/scan' },
    ],
  },
  {
    id: 'creative',
    label: '소재 제작',
    items: [
      { icon: Palette, title: 'AI로 광고 카피 생성하기', desc: '제품과 타깃을 입력하면 AI가 네이버 SA, 메타 광고 카피를 자동 생성합니다.', href: '/dashboard/creative', highlight: true },
      { icon: Palette, title: '배너 소재 제작하기', desc: '브랜드 가이드 기반으로 인스타, 페이스북 배너를 자동 제작합니다.', href: '/dashboard/creative' },
      { icon: Activity, title: '소재 A/B 테스트 설계하기', desc: '혜택 강조 vs 긴급성 강조 — 데이터로 더 나은 소재를 선택하세요.', href: '/dashboard/abtest' },
    ],
  },
  {
    id: 'data',
    label: '데이터 분석',
    items: [
      { icon: GitBranch, title: '전환 퍼널 분석하기', desc: '방문→진단→가입→유료 전환 각 단계의 이탈률을 분석합니다.', href: '/dashboard/funnel', highlight: true },
      { icon: Users, title: '코호트별 리텐션 확인하기', desc: '주차별 재방문율 히트맵으로 고객 유지력을 측정하세요.', href: '/dashboard/cohort' },
      { icon: Route, title: '고객 여정 타임라인 추적하기', desc: '개별 고객이 SmarComm과 함께한 여정을 한눈에 확인합니다.', href: '/dashboard/journey' },
      { icon: FileBarChart, title: '월간 캠페인 보고서 확인하기', desc: '채널별 성과, ROAS, CPA를 통합 리포트로 분석합니다.', href: '/dashboard/reports' },
    ],
  },
  {
    id: 'crm',
    label: 'CRM 마케팅',
    items: [
      { icon: Mail, title: '환영 이메일 자동화 설정하기', desc: '가입 즉시 환영 이메일 → 7일 후 재방문 유도까지 자동 시나리오를 설정하세요.', href: '/dashboard/crm/email', highlight: true },
      { icon: Bell, title: '점수 변화 푸시 알림 보내기', desc: '사이트 점수가 변하면 고객에게 자동 알림을 보내 재방문을 유도합니다.', href: '/dashboard/crm/push' },
      { icon: MessageSquare, title: '카카오 알림톡 연동하기', desc: '진단 완료, 미팅 예약 등 핵심 알림을 카카오로 전달하세요.', href: '/dashboard/crm/kakao' },
      { icon: Users, title: 'CRM 파이프라인 관리하기', desc: '리드→미팅→진행→계약, 고객 상태를 한눈에 관리하세요.', href: '/dashboard/crm' },
    ],
  },
];

// 카테고리별 미리보기 이미지/설명
const PREVIEWS: Record<string, { title: string; desc: string }> = {
  recommend: { title: 'SmarComm. 추천', desc: '마케팅 성과를 높이는 가장 빠른 방법을 추천합니다' },
  analysis: { title: '사이트 분석', desc: 'GEO/SEO 진단부터 경쟁사 비교까지' },
  creative: { title: '소재 제작', desc: 'AI가 브랜드에 맞는 소재를 자동 생성합니다' },
  data: { title: '데이터 분석', desc: '퍼널, 코호트, 여정 — 데이터로 의사결정하세요' },
  crm: { title: 'CRM 마케팅', desc: '이메일, 푸시, 카카오 — 고객과 지속 소통하세요' },
};

export default function QuickStartModal({ isOpen, onClose }: QuickStartModalProps) {
  const [activeCategory, setActiveCategory] = useState('recommend');
  const router = useRouter();

  if (!isOpen) return null;

  const category = CATEGORIES.find(c => c.id === activeCategory)!;
  const preview = PREVIEWS[activeCategory];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 flex h-[560px] w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* 닫기 */}
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-lg p-1 text-text-muted hover:text-text hover:bg-surface">
          <X size={18} />
        </button>

        {/* 좌측: 카테고리 */}
        <div className="w-48 shrink-0 border-r border-border bg-surface p-4">
          <h2 className="mb-4 text-base font-bold text-text">빠르게 시작하기</h2>

          <div className="mb-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">기능별로 보기</div>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeCategory === cat.id ? 'bg-white font-semibold text-text shadow-sm' : 'text-text-sub hover:text-text'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="border-t border-border pt-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">가이드</div>
            <button className="block w-full rounded-lg px-3 py-2 text-left text-sm text-text-sub hover:text-text">
              시작 가이드
            </button>
            <button className="block w-full rounded-lg px-3 py-2 text-left text-sm text-text-sub hover:text-text">
              용어 사전
            </button>
          </div>
        </div>

        {/* 중앙: 항목 리스트 */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="mb-4 text-base font-bold text-text">{preview.title}</h3>

          <div className="space-y-3">
            {category.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="group flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-all hover:border-text/20 hover:bg-surface"
                  onClick={() => { router.push(item.href); onClose(); }}
                >
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.highlight ? 'bg-text text-white' : 'bg-surface text-text-sub'}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-semibold ${item.highlight ? 'text-text' : 'text-text'}`}>{item.title}</span>
                      {item.highlight && <span className="rounded bg-text/10 px-1 py-0.5 text-[9px] font-bold text-text">추천</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-text-sub">{item.desc}</p>
                  </div>
                  <ChevronRight size={14} className="mt-1 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              );
            })}
          </div>
        </div>

        {/* 우측: 미리보기 */}
        <div className="hidden w-64 shrink-0 border-l border-border bg-surface p-6 lg:block">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-bold text-text">{preview.title}</div>
            <p className="mb-4 text-xs text-text-sub leading-relaxed">{preview.desc}</p>

            {/* 미니 차트 플레이스홀더 */}
            <div className="mb-4 rounded-lg bg-surface p-3">
              <div className="mb-2 text-[10px] font-semibold text-text-muted">미리보기</div>
              <div className="flex items-end gap-1">
                {[40, 55, 35, 70, 60, 80, 65].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-text/20" style={{ height: `${h}%`, minHeight: `${h * 0.6}px` }} />
                ))}
              </div>
            </div>

            <button
              onClick={() => { router.push(category.items[0]?.href || '/dashboard'); onClose(); }}
              className="w-full rounded-lg bg-text py-2 text-center text-xs font-semibold text-white hover:bg-accent-sub"
            >
              바로 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
