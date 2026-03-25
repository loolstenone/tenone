'use client';

import { useState } from 'react';
import { Bell, Plus, Send, Clock, Users, BarChart3 } from 'lucide-react';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

interface PushCampaign {
  id: string;
  title: string;
  message: string;
  target: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  status: 'sent' | 'scheduled' | 'draft';
  date: string;
}

const MOCK_PUSHES: PushCampaign[] = [
  { id: '1', title: '점수가 변했습니다!', message: '지난번 진단 후 사이트 점수에 변화가 있습니다. 지금 확인하세요.', target: '전체 가입자', sentCount: 1200, openRate: 34.2, clickRate: 12.8, status: 'sent', date: '2026-03-18' },
  { id: '2', title: '새로운 GEO 인사이트', message: 'ChatGPT에서 경쟁사가 노출되기 시작했습니다.', target: '진단 2회 이상', sentCount: 680, openRate: 41.5, clickRate: 18.3, status: 'sent', date: '2026-03-15' },
  { id: '3', title: '소재 제작 무료 체험', message: 'AI가 만든 광고 소재 5건을 무료로 체험하세요.', target: '가입 후 미전환', sentCount: 0, openRate: 0, clickRate: 0, status: 'scheduled', date: '2026-03-25' },
  { id: '4', title: '봄 시즌 캠페인 안내', message: '봄 시즌 마케팅, 준비하셨나요? 맞춤 전략을 확인하세요.', target: '전체', sentCount: 0, openRate: 0, clickRate: 0, status: 'draft', date: '' },
];

const _psc = getChartColors(7);
const STATUS_MAP = { sent: { label: '발송 완료', color: _psc[0] }, scheduled: { label: '예약됨', color: _psc[1] }, draft: { label: '초안', color: _psc[3] } };

export default function PushPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">푸시 메시지</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">고객에게 적시에 맞춤 메시지를 전달하세요</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
          <Plus size={15} /> 새 캠페인
        </button>
      </div>

      {/* KPI */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: '총 발송', value: '1,880건', icon: Send },
          { label: '평균 오픈율', value: '37.8%', icon: Bell },
          { label: '평균 클릭율', value: '15.5%', icon: BarChart3 },
          { label: '타겟 사용자', value: '1,488명', icon: Users },
        ].map((kpi, i) => (
          <div key={i} className="rounded-2xl border border-border bg-white p-4">
            <kpi.icon size={16} className="mb-2 text-text-muted" />
            <div className="text-xl font-bold text-text">{kpi.value}</div>
            <div className="text-xs text-text-muted">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* 캠페인 목록 */}
      <div className="space-y-3">
        {MOCK_PUSHES.map(push => {
          const status = STATUS_MAP[push.status];
          return (
            <div key={push.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-text-sub" />
                  <h3 className="text-sm font-semibold text-text">{push.title}</h3>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: status.color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
                  {status.label}
                </span>
              </div>
              <p className="mb-3 text-sm text-text-sub">{push.message}</p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>타겟: {push.target}</span>
                {push.status === 'sent' && (
                  <div className="flex gap-4">
                    <span>발송 {push.sentCount.toLocaleString()}</span>
                    <span>오픈 {push.openRate}%</span>
                    <span>클릭 {push.clickRate}%</span>
                  </div>
                )}
                {push.status === 'scheduled' && <span className="flex items-center gap-1"><Clock size={10} /> {push.date} 예약</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
