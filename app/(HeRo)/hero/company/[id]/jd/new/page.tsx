"use client";

/**
 * 신규 JD 작성 페이지 — 7블록 에디터
 */

import { use } from "react";
import { useRouter } from "next/navigation";
import JDEditor from "@/features/hero/JDEditor";

export default function NewJDPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: companyId } = use(params);
    const router = useRouter();

    return (
        <JDEditor
            companyId={companyId}
            onSaved={(id) => router.push(`/hero/company/${companyId}/jd/${id}`)}
        />
    );
}
