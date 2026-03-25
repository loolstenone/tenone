'use client';

import { Plus, Mail, Send, Clock, Eye, MousePointerClick } from 'lucide-react';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

interface EmailCampaign {
  id: string;
  subject: string;
  type: 'drip' | 'newsletter' | 'trigger';
  status: 'active' | 'paused' | 'draft';
  sentCount: number;
  openRate: number;
  clickRate: number;
  lastSent: string;
}

const MOCK_EMAILS: EmailCampaign[] = [
  { id: '1', subject: '사이트 점수가 변했습니다 — 지금 확인하세요', type: 'trigger', status: 'active', sentCount: 2400, openRate: 42.1, clickRate: 18.5, lastSent: '2026-03-20' },
  { id: '2', subject: '[SmarComm Weekly] 이번 주 마케팅 인사이트', type: 'newsletter', status: 'active', sentCount: 1488, openRate: 35.8, clickRate: 12.3, lastSent: '2026-03-17' },
  { id: '3', subject: '가입을 환영합니다! 첫 진단을 시작하세요', type: 'drip', status: 'active', sentCount: 1488, openRate: 68.2, clickRate: 45.1, lastSent: '2026-03-21' },
  { id: '4', subject: '7일째 방문이 없으시네요 — 경쟁사 근황', type: 'drip', status: 'active', sentCount: 340, openRate: 38.5, clickRate: 22.7, lastSent: '2026-03-19' },
  { id: '5', subject: '봄 시즌 마케팅 가이드 (무료 다운로드)', type: 'newsletter', status: 'draft', sentCount: 0, openRate: 0, clickRate: 0, lastSent: '' },
];

const TYPE_LABEL = { drip: '자동화', newsletter: '뉴스레터', trigger: '트리거' };
const _esc = getChartColors(7);
const STATUS_MAP = { active: { label: '활성', color: _esc[0] }, paused: { label: '일시정지', color: _esc[2] }, draft: { label: '초안', color: _esc[3] } };

export default function EmailPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">이메일 마케팅</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">가입 후 자동 이메일부터 뉴스레터까지 — 관계를 유지하세요</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
          <Plus size={15} /> 새 이메일
        </button>
      </div>

      {/* 자동화 시나리오 */}
      <div className="mb-8 rounded-2xl border border-border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-text">자동화 시나리오</h2>
        <div className="space-y-3">
          {[
            { trigger: '회원가입', delay: '즉시', action: '환영 이메일 + 첫 진단 유도' },
            { trigger: '진단 완료', delay: '24시간 후', action: '심화 리포트 안내 + 가입 유도' },
            { trigger: '7일 미방문', delay: '자동', action: '경쟁사 점수 변화 알림' },
            { trigger: '14일 미방문', delay: '자동', action: '재방문 인센티브 (무료 소재 5건)' },
            { trigger: '월간', delay: '매월 1일', action: '점수 변화 리포트 + 마케팅 인사이트' },
          ].map((scenario, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-border px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface">
                <Mail size={14} className="text-text-sub" />
              </div>
              <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                <span className="font-medium text-text">{scenario.trigger}</span>
                <span className="text-text-muted">{scenario.delay}</span>
                <span className="text-text-sub">{scenario.action}</span>
              </div>
              <span className="text-xs text-success">● 활성</span>
            </div>
          ))}
        </div>
      </div>

      {/* 이메일 캠페인 */}
      <div className="rounded-2xl border border-border bg-white">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">캠페인 목록</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-muted">
              <th className="px-5 py-2.5 text-left font-medium">제목</th>
              <th className="px-5 py-2.5 text-center font-medium">유형</th>
              <th className="px-5 py-2.5 text-center font-medium">상태</th>
              <th className="px-5 py-2.5 text-right font-medium">발송</th>
              <th className="px-5 py-2.5 text-right font-medium">오픈율</th>
              <th className="px-5 py-2.5 text-right font-medium">클릭율</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_EMAILS.map(email => {
              const status = STATUS_MAP[email.status];
              return (
                <tr key={email.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-5 py-3 font-medium text-text">{email.subject}</td>
                  <td className="px-5 py-3 text-center"><span className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-sub">{TYPE_LABEL[email.type]}</span></td>
                  <td className="px-5 py-3 text-center"><span className="text-xs" style={{ color: status.color }}>● {status.label}</span></td>
                  <td className="px-5 py-3 text-right text-text-sub">{email.sentCount > 0 ? email.sentCount.toLocaleString() : '-'}</td>
                  <td className="px-5 py-3 text-right font-medium text-text">{email.openRate > 0 ? `${email.openRate}%` : '-'}</td>
                  <td className="px-5 py-3 text-right text-text-sub">{email.clickRate > 0 ? `${email.clickRate}%` : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
