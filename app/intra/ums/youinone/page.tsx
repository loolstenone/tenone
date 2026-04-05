"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink, Users, Briefcase, Building2, Handshake,
  Clock, Wallet, FolderKanban, ArrowRight,
} from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";

/* ── Mock: 프로젝트 그룹 현황 ── */
const groupStats = {
  totalMembers: 147,
  alliances: 12,
  activeProjects: 8,
  completedProjects: 34,
};

/* ── Mock: 최근 프로젝트 ── */
const recentProjects = [
  {
    name: "브랜드 리뉴얼 프로젝트",
    client: "A사",
    members: 5,
    status: "진행중",
    budget: "15,000,000",
    startDate: "2026-03-01",
    endDate: "2026-05-15",
    progress: 60,
  },
  {
    name: "SNS 콘텐츠 제작",
    client: "B사",
    members: 3,
    status: "진행중",
    budget: "4,500,000",
    startDate: "2026-03-15",
    endDate: "2026-04-30",
    progress: 75,
  },
  {
    name: "UI/UX 컨설팅",
    client: "C사",
    members: 2,
    status: "완료",
    budget: "8,000,000",
    startDate: "2026-01-10",
    endDate: "2026-03-10",
    progress: 100,
  },
  {
    name: "웹사이트 구축",
    client: "D사",
    members: 4,
    status: "준비중",
    budget: "20,000,000",
    startDate: "2026-04-15",
    endDate: "2026-07-31",
    progress: 0,
  },
  {
    name: "마케팅 전략 수립",
    client: "E사",
    members: 3,
    status: "진행중",
    budget: "6,000,000",
    startDate: "2026-02-20",
    endDate: "2026-04-20",
    progress: 85,
  },
];

/* ── Mock: 파트너 기업 ── */
const partners = [
  { name: "스타트업 A", type: "IT", projects: 5, since: "2024" },
  { name: "에이전시 B", type: "마케팅", projects: 3, since: "2025" },
  { name: "디자인 스튜디오 C", type: "디자인", projects: 4, since: "2024" },
  { name: "미디어 D", type: "콘텐츠", projects: 2, since: "2025" },
  { name: "컨설팅 E", type: "전략", projects: 6, since: "2023" },
  { name: "테크 F", type: "IT", projects: 3, since: "2025" },
];

const typeColor: Record<string, string> = {
  IT: "bg-blue-50 text-blue-700",
  "마케팅": "bg-violet-50 text-violet-700",
  "디자인": "bg-rose-50 text-rose-700",
  "콘텐츠": "bg-amber-50 text-amber-700",
  "전략": "bg-emerald-50 text-emerald-700",
};

const statusStyle: Record<string, string> = {
  "진행중": "bg-emerald-50 text-emerald-700",
  "완료": "bg-neutral-100 text-neutral-500",
  "준비중": "bg-amber-50 text-amber-700",
};

export default function YouInOnePage() {
  return (
    <div>
      <PageHeader title="YouInOne 관리" description="프로젝트 그룹 & 프리랜서 얼라이언스 관리">
        <Link
          href="/youinone"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          사이트 바로가기
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="멤버 수"
          value={groupStats.totalMembers + "명"}
          sub="프리랜서 크루"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="얼라이언스"
          value={groupStats.alliances + "개"}
          sub="파트너 네트워크"
          icon={<Handshake className="h-4 w-4" />}
        />
        <StatCard
          label="진행중 프로젝트"
          value={groupStats.activeProjects + "개"}
          sub={`누적 ${groupStats.completedProjects}건 완료`}
          icon={<FolderKanban className="h-4 w-4" />}
        />
        <StatCard
          label="이번달 매출"
          value="₩25.5M"
          sub="프로젝트 정산 기준"
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 프로젝트 (2/3) */}
        <div className="lg:col-span-2">
          <Card>
            <SectionTitle title="프로젝트 현황" />
            <div className="space-y-0">
              {recentProjects.map((p) => (
                <div
                  key={p.name}
                  className="py-3 border-b border-neutral-50 last:border-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-800">{p.name}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-sm ${statusStyle[p.status] || "bg-neutral-100 text-neutral-500"}`}>
                        {p.status}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500">₩{p.budget}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-neutral-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {p.client}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {p.members}명
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {p.startDate.slice(5)} ~ {p.endDate.slice(5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${p.progress === 100 ? "bg-neutral-400" : "bg-neutral-800"}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 w-8 text-right">{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 파트너 기업 (1/3) */}
        <div className="space-y-6">
          <Card>
            <SectionTitle title="파트너 기업" />
            <div className="space-y-2.5">
              {partners.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between py-2 px-3 border border-neutral-100 rounded-sm"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColor[p.type] || "bg-neutral-50 text-neutral-500"}`}>
                        {p.type}
                      </span>
                      <span className="text-[10px] text-neutral-400">{p.projects}건 협업</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400">{p.since}~</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle title="정산 요약" />
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">이번달 정산</span>
                <span className="font-semibold text-neutral-800">₩25,500,000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">미정산 금액</span>
                <span className="font-semibold text-amber-600">₩8,000,000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">누적 매출</span>
                <span className="font-semibold text-neutral-800">₩142,300,000</span>
              </div>
              <div className="h-px bg-neutral-100 my-1" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">크루 평균 수익</span>
                <span className="font-medium text-neutral-700">₩1,734,000/월</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
