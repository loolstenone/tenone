"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileCode, Loader2, Mail, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Template {
    id: string;
    name: string;
    category: string | null;
    description: string | null;
    subject_template: string;
    variables: string[] | null;
    is_active: boolean;
    usage_count: number;
    updated_at: string;
    site_id: string | null;
}

const BUILT_IN_TEMPLATES = [
    { file: "lib/email/crm-template.ts", role: "CRM 브로드캐스트", desc: "변수 치환 + CTA 버튼 + 수신거부 푸터" },
    { file: "lib/email/newsletter-template.ts", role: "뉴스레터 발송", desc: "Ten:One 로고 + 브랜드 듀얼 + 카테고리 태그" },
];

const STANDARDS = [
    { title: "헤더", rule: "Ten:One 가로 로고 + `NEWSLETTER · {BRAND}` 라벨" },
    { title: "인사말", rule: "`{닉네임}님 고맙습니다 🙏` 감사 문구" },
    { title: "변수 치환", rule: "`{{name}}`, `{{email}}`, `{{brand}}` 등 double curly" },
    { title: "CTA", rule: "버튼 1개 중심 · 브랜드 컬러" },
    { title: "푸터", rule: "수신거부 (RFC 8058 One-Click) + 발송자 주소 + 개인정보 정책 링크" },
    { title: "발신자", rule: "noreply@tenone.biz (인증) / news@tenone.biz (뉴스레터) / hello@tenone.biz (마케팅)" },
    { title: "Reply-To", rule: "lools@tenone.biz (개인 메일함 답장)" },
    { title: "제목 포맷", rule: "`[{BRAND}] {본문 요약} · Ten:One™ Universe`" },
];

export default function MailTemplatesStandardPage() {
    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("mail_templates").select("*").order("usage_count", { ascending: false });
            setTemplates(data ?? []);
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader
                title="이메일 템플릿 표준"
                description="유니버스 공통 메일 브랜딩 · 변수 치환 · 수신거부 필수 요소"
            />

            {/* 8 Standards */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">템플릿 8대 표준</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600 w-40">요소</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">규칙</th>
                            </tr>
                        </thead>
                        <tbody>
                            {STANDARDS.map(s => (
                                <tr key={s.title} className="border-b border-neutral-100 last:border-0">
                                    <td className="px-3 py-2 font-semibold text-neutral-900">{s.title}</td>
                                    <td className="px-3 py-2 text-neutral-700"
                                        dangerouslySetInnerHTML={{ __html: s.rule.replace(/`([^`]+)`/g, '<code class="font-mono bg-neutral-100 px-1 rounded text-[10px]">$1</code>') }}
                                    />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Built-in Templates */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">빌트인 템플릿 (코드)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {BUILT_IN_TEMPLATES.map(t => (
                        <div key={t.file} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <FileCode className="h-4 w-4 text-blue-600" />
                                <p className="text-xs font-semibold text-neutral-900">{t.role}</p>
                            </div>
                            <p className="text-[10px] font-mono text-neutral-500 mb-2">{t.file}</p>
                            <p className="text-[11px] text-neutral-600">{t.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* DB Templates (mail_templates) */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">
                    DB 템플릿 레지스트리 <span className="text-[11px] text-neutral-500 font-normal">(mail_templates · {templates.length}개)</span>
                </h2>
                {loading ? (
                    <div className="flex items-center justify-center h-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
                ) : templates.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">
                        등록된 DB 템플릿이 없습니다. <br />
                        <span className="text-[10px]">현재는 <code className="font-mono bg-neutral-100 px-1 rounded">lib/email/*-template.ts</code> 빌트인만 사용 중.</span>
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">이름</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">카테고리</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">사이트</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">제목 템플릿</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">사용</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templates.map(t => (
                                    <tr key={t.id} className="border-b border-neutral-100 last:border-0">
                                        <td className="px-3 py-2 font-medium text-neutral-900">{t.name}</td>
                                        <td className="px-3 py-2 text-neutral-500">{t.category || "-"}</td>
                                        <td className="px-3 py-2 text-neutral-500 font-mono text-[10px]">{t.site_id || "-"}</td>
                                        <td className="px-3 py-2 text-neutral-600 truncate max-w-[240px]">{t.subject_template}</td>
                                        <td className="px-3 py-2 text-right text-neutral-700">{t.usage_count.toLocaleString()}</td>
                                        <td className="px-3 py-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${t.is_active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                                                {t.is_active ? "활성" : "정지"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-3">
                <Link href="/intra/ums/email/senders" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <Mail className="h-4 w-4 text-blue-600 mb-2" />
                    <p className="text-xs font-semibold">발신자 레지스트리</p>
                    <p className="text-[10px] text-neutral-500">senders 관리 <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
                <Link href="/intra/ums/email/usage" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <Mail className="h-4 w-4 text-amber-600 mb-2" />
                    <p className="text-xs font-semibold">사용량 · 한도</p>
                    <p className="text-[10px] text-neutral-500">usage 대시보드 <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
            </div>
        </div>
    );
}
