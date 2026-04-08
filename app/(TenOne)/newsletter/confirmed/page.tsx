import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default function NewsletterConfirmedPage({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    const hasError = !!searchParams.error;

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center">
                {hasError ? (
                    <>
                        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <h1 className="text-xl font-bold mb-2">확인에 실패했습니다</h1>
                        <p className="text-sm tn-text-sub mb-6">
                            링크가 만료되었거나 유효하지 않습니다.<br />
                            뉴스레터 페이지에서 다시 신청해주세요.
                        </p>
                        <Link href="/newsletter" className="text-sm underline underline-offset-2 tn-text-sub hover:text-neutral-700">
                            뉴스레터 페이지로 →
                        </Link>
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold mb-2">구독이 완료되었습니다!</h1>
                        <p className="text-sm tn-text-sub mb-6">
                            Ten:One™ Universe의 소식을 가장 먼저 받아보실 수 있습니다.
                        </p>
                        <Link href="/" className="text-sm underline underline-offset-2 tn-text-sub hover:text-neutral-700">
                            홈으로 →
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
