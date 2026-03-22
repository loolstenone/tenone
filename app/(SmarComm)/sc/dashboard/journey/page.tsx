'use client';

import { useState } from 'react';
import { Search, Globe, FileText, Palette, Megaphone, LineChart, Clock, ChevronRight } from 'lucide-react';
import { getChartColors } from '@/lib/smarcomm/chart-palette';

// SmarComm 고객 여정 타임라인
interface JourneyEvent {
  id: string;
  type: 'scan' | 'signup' | 'report' | 'creative' | 'campaign' | 'meeting';
  title: string;
  detail: string;
  date: string;
  icon: typeof Search;
  color: string;
}

const _jc = getChartColors(7);
const TYPE_COLOR: Record<string, string> = { scan: _jc[0], signup: _jc[1], report: _jc[2], creative: _jc[3], campaign: _jc[4], meeting: _jc[5] };

const MOCK_JOURNEYS: Record<string, JourneyEvent[]> = {
  '굿프레시 F&B': [
    { id: '1', type: 'scan', title: '사이트 진단 완료', detail: 'goodfresh.co.kr — 종합 62점 (Good)', date: '2026-03-01', icon: Globe, color: TYPE_COLOR.scan },
    { id: '2', type: 'signup', title: '회원가입', detail: 'kim@goodfresh.co.kr', date: '2026-03-01', icon: Search, color: TYPE_COLOR.signup },
    { id: '3', type: 'report', title: '심화 리포트 열람', detail: '키워드 분석, 콘텐츠 갭 확인', date: '2026-03-03', icon: FileText, color: TYPE_COLOR.report },
    { id: '4', type: 'scan', title: '리테스트 (2회차)', detail: '종합 68점 (+6점 향상)', date: '2026-03-08', icon: Globe, color: TYPE_COLOR.scan },
    { id: '5', type: 'meeting', title: '전문가 미팅', detail: 'SEO 개선 + 소재 제작 상담', date: '2026-03-10', icon: Search, color: TYPE_COLOR.meeting },
    { id: '6', type: 'creative', title: '소재 제작 시작', detail: '네이버 SA 카피 + 인스타 배너', date: '2026-03-12', icon: Palette, color: TYPE_COLOR.creative },
    { id: '7', type: 'campaign', title: 'Lite 플랜 가입', detail: '월 39만원 — 1채널 집행', date: '2026-03-15', icon: Megaphone, color: TYPE_COLOR.campaign },
    { id: '8', type: 'campaign', title: '네이버 SA 캠페인 시작', detail: '월 300만원 예산', date: '2026-03-18', icon: LineChart, color: TYPE_COLOR.campaign },
  ],
  '스타일온 패션': [
    { id: '1', type: 'scan', title: '사이트 진단', detail: 'styleon.kr — 종합 45점 (Needs Work)', date: '2026-03-05', icon: Globe, color: TYPE_COLOR.scan },
    { id: '2', type: 'signup', title: '회원가입', detail: 'lee@styleon.kr', date: '2026-03-05', icon: Search, color: TYPE_COLOR.signup },
    { id: '3', type: 'report', title: '심화 리포트 열람', detail: 'GEO 점수 22점 — AI 노출 부족', date: '2026-03-06', icon: FileText, color: TYPE_COLOR.report },
    { id: '4', type: 'creative', title: '소재 체험', detail: '5건 무료 소재 생성', date: '2026-03-08', icon: Palette, color: TYPE_COLOR.creative },
  ],
  '테크하우스': [
    { id: '1', type: 'scan', title: '사이트 진단', detail: 'techhouse.io — 종합 78점 (Good)', date: '2026-03-19', icon: Globe, color: TYPE_COLOR.scan },
    { id: '2', type: 'meeting', title: '미팅 예약', detail: '3/25 14:00 예정', date: '2026-03-19', icon: Search, color: TYPE_COLOR.meeting },
  ],
};

export default function JourneyPage() {
  const [selectedCustomer, setSelectedCustomer] = useState('굿프레시 F&B');
  const journey = MOCK_JOURNEYS[selectedCustomer] || [];

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text">사용자 여정</h1>
        <p className="mt-1 text-xs text-text-muted">고객이 SmarComm과 함께한 여정을 타임라인으로 확인하세요</p>
      </div>

      {/* 고객 선택 */}
      <div className="mb-6 flex gap-2">
        {Object.keys(MOCK_JOURNEYS).map(name => (
          <button
            key={name}
            onClick={() => setSelectedCustomer(name)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCustomer === name ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* 여정 요약 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-4 text-center">
          <div className="text-2xl font-bold text-text">{journey.length}</div>
          <div className="text-xs text-text-muted">총 활동</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 text-center">
          <div className="text-2xl font-bold text-text">{journey.filter(e => e.type === 'scan').length}</div>
          <div className="text-xs text-text-muted">진단 횟수</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 text-center">
          <div className="text-2xl font-bold text-text">{journey.filter(e => e.type === 'creative').length}</div>
          <div className="text-xs text-text-muted">소재 제작</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 text-center">
          <div className="text-2xl font-bold text-text">
            {journey.some(e => e.type === 'campaign' && e.title.includes('플랜')) ? '유료' : '무료'}
          </div>
          <div className="text-xs text-text-muted">현재 상태</div>
        </div>
      </div>

      {/* 타임라인 */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <h2 className="mb-5 text-sm font-semibold text-text">활동 타임라인</h2>
        <div className="relative">
          {/* 세로 라인 */}
          <div className="absolute left-5 top-0 h-full w-px bg-border" />

          <div className="space-y-6">
            {journey.map((event, i) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="relative flex items-start gap-5 pl-2">
                  {/* 도트 */}
                  <div
                    className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ background: event.color }}
                  >
                    <Icon size={14} className="text-white" />
                  </div>

                  {/* 콘텐츠 */}
                  <div className="flex-1 pb-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-text">{event.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock size={10} />
                        {event.date}
                      </div>
                    </div>
                    <p className="mt-0.5 text-sm text-text-sub">{event.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
