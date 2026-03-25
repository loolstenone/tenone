'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MessageCircle, Check, Clock, X } from 'lucide-react';
import { fetchBadakProfile, createConnection, checkConnectionStatus } from '@/lib/supabase/badak';
import ProfileCard from '@/components/badak/ProfileCard';
import type { BadakProfile } from '@/types/badak';
import Link from 'next/link';

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<BadakProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connStatus, setConnStatus] = useState<'none' | 'pending' | 'accepted' | 'declined'>('none');
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchBadakProfile(id).then(p => { setProfile(p); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (user?.id && id && user.id !== id) {
      checkConnectionStatus(user.id, id).then(setConnStatus);
    }
  }, [user, id]);

  const handleConnect = async () => {
    if (!user?.id || !id || !message.trim()) return;
    setSending(true);
    const result = await createConnection(user.id, id, message.trim());
    if (result) {
      setConnStatus('pending');
      setShowModal(false);
      setMessage('');
    }
    setSending(false);
  };

  if (loading) {
    return <div className="flex min-h-[calc(100vh-56px)] items-center justify-center"><div className="h-8 w-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  if (!profile) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center">
        <div className="text-4xl mb-3">😕</div>
        <p className="text-neutral-500">프로필을 찾을 수 없습니다</p>
        <Link href="/bk/explore" className="mt-3 text-sm text-blue-600 hover:underline">탐색으로 돌아가기</Link>
      </div>
    );
  }

  const isOwn = user?.id === id;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-neutral-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <ProfileCard profile={profile} variant="full" />

        {/* 액션 버튼 */}
        <div className="mt-6">
          {isOwn ? (
            <Link href="/bk/my" className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              프로필 수정
            </Link>
          ) : connStatus === 'accepted' ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-5 py-3 text-sm text-emerald-700">
              <Check size={16} /> 연결됨
            </div>
          ) : connStatus === 'pending' ? (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-5 py-3 text-sm text-amber-700">
              <Clock size={16} /> 연결 요청 대기 중
            </div>
          ) : (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <MessageCircle size={16} /> 만나고 싶다
            </button>
          )}
        </div>

        {/* 연결 요청 모달 */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-900">만나고 싶다</h3>
                <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600"><X size={20} /></button>
              </div>
              <p className="text-sm text-neutral-500 mb-4">{profile.displayName}님에게 연결 요청을 보냅니다. 간단한 소개와 이유를 적어주세요.</p>
              <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={200} rows={4}
                placeholder="저는 ~하고 있는데, ~에 대해 이야기 나누고 싶습니다"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm resize-none focus:border-blue-600 focus:outline-none" />
              <div className="mt-1 text-right text-xs text-neutral-400">{message.length}/200</div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50">취소</button>
                <button onClick={handleConnect} disabled={!message.trim() || sending}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
                  {sending ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '보내기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
