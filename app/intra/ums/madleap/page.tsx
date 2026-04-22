"use client";
import { Construction } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

export default function MadleapDashboard() {
    return (
        <div>
            <PageHeader title="MADLeap 대시보드" description="MADLeap 교육 프로그램 운영 현황" />
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Construction className="h-12 w-12 text-neutral-300 mb-4" />
                <p className="text-sm text-neutral-400">관리 기능 준비 중</p>
            </div>
        </div>
    );
}
