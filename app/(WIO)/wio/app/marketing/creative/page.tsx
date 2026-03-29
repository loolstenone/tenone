'use client';

import { useState } from 'react';
import { Palette, Plus, Image, FileText, Video, ArrowRight, CheckCircle2, Clock, XCircle, Eye } from 'lucide-react';
import { useWIO } from '../../layout';

const PIPELINE_STEPS = ['요청', '제작중', '내부리뷰', '수정', '최종승인'];

const MOCK_CREATIVES = [
  { id: 1, title: '봄 캠페인 메인 배너', type: 'image', campaign: '2026 봄 브랜드 캠페인', step: 4, status: 'approved', requester: '마케팅팀', designer: '김디자인', dueDate: '2026-03-25', variants: ['A: 밝은톤', 'B: 다크톤'] },
  { id: 2, title: '제품 소개 영상 30초', type: 'video', campaign: '제품 런칭 프로모션', step: 2, status: 'in_progress', requester: '마케팅팀', designer: '이영상', dueDate: '2026-04-05', variants: [] },
  { id: 3, title: '리드젠 랜딩페이지 카피', type: 'copy', campaign: '스타트업 리드젠 Q1', step: 3, status: 'review', requester: '그로스팀', designer: '박카피', dueDate: '2026-03-28', variants: ['A: 혜택 강조', 'B: 기능 강조'] },
  { id: 4, title: 'SNS 카드뉴스 세트', type: 'image', campaign: '채용 브랜딩 시리즈', step: 1, status: 'in_progress', requester: 'HR팀', designer: '김디자인', dueDate: '2026-04-01', variants: [] },
];

const TYPE_ICON: Record<string, any> = { image: Image, video: Video, copy: FileText };
const TYPE_LABEL: Record<string, string> = { image: '이미지', video: '영상', copy: '카피' };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  requested: { label: '요청됨', color: 'text-blue-400 bg-blue-500/10' },
  in_progress: { label: '제작중', color: 'text-amber-400 bg-amber-500/10' },
  review: { label: '리뷰중', color: 'text-violet-400 bg-violet-500/10' },
  revision: { label: '수정중', color: 'text-orange-400 bg-orange-500/10' },
  approved: { label: '승인완료', color: 'text-emerald-400 bg-emerald-500/10' },
  rejected: { label: '반려', color: 'text-red-400 bg-red-500/10' },
};

export default function CreativePage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';

  const creatives = isDemo ? MOCK_CREATIVES : MOCK_CREATIVES;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">크리에이티브 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-CRT &middot; 소재 요청/제작/리뷰/승인 파이프라인</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 소재 요청
        </button>
      </div>

      {/* 파이프라인 요약 */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {PIPELINE_STEPS.map((step, i) => {
          const count = creatives.filter(c => c.step === i + 1 || (i === 4 && c.status === 'approved')).length;
          return (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <div className="text-[11px] text-slate-500 mb-1">{step}</div>
              <div className="text-lg font-bold">{count}</div>
            </div>
          );
        })}
      </div>

      {/* 소재 목록 */}
      <div className="space-y-3">
        {creatives.map(c => {
          const st = STATUS_MAP[c.status] || STATUS_MAP.requested;
          const TypeIcon = TYPE_ICON[c.type] || FileText;
          return (
            <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TypeIcon size={14} className="text-slate-400" />
                  <span className="text-sm font-semibold">{c.title}</span>
                  <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full bg-white/5">{TYPE_LABEL[c.type]}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <div className="text-xs text-slate-500">마감 {c.dueDate}</div>
              </div>

              {/* 파이프라인 스텝 */}
              <div className="flex gap-0.5 mb-3">
                {PIPELINE_STEPS.map((step, i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full ${i < c.step ? 'bg-indigo-500' : 'bg-white/5'}`} />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div>{c.campaign} &middot; 요청: {c.requester} &middot; 담당: {c.designer}</div>
                {c.variants.length > 0 && (
                  <div className="flex gap-1.5">
                    {c.variants.map((v, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[10px]">{v}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
