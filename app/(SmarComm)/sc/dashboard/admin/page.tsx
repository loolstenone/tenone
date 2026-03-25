'use client';

import { useState } from 'react';
import { Plus, Edit3, Trash2, Eye, EyeOff, Globe, FileText, Users, Settings, BarChart3, Search, ExternalLink } from 'lucide-react';
import { BLOG_POSTS, type BlogPost } from '@/lib/smarcomm/blog-data';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

type AdminTab = 'blog' | 'pages' | 'members' | 'seo' | 'settings';

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('blog');
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [search, setSearch] = useState('');

  // 에디터 폼 상태
  const [form, setForm] = useState({ title: '', slug: '', summary: '', content: '', category: 'GEO/SEO', tags: '', published: true });

  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setForm({ title: post.title, slug: post.slug, summary: post.summary, content: post.content, category: post.category, tags: post.tags.join(', '), published: post.published });
    } else {
      setEditingPost(null);
      setForm({ title: '', slug: '', summary: '', content: '', category: 'GEO/SEO', tags: '', published: true });
    }
    setShowEditor(true);
  };

  const savePost = () => {
    const now = new Date().toISOString().split('T')[0];
    const newPost: BlogPost = {
      id: editingPost?.id ?? `b${Date.now()}`,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title: form.title, summary: form.summary, content: form.content,
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      author: 'SmarComm 팀',
      publishedAt: editingPost?.publishedAt ?? now,
      readTime: Math.ceil(form.content.length / 500),
      published: form.published,
    };
    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? newPost : p));
    } else {
      setPosts([newPost, ...posts]);
    }
    setShowEditor(false);
    setEditingPost(null);
  };

  const deletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const togglePublish = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, published: !p.published } : p));
  };

  const filteredPosts = posts.filter(p => !search || p.title.includes(search) || p.category.includes(search));

  const TABS = [
    { id: 'blog' as AdminTab, label: '블로그 관리', icon: FileText },
    { id: 'pages' as AdminTab, label: '페이지 관리', icon: Globe },
    { id: 'seo' as AdminTab, label: 'SEO 설정', icon: BarChart3 },
    { id: 'members' as AdminTab, label: '회원 관리', icon: Users },
    { id: 'settings' as AdminTab, label: '사이트 설정', icon: Settings },
  ];

  const inputClass = "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none";

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6">
        <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">사이트 관리</h1><GuideHelpButton /></div>
        <p className="mt-1 text-xs text-text-muted">블로그, 페이지, SEO, 회원을 관리합니다</p>
      </div>

      {/* 탭 */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${tab === t.id ? 'border-text text-text' : 'border-transparent text-text-muted hover:text-text-sub'}`}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── 블로그 관리 ── */}
      {tab === 'blog' && (
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="글 검색..."
                className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
            </div>
            <button onClick={() => openEditor()} className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-xs font-semibold text-white hover:bg-accent-sub">
              <Plus size={13} /> 새 글 작성
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-muted">
                  <th className="px-4 py-3 text-left font-medium">제목</th>
                  <th className="px-4 py-3 text-left font-medium">카테고리</th>
                  <th className="px-4 py-3 text-center font-medium">상태</th>
                  <th className="px-4 py-3 text-left font-medium">작성일</th>
                  <th className="px-4 py-3 text-right font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map(post => (
                  <tr key={post.id} className="border-b border-border last:border-0 hover:bg-surface">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text">{post.title}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">/blog/{post.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-text-sub">{post.category}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => togglePublish(post.id)} title={post.published ? '발행됨' : '비공개'}>
                        {post.published ? <Eye size={14} className="mx-auto text-success" /> : <EyeOff size={14} className="mx-auto text-text-muted" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">{post.publishedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`/blog/${post.slug}`} target="_blank" className="text-text-muted hover:text-text"><ExternalLink size={13} /></a>
                        <button onClick={() => openEditor(post)} className="text-text-muted hover:text-text"><Edit3 size={13} /></button>
                        <button onClick={() => deletePost(post.id)} className="text-text-muted hover:text-danger"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 페이지 관리 ── */}
      {tab === 'pages' && (
        <div className="rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted">
                <th className="px-4 py-3 text-left font-medium">페이지</th>
                <th className="px-4 py-3 text-left font-medium">경로</th>
                <th className="px-4 py-3 text-center font-medium">상태</th>
                <th className="px-4 py-3 text-right font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: '홈 (랜딩)', path: '/', status: '활성' },
                { name: '요금제', path: '/pricing', status: '활성' },
                { name: '무료 진단', path: '/scan', status: '활성' },
                { name: '블로그', path: '/blog', status: '활성' },
                { name: '로그인', path: '/login', status: '활성' },
                { name: '회원가입', path: '/signup', status: '활성' },
              ].map((page, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-4 py-3 font-medium text-text">{page.name}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{page.path}</td>
                  <td className="px-4 py-3 text-center"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">{page.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <a href={page.path} target="_blank" className="text-text-muted hover:text-text"><ExternalLink size={13} /></a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SEO 설정 ── */}
      {tab === 'seo' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-text">메타 태그 기본값</h3>
            <div className="space-y-3">
              <div><label className="block text-xs text-text-muted mb-1">사이트 제목</label><input defaultValue="SmarComm. — AI 마케팅 커뮤니케이션 플랫폼" className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">사이트 설명</label><textarea defaultValue="AI 검색 시대의 올인원 마케팅 플랫폼. GEO/SEO 진단부터 소재 제작, 광고 집행, 성과 분석까지." rows={2} className={`${inputClass} resize-none`} /></div>
              <div><label className="block text-xs text-text-muted mb-1">OG 이미지 URL</label><input placeholder="https://smarcomm.com/og-image.png" className={inputClass} /></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-text">검색 엔진 설정</h3>
            <div className="space-y-3">
              <div><label className="block text-xs text-text-muted mb-1">Google Search Console 인증 코드</label><input placeholder="google-site-verification=..." className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">네이버 서치어드바이저 인증 코드</label><input placeholder="naver-site-verification=..." className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">robots.txt 설정</label><textarea defaultValue={`User-agent: *\nAllow: /\nSitemap: https://smarcomm.com/sitemap.xml`} rows={3} className={`${inputClass} resize-none font-mono text-xs`} /></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-text">추적 코드</h3>
            <div className="space-y-3">
              <div><label className="block text-xs text-text-muted mb-1">Google Analytics (GA4) 측정 ID</label><input placeholder="G-XXXXXXXXXX" className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">Meta Pixel ID</label><input placeholder="1234567890" className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">커스텀 헤드 코드</label><textarea placeholder="<head> 태그에 삽입할 추가 코드" rows={3} className={`${inputClass} resize-none font-mono text-xs`} /></div>
            </div>
          </div>
        </div>
      )}

      {/* ── 회원 관리 ── */}
      {tab === 'members' && (
        <div className="rounded-2xl border border-border bg-white">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">등록 회원</h3>
            <span className="text-xs text-text-muted">3명</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted">
                <th className="px-4 py-2.5 text-left font-medium">이메일</th>
                <th className="px-4 py-2.5 text-left font-medium">플랜</th>
                <th className="px-4 py-2.5 text-left font-medium">가입일</th>
                <th className="px-4 py-2.5 text-left font-medium">최근 활동</th>
                <th className="px-4 py-2.5 text-center font-medium">진단 횟수</th>
              </tr>
            </thead>
            <tbody>
              {[
                { email: 'admin@smarcomm.com', plan: '관리자', joined: '2026-03-01', lastActive: '2026-03-22', scans: 24 },
                { email: 'kim@goodfresh.co.kr', plan: 'Lite', joined: '2026-03-05', lastActive: '2026-03-21', scans: 8 },
                { email: 'lee@styleon.kr', plan: 'Free', joined: '2026-03-10', lastActive: '2026-03-18', scans: 3 },
              ].map((member, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-4 py-3 font-medium text-text">{member.email}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${member.plan === '관리자' ? 'bg-text/10 text-text' : member.plan === 'Free' ? 'bg-surface text-text-muted' : 'bg-emerald-50 text-emerald-600'}`}>{member.plan}</span></td>
                  <td className="px-4 py-3 text-xs text-text-muted">{member.joined}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{member.lastActive}</td>
                  <td className="px-4 py-3 text-center text-xs font-medium text-text">{member.scans}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 사이트 설정 ── */}
      {tab === 'settings' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-text">기본 정보</h3>
            <div className="space-y-3">
              <div><label className="block text-xs text-text-muted mb-1">사이트 이름</label><input defaultValue="SmarComm." className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">사이트 URL</label><input defaultValue="https://smarcomm.com" className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">관리자 이메일</label><input defaultValue="admin@smarcomm.com" className={inputClass} /></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-text">공지사항</h3>
            <div className="space-y-3">
              <div><label className="block text-xs text-text-muted mb-1">상단 공지 배너 (비워두면 비표시)</label><input placeholder="봄 시즌 프로모션 — Lite 플랜 30% 할인" className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">배너 링크</label><input placeholder="/pricing" className={inputClass} /></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-text">SNS 연결</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-text-muted mb-1">Instagram</label><input placeholder="https://instagram.com/smarcomm" className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">YouTube</label><input placeholder="https://youtube.com/@smarcomm" className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">블로그</label><input placeholder="https://blog.smarcomm.com" className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">카카오 채널</label><input placeholder="https://pf.kakao.com/smarcomm" className={inputClass} /></div>
            </div>
          </div>
        </div>
      )}

      {/* ══════ 블로그 에디터 모달 ══════ */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowEditor(false)}>
          <div className="w-[640px] max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-text">{editingPost ? '글 수정' : '새 글 작성'}</h3>
              <button onClick={() => setShowEditor(false)} className="text-text-muted hover:text-text">✕</button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs text-text-muted mb-1">제목</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">슬러그 (URL)</label><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="자동 생성" className={inputClass} /></div>
              <div><label className="block text-xs text-text-muted mb-1">요약</label><textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={2} className={`${inputClass} resize-none`} /></div>
              <div><label className="block text-xs text-text-muted mb-1">본문</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10} className={`${inputClass} resize-none font-mono text-xs`} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-text-muted mb-1">카테고리</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass}>
                    {['GEO/SEO', '광고', '그로스', '소재', 'CRM', '사례', '트렌드'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs text-text-muted mb-1">태그 (쉼표 구분)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} id="published" className="rounded" />
                <label htmlFor="published" className="text-xs text-text-sub">발행 (체크 해제 시 비공개)</label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowEditor(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text">취소</button>
              <button onClick={savePost} disabled={!form.title.trim()} className="rounded-xl bg-text px-4 py-2 text-sm font-semibold text-white hover:bg-accent-sub disabled:opacity-50">
                {editingPost ? '저장' : '발행'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
