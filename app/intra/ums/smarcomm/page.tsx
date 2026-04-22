"use client";
import { Construction } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

export default function SmarcommDashboard() {
    return (
        <div>
            <PageHeader title="SmarComm. 대시보드" description="SmarComm 마케팅 자동화 OS 운영 현황" />
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Construction className="h-12 w-12 text-neutral-300 mb-4" />
                <p className="text-sm text-neutral-400">관리 기능 준비 중</p>
            </div>
        </div>
    );
}
