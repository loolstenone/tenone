'use client';

import { Plus, MessageSquare, Send, Users } from 'lucide-react';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

interface KakaoMessage {
  id: string;
  type: 'alimtalk' | 'friendtalk';
  title: string;
  template: string;
  status: 'active' | 'pending' | 'draft';
  sentCount: number;
  readRate: number;
  date: string;
}

const MOCK_KAKAO: KakaoMessage[] = [
  { id: '1', type: 'alimtalk', title: '진단 완료 알림', template: '[SmarComm] #{고객명}님, 사이트 진단이 완료되었습니다. 종합 점수: #{점수}점', status: 'active', sentCount: 4200, readRate: 92.5, date: '2026-03-20' },
  { id: '2', type: 'alimtalk', title: '미팅 예약 확인', template: '[SmarComm] #{고객명}님, #{날짜} #{시간} 미팅이 예약되었습니다.', status: 'active', sentCount: 340, readRate: 98.1, date: '2026-03-19' },
  { id: '3', type: 'friendtalk', title: '봄 시즌 프로모션', template: '🌸 봄 맞이 SEO 무료 진단 이벤트! 지금 점검하고 할인 쿠폰 받으세요.', status: 'active', sentCount: 1200, readRate: 78.3, date: '2026-03-15' },
  { id: '4', type: 'friendtalk', title: '주간 인사이트', template: '이번 주 마케팅 트렌드와 경쟁사 동향을 확인하세요.', status: 'draft', sentCount: 0, readRate: 0, date: '' },
];

const TYPE_LABEL = { alimtalk: '알림톡', friendtalk: '친구톡' };

export default function KakaoPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">카카오 메시지</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">알림톡과 친구톡으로 고객과 직접 소통하세요</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
          <Plus size={15} /> 새 메시지
        </button>
      </div>

      {/* KPI */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">총 발송</div>
          <div className="text-2xl font-bold text-text">5,740건</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">평균 읽음률</div>
          <div className="text-2xl font-bold text-text">89.7%</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">카카오 채널 친구</div>
          <div className="text-2xl font-bold text-text">2,340명</div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="space-y-3">
        {MOCK_KAKAO.map(msg => (
          <div key={msg.id} className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-text-sub" />
                <h3 className="text-sm font-semibold text-text">{msg.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${msg.type === 'alimtalk' ? 'bg-[#FEE500]/20 text-[#3C1E1E]' : 'bg-surface text-text-sub'}`}>
                  {TYPE_LABEL[msg.type]}
                </span>
              </div>
              <span className={`text-xs font-medium ${msg.status === 'active' ? 'text-success' : 'text-text-muted'}`}>
                {msg.status === 'active' ? '● 활성' : '● 초안'}
              </span>
            </div>

            {/* 메시지 미리보기 */}
            <div className="mb-3 rounded-xl bg-[#FEE500]/10 p-4">
              <p className="text-sm text-text-sub leading-relaxed">{msg.template}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted">
              {msg.sentCount > 0 ? (
                <div className="flex gap-4">
                  <span>발송 {msg.sentCount.toLocaleString()}</span>
                  <span>읽음 {msg.readRate}%</span>
                  <span>{msg.date}</span>
                </div>
              ) : (
                <span>아직 발송되지 않음</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
