'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList, Plus, Search, Filter, BarChart3, Users, Clock, CheckCircle2,
  FileText, Trash2, GripVertical, ChevronUp, ChevronDown, Eye, Save, Send,
  Star, Calendar, Upload, ChevronLeft, Download, ArrowLeft, ToggleLeft, ToggleRight,
  CircleDot, CheckSquare, List, Hash, Type, AlignLeft, X
} from 'lucide-react';
import { useWIO } from '../layout';

/* ───── Types ───── */
type SurveyStatus = 'active' | 'closed' | 'draft';
type QuestionType = 'short' | 'long' | 'radio' | 'checkbox' | 'dropdown' | 'rating' | 'date' | 'file';
type TargetType = 'all' | 'department' | 'select';

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options?: string[];
}

interface SurveyResponse {
  respondentId: string;
  respondentName: string;
  answers: Record<string, string | string[] | number>;
  submittedAt: string;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  status: SurveyStatus;
  anonymous: boolean;
  target: TargetType;
  deadline: string;
  createdBy: string;
  createdAt: string;
  questions: Question[];
  responseCount: number;
  targetCount: number;
  responses: SurveyResponse[];
}

const QUESTION_TYPES: { id: QuestionType; label: string; icon: typeof Type }[] = [
  { id: 'short', label: '단답형', icon: Type },
  { id: 'long', label: '장문형', icon: AlignLeft },
  { id: 'radio', label: '객관식 (단일)', icon: CircleDot },
  { id: 'checkbox', label: '객관식 (복수)', icon: CheckSquare },
  { id: 'dropdown', label: '드롭다운', icon: List },
  { id: 'rating', label: '점수 (1~5)', icon: Star },
  { id: 'date', label: '날짜', icon: Calendar },
  { id: 'file', label: '파일 업로드', icon: Upload },
];

const STATUS_STYLES: Record<SurveyStatus, { label: string; color: string }> = {
  active: { label: '진행중', color: 'text-emerald-400 bg-emerald-500/10' },
  closed: { label: '마감', color: 'text-slate-400 bg-slate-500/10' },
  draft: { label: '임시저장', color: 'text-amber-400 bg-amber-500/10' },
};

/* ───── Mock Data ───── */
const MOCK_SURVEYS: Survey[] = [
  {
    id: 's1',
    title: '2026 상반기 직원 만족도 조사',
    description: '상반기 근무 환경, 복지, 커뮤니케이션 등 전반적인 만족도를 조사합니다.',
    status: 'active',
    anonymous: true,
    target: 'all',
    deadline: '2026-04-15',
    createdBy: '인사팀 김수진',
    createdAt: '2026-03-15',
    responseCount: 45,
    targetCount: 60,
    questions: [
      { id: 'q1', type: 'rating', title: '전반적인 근무 환경에 대한 만족도는?', required: true },
      { id: 'q2', type: 'rating', title: '팀 내 커뮤니케이션은 원활한가요?', required: true },
      { id: 'q3', type: 'radio', title: '가장 개선이 필요한 복지는?', required: true, options: ['식대 지원', '교통비', '자기계발비', '건강검진', '휴가 제도'] },
      { id: 'q4', type: 'checkbox', title: '현재 만족하는 복지를 모두 선택하세요', required: false, options: ['유연근무', '식대 지원', '교육비', '체력단련비', '경조사 지원', '명절 선물'] },
      { id: 'q5', type: 'rating', title: '직속 상사의 리더십에 대한 만족도는?', required: true },
      { id: 'q6', type: 'dropdown', title: '소속 부서를 선택하세요', required: true, options: ['개발팀', '디자인팀', '마케팅팀', '인사팀', '영업팀', '경영지원팀'] },
      { id: 'q7', type: 'long', title: '회사에 바라는 점이나 건의사항이 있다면 자유롭게 작성해주세요', required: false },
      { id: 'q8', type: 'radio', title: '현재 워라밸에 만족하시나요?', required: true, options: ['매우 만족', '만족', '보통', '불만족', '매우 불만족'] },
    ],
    responses: [
      { respondentId: 'r1', respondentName: '익명', answers: { q1: 4, q2: 3, q3: '자기계발비', q4: ['유연근무', '식대 지원'], q5: 4, q6: '개발팀', q7: '원격근무 확대를 희망합니다', q8: '만족' }, submittedAt: '2026-03-20' },
      { respondentId: 'r2', respondentName: '익명', answers: { q1: 5, q2: 4, q3: '건강검진', q4: ['유연근무', '교육비', '체력단련비'], q5: 5, q6: '디자인팀', q7: '', q8: '매우 만족' }, submittedAt: '2026-03-21' },
      { respondentId: 'r3', respondentName: '익명', answers: { q1: 3, q2: 2, q3: '식대 지원', q4: ['경조사 지원'], q5: 3, q6: '마케팅팀', q7: '부서 간 소통 채널이 더 활성화되면 좋겠습니다', q8: '보통' }, submittedAt: '2026-03-22' },
      { respondentId: 'r4', respondentName: '익명', answers: { q1: 4, q2: 4, q3: '휴가 제도', q4: ['유연근무', '식대 지원', '명절 선물'], q5: 4, q6: '영업팀', q7: '', q8: '만족' }, submittedAt: '2026-03-23' },
      { respondentId: 'r5', respondentName: '익명', answers: { q1: 2, q2: 3, q3: '교통비', q4: ['식대 지원'], q5: 2, q6: '경영지원팀', q7: '야근이 너무 잦습니다. 업무 효율화가 필요합니다.', q8: '불만족' }, submittedAt: '2026-03-24' },
    ],
  },
  {
    id: 's2',
    title: '사무실 이전 선호도 조사',
    description: '신규 사무실 후보지에 대한 직원 선호도를 조사합니다.',
    status: 'closed',
    anonymous: false,
    target: 'all',
    deadline: '2026-03-10',
    createdBy: '경영지원팀 박현우',
    createdAt: '2026-02-25',
    responseCount: 58,
    targetCount: 60,
    questions: [
      { id: 'q1', type: 'radio', title: '선호하는 사무실 위치는?', required: true, options: ['강남역 A빌딩', '판교 B타워', '성수동 C센터'] },
      { id: 'q2', type: 'checkbox', title: '사무실 선택 시 중요하게 생각하는 요소 (복수선택)', required: true, options: ['출퇴근 편의성', '주변 편의시설', '사무실 면적', '임대료', '주차 공간'] },
      { id: 'q3', type: 'long', title: '사무실 이전에 대한 의견이 있으시면 자유롭게 작성해주세요', required: false },
    ],
    responses: [
      { respondentId: 'r1', respondentName: '김민수', answers: { q1: '판교 B타워', q2: ['출퇴근 편의성', '주차 공간'], q3: '판교가 교통이 편리합니다' }, submittedAt: '2026-02-28' },
      { respondentId: 'r2', respondentName: '이지은', answers: { q1: '강남역 A빌딩', q2: ['출퇴근 편의성', '주변 편의시설'], q3: '' }, submittedAt: '2026-03-01' },
      { respondentId: 'r3', respondentName: '박서준', answers: { q1: '성수동 C센터', q2: ['사무실 면적', '임대료'], q3: '성수동이 트렌디하고 좋을 것 같습니다' }, submittedAt: '2026-03-02' },
    ],
  },
  {
    id: 's3',
    title: '팀 빌딩 활동 피드백',
    description: '지난 팀 빌딩 활동에 대한 피드백을 수집합니다.',
    status: 'active',
    anonymous: true,
    target: 'department',
    deadline: '2026-04-01',
    createdBy: '문화팀 최유나',
    createdAt: '2026-03-20',
    responseCount: 12,
    targetCount: 30,
    questions: [
      { id: 'q1', type: 'rating', title: '전반적인 만족도는?', required: true },
      { id: 'q2', type: 'radio', title: '가장 즐거웠던 활동은?', required: true, options: ['보드게임', '요리 체험', '방탈출', '스포츠'] },
      { id: 'q3', type: 'short', title: '다음에 해보고 싶은 활동이 있다면?', required: false },
      { id: 'q4', type: 'rating', title: '팀워크 향상에 도움이 되었나요?', required: true },
    ],
    responses: [
      { respondentId: 'r1', respondentName: '익명', answers: { q1: 5, q2: '방탈출', q3: '캠핑', q4: 5 }, submittedAt: '2026-03-22' },
      { respondentId: 'r2', respondentName: '익명', answers: { q1: 4, q2: '요리 체험', q3: '', q4: 4 }, submittedAt: '2026-03-23' },
    ],
  },
  {
    id: 's4',
    title: '신규 복지 제도 의견',
    description: '도입 검토 중인 신규 복지 제도에 대한 의견을 수렴합니다.',
    status: 'draft',
    anonymous: true,
    target: 'all',
    deadline: '',
    createdBy: '인사팀 김수진',
    createdAt: '2026-03-28',
    responseCount: 0,
    targetCount: 60,
    questions: [
      { id: 'q1', type: 'radio', title: '가장 도입을 희망하는 복지 제도는?', required: true, options: ['반려동물 동반 출근', '낮잠 시간', '자율 출퇴근', '무제한 휴가'] },
      { id: 'q2', type: 'long', title: '추가로 원하는 복지가 있으면 작성해주세요', required: false },
    ],
    responses: [],
  },
];

/* ───── Component ───── */
export default function SurveyPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | SurveyStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // View modes: 'list' | 'create' | 'detail' | 'preview' | 'respond'
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail' | 'preview' | 'respond'>('list');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [detailTab, setDetailTab] = useState<'summary' | 'individual'>('summary');

  // Create/Edit form
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAnonymous, setEditAnonymous] = useState(true);
  const [editTarget, setEditTarget] = useState<TargetType>('all');
  const [editDeadline, setEditDeadline] = useState('');
  const [editQuestions, setEditQuestions] = useState<Question[]>([]);

  // Respond form
  const [respondAnswers, setRespondAnswers] = useState<Record<string, string | string[] | number>>({});
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    if (isDemo) setSurveys(MOCK_SURVEYS);
    setLoading(false);
  }, [tenant, isDemo]);

  const filteredSurveys = useMemo(() => {
    let list = surveys;
    if (filterStatus !== 'all') list = list.filter(s => s.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    return list;
  }, [surveys, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = surveys.length;
    const active = surveys.filter(s => s.status === 'active').length;
    const closed = surveys.filter(s => s.status === 'closed').length;
    const totalResp = surveys.reduce((a, s) => a + s.responseCount, 0);
    const totalTarget = surveys.reduce((a, s) => a + s.targetCount, 0);
    const avgRate = totalTarget > 0 ? Math.round((totalResp / totalTarget) * 100) : 0;
    return { total, active, closed, avgRate };
  }, [surveys]);

  /* ─── Handlers ─── */
  const handleCreateNew = () => {
    setEditTitle('');
    setEditDesc('');
    setEditAnonymous(true);
    setEditTarget('all');
    setEditDeadline('');
    setEditQuestions([]);
    setViewMode('create');
  };

  const addQuestion = () => {
    setEditQuestions(prev => [...prev, {
      id: `q-${Date.now()}`,
      type: 'short',
      title: '',
      required: false,
      options: [],
    }]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setEditQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setEditQuestions(prev => prev.filter(q => q.id !== id));
  };

  const moveQuestion = (id: string, dir: 'up' | 'down') => {
    setEditQuestions(prev => {
      const idx = prev.findIndex(q => q.id === id);
      if (idx < 0) return prev;
      const newIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const addOption = (qId: string) => {
    setEditQuestions(prev => prev.map(q =>
      q.id === qId ? { ...q, options: [...(q.options || []), ''] } : q
    ));
  };

  const updateOption = (qId: string, optIdx: number, val: string) => {
    setEditQuestions(prev => prev.map(q =>
      q.id === qId ? { ...q, options: q.options?.map((o, i) => i === optIdx ? val : o) } : q
    ));
  };

  const removeOption = (qId: string, optIdx: number) => {
    setEditQuestions(prev => prev.map(q =>
      q.id === qId ? { ...q, options: q.options?.filter((_, i) => i !== optIdx) } : q
    ));
  };

  const handleSaveSurvey = (publish: boolean) => {
    const newSurvey: Survey = {
      id: `s-${Date.now()}`,
      title: editTitle || '제목 없는 설문',
      description: editDesc,
      status: publish ? 'active' : 'draft',
      anonymous: editAnonymous,
      target: editTarget,
      deadline: editDeadline,
      createdBy: '나',
      createdAt: new Date().toISOString().split('T')[0],
      questions: editQuestions,
      responseCount: 0,
      targetCount: 60,
      responses: [],
    };
    setSurveys(prev => [newSurvey, ...prev]);
    setViewMode('list');
  };

  const handlePreview = () => {
    const previewSurvey: Survey = {
      id: 'preview',
      title: editTitle || '제목 없는 설문',
      description: editDesc,
      status: 'active',
      anonymous: editAnonymous,
      target: editTarget,
      deadline: editDeadline,
      createdBy: '나',
      createdAt: '',
      questions: editQuestions,
      responseCount: 0,
      targetCount: 0,
      responses: [],
    };
    setSelectedSurvey(previewSurvey);
    setViewMode('preview');
  };

  const openDetail = (survey: Survey) => {
    setSelectedSurvey(survey);
    setDetailTab('summary');
    setViewMode('detail');
  };

  const openRespond = (survey: Survey) => {
    setSelectedSurvey(survey);
    setRespondAnswers({});
    setHasVoted(false);
    setViewMode('respond');
  };

  const handleSubmitResponse = () => {
    setHasVoted(true);
  };

  /* ─── Result helpers ─── */
  const getOptionCounts = (survey: Survey, qId: string, options: string[]) => {
    const counts: Record<string, number> = {};
    options.forEach(o => counts[o] = 0);
    survey.responses.forEach(r => {
      const ans = r.answers[qId];
      if (Array.isArray(ans)) ans.forEach(a => { if (counts[a] !== undefined) counts[a]++; });
      else if (typeof ans === 'string' && counts[ans] !== undefined) counts[ans]++;
    });
    return counts;
  };

  const getRatingStats = (survey: Survey, qId: string) => {
    const vals = survey.responses.map(r => r.answers[qId]).filter(v => typeof v === 'number') as number[];
    if (vals.length === 0) return { avg: 0, dist: [0, 0, 0, 0, 0], count: 0 };
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const dist = [0, 0, 0, 0, 0];
    vals.forEach(v => dist[v - 1]++);
    return { avg, dist, count: vals.length };
  };

  const getTextResponses = (survey: Survey, qId: string) => {
    return survey.responses
      .map(r => ({ name: r.respondentName, text: r.answers[qId] as string, date: r.submittedAt }))
      .filter(r => r.text && r.text.toString().trim());
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">설문조사</h1>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ═══════════ RESPOND VIEW ═══════════ */
  if (viewMode === 'respond' && selectedSurvey) {
    const sv = selectedSurvey;
    return (
      <div>
        <button onClick={() => setViewMode('list')} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={15} /> 목록으로
        </button>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-lg font-bold mb-1">{sv.title}</h2>
          <p className="text-sm text-slate-400 mb-6">{sv.description}</p>

          {hasVoted ? (
            <div className="text-center py-12">
              <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-400" />
              <p className="text-lg font-semibold mb-2">응답이 제출되었습니다!</p>
              <p className="text-sm text-slate-400">소중한 의견 감사합니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sv.questions.map((q, qi) => (
                <div key={q.id} className="rounded-lg border border-white/5 bg-white/[0.01] p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xs text-slate-500 mt-0.5">{qi + 1}.</span>
                    <div>
                      <p className="text-sm font-medium">{q.title || '질문'}</p>
                      {q.required && <span className="text-[10px] text-red-400">* 필수</span>}
                    </div>
                  </div>

                  {q.type === 'short' && (
                    <input type="text" placeholder="답변을 입력하세요"
                      className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                      value={(respondAnswers[q.id] as string) || ''}
                      onChange={e => setRespondAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} />
                  )}
                  {q.type === 'long' && (
                    <textarea placeholder="답변을 입력하세요" rows={3}
                      className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm resize-none focus:border-indigo-500 focus:outline-none"
                      value={(respondAnswers[q.id] as string) || ''}
                      onChange={e => setRespondAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} />
                  )}
                  {q.type === 'radio' && q.options?.map(opt => (
                    <label key={opt} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${respondAnswers[q.id] === opt ? 'border-indigo-500 bg-indigo-500' : 'border-white/20 group-hover:border-white/40'}`}>
                        {respondAnswers[q.id] === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm text-slate-300" onClick={() => setRespondAnswers(prev => ({ ...prev, [q.id]: opt }))}>{opt}</span>
                    </label>
                  ))}
                  {q.type === 'checkbox' && q.options?.map(opt => {
                    const selected = Array.isArray(respondAnswers[q.id]) ? (respondAnswers[q.id] as string[]).includes(opt) : false;
                    return (
                      <label key={opt} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selected ? 'border-indigo-500 bg-indigo-500' : 'border-white/20 group-hover:border-white/40'}`}
                          onClick={() => {
                            const cur = Array.isArray(respondAnswers[q.id]) ? (respondAnswers[q.id] as string[]) : [];
                            setRespondAnswers(prev => ({
                              ...prev,
                              [q.id]: selected ? cur.filter(v => v !== opt) : [...cur, opt],
                            }));
                          }}>
                          {selected && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-300">{opt}</span>
                      </label>
                    );
                  })}
                  {q.type === 'dropdown' && (
                    <select className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300 focus:outline-none w-full"
                      value={(respondAnswers[q.id] as string) || ''}
                      onChange={e => setRespondAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}>
                      <option value="">선택하세요</option>
                      {q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                  {q.type === 'rating' && (
                    <div className="flex gap-2 mt-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setRespondAnswers(prev => ({ ...prev, [q.id]: n }))}
                          className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-semibold transition-all ${(respondAnswers[q.id] as number) >= n ? 'border-amber-500 bg-amber-500/20 text-amber-400' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>
                          <Star size={16} fill={(respondAnswers[q.id] as number) >= n ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === 'date' && (
                    <input type="date"
                      className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300 focus:outline-none"
                      value={(respondAnswers[q.id] as string) || ''}
                      onChange={e => setRespondAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} />
                  )}
                  {q.type === 'file' && (
                    <div className="rounded-lg border-2 border-dashed border-white/10 p-6 text-center">
                      <Upload size={20} className="mx-auto mb-2 text-slate-500" />
                      <p className="text-xs text-slate-500">파일을 드래그하거나 클릭하여 업로드</p>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <button onClick={handleSubmitResponse}
                  className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition-colors">
                  제출하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════ PREVIEW VIEW ═══════════ */
  if (viewMode === 'preview' && selectedSurvey) {
    return (
      <div>
        <button onClick={() => setViewMode('create')} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={15} /> 편집으로 돌아가기
        </button>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-2 mb-4 text-sm text-indigo-300 flex items-center gap-2">
          <Eye size={15} /> 미리보기 모드 — 응답자에게 이렇게 보입니다
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-lg font-bold mb-1">{selectedSurvey.title || '제목 없음'}</h2>
          <p className="text-sm text-slate-400 mb-6">{selectedSurvey.description || '설명 없음'}</p>
          <div className="space-y-4">
            {selectedSurvey.questions.map((q, qi) => (
              <div key={q.id} className="rounded-lg border border-white/5 bg-white/[0.01] p-4">
                <p className="text-sm font-medium mb-2">
                  <span className="text-slate-500 mr-1">{qi + 1}.</span>
                  {q.title || '질문'} {q.required && <span className="text-red-400 text-xs">*</span>}
                </p>
                {q.type === 'short' && <div className="h-9 rounded-lg border border-white/5 bg-white/[0.02]" />}
                {q.type === 'long' && <div className="h-20 rounded-lg border border-white/5 bg-white/[0.02]" />}
                {(q.type === 'radio' || q.type === 'checkbox') && q.options?.map((o, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <div className={`w-4 h-4 border-2 border-white/20 ${q.type === 'radio' ? 'rounded-full' : 'rounded'}`} />
                    <span className="text-sm text-slate-400">{o || `옵션 ${i + 1}`}</span>
                  </div>
                ))}
                {q.type === 'dropdown' && <div className="h-9 rounded-lg border border-white/5 bg-white/[0.02] flex items-center px-3 text-sm text-slate-500">선택하세요</div>}
                {q.type === 'rating' && (
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className="w-10 h-10 rounded-lg border-2 border-white/10 flex items-center justify-center"><Star size={16} className="text-slate-600" /></div>
                    ))}
                  </div>
                )}
                {q.type === 'date' && <div className="h-9 w-48 rounded-lg border border-white/5 bg-white/[0.02] flex items-center px-3 text-sm text-slate-500"><Calendar size={14} className="mr-2" /> 날짜 선택</div>}
                {q.type === 'file' && <div className="h-20 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-xs text-slate-500"><Upload size={16} className="mr-2" />파일 업로드</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════ CREATE VIEW ═══════════ */
  if (viewMode === 'create') {
    return (
      <div>
        <button onClick={() => setViewMode('list')} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={15} /> 목록으로
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">새 설문 만들기</h1>
          <div className="flex gap-2">
            <button onClick={handlePreview} disabled={editQuestions.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30 transition-colors">
              <Eye size={15} /> 미리보기
            </button>
            <button onClick={() => handleSaveSurvey(false)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors">
              <Save size={15} /> 임시저장
            </button>
            <button onClick={() => handleSaveSurvey(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500 transition-colors">
              <Send size={15} /> 발행
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Survey info */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
            <input type="text" placeholder="설문 제목" value={editTitle} onChange={e => setEditTitle(e.target.value)}
              className="w-full text-lg font-bold bg-transparent border-b border-white/10 pb-2 focus:border-indigo-500 focus:outline-none placeholder-slate-600" />
            <textarea placeholder="설문 설명 (선택)" value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
              className="w-full text-sm bg-transparent border-b border-white/10 pb-2 resize-none focus:border-indigo-500 focus:outline-none placeholder-slate-600" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">응답 방식</label>
                <button onClick={() => setEditAnonymous(!editAnonymous)}
                  className="flex items-center gap-2 text-sm text-slate-300">
                  {editAnonymous ? <ToggleRight size={20} className="text-indigo-400" /> : <ToggleLeft size={20} className="text-slate-500" />}
                  {editAnonymous ? '익명' : '실명'}
                </button>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">대상</label>
                <select value={editTarget} onChange={e => setEditTarget(e.target.value as TargetType)}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 focus:outline-none w-full">
                  <option value="all">전체</option>
                  <option value="department">부서별</option>
                  <option value="select">선택</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">마감일</label>
                <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 focus:outline-none w-full" />
              </div>
            </div>
          </div>

          {/* Questions */}
          {editQuestions.map((q, qi) => (
            <div key={q.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-3">
                <GripVertical size={16} className="text-slate-600" />
                <span className="text-xs text-slate-500 font-mono">{qi + 1}</span>
                <select value={q.type} onChange={e => {
                  const newType = e.target.value as QuestionType;
                  const needsOptions = ['radio', 'checkbox', 'dropdown'].includes(newType);
                  updateQuestion(q.id, {
                    type: newType,
                    options: needsOptions && (!q.options || q.options.length === 0) ? ['옵션 1', '옵션 2'] : q.options,
                  });
                }}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-xs text-slate-300 focus:outline-none">
                  {QUESTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <div className="flex items-center gap-1 ml-auto">
                  <button onClick={() => updateQuestion(q.id, { required: !q.required })}
                    className={`text-xs px-2 py-1 rounded transition-colors ${q.required ? 'bg-red-500/10 text-red-400' : 'text-slate-500 hover:bg-white/5'}`}>
                    필수
                  </button>
                  <button onClick={() => moveQuestion(q.id, 'up')} disabled={qi === 0} className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"><ChevronUp size={14} /></button>
                  <button onClick={() => moveQuestion(q.id, 'down')} disabled={qi === editQuestions.length - 1} className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"><ChevronDown size={14} /></button>
                  <button onClick={() => removeQuestion(q.id)} className="p-1 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              <input type="text" placeholder="질문을 입력하세요" value={q.title}
                onChange={e => updateQuestion(q.id, { title: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 pb-2 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600 mb-3" />

              {/* Type-specific preview */}
              {q.type === 'short' && <div className="h-9 rounded-lg border border-white/5 bg-white/[0.02] flex items-center px-3 text-xs text-slate-600">단답형 텍스트</div>}
              {q.type === 'long' && <div className="h-20 rounded-lg border border-white/5 bg-white/[0.02] flex items-start p-3 text-xs text-slate-600">장문형 텍스트</div>}
              {q.type === 'rating' && (
                <div className="flex gap-2">{[1, 2, 3, 4, 5].map(n => <div key={n} className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-xs text-slate-500">{n}</div>)}</div>
              )}
              {q.type === 'date' && <div className="h-9 w-48 rounded-lg border border-white/5 bg-white/[0.02] flex items-center px-3 text-xs text-slate-600"><Calendar size={12} className="mr-2" />날짜 선택</div>}
              {q.type === 'file' && <div className="h-16 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-xs text-slate-600"><Upload size={14} className="mr-2" />파일 업로드</div>}

              {/* Options for radio/checkbox/dropdown */}
              {['radio', 'checkbox', 'dropdown'].includes(q.type) && (
                <div className="space-y-2">
                  {q.options?.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      {q.type === 'radio' && <div className="w-4 h-4 rounded-full border-2 border-white/20 shrink-0" />}
                      {q.type === 'checkbox' && <div className="w-4 h-4 rounded border-2 border-white/20 shrink-0" />}
                      {q.type === 'dropdown' && <span className="text-xs text-slate-500 w-5">{oi + 1}.</span>}
                      <input type="text" value={opt} onChange={e => updateOption(q.id, oi, e.target.value)}
                        placeholder={`옵션 ${oi + 1}`}
                        className="flex-1 bg-transparent border-b border-white/5 pb-1 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600" />
                      <button onClick={() => removeOption(q.id, oi)} className="text-slate-600 hover:text-red-400 transition-colors"><X size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => addOption(q.id)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1">+ 옵션 추가</button>
                </div>
              )}
            </div>
          ))}

          {/* Add question button */}
          <button onClick={addQuestion}
            className="w-full rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/40 py-4 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors">
            <Plus size={18} /> 질문 추가
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════ DETAIL VIEW (Results) ═══════════ */
  if (viewMode === 'detail' && selectedSurvey) {
    const sv = selectedSurvey;
    const rate = sv.targetCount > 0 ? Math.round((sv.responseCount / sv.targetCount) * 100) : 0;

    return (
      <div>
        <button onClick={() => setViewMode('list')} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={15} /> 목록으로
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{sv.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{sv.createdBy} | {sv.createdAt}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_STYLES[sv.status].color}`}>{STATUS_STYLES[sv.status].label}</span>
            <button className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 transition-colors">
              <Download size={13} /> CSV 내보내기
            </button>
          </div>
        </div>

        {/* Response rate */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">응답률</span>
            <span className="text-sm font-semibold">{sv.responseCount}/{sv.targetCount} ({rate}%)</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 ease-out" style={{ width: `${rate}%` }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-4">
          <button onClick={() => setDetailTab('summary')}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${detailTab === 'summary' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            요약 결과
          </button>
          <button onClick={() => setDetailTab('individual')}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${detailTab === 'individual' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            개별 응답 ({sv.responses.length})
          </button>
        </div>

        {detailTab === 'summary' ? (
          <div className="space-y-4">
            {sv.questions.map((q, qi) => (
              <div key={q.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <p className="text-sm font-medium mb-3"><span className="text-slate-500 mr-1.5">{qi + 1}.</span>{q.title}</p>

                {/* Radio / Checkbox / Dropdown results: bar chart */}
                {['radio', 'checkbox', 'dropdown'].includes(q.type) && q.options && (() => {
                  const counts = getOptionCounts(sv, q.id, q.options);
                  const totalResponses = q.type === 'checkbox'
                    ? sv.responses.length
                    : Object.values(counts).reduce((a, b) => a + b, 0);
                  const maxCount = Math.max(...Object.values(counts), 1);
                  return (
                    <div className="space-y-2">
                      {q.options.map(opt => {
                        const cnt = counts[opt] || 0;
                        const pct = totalResponses > 0 ? Math.round((cnt / totalResponses) * 100) : 0;
                        return (
                          <div key={opt} className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 w-28 shrink-0 truncate">{opt}</span>
                            <div className="flex-1 h-6 rounded bg-white/5 overflow-hidden">
                              <div className="h-full rounded bg-indigo-500/30 transition-all duration-700 ease-out flex items-center px-2"
                                style={{ width: `${maxCount > 0 ? (cnt / maxCount) * 100 : 0}%`, minWidth: cnt > 0 ? '24px' : '0' }}>
                                {cnt > 0 && <span className="text-[10px] text-indigo-300 font-semibold">{cnt}</span>}
                              </div>
                            </div>
                            <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Rating results */}
                {q.type === 'rating' && (() => {
                  const { avg, dist, count } = getRatingStats(sv, q.id);
                  const maxDist = Math.max(...dist, 1);
                  return (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star key={n} size={18} className={n <= Math.round(avg) ? 'text-amber-400' : 'text-slate-700'} fill={n <= Math.round(avg) ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                        <span className="text-lg font-bold text-amber-400">{avg.toFixed(1)}</span>
                        <span className="text-xs text-slate-500">({count}명 응답)</span>
                      </div>
                      <div className="space-y-1">
                        {[5, 4, 3, 2, 1].map(n => (
                          <div key={n} className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-4 text-right">{n}</span>
                            <div className="flex-1 h-4 rounded bg-white/5 overflow-hidden">
                              <div className="h-full rounded bg-amber-500/30 transition-all duration-700 ease-out"
                                style={{ width: `${(dist[n - 1] / maxDist) * 100}%`, minWidth: dist[n - 1] > 0 ? '4px' : '0' }} />
                            </div>
                            <span className="text-[10px] text-slate-500 w-5">{dist[n - 1]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Text results */}
                {['short', 'long'].includes(q.type) && (() => {
                  const texts = getTextResponses(sv, q.id);
                  return texts.length > 0 ? (
                    <div className="space-y-2">
                      {texts.map((t, i) => (
                        <div key={i} className="rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2.5">
                          <p className="text-sm text-slate-300">{t.text}</p>
                          <p className="text-[10px] text-slate-600 mt-1">{t.name} | {t.date}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-slate-500">응답 없음</p>;
                })()}

                {/* Date / File stub */}
                {q.type === 'date' && <p className="text-sm text-slate-500">날짜 응답 {sv.responses.length}건</p>}
                {q.type === 'file' && <p className="text-sm text-slate-500">파일 업로드 {sv.responses.length}건</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sv.responses.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={32} className="mx-auto mb-3 text-slate-700" />
                <p className="text-sm text-slate-400">아직 응답이 없습니다</p>
              </div>
            ) : sv.responses.map((resp, ri) => (
              <div key={ri} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">응답 #{ri + 1} — {resp.respondentName}</span>
                  <span className="text-[10px] text-slate-500">{resp.submittedAt}</span>
                </div>
                <div className="space-y-2">
                  {sv.questions.map((q, qi) => {
                    const ans = resp.answers[q.id];
                    let display = '-';
                    if (Array.isArray(ans)) display = ans.join(', ');
                    else if (typeof ans === 'number') display = `${ans}점`;
                    else if (ans) display = String(ans);
                    return (
                      <div key={q.id} className="flex gap-2">
                        <span className="text-xs text-slate-500 shrink-0">{qi + 1}.</span>
                        <div>
                          <p className="text-xs text-slate-500">{q.title}</p>
                          <p className="text-sm text-slate-300">{display}</p>
                        </div>
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

  /* ═══════════ LIST VIEW ═══════════ */
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">설문조사</h1>
          <p className="text-xs text-slate-500 mt-0.5">COMM-SURVEY</p>
        </div>
        <button onClick={handleCreateNew}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 새 설문 만들기
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: '전체 설문', value: stats.total, icon: ClipboardList, color: 'text-indigo-400' },
          { label: '진행중', value: stats.active, icon: Clock, color: 'text-emerald-400' },
          { label: '완료', value: stats.closed, icon: CheckCircle2, color: 'text-slate-400' },
          { label: '평균 응답률', value: `${stats.avgRate}%`, icon: BarChart3, color: 'text-amber-400' },
        ].map((st, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <st.icon size={15} className={st.color} />
              <span className="text-xs text-slate-500">{st.label}</span>
            </div>
            <p className="text-xl font-bold">{st.value}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1">
          {(['all', 'active', 'closed', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${filterStatus === f ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              {f === 'all' ? '전체' : STATUS_STYLES[f].label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="설문 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="rounded-lg border border-white/5 bg-white/[0.03] pl-8 pr-3 py-1.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none w-48" />
        </div>
      </div>

      {/* Survey Cards */}
      {filteredSurveys.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList size={40} className="mx-auto mb-3 text-slate-700" />
          <p className="text-sm text-slate-400">설문이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSurveys.map(sv => {
            const rate = sv.targetCount > 0 ? Math.round((sv.responseCount / sv.targetCount) * 100) : 0;
            return (
              <div key={sv.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-colors cursor-pointer group"
                onClick={() => sv.status === 'draft' ? undefined : openDetail(sv)}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold group-hover:text-indigo-300 transition-colors">{sv.title}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ml-2 ${STATUS_STYLES[sv.status].color}`}>
                    {STATUS_STYLES[sv.status].label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3 line-clamp-1">{sv.description}</p>

                {/* Progress bar */}
                {sv.status !== 'draft' && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500">{sv.responseCount}/{sv.targetCount} 응답</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{rate}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500/50 transition-all duration-700 ease-out" style={{ width: `${rate}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-600">
                  <span>{sv.createdBy}</span>
                  <div className="flex items-center gap-3">
                    <span>{sv.questions.length}문항</span>
                    {sv.deadline && <span>마감 {sv.deadline}</span>}
                  </div>
                </div>

                {sv.status === 'active' && (
                  <button onClick={e => { e.stopPropagation(); openRespond(sv); }}
                    className="mt-3 w-full rounded-lg border border-indigo-500/30 bg-indigo-500/5 py-2 text-xs text-indigo-400 font-semibold hover:bg-indigo-500/10 transition-colors">
                    응답하기
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
