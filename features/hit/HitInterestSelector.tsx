"use client";

import { useState, useEffect } from "react";
import { Building2, Briefcase, ChevronRight, AlertCircle } from "lucide-react";
import HitErrorRetry from "./HitErrorRetry";

interface Industry { id: string; name_ko: string; icon?: string }
interface JobFunction { id: string; name_ko: string; icon?: string }
interface Track { id: string; name_ko: string; description?: string; is_active: boolean }

interface HitInterestSelectorProps {
  onSelect: (industry: string, jobFunction: string, trackId: string | null) => void;
  /** 분야 목록을 못 불러올 때 '스타트업 종합' 트랙으로 계속하는 길 (2026-10-12) */
  onSkip?: () => void;
}

export default function HitInterestSelector({ onSelect, onSkip }: HitInterestSelectorProps) {
  const [step, setStep] = useState<'industry' | 'jobFunction' | 'track' | 'inactive'>('industry');
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [jobFunctions, setJobFunctions] = useState<JobFunction[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedJobFunction, setSelectedJobFunction] = useState<string>('');
  const [selectedIndustryName, setSelectedIndustryName] = useState('');
  const [selectedJobFunctionName, setSelectedJobFunctionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadTick, setLoadTick] = useState(0);
  const [trackError, setTrackError] = useState<string | null>(null);

  // 산업군/직군 로드 — 실패하거나 비어 있으면 오류 화면 (빈 화면으로 멈추지 않게, 2026-10-12)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    fetch('/api/hit/b/tracks')
      .then(r => { if (!r.ok) throw new Error('load'); return r.json(); })
      .then(data => {
        if (cancelled) return;
        const inds: Industry[] = data.industries || [];
        const jfs: JobFunction[] = data.jobFunctions || [];
        setIndustries(inds);
        setJobFunctions(jfs);
        if (inds.length === 0 || jfs.length === 0) setLoadError(true);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setLoadError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [loadTick]);

  // 산업군 선택
  const handleIndustry = (id: string) => {
    const ind = industries.find(i => i.id === id);
    setSelectedIndustry(id);
    setSelectedIndustryName(ind?.name_ko || id);
    setStep('jobFunction');
  };

  // 직군 선택
  const handleJobFunction = async (id: string) => {
    const jf = jobFunctions.find(j => j.id === id);
    setSelectedJobFunction(id);
    setSelectedJobFunctionName(jf?.name_ko || id);
    setTrackError(null);

    // 매칭 트랙 조회
    try {
      const res = await fetch(`/api/hit/b/tracks?industry=${selectedIndustry}&jobFunction=${id}`);
      if (!res.ok) throw new Error('tracks');
      const data = await res.json();
      const matchedTracks: Track[] = data.tracks || [];
      const matchType: string = data.matchType || 'none';

      if (matchedTracks.length === 1) {
        onSelect(selectedIndustry, id, matchedTracks[0].id);
      } else if (matchedTracks.length > 1) {
        setTracks(matchedTracks);
        setStep('track');
      } else {
        // 3단계 폴백 전부 없음 → 종합 트랙으로 진행 안내
        setStep('inactive');
      }
    } catch {
      // 네트워크 오류를 '전용 트랙 없음'으로 오인하지 않는다
      setTrackError('트랙을 불러오지 못했습니다. 다시 시도해 주세요.');
    }
  };

  // 세부 트랙 선택
  const handleTrack = (trackId: string) => {
    onSelect(selectedIndustry, selectedJobFunction, trackId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-8 w-8 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 flex flex-col items-center gap-6">
        <HitErrorRetry message="관심 분야 목록을 불러오지 못했습니다." onRetry={() => setLoadTick(n => n + 1)} />
        {onSkip && (
          <div className="text-center">
            <p className="text-xs text-neutral-400 mb-2 break-keep">분야를 고르지 않고 공통 문항과 &lsquo;스타트업 종합&rsquo; 트랙의 직무 역량 문항으로 진행할 수도 있습니다.</p>
            <button onClick={onSkip} className="text-sm font-bold text-neutral-700 underline hover:text-neutral-900">스타트업 종합 트랙으로 진행</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <p className="text-xs font-bold text-[#E53935] uppercase tracking-widest mb-2">관심 분야 선택</p>
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">
          {step === 'industry' && '관심 있는 산업군을 선택하세요'}
          {step === 'jobFunction' && '관심 있는 직군을 선택하세요'}
          {step === 'track' && '세부 트랙을 선택하세요'}
          {step === 'inactive' && ''}
        </h2>
        {step !== 'inactive' && (
          <p className="text-sm text-neutral-500">선택에 따라 맞춤 역량 검사가 제공됩니다</p>
        )}
      </div>

      {/* 선택 경로 표시 */}
      {(step === 'jobFunction' || step === 'track') && (
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6 justify-center">
          <span className="font-medium text-[#E53935]">{selectedIndustryName}</span>
          {step === 'track' && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-[#E53935]">{selectedJobFunctionName}</span>
            </>
          )}
        </div>
      )}

      {/* Step 1: 산업군 */}
      {step === 'industry' && (
        <div className="grid grid-cols-2 gap-3">
          {industries.map(ind => (
            <button
              key={ind.id}
              onClick={() => handleIndustry(ind.id)}
              className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl hover:border-[#E53935] hover:bg-red-50 transition-all text-left"
            >
              <Building2 className="h-5 w-5 text-neutral-400" />
              <span className="text-sm font-medium text-neutral-700">{ind.name_ko}</span>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: 직군 */}
      {step === 'jobFunction' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {jobFunctions.map(jf => (
              <button
                key={jf.id}
                onClick={() => handleJobFunction(jf.id)}
                className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl hover:border-[#E53935] hover:bg-red-50 transition-all text-left"
              >
                <Briefcase className="h-5 w-5 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-700">{jf.name_ko}</span>
              </button>
            ))}
          </div>
          {trackError && <HitErrorRetry className="mt-4" message={trackError} onRetry={() => handleJobFunction(selectedJobFunction)} />}
          <button
            onClick={() => { setStep('industry'); setSelectedIndustry(''); setTrackError(null); }}
            className="mt-4 text-xs text-neutral-400 hover:text-neutral-600 mx-auto block"
          >
            산업군 다시 선택
          </button>
        </>
      )}

      {/* Step 3: 세부 트랙 */}
      {step === 'track' && (
        <div className="space-y-3">
          {tracks.map(t => (
            <button
              key={t.id}
              onClick={() => handleTrack(t.id)}
              className="w-full flex items-center gap-4 p-5 border border-neutral-200 rounded-xl hover:border-[#E53935] hover:bg-red-50 transition-all text-left"
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-neutral-800">{t.name_ko}</p>
                {t.description && <p className="text-xs text-neutral-500 mt-1">{t.description}</p>}
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-400" />
            </button>
          ))}
        </div>
      )}

      {/* 활성 트랙 없음 */}
      {step === 'inactive' && (
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-800 mb-2">
            {selectedIndustryName} x {selectedJobFunctionName}
          </h3>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            이 분야 전용 직무 역량 문항은 아직 없습니다.
            <br />
            공통 문항(핵심역량 · 효능감 · 자기·직무 이해)과 &lsquo;스타트업 종합&rsquo; 트랙의 직무 역량 문항으로 진행합니다.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onSelect(selectedIndustry, selectedJobFunction, null)}
              className="px-6 py-3 bg-[#E53935] text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              스타트업 종합 트랙으로 진행
            </button>
            <button
              onClick={() => { setStep('industry'); setSelectedIndustry(''); setSelectedJobFunction(''); }}
              className="text-sm text-neutral-400 hover:text-neutral-600"
            >
              다른 분야 선택
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
