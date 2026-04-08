"use client";

import { useState } from "react";
import { Plus, Trash2, X, Save, ChevronUp, ChevronDown, Image, Link, Type, Layout, Rss } from "lucide-react";
import type { NewsletterBlock, HeroBlock, CardRowBlock, TextBlock, UniverseFeedBlock, CardItem } from "@/lib/email/newsletter-blocks";

/* ── 블록 기본값 ── */

function defaultHero(): HeroBlock {
    return { type: 'hero', brand: 'Mindle', brandColor: '#F5C518', title: '', summary: '', imageUrl: '', linkUrl: '', linkLabel: '자세히 보기' };
}
function defaultCardRow(): CardRowBlock {
    return { type: 'card_row', heading: '', items: [{ title: '', summary: '', imageUrl: '', linkUrl: '' }] };
}
function defaultText(): TextBlock {
    return { type: 'text', content: '' };
}
function defaultUniverseFeed(): UniverseFeedBlock {
    return { type: 'universe_feed', items: [{ brand: 'Ten:One™', title: '', linkUrl: '' }] };
}

const BLOCK_META = [
    { type: 'hero',          label: '히어로',        icon: Layout, desc: '메인 섹션 — 브랜드 컬러 배경 + 제목 + CTA' },
    { type: 'card_row',      label: '카드 (1~3개)',  icon: Image,  desc: '썸네일 + 제목 + 요약 카드 그리드' },
    { type: 'text',          label: '텍스트',        icon: Type,   desc: '자유 본문 단락' },
    { type: 'universe_feed', label: 'Universe 피드', icon: Rss,    desc: 'Universe 브랜드 소식 리스트' },
];

/* ── 개별 블록 에디터 ── */

function HeroEditor({ block, onChange }: { block: HeroBlock; onChange: (b: HeroBlock) => void }) {
    const f = (key: keyof HeroBlock) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        onChange({ ...block, [key]: e.target.value });

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] text-neutral-400 mb-1 block">브랜드명</label>
                    <input value={block.brand} onChange={f('brand')} placeholder="Mindle"
                        className="w-full px-2.5 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                </div>
                <div>
                    <label className="text-[10px] text-neutral-400 mb-1 block">브랜드 색상</label>
                    <div className="flex gap-2 items-center">
                        <input type="color" value={block.brandColor} onChange={f('brandColor')}
                            className="h-8 w-12 border border-neutral-200 rounded cursor-pointer" />
                        <input value={block.brandColor} onChange={f('brandColor')}
                            className="flex-1 px-2.5 py-2 text-xs border border-neutral-200 rounded focus:outline-none font-mono" />
                    </div>
                </div>
            </div>
            <div>
                <label className="text-[10px] text-neutral-400 mb-1 block">제목 *</label>
                <input value={block.title} onChange={f('title')} placeholder="이번 호 메인 헤드라인"
                    className="w-full px-2.5 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
            </div>
            <div>
                <label className="text-[10px] text-neutral-400 mb-1 block">요약 *</label>
                <textarea value={block.summary} onChange={f('summary')} rows={3} placeholder="2~3문장 요약"
                    className="w-full px-2.5 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 resize-none" />
            </div>
            <div>
                <label className="text-[10px] text-neutral-400 mb-1 block">이미지 URL (선택)</label>
                <input value={block.imageUrl || ''} onChange={f('imageUrl')} placeholder="https://..."
                    className="w-full px-2.5 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] text-neutral-400 mb-1 block">CTA 링크 (선택)</label>
                    <input value={block.linkUrl || ''} onChange={f('linkUrl')} placeholder="https://..."
                        className="w-full px-2.5 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                </div>
                <div>
                    <label className="text-[10px] text-neutral-400 mb-1 block">CTA 레이블</label>
                    <input value={block.linkLabel || '자세히 보기'} onChange={f('linkLabel')} placeholder="자세히 보기"
                        className="w-full px-2.5 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                </div>
            </div>
        </div>
    );
}

function CardItemEditor({ item, onChange, onRemove, canRemove }: { item: CardItem; onChange: (i: CardItem) => void; onRemove: () => void; canRemove: boolean }) {
    const f = (key: keyof CardItem) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange({ ...item, [key]: e.target.value });
    return (
        <div className="p-3 border border-neutral-100 rounded bg-neutral-50 space-y-2 relative">
            {canRemove && (
                <button onClick={onRemove} className="absolute top-2 right-2 p-0.5 text-neutral-300 hover:text-red-500">
                    <X className="h-3 w-3" />
                </button>
            )}
            <input value={item.title} onChange={f('title')} placeholder="카드 제목 *"
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none bg-white" />
            <textarea value={item.summary} onChange={f('summary')} rows={2} placeholder="카드 요약 (1~2줄)"
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none resize-none bg-white" />
            <div className="grid grid-cols-2 gap-2">
                <input value={item.imageUrl || ''} onChange={f('imageUrl')} placeholder="이미지 URL"
                    className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none bg-white" />
                <input value={item.linkUrl || ''} onChange={f('linkUrl')} placeholder="링크 URL"
                    className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none bg-white" />
            </div>
        </div>
    );
}

function CardRowEditor({ block, onChange }: { block: CardRowBlock; onChange: (b: CardRowBlock) => void }) {
    const updateItem = (idx: number, item: CardItem) =>
        onChange({ ...block, items: block.items.map((it, i) => i === idx ? item : it) });
    const addItem = () => {
        if (block.items.length >= 3) return;
        onChange({ ...block, items: [...block.items, { title: '', summary: '', imageUrl: '', linkUrl: '' }] });
    };
    const removeItem = (idx: number) =>
        onChange({ ...block, items: block.items.filter((_, i) => i !== idx) });

    return (
        <div className="space-y-3">
            <div>
                <label className="text-[10px] text-neutral-400 mb-1 block">섹션 제목 (선택)</label>
                <input value={block.heading || ''} onChange={e => onChange({ ...block, heading: e.target.value })}
                    placeholder="이번 주 트렌드"
                    className="w-full px-2.5 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
            </div>
            <div className="space-y-2">
                {block.items.map((item, idx) => (
                    <CardItemEditor key={idx} item={item} onChange={(i) => updateItem(idx, i)}
                        onRemove={() => removeItem(idx)} canRemove={block.items.length > 1} />
                ))}
            </div>
            {block.items.length < 3 && (
                <button onClick={addItem} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700">
                    <Plus className="h-3 w-3" /> 카드 추가 ({block.items.length}/3)
                </button>
            )}
        </div>
    );
}

function TextEditor({ block, onChange }: { block: TextBlock; onChange: (b: TextBlock) => void }) {
    return (
        <div>
            <label className="text-[10px] text-neutral-400 mb-1 block">본문 (단락은 빈 줄로 구분)</label>
            <textarea value={block.content} onChange={e => onChange({ ...block, content: e.target.value })}
                rows={6} placeholder="텍스트를 입력하세요..."
                className="w-full px-2.5 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 resize-none" />
        </div>
    );
}

function UniverseFeedEditor({ block, onChange }: { block: UniverseFeedBlock; onChange: (b: UniverseFeedBlock) => void }) {
    const updateItem = (idx: number, key: string, val: string) =>
        onChange({ ...block, items: block.items.map((it, i) => i === idx ? { ...it, [key]: val } : it) });
    const addItem = () => onChange({ ...block, items: [...block.items, { brand: '', title: '', linkUrl: '' }] });
    const removeItem = (idx: number) => onChange({ ...block, items: block.items.filter((_, i) => i !== idx) });

    return (
        <div className="space-y-2">
            <p className="text-[10px] text-neutral-400">Universe 소식 아이템 (브랜드명 + 제목 + 링크)</p>
            {block.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                    <input value={item.brand} onChange={e => updateItem(idx, 'brand', e.target.value)}
                        placeholder="브랜드" className="w-24 px-2 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none" />
                    <input value={item.title} onChange={e => updateItem(idx, 'title', e.target.value)}
                        placeholder="소식 제목" className="flex-1 px-2 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none" />
                    <input value={item.linkUrl || ''} onChange={e => updateItem(idx, 'linkUrl', e.target.value)}
                        placeholder="링크" className="w-28 px-2 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none" />
                    {block.items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="text-neutral-300 hover:text-red-500">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            ))}
            <button onClick={addItem} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700">
                <Plus className="h-3 w-3" /> 아이템 추가
            </button>
        </div>
    );
}

/* ── 블록 래퍼 ── */

function BlockWrapper({
    block, index, total, onChange, onRemove, onMove,
}: {
    block: NewsletterBlock;
    index: number;
    total: number;
    onChange: (b: NewsletterBlock) => void;
    onRemove: () => void;
    onMove: (dir: -1 | 1) => void;
}) {
    const meta = BLOCK_META.find(m => m.type === block.type)!;
    const Icon = meta.icon;

    return (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
            {/* 블록 헤더 */}
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="text-xs font-medium text-neutral-600">{meta.label}</span>
                </div>
                <div className="flex items-center gap-0.5">
                    <button onClick={() => onMove(-1)} disabled={index === 0}
                        className="p-1 text-neutral-300 hover:text-neutral-600 disabled:opacity-20">
                        <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onMove(1)} disabled={index === total - 1}
                        className="p-1 text-neutral-300 hover:text-neutral-600 disabled:opacity-20">
                        <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={onRemove} className="p-1 text-neutral-300 hover:text-red-500 ml-1">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
            {/* 블록 내용 */}
            <div className="p-4">
                {block.type === 'hero'          && <HeroEditor block={block} onChange={onChange as (b: HeroBlock) => void} />}
                {block.type === 'card_row'      && <CardRowEditor block={block} onChange={onChange as (b: CardRowBlock) => void} />}
                {block.type === 'text'          && <TextEditor block={block} onChange={onChange as (b: TextBlock) => void} />}
                {block.type === 'universe_feed' && <UniverseFeedEditor block={block} onChange={onChange as (b: UniverseFeedBlock) => void} />}
            </div>
        </div>
    );
}

/* ── 메인 에디터 ── */

interface Props {
    title: string;
    blocks: NewsletterBlock[];
    onTitleChange: (t: string) => void;
    onBlocksChange: (b: NewsletterBlock[]) => void;
    onSave: () => void;
    onClose: () => void;
    saving: boolean;
}

export function NewsletterBlockEditor({ title, blocks, onTitleChange, onBlocksChange, onSave, onClose, saving }: Props) {
    const addBlock = (type: string) => {
        let b: NewsletterBlock;
        if (type === 'hero')          b = defaultHero();
        else if (type === 'card_row') b = defaultCardRow();
        else if (type === 'text')     b = defaultText();
        else                          b = defaultUniverseFeed();
        onBlocksChange([...blocks, b]);
    };

    const updateBlock = (idx: number, b: NewsletterBlock) =>
        onBlocksChange(blocks.map((bl, i) => i === idx ? b : bl));

    const removeBlock = (idx: number) =>
        onBlocksChange(blocks.filter((_, i) => i !== idx));

    const moveBlock = (idx: number, dir: -1 | 1) => {
        const next = [...blocks];
        const target = idx + dir;
        if (target < 0 || target >= next.length) return;
        [next[idx], next[target]] = [next[target], next[idx]];
        onBlocksChange(next);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                    {/* 헤더 */}
                    <div className="p-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
                        <h2 className="text-sm font-semibold">뉴스레터 편집</h2>
                        <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-900">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* 스크롤 영역 */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {/* 제목 */}
                        <div>
                            <label className="text-[10px] text-neutral-400 mb-1 block font-medium uppercase tracking-wide">이메일 제목 (Subject)</label>
                            <input value={title} onChange={e => onTitleChange(e.target.value)}
                                placeholder="[Mindle] 이번 주 트렌드 홀씨 — 2026년 4월"
                                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                        </div>

                        {/* 블록 목록 */}
                        <div className="space-y-3">
                            {blocks.map((bl, idx) => (
                                <BlockWrapper key={idx} block={bl} index={idx} total={blocks.length}
                                    onChange={(b) => updateBlock(idx, b)}
                                    onRemove={() => removeBlock(idx)}
                                    onMove={(dir) => moveBlock(idx, dir)} />
                            ))}
                            {blocks.length === 0 && (
                                <div className="text-center py-8 text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-lg">
                                    아래 버튼으로 블록을 추가하세요
                                </div>
                            )}
                        </div>

                        {/* 블록 추가 버튼 */}
                        <div className="pt-2 border-t border-neutral-100">
                            <p className="text-[10px] text-neutral-400 mb-2 font-medium uppercase tracking-wide">블록 추가</p>
                            <div className="grid grid-cols-2 gap-2">
                                {BLOCK_META.map((m) => {
                                    const Icon = m.icon;
                                    return (
                                        <button key={m.type} onClick={() => addBlock(m.type)}
                                            className="flex items-start gap-2 p-3 border border-neutral-200 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-colors text-left">
                                            <Icon className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-medium text-neutral-700">{m.label}</p>
                                                <p className="text-[10px] text-neutral-400 leading-relaxed">{m.desc}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 푸터 */}
                    <div className="p-4 border-t border-neutral-100 flex justify-end gap-2 shrink-0">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100 rounded">취소</button>
                        <button onClick={onSave} disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50">
                            <Save className="h-3.5 w-3.5" /> {saving ? "저장 중..." : "저장"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
