"use client";

import { useState, useEffect } from "react";
import { Building2, Briefcase, ChevronRight, AlertCircle } from "lucide-react";

interface Industry { id: string; name_ko: string; icon?: string }
interface JobFunction { id: string; name_ko: string; icon?: string }
interface Track { id: string; name_ko: string; description?: string; is_active: boolean }

interface HitInterestSelectorProps {
  onSelect: (industry: string, jobFunction: string, trackId: string | null) => void;
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

  // 산업군/직군 로드
  useEffect(() => {
    fetch('/api/hit/b/tracks')
      .then(r => r.json())
      .then(data => {
        setIndustries(data.industries || []);
        setJobFunctions(data.jobFunctions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

    // 매칭 트랙 조회
    try {
      const res = await fetch(`/api/hit/b/tracks?industry=${selectedIndustry}&jobFunction=${id}`);
      const data = await res.json();
      const matchedTracks: Track[] = data.tracks || [];
      const matchType: string = data.matchType || 'none';

      if (matchedTracks.length === 1) {
        onSelect(selectedIndustry, id, matchedTracks[0].id);
      } else if (matchedTracks.length > 1) {
        setTracks(matchedTracks);
        setStep('track');
      } else {
        // 3단계 폴백 전부 없음 → 준비 중
        setStep('inactive');
      }
    } catch {
      setStep('inactive');
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
          <button
            onClick={() => { setStep('industry'); setSelectedIndustry(''); }}
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
            이 분야의 역량 검사는 현재 준비 중입니다.
            <br />
            지금까지의 검사 결과(인성 + RIASEC)로 기본 방향을 안내해드립니다.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onSelect(selectedIndustry, selectedJobFunction, null)}
              className="px-6 py-3 bg-[#E53935] text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              기본 결과 보기
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
