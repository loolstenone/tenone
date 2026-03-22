'use client';

import { useState } from 'react';
import { Search, Plus, BookOpen, X } from 'lucide-react';
import { GLOSSARY, CATEGORIES, type GlossaryTerm } from '@/lib/smarcomm/glossary-data';

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('전체');
  const [customTerms, setCustomTerms] = useState<GlossaryTerm[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smarcomm_custom_glossary');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEn, setNewEn] = useState('');
  const [newKo, setNewKo] = useState('');
  const [newDef, setNewDef] = useState('');
  const [newCat, setNewCat] = useState('기타');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allTerms = [...GLOSSARY, ...customTerms];

  const filtered = allTerms.filter(term => {
    const matchSearch = search === '' ||
      term.en.toLowerCase().includes(search.toLowerCase()) ||
      term.ko.includes(search) ||
      term.definition.includes(search) ||
      (term.abbr && term.abbr.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = category === '전체' || term.category === category;
    return matchSearch && matchCategory;
  });

  // 알파벳순 정렬
  const sorted = filtered.sort((a, b) => a.en.localeCompare(b.en));

  // 알파벳 그룹화
  const grouped: Record<string, GlossaryTerm[]> = {};
  sorted.forEach(term => {
    const letter = term.en.charAt(0).toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(term);
  });

  const handleAdd = () => {
    if (!newEn || !newKo || !newDef) return;
    const newTerm: GlossaryTerm = { en: newEn, ko: newKo, definition: newDef, category: newCat };
    const updated = [...customTerms, newTerm];
    setCustomTerms(updated);
    localStorage.setItem('smarcomm_custom_glossary', JSON.stringify(updated));
    setNewEn(''); setNewKo(''); setNewDef(''); setNewCat('기타');
    setShowAddForm(false);
  };

  const handleRemoveCustom = (index: number) => {
    const updated = customTerms.filter((_, i) => i !== index);
    setCustomTerms(updated);
    localStorage.setItem('smarcomm_custom_glossary', JSON.stringify(updated));
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <BookOpen size={20} /> 마케팅 용어 사전
          </h1>
          <p className="text-xs text-text-muted mt-1">{allTerms.length}개 용어 수록</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub"
        >
          <Plus size={15} /> 용어 추가
        </button>
      </div>

      {/* 용어 추가 폼 */}
      {showAddForm && (
        <div className="mb-6 rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">커스텀 용어 추가</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={newEn} onChange={e => setNewEn(e.target.value)} placeholder="영문 용어" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
            <input value={newKo} onChange={e => setNewKo(e.target.value)} placeholder="한국어 용어" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
            <input value={newDef} onChange={e => setNewDef(e.target.value)} placeholder="정의" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none sm:col-span-2" />
            <select value={newCat} onChange={e => setNewCat(e.target.value)} className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text focus:border-text focus:outline-none">
              {CATEGORIES.filter(c => c !== '전체').map(c => <option key={c} value={c}>{c}</option>)}
              <option value="기타">기타</option>
            </select>
            <button onClick={handleAdd} className="rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">추가</button>
          </div>
        </div>
      )}

      {/* 검색 + 카테고리 필터 */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="용어 검색 (영문, 한국어, 약어)"
            className="w-full rounded-xl border border-border bg-white py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 수 */}
      <p className="mb-4 text-xs text-text-muted">{sorted.length}개 결과</p>

      {/* 용어 목록 — 알파벳 그룹 */}
      {Object.keys(grouped).length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <p className="text-sm text-text-sub">검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([letter, terms]) => (
            <div key={letter}>
              <div className="mb-2 text-lg font-bold text-text">{letter}</div>
              <div className="space-y-1.5">
                {terms.map((term, i) => {
                  const termId = `${term.en}-${i}`;
                  const isCustom = customTerms.includes(term);
                  const isExpanded = expandedId === termId;
                  return (
                    <div
                      key={termId}
                      className="rounded-xl border border-border bg-white transition-colors hover:bg-surface cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : termId)}
                    >
                      <div className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div>
                            <span className="text-sm font-semibold text-text">{term.en}</span>
                            {term.abbr && <span className="ml-1.5 text-xs text-text-muted">({term.abbr})</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-text-muted">{term.category}</span>
                          {isCustom && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveCustom(customTerms.indexOf(term)); }}
                              className="text-text-muted hover:text-danger"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-t border-border px-5 py-3">
                          <div className="mb-1 text-sm font-medium text-text">{term.ko}</div>
                          <p className="text-sm leading-relaxed text-text-sub">{term.definition}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
