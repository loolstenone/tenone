"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Check, Clock, XCircle, AlertCircle, Plus, X } from "lucide-react";
import { PageHeader } from "@/features/jakka/PageHeader";
import {
    getMyCreatorProfile,
    getMySellerApplication,
    createSellerApplication,
    withdrawSellerApplication,
    type JakkaCreator,
    type SellerApplication,
    type ProductCategory,
} from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";
import { currentLoginHref } from "@/lib/login-href";

const CATEGORIES: ProductCategory[] = ["원화", "프린트", "굿즈", "피규어", "포스터", "사진", "기타"];

export default function MarketApplyPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [creator, setCreator] = useState<JakkaCreator | null>(null);
    const [application, setApplication] = useState<SellerApplication | null>(null);
    const [loading, setLoading] = useState(true);

    // 폼 상태
    const [intro, setIntro] = useState("");
    const [primaryCategory, setPrimaryCategory] = useState<ProductCategory | "">("");
    const [portfolioUrls, setPortfolioUrls] = useState<string[]>([""]);
    const [sellerType, setSellerType] = useState<"individual" | "business">("individual");
    const [businessName, setBusinessName] = useState("");
    const [businessNumber, setBusinessNumber] = useState("");
    const [taxEmail, setTaxEmail] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [bankHolder, setBankHolder] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreeFee, setAgreeFee] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || !user) { router.push(currentLoginHref()); return; }
        (async () => {
            const c = await getMyCreatorProfile(user.authId ?? user.id);
            if (!c) { router.push("/jakka/profile"); return; }
            setCreator(c);
            const app = await getMySellerApplication(c.id);
            setApplication(app);
            setLoading(false);
        })();
    }, [authLoading, isAuthenticated, user, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!creator) return;
        if (!intro.trim() || !primaryCategory) { setError("자기소개와 주력 카테고리를 입력해주세요."); return; }
        if (!bankName.trim() || !bankAccount.trim() || !bankHolder.trim()) { setError("정산 계좌 정보를 모두 입력해주세요."); return; }
        if (sellerType === "business" && (!businessName.trim() || !businessNumber.trim())) {
            setError("사업자 정보를 모두 입력해주세요."); return;
        }
        if (!agreeTerms || !agreeFee || !agreePrivacy) { setError("모든 약관에 동의해주세요."); return; }

        setSubmitting(true); setError(null);
        const res = await createSellerApplication({
            creatorId: creator.id,
            intro: intro.trim(),
            primaryCategory,
            portfolioUrls: portfolioUrls.filter((u) => u.trim()),
            sellerType,
            businessName: businessName.trim() || undefined,
            businessNumber: businessNumber.trim() || undefined,
            taxInvoiceEmail: taxEmail.trim() || undefined,
            bankName: bankName.trim(),
            bankAccountNumber: bankAccount.trim(),
            bankAccountHolder: bankHolder.trim(),
            agreedTerms: agreeTerms,
            agreedFee: agreeFee,
            agreedPrivacy: agreePrivacy,
        });
        setSubmitting(false);
        if (res) setApplication(res);
        else setError("신청 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }

    async function handleWithdraw() {
        if (!application) return;
        if (!confirm("신청을 철회하시겠습니까?")) return;
        const ok = await withdrawSellerApplication(application.id);
        if (ok && creator) {
            const app = await getMySellerApplication(creator.id);
            setApplication(app);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
            </div>
        );
    }

    // 승인 완료 상태
    if (creator?.seller_status === "approved") {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-2xl mx-auto px-5 py-16 text-center">
                    <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h1 className="text-[20px] font-black text-neutral-900 mb-2">입점이 완료된 상태입니다</h1>
                    <p className="text-[13px] text-neutral-700 mb-6">
                        이미 JAKKA 마켓 작가로 활동 중입니다.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Link href="/jakka/market/upload" className="text-[12px] font-bold text-white bg-neutral-900 px-4 py-2 hover:bg-neutral-700">
                            작품 등록하기
                        </Link>
                        <Link href="/jakka/seller" className="text-[12px] font-bold text-neutral-900 border border-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white">
                            판매자 센터
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 심사 중
    if (application?.status === "pending") {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-2xl mx-auto px-5 py-16">
                    <div className="text-center mb-8">
                        <Clock className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                        <h1 className="text-[20px] font-black text-neutral-900 mb-2">심사 진행 중</h1>
                        <p className="text-[13px] text-neutral-700">
                            제출하신 신청서를 검토하고 있습니다.<br />
                            영업일 기준 2~5일 내에 이메일로 결과를 알려드립니다.
                        </p>
                    </div>
                    <div className="border border-neutral-200 p-5 space-y-3 bg-neutral-50">
                        <div className="flex justify-between text-[12px]">
                            <span className="text-neutral-500">신청일</span>
                            <span className="text-neutral-900">{application.created_at.substring(0, 10)}</span>
                        </div>
                        <div className="flex justify-between text-[12px]">
                            <span className="text-neutral-500">주력 카테고리</span>
                            <span className="text-neutral-900">{application.primary_category}</span>
                        </div>
                        <div className="flex justify-between text-[12px]">
                            <span className="text-neutral-500">회원 유형</span>
                            <span className="text-neutral-900">{application.seller_type === "business" ? "사업자" : "개인"}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleWithdraw}
                        className="mt-6 w-full text-[12px] font-bold text-neutral-900 border border-neutral-300 py-3 hover:bg-neutral-100"
                    >
                        신청 철회
                    </button>
                </div>
            </div>
        );
    }

    // 반려
    if (application?.status === "rejected") {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-2xl mx-auto px-5 py-16">
                    <div className="text-center mb-6">
                        <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h1 className="text-[20px] font-black text-neutral-900 mb-2">신청이 반려되었습니다</h1>
                    </div>
                    {application.reviewer_note && (
                        <div className="border-l-4 border-red-600 bg-red-50 p-4 mb-6">
                            <p className="text-[11px] font-bold text-red-900 mb-1">반려 사유</p>
                            <p className="text-[13px] text-neutral-900 whitespace-pre-line">{application.reviewer_note}</p>
                        </div>
                    )}
                    <p className="text-[13px] text-neutral-700 text-center mb-6">
                        내용을 보완해 다시 신청할 수 있습니다.
                    </p>
                    <button
                        onClick={() => setApplication(null)}
                        className="w-full text-[13px] font-bold bg-neutral-900 text-white py-3 hover:bg-neutral-700"
                    >
                        다시 신청하기
                    </button>
                </div>
            </div>
        );
    }

    // 신청 폼
    return (
        <div className="min-h-screen bg-white">
            <PageHeader eyebrow="Seller Application" title="마켓 입점 신청" subtitle="JAKKA 마켓 작가로 등록해 작품을 판매하세요." />

            <div className="max-w-2xl mx-auto px-5 py-6">
                <Link href="/jakka/market" className="inline-flex items-center gap-1 text-[12px] text-neutral-700 hover:text-neutral-900 mb-6">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    마켓으로
                </Link>

                {/* 안내 배너 */}
                <div className="border-l-4 border-neutral-900 bg-neutral-50 p-4 mb-8">
                    <p className="text-[11px] font-bold text-neutral-900 uppercase tracking-[0.15em] mb-2">입점 안내</p>
                    <ul className="text-[12px] text-neutral-700 leading-relaxed space-y-1 list-disc list-inside">
                        <li>영업일 기준 <b className="text-neutral-900">2~5일 심사</b> 후 승인 여부 안내</li>
                        <li>기본 플랫폼 수수료 <b className="text-neutral-900">15%</b> (VAT 별도)</li>
                        <li>승인 후 수정·삭제·재고 관리는 판매자 센터에서</li>
                        <li>정산은 월 2회 (1일·15일 기준)</li>
                    </ul>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 자기소개 */}
                    <div>
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">
                            작가 소개 <span className="text-red-500">*</span>
                        </p>
                        <textarea
                            value={intro}
                            onChange={(e) => setIntro(e.target.value)}
                            rows={5}
                            maxLength={1000}
                            placeholder="작가로서의 여정, 작업 스타일, 추구하는 방향 등을 소개해주세요."
                            className="w-full text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2.5 focus:outline-none focus:border-neutral-900 resize-none"
                        />
                        <p className="mt-1 text-[11px] text-neutral-500 text-right">{intro.length}/1000</p>
                    </div>

                    {/* 주력 카테고리 */}
                    <div>
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">
                            주력 카테고리 <span className="text-red-500">*</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setPrimaryCategory(c)}
                                    className={`text-[12px] font-bold px-3 py-1.5 border ${
                                        primaryCategory === c
                                            ? "border-neutral-900 bg-neutral-900 text-white"
                                            : "border-neutral-300 text-neutral-500 hover:border-neutral-700"
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 포트폴리오 링크 */}
                    <div>
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">
                            외부 포트폴리오 (선택)
                        </p>
                        <div className="space-y-2">
                            {portfolioUrls.map((url, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setPortfolioUrls((p) => p.map((v, idx) => idx === i ? e.target.value : v))}
                                        placeholder="https://instagram.com/... 또는 behance.net/..."
                                        className="flex-1 text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900"
                                    />
                                    {portfolioUrls.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setPortfolioUrls((p) => p.filter((_, idx) => idx !== i))}
                                            className="px-2 text-neutral-500 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setPortfolioUrls((p) => [...p, ""])}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-700 hover:text-neutral-900"
                            >
                                <Plus className="w-3 h-3" />
                                링크 추가
                            </button>
                        </div>
                    </div>

                    {/* 회원 유형 */}
                    <div>
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">
                            회원 유형 <span className="text-red-500">*</span>
                        </p>
                        <div className="flex gap-2">
                            {(["individual", "business"] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setSellerType(t)}
                                    className={`flex-1 text-[13px] font-bold py-2.5 border ${
                                        sellerType === t
                                            ? "border-neutral-900 bg-neutral-900 text-white"
                                            : "border-neutral-300 text-neutral-500"
                                    }`}
                                >
                                    {t === "individual" ? "개인" : "사업자"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {sellerType === "business" && (
                        <div className="space-y-3 p-4 border border-neutral-200 bg-neutral-50">
                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em]">사업자 정보</p>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="사업자명 (상호)"
                                className="w-full text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900"
                            />
                            <input
                                type="text"
                                value={businessNumber}
                                onChange={(e) => setBusinessNumber(e.target.value)}
                                placeholder="사업자등록번호 (000-00-00000)"
                                className="w-full text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900"
                            />
                            <input
                                type="email"
                                value={taxEmail}
                                onChange={(e) => setTaxEmail(e.target.value)}
                                placeholder="세금계산서 수신 이메일"
                                className="w-full text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900"
                            />
                        </div>
                    )}

                    {/* 정산 계좌 */}
                    <div>
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">
                            정산 계좌 <span className="text-red-500">*</span>
                        </p>
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                placeholder="은행명 (예: 국민은행)"
                                className="w-full text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900"
                            />
                            <input
                                type="text"
                                value={bankAccount}
                                onChange={(e) => setBankAccount(e.target.value)}
                                placeholder="계좌번호"
                                className="w-full text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900"
                            />
                            <input
                                type="text"
                                value={bankHolder}
                                onChange={(e) => setBankHolder(e.target.value)}
                                placeholder="예금주 (사업자는 상호)"
                                className="w-full text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900"
                            />
                        </div>
                    </div>

                    {/* 약관 동의 */}
                    <div className="space-y-2 border-t border-neutral-200 pt-6">
                        <label className="flex items-start gap-2 text-[12px] text-neutral-900 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="mt-0.5"
                            />
                            <span>
                                <b>[필수]</b> JAKKA 마켓 입점 약관에 동의합니다.
                            </span>
                        </label>
                        <label className="flex items-start gap-2 text-[12px] text-neutral-900 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreeFee}
                                onChange={(e) => setAgreeFee(e.target.checked)}
                                className="mt-0.5"
                            />
                            <span>
                                <b>[필수]</b> 플랫폼 수수료 15% (VAT 별도) 및 정산 정책에 동의합니다.
                            </span>
                        </label>
                        <label className="flex items-start gap-2 text-[12px] text-neutral-900 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreePrivacy}
                                onChange={(e) => setAgreePrivacy(e.target.checked)}
                                className="mt-0.5"
                            />
                            <span>
                                <b>[필수]</b> 정산·세무 처리를 위한 개인정보 및 사업자 정보 수집·이용에 동의합니다.
                            </span>
                        </label>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 text-[12px] text-red-600">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full text-[13px] font-bold bg-neutral-900 text-white py-3 hover:bg-neutral-700 transition-colors disabled:opacity-50"
                    >
                        {submitting ? "접수 중…" : "입점 신청 제출"}
                    </button>
                </form>
            </div>
        </div>
    );
}
