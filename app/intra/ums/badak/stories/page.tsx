"use client";

import { useState, useEffect } from "react";
import {
  Plus, Edit3, Trash2, Eye, EyeOff, ArrowRight,
  Loader2, RefreshCw, X, Send, BookOpen,
} from "lucide-react";
import { PageHeader, Card } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Member {
  id: string;
  display_name: string;
  job_function: string | null;
}

interface Story {
  id: string;
  title: string;
  content: string | null;
  before_role: string | null;
  after_role: string | null;
  published: boolean | null;
  created_at: string;
  member: Member | null;
}

const EMPTY_FORM = {
  title: "",
  content: "",
  before_role: "",
  after_role: "",
  member_id: "",
  published: false,
};

export default function BadakStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [storiesRes, membersRes] = await Promise.all([
        fetch("/api/badak/stories?all=true"),
        createClient().from("badak_members").select("id, display_name, job_function").order("display_name"),
      ]);
      const storiesData = await storiesRes.json();
      setStories(storiesData.stories ?? []);
      setMembers((membersRes.data ?? []) as Member[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(story: Story) {
    setEditId(story.id);
    setForm({
      title: story.title,
      content: story.content ?? "",
      before_role: story.before_role ?? "",
      after_role: story.after_role ?? "",
      member_id: (story.member as Member | null)?.id ?? "",
      published: story.published ?? false,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...(editId ? { id: editId } : {}),
        title: form.title,
        content: form.content || null,
        before_role: form.before_role || null,
        after_role: form.after_role || null,
        member_id: form.member_id || null,
        published: form.published,
      };
      const res = await fetch("/api/badak/stories", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowModal(false);
        await loadAll();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "저장 실패");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(story: Story) {
    const res = await fetch("/api/badak/stories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: story.id, published: !story.published }),
    });
    if (res.ok) {
      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, published: !s.published } : s))
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/badak/stories?id=${id}`, { method: "DELETE" });
      if (res.ok) setStories((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const published = stories.filter((s) => s.published);
  const drafts = stories.filter((s) => !s.published);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="스토리 관리"
        description="바닥 성장 스토리를 작성·발행합니다"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" /> 새로고침
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> 스토리 작성
          </button>
        </div>
      </PageHeader>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "전체 스토리", value: stories.length, color: "text-gray-900" },
          { label: "발행됨", value: published.length, color: "text-emerald-600" },
          { label: "초안", value: drafts.length, color: "text-amber-600" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </Card>
        ))}
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : stories.length === 0 ? (
        <Card className="py-16 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">작성된 스토리가 없습니다</p>
          <button onClick={openCreate} className="mt-4 text-sm text-indigo-600 hover:underline">
            첫 스토리 작성하기
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <Card key={story.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* 상태 + 전환 뱃지 */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        story.published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {story.published ? "발행됨" : "초안"}
                    </span>
                    {story.before_role && story.after_role && (
                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5">{story.before_role}</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700 font-medium">
                          {story.after_role}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* 제목 */}
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug">{story.title}</h3>

                  {/* 본문 미리보기 */}
                  {story.content && (
                    <p className="mt-1.5 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {story.content}
                    </p>
                  )}

                  {/* 작성자 + 날짜 */}
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-400">
                    {story.member && (
                      <>
                        <span className="font-medium text-gray-600">{story.member.display_name}</span>
                        {story.member.job_function && <span>· {story.member.job_function}</span>}
                        <span>·</span>
                      </>
                    )}
                    <span>{new Date(story.created_at).toLocaleDateString("ko-KR")}</span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(story)}
                    title={story.published ? "비공개로 전환" : "발행"}
                    className={`rounded-lg p-2 transition-colors ${
                      story.published
                        ? "text-emerald-600 hover:bg-emerald-50"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {story.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(story)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(story.id)}
                    disabled={deletingId === story.id}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    {deletingId === story.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 작성/수정 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                {editId ? "스토리 수정" : "스토리 작성"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* 제목 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="예: 바닥에서 만난 개발자 덕분에 사이드 프로젝트가 회사가 됐어요"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              {/* 전환 전/후 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">전환 전 역할</label>
                  <input
                    value={form.before_role}
                    onChange={(e) => setForm({ ...form, before_role: e.target.value })}
                    placeholder="예: 에이전시 AE"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">전환 후 역할</label>
                  <input
                    value={form.after_role}
                    onChange={(e) => setForm({ ...form, after_role: e.target.value })}
                    placeholder="예: 인하우스 브랜드 매니저"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* 본문 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">본문</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="스토리 본문을 입력하세요..."
                  rows={6}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                />
              </div>

              {/* 멤버 연결 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">멤버 연결 (선택)</label>
                <select
                  value={form.member_id}
                  onChange={(e) => setForm({ ...form, member_id: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 bg-white"
                >
                  <option value="">— 멤버 선택 안 함 —</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.display_name}{m.job_function ? ` (${m.job_function})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* 발행 여부 */}
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                <button
                  onClick={() => setForm({ ...form, published: !form.published })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    form.published ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.published ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    {form.published ? "즉시 발행" : "초안으로 저장"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {form.published
                      ? "저장 즉시 바닥 스토리 페이지에 공개됩니다"
                      : "발행 전까지 바닥 사용자에게 노출되지 않습니다"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim() || saving}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {saving ? "저장 중..." : editId ? "수정 저장" : "스토리 등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
