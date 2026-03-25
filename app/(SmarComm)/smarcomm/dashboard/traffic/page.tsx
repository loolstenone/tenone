'use client';

import { useState } from 'react';
import { Globe, TrendingUp, TrendingDown, Users, Clock, Monitor, Smartphone, ArrowRight, ExternalLink } from 'lucide-react';
import LineChart from '@/components/smarcomm/charts/LineChart';
import BarChart from '@/components/smarcomm/charts/BarChart';
import DonutChart from '@/components/smarcomm/charts/DonutChart';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';


// Mock 트래픽 데이터 (GA4 연동 시 실제 데이터로 대체)
const DAILY_TRAFFIC = [
  { label: '3/17', value: 1240 }, { label: '3/18', value: 1380 }, { label: '3/19', value: 1520 },
  { label: '3/20', value: 1190 }, { label: '3/21', value: 1650 }, { label: '3/22', value: 1420 }, { label: '3/23', value: 1580 },
];

const CHANNEL_SOURCES = [
  { channel: '자연 검색', sessions: 4820, users: 3650, bounceRate: 42, avgDuration: '2:34', pagesPerSession: 3.2, change: '+12%', positive: true },
  { channel: '유료 검색', sessions: 2140, users: 1890, bounceRate: 38, avgDuration: '1:48', pagesPerSession: 2.8, change: '+8%', positive: true },
  { channel: '직접 유입', sessions: 1680, users: 1420, bounceRate: 35, avgDuration: '3:12', pagesPerSession: 4.1, change: '+3%', positive: true },
  { channel: 'AI 추천', sessions: 890, users: 780, bounceRate: 28, avgDuration: '3:45', pagesPerSession: 4.8, change: '+45%', positive: true },
  { channel: '소셜 미디어', sessions: 720, users: 650, bounceRate: 55, avgDuration: '1:22', pagesPerSession: 2.1, change: '-5%', positive: false },
  { channel: '이메일', sessions: 340, users: 310, bounceRate: 30, avgDuration: '2:56', pagesPerSession: 3.5, change: '+18%', positive: true },
  { channel: '추천 (레퍼럴)', sessions: 210, users: 180, bounceRate: 48, avgDuration: '1:55', pagesPerSession: 2.4, change: '+2%', positive: true },
];

const TOP_PAGES = [
  { page: '/', title: '홈페이지', views: 8420, uniqueViews: 6200, avgTime: '0:42', bounceRate: 58 },
  { page: '/scan', title: '무료 진단', views: 4180, uniqueViews: 3500, avgTime: '2:15', bounceRate: 22 },
  { page: '/blog', title: '블로그', views: 2840, uniqueViews: 2100, avgTime: '3:28', bounceRate: 35 },
  { page: '/pricing', title: '요금제', views: 1920, uniqueViews: 1650, avgTime: '1:45', bounceRate: 42 },
  { page: '/report/*', title: '진단 리포트', views: 1560, uniqueViews: 1200, avgTime: '4:12', bounceRate: 18 },
  { page: '/blog/*', title: '블로그 글', views: 1340, uniqueViews: 980, avgTime: '3:55', bounceRate: 32 },
  { page: '/login', title: '로그인', views: 890, uniqueViews: 780, avgTime: '0:35', bounceRate: 15 },
  { page: '/signup', title: '회원가입', views: 620, uniqueViews: 540, avgTime: '1:22', bounceRate: 28 },
];

const AUDIENCE = {
  device: [{ label: '데스크탑', value: 58 }, { label: '모바일', value: 38 }, { label: '태블릿', value: 4 }],
  newVsReturning: [{ label: '신규', value: 62 }, { label: '재방문', value: 38 }],
  topCountries: [{ name: '대한민국', pct: 82 }, { name: '미국', pct: 8 }, { name: '일본', pct: 4 }, { name: '기타', pct: 6 }],
};

export default function TrafficPage() {
  const [period, setPeriod] = useState('7d');
  const pc = getChartColors(7);

  const totalSessions = CHANNEL_SOURCES.reduce((s, c) => s + c.sessions, 0);
  const totalUsers = CHANNEL_SOURCES.reduce((s, c) => s + c.users, 0);
  const avgBounce = Math.round(CHANNEL_SOURCES.reduce((s, c) => s + c.bounceRate * c.sessions, 0) / totalSessions);

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div>
            <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">트래픽 분석</h1><GuideHelpButton /></div>
            <p className="mt-1 text-xs text-text-muted">사이트 방문자, 유입 경로, 페이지 성과를 분석합니다</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[{ key: '7d', label: '7일' }, { key: '30d', label: '30일' }, { key: '90d', label: '90일' }].map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${period === p.key ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* 연동 안내 배너 */}
      <div className="mb-6 rounded-2xl border border-dashed border-point/30 bg-point/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe size={18} className="text-point" />
          <div>
            <div className="text-xs font-semibold text-text">GA4를 연동하면 실제 트래픽 데이터를 확인합니다</div>
            <div className="text-[10px] text-text-muted">현재는 샘플 데이터가 표시됩니다</div>
          </div>
        </div>
        <a href="/dashboard/profile" className="rounded-lg bg-point px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-point/80">GA4 연동 →</a>
      </div>

      {/* KPI */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {[
          { label: '세션', value: totalSessions.toLocaleString(), change: '+14%', positive: true },
          { label: '사용자', value: totalUsers.toLocaleString(), change: '+11%', positive: true },
          { label: '이탈률', value: `${avgBounce}%`, change: '-2%', positive: true },
          { label: 'AI 추천 유입', value: '890', change: '+45%', positive: true },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-2xl border border-border bg-white p-5">
            <div className="text-xs text-text-muted">{kpi.label}</div>
            <div className="mt-1 text-2xl font-bold text-text">{kpi.value}</div>
            <div className={`mt-1 flex items-center gap-1 text-xs ${kpi.positive ? 'text-success' : 'text-danger'}`}>
              {kpi.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {kpi.change}
            </div>
          </div>
        ))}
      </div>

      {/* 일별 추이 + 채널 분포 */}
      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">일별 트래픽 추이</h2>
          <LineChart data={DAILY_TRAFFIC} height={200} color={pc[0]} />
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">채널별 유입 분포</h2>
          <DonutChart
            data={CHANNEL_SOURCES.slice(0, 5).map((c, i) => ({ label: c.channel, value: c.sessions, color: pc[i] }))}
            size={160} centerLabel="총 세션" centerValue={totalSessions.toLocaleString()}
          />
        </div>
      </div>

      {/* 채널별 상세 */}
      <div className="mb-6 rounded-2xl border border-border bg-white">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">채널별 트래픽</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-muted">
              <th className="px-5 py-2.5 text-left font-medium">채널</th>
              <th className="px-5 py-2.5 text-right font-medium">세션</th>
              <th className="px-5 py-2.5 text-right font-medium">사용자</th>
              <th className="px-5 py-2.5 text-right font-medium">이탈률</th>
              <th className="px-5 py-2.5 text-right font-medium">평균 체류</th>
              <th className="px-5 py-2.5 text-right font-medium">페이지/세션</th>
              <th className="px-5 py-2.5 text-right font-medium">변화</th>
            </tr>
          </thead>
          <tbody>
            {CHANNEL_SOURCES.map((ch, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: pc[i] }} />
                    <span className="font-medium text-text">{ch.channel}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right text-text-sub">{ch.sessions.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-text-sub">{ch.users.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-text-sub">{ch.bounceRate}%</td>
                <td className="px-5 py-3 text-right text-text-sub">{ch.avgDuration}</td>
                <td className="px-5 py-3 text-right text-text-sub">{ch.pagesPerSession}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`text-xs font-semibold ${ch.positive ? 'text-success' : 'text-danger'}`}>{ch.change}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 상위 페이지 + 오디언스 */}
      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        {/* 상위 페이지 */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">상위 페이지</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] text-text-muted">
                <th className="pb-2 text-left font-medium">페이지</th>
                <th className="pb-2 text-right font-medium">조회</th>
                <th className="pb-2 text-right font-medium">체류시간</th>
                <th className="pb-2 text-right font-medium">이탈률</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PAGES.slice(0, 6).map((p, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-2">
                    <div className="text-xs font-medium text-text">{p.title}</div>
                    <div className="text-[9px] text-text-muted">{p.page}</div>
                  </td>
                  <td className="py-2 text-right text-xs text-text-sub">{p.views.toLocaleString()}</td>
                  <td className="py-2 text-right text-xs text-text-sub">{p.avgTime}</td>
                  <td className="py-2 text-right text-xs text-text-sub">{p.bounceRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 오디언스 프로필 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-text">디바이스</h2>
            <div className="space-y-2">
              {AUDIENCE.device.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-text-sub">{d.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.value}%`, background: pc[i] }} />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold text-text">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-text">신규 vs 재방문</h2>
            <DonutChart
              data={AUDIENCE.newVsReturning.map((d, i) => ({ label: d.label, value: d.value, color: pc[i] }))}
              size={120} centerLabel="재방문" centerValue="38%"
            />
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-text">지역</h2>
            <div className="space-y-1.5">
              {AUDIENCE.topCountries.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-text-sub">{c.name}</span>
                  <span className="font-semibold text-text">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <NextStepCTA stage="진단 → 기획" title="트래픽 분석을 기반으로 마케팅 전략 수립" description="유입 채널별 성과를 분석하고 예산을 최적화하세요" actionLabel="AI 어드바이저" href="/dashboard/advisor" />
    </div>
  );
}
