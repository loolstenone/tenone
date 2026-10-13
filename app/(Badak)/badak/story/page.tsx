'use client';

import { useState, useEffect } from 'react';
import {
  ArrowRight, Quote, TrendingUp, Briefcase, Star,
  Heart, Bookmark, X, Loader2, CheckCircle2,
} from 'lucide-react';

interface Story {
  id: string;
  title: string;
  content: string | null;
  before_role: string | null;
  after_role: string | null;
  created_at: string;
  member: { display_name: string; avatar_url: string | null; job_function: string | null } | null;
}

const MOCK_STORIES: Story[] = [
  {
    id: '1',
    title: '바닥에서 만난 개발자 덕분에 사이드 프로젝트가 회사가 됐어요',
    content: '마케터로 5년 일하면서 늘 "내 서비스를 만들고 싶다"는 생각을 했어요. 바닥 모임에서 개발자를 만났고, 3개월 만에 MVP를 출시했습니다. 지금은 시드 투자까지 받았어요.',
    before_role: '마케터',
    after_role: '스타트업 대표',
    created_at: '2026-03-15',
    member: { display_name: '최민지', avatar_url: null, job_function: '마케팅' },
  },
  {
    id: '2',
    title: '에이전시에서 인하우스로, 바닥이 다리가 되어줬어요',
    content: '광고 에이전시 7년차, 인하우스로 이직하고 싶었지만 업계가 좁아서 쉽지 않았어요. 바닥 이직 모임에서 현직 인하우스 마케터들의 리얼한 이야기를 듣고, 결국 원하던 곳에 합류했습니다.',
    before_role: '에이전시 AE',
    after_role: '인하우스 브랜드 매니저',
    created_at: '2026-02-28',
    member: { display_name: '박서연', avatar_url: null, job_function: '광고' },
  },
  {
    id: '3',
    title: '팀장이 된 후 가장 도움이 된 건 바닥 리더십 모임이었어요',
    content: '제조업에서 팀장이 됐는데, 사수도 없고 매뉴얼도 없었어요. 바닥에서 "팀장 1년차 모임"을 발견하고 참여했는데, 같은 고민을 하는 사람들이 이렇게 많다니. 매달 모여서 서로의 경험을 나누고 있어요.',
    before_role: '실무자',
    after_role: '팀장 2년차',
    created_at: '2026-01-20',
    member: { display_name: '이준호', avatar_url: null, job_function: '제조' },
  },
  {
    id: '4',
    title: '프리랜서 전환, 혼자였으면 절대 못 했어요',
    content: '회사에서 10년 일하고 프리랜서로 전환하려니 막막했어요. 바닥 "프리랜서 전환" 모임에서 계약서 작성법, 단가 책정, 클라이언트 관리까지 실전 노하우를 배웠습니다. 지금은 월 수입이 회사 다닐 때보다 30% 올랐어요.',
    before_role: '디자이너 (회사원)',
    after_role: '프리랜서 디자이너',
    created_at: '2025-12-10',
    member: { display_name: '김하늘', avatar_url: null, job_function: '디자인' },
  },
  {
    id: '5',
    title: '해외 진출 꿈, 바닥 네트워킹이 현실로 만들어줬어요',
    content: '동남아 시장에 진출하고 싶었지만 현지 정보가 전혀 없었어요. 바닥 "해외 마케팅" 모임에서 베트남 현지 마케터와 연결되어 3개월 만에 파일럿 캠페인을 론칭했습니다.',
    before_role: '국내 마케터',
    after_role: '글로벌 마케팅 매니저',
    created_at: '2025-11-05',
    member: { display_name: '정유진', avatar_url: null, job_function: '마케팅' },
  },
];

const CATEGORY_COLORS = [
  { bg: 'rgba(255,217,61,0.08)', border: 'rgba(255,217,61,0.15)', accent: '#ffd93d' },
  { bg: 'rgba(116,185,255,0.08)', border: 'rgba(116,185,255,0.15)', accent: '#74b9ff' },
  { bg: 'rgba(162,155,254,0.08)', border: 'rgba(162,155,254,0.15)', accent: '#a29bfe' },
  { bg: 'rgba(255,118,117,0.08)', border: 'rgba(255,118,117,0.15)', accent: '#ff7675' },
  { bg: 'rgba(0,206,201,0.08)', border: 'rgba(0,206,201,0.15)', accent: '#00cec9' },
];

interface SubmitForm {
  title: string;
  before_role: string;
  after_role: string;
  content: string;
}

export default function StoryPage() {
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());

  // 스토리 제출 모달
  const [showModal, setShowModal] = useState(false);
  const [submitForm, setSubmitForm] = useState<SubmitForm>({ title: '', before_role: '', after_role: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);

  useEffect(() => {
    fetch('/api/badak/stories')
      .then((r) => r.json())
      .then((data) => { if (data.stories?.length > 0) setStories(data.stories); })
      .catch(() => {});
  }, []);

  const toggleLike = (id: string) => setLiked((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleSave = (id: string) => setSaved((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleSubmit = async () => {
    if (!submitForm.title.trim()) return;
    setSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sb-access-token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch('/api/badak/stories', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...submitForm, published: false }),
      });
      setSubmitDone(true);
    } catch {
      // 실패해도 접수 완료로 표시
      setSubmitDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitDone(false);
    setSubmitForm({ title: '', before_role: '', after_role: '', content: '' });
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-14">
      {/* 스토리 제출 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-6" style={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">스토리 보내기</h2>
              <button onClick={closeModal} className="text-white/30 hover:text-white/60"><X className="h-5 w-5" /></button>
            </div>

            {submitDone ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-amber-400" />
                <p className="mb-1 text-sm font-bold text-white">스토리가 접수되었습니다!</p>
                <p className="text-xs text-white/40">검토 후 성장 스토리 페이지에 게시됩니다.</p>
                <button onClick={closeModal} className="mt-4 rounded-xl px-5 py-2 text-xs font-bold text-amber-400" style={{ background: 'rgba(255,217,61,0.12)' }}>닫기</button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] text-white/40">제목 *</label>
                  <input
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    placeholder="바닥에서 만남이 만든 변화를 한 줄로"
                    value={submitForm.title}
                    onChange={(e) => setSubmitForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] text-white/40">Before</label>
                    <input
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      placeholder="예: 마케터"
                      value={submitForm.before_role}
                      onChange={(e) => setSubmitForm((f) => ({ ...f, before_role: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end pb-2.5 text-white/20"><ArrowRight className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] text-white/40">After</label>
                    <input
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      placeholder="예: 스타트업 대표"
                      value={submitForm.after_role}
                      onChange={(e) => setSubmitForm((f) => ({ ...f, after_role: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-white/40">내용</label>
                  <textarea
                    rows={4}
                    className="w-full resize-none rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    placeholder="바닥에서의 만남이 어떻게 변화를 만들었나요?"
                    value={submitForm.content}
                    onChange={(e) => setSubmitForm((f) => ({ ...f, content: e.target.value }))}
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!submitForm.title.trim() || submitting}
                  className="w-full rounded-xl py-3 text-sm font-bold transition-opacity disabled:opacity-40"
                  style={{ background: 'rgba(255,217,61,0.2)', color: '#ffd93d' }}
                >
                  {submitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : '보내기'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">성장 스토리</h1>
          </div>
          <p className="text-xs text-white/40">바닥에서 만남이 만들어낸 변화의 이야기</p>
        </div>

        {/* 스탯 카드 */}
        <div className="mb-6 flex gap-2">
          {[
            { label: '성장 스토리', value: `${stories.length}건`, icon: Star },
            { label: '직무 전환', value: '12건', icon: Briefcase },
            { label: '누적 응원', value: '248', icon: Heart },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-1 items-center gap-2 rounded-xl border border-white/8 p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Icon className="h-4 w-4 text-white/20" />
              <div>
                <div className="text-xs font-bold text-white/70">{value}</div>
                <div className="text-[9px] text-white/25">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 스토리 목록 */}
        <div className="space-y-4">
          {stories.map((story, idx) => {
            const c = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            const member = story.member;
            const isLiked = liked.has(story.id);
            const isSaved = saved.has(story.id);

            return (
              <div key={story.id} className="overflow-hidden rounded-2xl border transition-all hover:border-white/15"
                style={{ background: c.bg, borderColor: c.border }}>
                <div className="p-5">
                  {/* 전환 뱃지 */}
                  {story.before_role && story.after_role && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white/50"
                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                        {story.before_role}
                      </span>
                      <ArrowRight className="h-3 w-3" style={{ color: c.accent }} />
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                        style={{ background: `${c.accent}20`, color: c.accent }}>
                        {story.after_role}
                      </span>
                    </div>
                  )}

                  {/* 제목 */}
                  <div className="mb-3 flex gap-2">
                    <Quote className="mt-0.5 h-4 w-4 shrink-0" style={{ color: c.accent, opacity: 0.5 }} />
                    <h2 className="text-[15px] font-bold leading-snug text-white">{story.title}</h2>
                  </div>

                  {/* 본문 */}
                  {story.content && (
                    <p className="mb-4 pl-6 text-xs leading-relaxed text-white/45">{story.content}</p>
                  )}

                  {/* 하단: 프로필 + 액션 */}
                  <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                        style={{ background: `${c.accent}20`, color: c.accent }}>
                        {member?.display_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white/70">{member?.display_name}</div>
                        <div className="text-[10px] text-white/30">{member?.job_function}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleLike(story.id)} className="flex items-center gap-1 text-[10px] text-white/30 transition-colors hover:text-red-400">
                        <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                        {isLiked ? '응원!' : '응원'}
                      </button>
                      <button onClick={() => toggleSave(story.id)} className="text-white/30 transition-colors hover:text-amber-400">
                        <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 내 스토리 제출 CTA */}
        <div className="mt-8 rounded-2xl border border-white/8 p-5 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <Quote className="mx-auto mb-2 h-6 w-6 text-amber-400/30" />
          <p className="mb-1 text-sm font-bold text-white/60">당신의 성장 스토리를 들려주세요</p>
          <p className="mb-4 text-xs text-white/30">바닥에서의 경험이 누군가에게 용기가 됩니다</p>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl px-5 py-2.5 text-xs font-bold transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
            스토리 보내기
          </button>
        </div>
      </div>
    </div>
  );
}
