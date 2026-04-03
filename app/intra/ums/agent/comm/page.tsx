"use client";

import { PageHeader } from "@/components/intra/IntraUI";
import { MessageSquare } from "lucide-react";

export default function AgentCommPage() {
    return (
        <div className="space-y-6">
            <PageHeader title="에이전트 커뮤니케이션" description="AI 에이전트 메시지 허브 및 채널 관리" />
            <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
                <MessageSquare className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-400">메신저 채널로 이동하세요</p>
                <a href="/intra/myverse/messenger" className="inline-block mt-4 text-xs px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800">
                    메신저 열기
                </a>
            </div>
        </div>
    );
}
