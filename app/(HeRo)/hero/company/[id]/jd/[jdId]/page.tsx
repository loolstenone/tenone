"use client";

/**
 * 기존 JD 편집 페이지 — 7블록 에디터 (초기값 로드)
 */

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import JDEditor, { type JDInitialValues } from "@/features/hero/JDEditor";

const HERO_RED = "#E53935";

export default function EditJDPage({ params }: { params: Promise<{ id: string; jdId: string }> }) {
    const { id: companyId, jdId } = use(params);
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [initial, setInitial] = useState<JDInitialValues | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        (async () => {
            try {
                const res = await fetch(`/api/hero/jd?id=${jdId}&memberId=${user.id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setInitial({
                    id: data.jd.id,
                    positionTitle: data.jd.position_title,
                    summary: data.jd.summary ?? "",
                    blocks: data.jd.blocks ?? {},
                    employmentType: data.jd.employment_type ?? "",
                    experienceRange: data.jd.experience_range ?? "",
                    status: data.jd.status,
                });
            } catch (e) {
                setError(e instanceof Error ? e.message : "불러오기 실패");
            }
            setLoading(false);
        })();
    }, [user?.id, jdId]);

    if (isLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginModal isOpen={true} onClose={() => {}} accentColor={HERO_RED} /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-sm text-red-500">{error}</div>;
    if (!initial) return null;

    return (
        <JDEditor
            companyId={companyId}
            initial={initial}
            onSaved={() => router.push(`/hero/company/${companyId}/jd`)}
        />
    );
}
