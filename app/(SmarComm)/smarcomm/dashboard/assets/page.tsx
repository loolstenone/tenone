'use client';

// V2.0 § 3-D 자산화 (Brand Assetizing) — Entity 카탈로그
// Schema.org 표준 Entity를 영구 자산으로 등록·관리한다.

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Archive, Globe, Eye, EyeOff, AlertCircle } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';
import {
  ENTITY_TYPES,
  getEntityMeta,
  type EntityType,
  type BrandAsset,
} from '@/lib/smarcomm/assets';

type AssetSummary = Pick<BrandAsset, 'id' | 'entity_type' | 'name' | 'slug' | 'description' | 'persistence_score' | 'is_public' | 'created_at' | 'updated_at'>;

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const tenantId = localStorage.getItem('smarcomm_company') || 'tenone-demo';
      const params = new URLSearchParams({ tenant_id: tenantId });
      if (typeFilter !== 'all') params.set('entity_type', typeFilter);
      const res = await fetch(`/api/smarcomm/assets?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      setAssets(data.assets || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const filtered = assets.filter((a) =>
    !search ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text">⑦ 자산화 — Brand Assetizing</h1>
            <GuideHelpButton />
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Brand Assetizing</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">
            캠페인 산출물을 검색·AI가 평생 참조할 Entity 자산으로 영속화합니다. Schema.org 표준 JSON-LD로 저장됩니다.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub"
        >
          <Plus size={15} /> 새 자산
        </button>
      </div>

      {/* 검색 + Entity 필터 */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="자산 이름·설명 검색"
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-11 pr-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setTypeFilter('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${typeFilter === 'all' ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}
          >
            전체 ({assets.length})
          </button>
          {ENTITY_TYPES.map((meta) => (
            <button
              key={meta.key}
              onClick={() => setTypeFilter(meta.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1 ${typeFilter === meta.key ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}
            >
              <span>{meta.icon}</span> {meta.label}
            </button>
          ))}
        </div>
      </div>

      {/* 본문 */}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>자산 로드 실패: {error}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">로딩 중…</div>
      ) : filtered.length === 0 ? (
        <EmptyState onCreate={() => setShowCreate(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {/* 가이드 */}
      <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
        <h3 className="mb-2 text-sm font-bold text-text">⑦ 자산화 단계의 의미</h3>
        <p className="mb-3 text-xs text-text-sub leading-relaxed">
          캠페인이 끝나도 AI·검색이 평생 참조할 디지털 흔적을 남기는 단계. SmarComm의 장기 가치는 "한 번 만든 자산이 365일 후에도 AI 추천에 인용되는 것"입니다.
        </p>
        <ul className="space-y-1 text-xs text-text-sub">
          <li>① <strong>디지털 흔적 정화</strong> — 오래된 보도자료·잘못된 정보 정리 (AIRM과 연동)</li>
          <li>② <strong>고권위 소스 주입</strong> — 위키피디아·권위 매체·학술 백서 등재</li>
          <li>③ <strong>엔티티 브랜딩</strong> — JSON-LD로 AI가 읽기 쉬운 구조화 데이터 제공</li>
        </ul>
      </div>

      {showCreate && (
        <CreateAssetModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchAssets(); }}
        />
      )}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-12 text-center">
      <Archive size={32} className="mx-auto mb-3 text-text-muted" />
      <p className="text-sm font-medium text-text">아직 등록된 자산이 없습니다</p>
      <p className="mt-1 text-xs text-text-muted">Organization·Service·FAQPage 같은 Schema.org Entity를 등록해 AI 검색 노출의 영속성을 확보하세요.</p>
      <button
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-text px-4 py-2 text-xs font-semibold text-white hover:bg-accent-sub"
      >
        <Plus size={13} /> 첫 자산 등록
      </button>
    </div>
  );
}

function AssetCard({ asset }: { asset: AssetSummary }) {
  const meta = getEntityMeta(asset.entity_type);
  const scoreColor = asset.persistence_score >= 70 ? '#10B981' : asset.persistence_score >= 40 ? '#F59E0B' : '#DC2626';

  return (
    <Link
      href={`/smarcomm/dashboard/assets/${asset.slug}`}
      className="block rounded-2xl border border-border bg-white p-4 hover:border-text/40 transition-colors"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{meta.icon}</span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-text truncate">{asset.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-text-muted">{meta.label}</span>
              {asset.is_public ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-surface px-1.5 py-0.5 text-[9px] text-text-sub" title="외부 공개"><Eye size={9} /> 공개</span>
              ) : (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-surface px-1.5 py-0.5 text-[9px] text-text-muted" title="내부만"><EyeOff size={9} /> 내부</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold" style={{ color: scoreColor }}>{asset.persistence_score}</div>
          <div className="text-[9px] text-text-muted">흔적 점수</div>
        </div>
      </div>
      {asset.description && (
        <p className="text-xs text-text-sub line-clamp-2 leading-relaxed">{asset.description}</p>
      )}
      <div className="mt-3 flex items-center gap-3 text-[10px] text-text-muted">
        <span>업데이트 {formatRelative(asset.updated_at)}</span>
        <span>·</span>
        <span className="font-mono truncate">/{asset.slug}</span>
      </div>
    </Link>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const day = Math.floor(diff / 86400000);
  if (day === 0) return '오늘';
  if (day === 1) return '어제';
  if (day < 7) return `${day}일 전`;
  if (day < 30) return `${Math.floor(day / 7)}주 전`;
  if (day < 365) return `${Math.floor(day / 30)}개월 전`;
  return `${Math.floor(day / 365)}년 전`;
}

function CreateAssetModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [entityType, setEntityType] = useState<EntityType>('Organization');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!name.trim()) {
      setError('이름이 필요합니다');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const tenantId = localStorage.getItem('smarcomm_company') || 'tenone-demo';
      const baseSchema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': entityType,
        name: name.trim(),
      };
      if (description.trim()) baseSchema.description = description.trim();
      const res = await fetch('/api/smarcomm/assets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          entity_type: entityType,
          name: name.trim(),
          description: description.trim() || null,
          schema_jsonld: baseSchema,
          is_public: isPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '생성 실패');
      onCreated();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4">
          <h2 className="text-base font-bold text-text">새 Entity 자산</h2>
          <p className="mt-0.5 text-xs text-text-muted">Schema.org 표준 Entity 등록 (이후 JSON-LD 편집 가능)</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-sub mb-1">Entity 타입</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as EntityType)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              {ENTITY_TYPES.map((m) => (
                <option key={m.key} value={m.key}>{m.icon} {m.label} ({m.key})</option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-text-muted">{getEntityMeta(entityType).description}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-sub mb-1">이름 *</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder={entityType === 'Organization' ? 'SmarComm' : entityType === 'Service' ? 'SmarComm Audit' : ''}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-sub mb-1">설명 (선택)</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm resize-none"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-text-sub cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded" />
            <Globe size={12} /> 외부 공개 (JSON-LD를 외부에서 조회 가능)
          </label>
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-xs font-medium text-text-sub hover:text-text">취소</button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-lg bg-text px-4 py-2 text-xs font-semibold text-white hover:bg-accent-sub disabled:opacity-50"
          >
            {submitting ? '생성 중…' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
}
