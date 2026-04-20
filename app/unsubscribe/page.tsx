"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

function UnsubscribeContent() {
    const params = useSearchParams();
    const token = params.get('token');
    const done = params.get('done');
    const errorParam = params.get('error');

    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<'done' | 'error' | null>(done ? 'done' : errorParam ? 'error' : null);
    const [errorMsg, setErrorMsg] = useState(errorParam ?? '');

    const handleConfirm = async () => {
        if (!token) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`, { method: 'POST', body: `token=${encodeURIComponent(token)}`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            const data = await res.json();
            if (res.ok) setResult('done');
            else { setResult('error'); setErrorMsg(data.error ?? '처리 실패'); }
        } catch (e) {
            setResult('error');
            setErrorMsg(e instanceof Error ? e.message : '네트워크 오류');
        } finally { setProcessing(false); }
    };

    // 이미 done/error 상태로 진입한 경우 바로 결과 표시
    useEffect(() => {
        if (done) setResult('done');
        if (errorParam) { setResult('error'); setErrorMsg(errorParam); }
    }, [done, errorParam]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
            <div className="max-w-md w-full bg-white border border-neutral-200 p-8 text-center">
                <img src="/logo-horizontal.png" alt="Ten:One Universe" width={140} className="mx-auto mb-6 opacity-70" />

                {result === 'done' ? (
                    <>
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                        <h1 className="text-lg font-bold mb-2">수신거부가 완료되었습니다</h1>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            앞으로 이메일을 받지 않습니다.<br />
                            그동안 관심 가져주셔서 감사합니다.
                        </p>
                    </>
                ) : result === 'error' ? (
                    <>
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                        <h1 className="text-lg font-bold mb-2">처리할 수 없습니다</h1>
                        <p className="text-sm text-neutral-500 mb-2">{errorMsg || '유효하지 않은 링크입니다.'}</p>
                        <p className="text-[11px] text-neutral-400">
                            지속적으로 문제가 발생하면 <a href="mailto:lools@tenone.biz" className="underline">lools@tenone.biz</a>로 연락주세요.
                        </p>
                    </>
                ) : token ? (
                    <>
                        <Mail className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                        <h1 className="text-lg font-bold mb-2">수신거부 확인</h1>
                        <p className="text-sm text-neutral-500 mb-6">
                            정말로 이 이메일 주소로의<br />뉴스레터·마케팅 메일 수신을 거부하시겠습니까?
                        </p>
                        <button onClick={handleConfirm} disabled={processing}
                            className="w-full py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
                            {processing ? '처리 중...' : '수신거부'}
                        </button>
                        <Link href="/" className="block mt-3 text-xs text-neutral-400 hover:text-neutral-700">돌아가기</Link>
                    </>
                ) : (
                    <>
                        <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                        <h1 className="text-lg font-bold mb-2">유효하지 않은 링크</h1>
                        <p className="text-sm text-neutral-500">수신거부 토큰이 없습니다. 메일에서 제공된 링크를 정확히 클릭해주세요.</p>
                    </>
                )}

                <p className="text-[10px] text-neutral-400 mt-8 pt-6 border-t border-neutral-100">
                    Ten:One™ Universe · tenone.biz
                </p>
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">불러오는 중...</div>}>
            <UnsubscribeContent />
        </Suspense>
    );
}
