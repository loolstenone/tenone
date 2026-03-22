'use client';

import { useState } from 'react';
import { Palette, Type, Image, Video, Plus, Sparkles, ChevronRight } from 'lucide-react';
import { MOCK_CREATIVES } from '@/lib/smarcomm/dashboard-data';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';

const TYPE_ICON = { text: Type, banner: Image, video: Video };
const TYPE_LABEL = { text: '텍스트 카피', banner: '배너/이미지', video: '영상' };

export default function CreativePage() {
  const [selectedType, setSelectedType] = useState<'text' | 'banner' | 'video'>('text');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerated([
        selectedType === 'text' ? '🔍 AI가 찾아주는 내 가게 SEO 점수, 30초면 끝!' : '',
        selectedType === 'text' ? '⚡ ChatGPT가 추천하는 가게 되기 — 무료 진단 시작' : '',
        selectedType === 'text' ? '📊 경쟁사는 이미 AI 검색에 노출되고 있습니다' : '',
      ].filter(Boolean));
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">소재 제작</h1>
          <p className="mt-1 text-xs text-text-muted">AI가 브랜드 가이드 기반으로 광고 소재를 자동 생성합니다</p>
        </div>
      </div>

      {/* 유형 선택 */}
      <div className="mb-6 flex gap-3">
        {(['text', 'banner', 'video'] as const).map(type => {
          const Icon = TYPE_ICON[type];
          return (
            <button key={type} onClick={() => setSelectedType(type)}
              className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-colors ${selectedType === type ? 'border-text bg-text text-white' : 'border-border bg-white text-text-sub hover:bg-surface'}`}>
              <Icon size={16} /> {TYPE_LABEL[type]}
            </button>
          );
        })}
      </div>

      {/* 생성 폼 */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-text">AI 소재 생성</h2>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder={selectedType === 'text' ? '예: 20대 여성 타깃 봄 신상 원피스 네이버 SA 카피, 혜택 강조 톤' : selectedType === 'banner' ? '예: 봄 할인 30% 프로모션 배너 1080x1080' : '예: 신제품 소개 15초 영상, 밝고 트렌디한 분위기'}
          className="w-full rounded-xl border border-border bg-surface p-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none resize-none" rows={3} />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-text-muted">브랜드 가이드가 적용됩니다</span>
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-1.5 rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub disabled:opacity-50">
            <Sparkles size={15} /> {generating ? '생성 중...' : 'AI 소재 생성'}
          </button>
        </div>
      </div>

      {/* 생성 결과 */}
      {generated.length > 0 && (
        <div className="mb-6 rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">생성된 소재</h2>
          <div className="space-y-2">
            {generated.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-surface">
                <span className="text-sm text-text">{item}</span>
                <div className="flex gap-1.5">
                  <button className="rounded-lg bg-surface px-3 py-1 text-xs text-text-sub hover:text-text">복사</button>
                  <button className="rounded-lg bg-surface px-3 py-1 text-xs text-text-sub hover:text-text">저장</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최근 소재 */}
      <div className="rounded-2xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">최근 소재</h2>
          <button onClick={() => window.location.href = '/sc/dashboard/archive'} className="text-xs text-text-muted hover:text-text">전체 아카이브 →</button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-xs text-text-muted">
            <th className="px-5 py-2.5 text-left font-medium">소재</th>
            <th className="px-5 py-2.5 text-left font-medium">유형</th>
            <th className="px-5 py-2.5 text-left font-medium">채널</th>
            <th className="px-5 py-2.5 text-center font-medium">상태</th>
            <th className="px-5 py-2.5 text-right font-medium">생성일</th>
          </tr></thead>
          <tbody>
            {MOCK_CREATIVES.map(c => {
              const Icon = TYPE_ICON[c.type];
              return (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-5 py-3"><div className="flex items-center gap-2"><Icon size={14} className="text-text-muted" /><span className="font-medium text-text">{c.title}</span></div></td>
                  <td className="px-5 py-3 text-text-sub">{TYPE_LABEL[c.type].split('/')[0]}</td>
                  <td className="px-5 py-3 text-text-sub">{c.channel}</td>
                  <td className="px-5 py-3 text-center"><span className={`text-xs ${c.status === 'active' ? 'text-success' : 'text-text-muted'}`}>{c.status === 'active' ? '● 사용 중' : c.status === 'draft' ? '● 초안' : '● 보관'}</span></td>
                  <td className="px-5 py-3 text-right text-text-muted">{c.createdAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <NextStepCTA stage="제작 → 실행" title="완성된 소재를 광고 채널에 집행" description="제작된 카피와 배너를 네이버, 메타, 구글 등에서 바로 집행하세요" actionLabel="캠페인 집행" href="/sc/dashboard/campaigns" />
    </div>
  );
}
