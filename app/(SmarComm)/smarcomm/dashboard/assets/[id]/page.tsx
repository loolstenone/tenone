'use client';

// V2.0 § 3-D 단건 자산 상세 — JSON-LD · 배포 상태 · AI 인용 이력

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Copy, Check, Trash2, Eye, EyeOff, ExternalLink, Globe, AlertCircle, Plus, X,
} from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import {
  getEntityMeta,
  DISTRIBUTION_CHANNEL_META,
  DISTRIBUTION_STATUS_META,
  type BrandAsset,
  type AssetDistribution,
  type AssetCitation,
} from '@/lib/smarcomm/assets';

type DetailResponse = {
  asset: BrandAsset;
  distributions: AssetDistribution[];
  citations: AssetCitation[];
};

const PLATFORM_LABEL: Record<AssetCitation['platform'], string> = {
  'claude': 'Claude',
  'chatgpt': 'ChatGPT',
  'perplexity': 'Perplexity',
  'naver-cue': '네이버 Cue',
  'google-aio': 'Google AI Overview',
};

const ACCURACY_BADGE: Record<AssetCitation['accuracy'], { label: string; color: string }> = {
  exact:   { label: '정확',  color: '#10B981' },
  partial: { label: '부분',  color: '#F59E0B' },
  wrong:   { label: '오답',  color: '#DC2626' },
};

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDistModal, setShowDistModal] = useState(false);
  const [daLoading, setDaLoading] = useState<Set<string>>(new Set());
  const [daBatchLoading, setDaBatchLoading] = useState(false);
  const [daKeyMissing, setDaKeyMissing] = useState(false);

  const reloadDetail = async () => {
    if (!detail) return;
    const res = await fetch(`/api/smarcomm/assets/${detail.asset.id}`);
    if (res.ok) setDetail(await res.json());
  };

  const enrichDA = async (distributionId?: string) => {
    if (!detail) return;
    if (distributionId) {
      setDaLoading(prev => new Set(prev).add(distributionId));
    } else {
      setDaBatchLoading(true);
    }
    try {
      const res = await fetch(`/api/smarcomm/assets/${detail.asset.id}/distributions/enrich-da`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: distributionId ? JSON.stringify({ distribution_id: distributionId }) : undefined,
      });
      const data = await res.json();
      if (data.status === 'api_key_missing') {
        setDaKeyMissing(true);
      } else {
        setDaKeyMissing(false);
        await reloadDetail();
      }
    } catch {
      // ignore
    } finally {
      if (distributionId) {
        setDaLoading(prev => { const n = new Set(prev); n.delete(distributionId); return n; });
      } else {
        setDaBatchLoading(false);
      }
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/smarcomm/assets/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'failed');
        setDetail(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onCopyJsonLd = async () => {
    if (!detail) return;
    const code = `<script type="application/ld+json">\n${JSON.stringify(detail.asset.schema_jsonld, null, 2)}\n</script>`;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const onArchive = async () => {
    if (!detail) return;
    if (!confirm('이 자산을 보관(archive)합니까? 영구 삭제가 아니라 valid_until만 지정됩니다.')) return;
    const res = await fetch(`/api/smarcomm/assets/${detail.asset.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/smarcomm/dashboard/assets');
  };

  const onToggleVisibility = async () => {
    if (!detail) return;
    const res = await fetch(`/api/smarcomm/assets/${detail.asset.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ is_public: !detail.asset.is_public }),
    });
    const data = await res.json();
    if (res.ok && data.asset) {
      setDetail({ ...detail, asset: data.asset });
    }
  };

  if (loading) return <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">로딩 중…</div>;
  if (error || !detail) return (
    <div className="max-w-3xl">
      <Link href="/smarcomm/dashboard/assets" className="inline-flex items-center gap-1 text-xs text-text-sub hover:text-text mb-4"><ArrowLeft size={12} /> 자산 목록</Link>
      <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-4 text-xs text-danger">
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        <span>자산을 불러오지 못했습니다: {error ?? '알 수 없는 오류'}</span>
      </div>
    </div>
  );

  const { asset, distributions, citations } = detail;
  const meta = getEntityMeta(asset.entity_type);
  const scoreColor = asset.persistence_score >= 70 ? '#10B981' : asset.persistence_score >= 40 ? '#F59E0B' : '#DC2626';
  const liveDist = distributions.filter(d => d.status === 'live').length;
  const exactCit = citations.filter(c => c.accuracy === 'exact').length;

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/smarcomm/dashboard/assets" className="inline-flex items-center gap-1 text-xs text-text-sub hover:text-text">
          <ArrowLeft size={12} /> 자산 목록
        </Link>
        <PageTopBar />
      </div>

      {/* 헤더 */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white">
        <div className="flex items-start justify-between gap-3 p-5">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-3xl shrink-0">{meta.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-text">{asset.name}</h1>
                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-text-sub">{meta.label}</span>
                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-mono text-text-muted">{asset.entity_type}</span>
                {asset.is_public ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700"><Eye size={10} /> 공개</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-text-muted"><EyeOff size={10} /> 내부</span>
                )}
              </div>
              <p className="mt-1 text-xs text-text-sub font-mono">slug: {asset.slug}</p>
              {asset.description && <p className="mt-2 text-sm text-text-sub">{asset.description}</p>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold" style={{ color: scoreColor }}>{asset.persistence_score}</div>
            <div className="text-[10px] text-text-muted">디지털 흔적 점수</div>
            <div className="mt-0.5 text-[9px] text-text-muted italic" title="distribution.domain_authority 있으면 DA × 채널 max cap / 100 으로 정규화. 없으면 채널 가중치(휴리스틱) fallback. DA 자동 채움: Moz/Ahrefs API.">
              🔬 DA-scaled (fallback: 휴리스틱)
            </div>
          </div>
        </div>

        {/* 미니 통계 */}
        <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-surface/30">
          <Stat label="배포 (live)" value={`${liveDist} / ${distributions.length}`} />
          <Stat label="AI 인용 (exact)" value={`${exactCit} / ${citations.length}`} />
          <Stat label="유효 기간" value={asset.valid_until ? '종료됨' : '영구'} />
        </div>
      </div>

      {/* 액션 바 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={onCopyJsonLd} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-text hover:bg-surface">
          {copied ? <><Check size={13} className="text-success" /> 복사됨</> : <><Copy size={13} /> JSON-LD 스니펫 복사</>}
        </button>
        <button onClick={onToggleVisibility} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-text hover:bg-surface">
          {asset.is_public ? <><EyeOff size={13} /> 내부로 전환</> : <><Globe size={13} /> 공개로 전환</>}
        </button>
        <button onClick={onArchive} className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/5 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10">
          <Trash2 size={13} /> 보관 (archive)
        </button>
      </div>

      {/* JSON-LD 미리보기 */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white">
        <div className="border-b border-border bg-surface/40 px-5 py-3">
          <h2 className="text-sm font-bold text-text">JSON-LD 본문 (Schema.org 표준)</h2>
          <p className="mt-0.5 text-[11px] text-text-muted">사이트 head에 삽입하면 검색·AI가 이 Entity를 인용 가능한 형태로 인식합니다.</p>
        </div>
        <pre className="overflow-auto bg-neutral-950 p-4 text-[11px] leading-relaxed text-emerald-300 max-h-96">
          <code>{`<script type="application/ld+json">\n${JSON.stringify(asset.schema_jsonld, null, 2)}\n</script>`}</code>
        </pre>
      </div>

      {/* 외부 배포 이력 */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white">
        <div className="border-b border-border bg-surface/40 px-5 py-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-text inline-flex items-center gap-1.5">
              외부 매체 배포 이력
              <span className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-text-muted" title="사용자가 수동 입력. 외부 매체 자동 감지 연동은 단계적으로 활성.">
                🔬 출처: 사용자 입력 (수동)
              </span>
            </h2>
            <p className="mt-0.5 text-[11px] text-text-muted">권위 매체에 Entity가 노출될수록 AI 학습·인용 가능성이 높아집니다. 직접 등재한 이력을 추가해 흔적 점수를 관리하세요.</p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            {distributions.some(d => d.external_url) && (
              <button
                onClick={() => enrichDA()}
                disabled={daBatchLoading}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1.5 text-[11px] font-medium text-text hover:bg-surface disabled:opacity-50"
                title="외부 URL이 있는 모든 배포 이력의 도메인 권위도(DA)를 Moz/Ahrefs API로 조회"
              >
                {daBatchLoading ? '조회 중…' : '🔍 DA 일괄 조회'}
              </button>
            )}
            <button onClick={() => setShowDistModal(true)} className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1.5 text-[11px] font-medium text-text hover:bg-surface">
              <Plus size={12} /> 배포 이력 추가
            </button>
          </div>
        </div>
        {daKeyMissing && (
          <div className="border-b border-border bg-amber-50 px-5 py-2 text-[11px] text-amber-800">
            🔌 외부 도메인 권위도 API 미연결 — <code className="text-[10px]">MOZSCAPE_ACCESS_ID + MOZSCAPE_SECRET_KEY</code> (Moz, 권장) 또는 <code className="text-[10px]">AHREFS_API_KEY</code> 설정 필요. 현재는 채널 휴리스틱 가중치로 fallback.
          </div>
        )}
        {distributions.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-muted">
            등록된 배포 이력이 없습니다. 위키피디아·뉴스·매체에 Entity가 등재되면 + 버튼으로 직접 추가하세요.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {distributions.map((d) => {
              const cMeta = DISTRIBUTION_CHANNEL_META[d.channel];
              const sMeta = DISTRIBUTION_STATUS_META[d.status];
              return (
                <div key={d.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{cMeta.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-text truncate">{d.medium_name}</span>
                        <span className="text-[10px] text-text-muted">{cMeta.label}</span>
                      </div>
                      {d.external_url && (
                        <a href={d.external_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-text-sub hover:text-text inline-flex items-center gap-0.5">
                          {d.external_url.replace(/^https?:\/\//, '').slice(0, 60)} <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums"
                      style={{
                        background: d.domain_authority != null ? '#0F766E15' : '#94A3B815',
                        color: d.domain_authority != null ? '#0F766E' : '#94A3B8',
                      }}
                      title={d.domain_authority != null
                        ? `Domain Authority ${d.domain_authority}/100 (Moz DA 또는 Ahrefs DR)`
                        : '도메인 권위도 미조회 — DA 조회 버튼으로 Moz/Ahrefs API 호출'}
                    >
                      DA {d.domain_authority != null ? d.domain_authority : '—'}
                    </span>
                    {d.external_url && (
                      <button
                        onClick={() => enrichDA(d.id)}
                        disabled={daLoading.has(d.id)}
                        className="rounded-full border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-text-sub hover:text-text hover:bg-surface disabled:opacity-50"
                        title="이 도메인의 권위도(DA)를 Moz/Ahrefs API로 조회"
                      >
                        {daLoading.has(d.id) ? '…' : '🔍 DA 조회'}
                      </button>
                    )}
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: `${sMeta.color}15`, color: sMeta.color }}>{sMeta.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI 인용 이력 */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white">
        <div className="border-b border-border bg-surface/40 px-5 py-3">
          <h2 className="text-sm font-bold text-text inline-flex items-center gap-1.5">
            AI 인용 이력
            <span className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-text-muted" title="진단 시 AI 응답에서 Entity 언급을 감지하면 자동 기록. 현재 자동 동기화 준비 중.">
              🔬 출처: AI 응답 자동 (준비 중)
            </span>
          </h2>
          <p className="mt-0.5 text-[11px] text-text-muted">5 AI 플랫폼에서 이 Entity가 어떻게 인용되는지 추적합니다. 진단 시 자동 동기화는 준비 중 — 현재는 수동 기록 불가.</p>
        </div>
        {citations.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-muted">아직 AI 인용이 감지되지 않았습니다.</div>
        ) : (
          <div className="divide-y divide-border">
            {citations.slice(0, 20).map((c) => {
              const aMeta = ACCURACY_BADGE[c.accuracy];
              return (
                <div key={c.id} className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-semibold text-text-sub">{PLATFORM_LABEL[c.platform]}</span>
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: `${aMeta.color}15`, color: aMeta.color }}>{aMeta.label}</span>
                    <span className="text-[10px] text-text-muted">{new Date(c.measured_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <p className="text-[11px] text-text-sub italic">"{c.query}"</p>
                  {c.response_excerpt && (
                    <p className="mt-1 text-[11px] text-text leading-relaxed line-clamp-2">{c.response_excerpt}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDistModal && (
        <AddDistributionModal
          assetId={asset.id}
          onClose={() => setShowDistModal(false)}
          onAdded={() => { setShowDistModal(false); reloadDetail(); }}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 text-center">
      <div className="text-[10px] text-text-muted">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-text">{value}</div>
    </div>
  );
}

// V2.1 § 1.10 — 배포 이력 추가 모달 (사용자 직접 입력)
function AddDistributionModal({ assetId, onClose, onAdded }: { assetId: string; onClose: () => void; onAdded: () => void }) {
  const [channel, setChannel] = useState<AssetDistribution['channel']>('news_press');
  const [mediumName, setMediumName] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [status, setStatus] = useState<AssetDistribution['status']>('live');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!mediumName.trim()) {
      setError('매체명을 입력하세요');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/smarcomm/assets/${assetId}/distributions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          channel,
          medium_name: mediumName.trim(),
          external_url: externalUrl.trim() || null,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '추가 실패');
      onAdded();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-text">배포 이력 추가</h2>
            <p className="mt-0.5 text-xs text-text-muted">사용자 직접 입력 — 위키·뉴스·매체 등재 이력</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-sub mb-1">채널 *</label>
            <select value={channel} onChange={(e) => setChannel(e.target.value as AssetDistribution['channel'])} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm">
              {(Object.entries(DISTRIBUTION_CHANNEL_META) as [AssetDistribution['channel'], typeof DISTRIBUTION_CHANNEL_META[AssetDistribution['channel']]][]).map(([k, m]) => (
                <option key={k} value={k}>{m.icon} {m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-sub mb-1">매체명 *</label>
            <input
              type="text" value={mediumName} onChange={(e) => setMediumName(e.target.value)}
              placeholder="예: Naver News · MIT Tech Review · 위키피디아"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-sub mb-1">외부 URL (선택)</label>
            <input
              type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-sub mb-1">상태</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as AssetDistribution['status'])} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm">
              {(Object.entries(DISTRIBUTION_STATUS_META) as [AssetDistribution['status'], typeof DISTRIBUTION_STATUS_META[AssetDistribution['status']]][]).map(([k, m]) => (
                <option key={k} value={k}>{m.label}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-xs font-medium text-text-sub hover:text-text">취소</button>
          <button onClick={onSubmit} disabled={submitting} className="rounded-lg bg-text px-4 py-2 text-xs font-semibold text-white hover:bg-accent-sub disabled:opacity-50">
            {submitting ? '추가 중…' : '추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
