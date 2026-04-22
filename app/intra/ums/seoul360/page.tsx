"use client";
import { Construction } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

export default function Seoul360Dashboard() {
    return (
        <div>
            <PageHeader title="Seoul/360° 대시보드" description="서울 관광 가이드 콘텐츠 운영 현황" />
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Construction className="h-12 w-12 text-neutral-300 mb-4" />
                <p className="text-sm text-neutral-400">관리 기능 준비 중</p>
            </div>
        </div>
    );
}
