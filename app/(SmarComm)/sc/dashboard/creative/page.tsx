'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Palette, Type, Image, Video, Plus, Sparkles, ChevronRight, Copy, Check, Loader2 } from 'lucide-react';
import { MOCK_CREATIVES } from '@/lib/smarcomm/dashboard-data';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

const TYPE_ICON = { text: Type, banner: Image, video: Video };
const TYPE_LABEL = { text: '텍스트 카피', banner: '배너/이미지', video: '영상' };

interface GeneratedCreative {
  title: string;
  body: string;
  cta?: string;
  hashtags?: string[];
  image_prompt?: string;
  duration?: string;
}

export default function CreativePage() {
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<'text' | 'banner' | 'video'>('text');
  const [prompt, setPrompt] = useState('');
  const [channel, setChannel] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedCreative[]>([]);
  const [generatedBy, setGeneratedBy] = useState<'ai' | 'rule'>('rule');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // 기획서에서 넘어온 컨텍스트 자동 적용
  useEffect(() => {
    const actionTitle = searchParams.get('action');
    const actionChannel = searchParams.get('channel');
    const actionDesc = searchParams.get('desc');
    if (actionTitle) {
      setPrompt(`${actionTitle}${actionDesc ? `\n${actionDesc}` : ''}`);
    }
    if (actionChannel) {
      setChannel(actionChannel);
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGenerated([]);
    try {
      // 기획서 배경 정보 가져오기
      let context = '';
      try {
        const plan = sessionStorage.getItem('campaignPlan');
        if (plan) {
          const parsed = JSON.parse(plan);
          context = `문제: ${parsed.background?.problem || ''}\n목표: ${parsed.background?.goal || ''}\n전략: ${parsed.strategy?.approach || ''}`;
        }
      } catch { /* ignore */ }

      const res = await fetch('/api/smarcomm/creative/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          prompt: prompt,
          channel: channel || undefined,
          context: context || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGenerated(data.creatives || []);
        setGeneratedBy(data.generated_by || 'rule');
      }
    } catch (e) {
      console.error('Creative generation failed:', e);
    }
    setGenerating(false);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">소재 제작</h1><GuideHelpButton /></div>
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

      {/* 채널 선택 */}
      {channel && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-text-muted">채널:</span>
          <span className="rounded-lg bg-surface px-3 py-1 text-xs font-medium text-text">{channel}</span>
          <button onClick={() => setChannel('')} className="text-xs text-text-muted hover:text-text">×</button>
        </div>
      )}

      {/* 생성 폼 */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-text">AI 소재 생성</h2>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder={selectedType === 'text' ? '예: 20대 여성 타깃 봄 신상 원피스 네이버 SA 카피, 혜택 강조 톤' : selectedType === 'banner' ? '예: 봄 할인 30% 프로모션 배너 1080x1080' : '예: 신제품 소개 15초 영상, 밝고 트렌디한 분위기'}
          className="w-full rounded-xl border border-border bg-surface p-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none resize-none" rows={3} />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {generating ? '' : '브랜드 가이드가 적용됩니다'}
          </span>
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-1.5 rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub disabled:opacity-50">
            {generating ? <><Loader2 size={15} className="animate-spin" /> AI 생성 중...</> : <><Sparkles size={15} /> AI 소재 생성</>}
          </button>
        </div>
      </div>

      {/* 생성 결과 */}
      {generated.length > 0 && (
        <div className="mb-6 rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">생성된 소재 ({generated.length}개 변형)</h2>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${generatedBy === 'ai' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              {generatedBy === 'ai' ? 'AI 생성' : '규칙 기반'}
            </span>
          </div>
          <div className="space-y-3">
            {generated.map((item, i) => (
              <div key={i} className="rounded-xl border border-border p-4 hover:bg-surface">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-text">{item.title}</h3>
                  <button onClick={() => handleCopy(`${item.title}\n\n${item.body}${item.cta ? `\n\n${item.cta}` : ''}`, i)}
                    className="flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 text-xs text-text-sub hover:text-text">
                    {copiedIdx === i ? <><Check size={12} /> 복사됨</> : <><Copy size={12} /> 복사</>}
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-sm text-text-sub leading-relaxed">{item.body}</p>
                {item.cta && (
                  <div className="mt-2 text-xs font-medium text-point">CTA: {item.cta}</div>
                )}
                {item.hashtags && item.hashtags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.hashtags.map((tag, j) => (
                      <span key={j} className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-text-muted">#{tag}</span>
                    ))}
                  </div>
                )}
                {item.image_prompt && (
                  <div className="mt-2 rounded-lg bg-gray-50 p-2 text-[11px] text-text-muted">
                    Image Prompt: {item.image_prompt}
                  </div>
                )}
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
