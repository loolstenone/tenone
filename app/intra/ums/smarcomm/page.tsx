"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink, Megaphone, UserCheck, Handshake, Activity,
  Mail, BarChart3, Target, Zap, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";

/* ── Mock: 캠페인 현황 ── */
const campaigns = [
  {
    name: "2026 Spring 뉴스레터",
    type: "이메일",
    status: "진행중",
    sent: 2340,
    opened: 1456,
    clicked: 387,
    startDate: "2026-03-15",
  },
  {
    name: "MADLeague 리크루팅",
    type: "SNS",
    status: "진행중",
    sent: 5200,
    opened: 3100,
    clicked: 890,
    startDate: "2026-04-01",
  },
  {
    name: "WIO 런칭 캠페인",
    type: "멀티채널",
    status: "준비중",
    sent: 0,
    opened: 0,
    clicked: 0,
    startDate: "2026-04-20",
  },
  {
    name: "Badak DAM Party 초대",
    type: "이메일",
    status: "완료",
    sent: 1870,
    opened: 1234,
    clicked: 456,
    startDate: "2026-03-01",
  },
  {
    name: "Evolution School 모집",
    type: "SNS",
    status: "진행중",
    sent: 8900,
    opened: 4500,
    clicked: 1200,
    startDate: "2026-03-20",
  },
];

/* ── Mock: 최근 활동 ── */
const activities = [
  { text: "Spring 뉴스레터 3차 발송 완료 (780명)", time: "1시간 전", type: "send" },
  { text: "MADLeague 캠페인 CTR 17.1% 달성", time: "3시간 전", type: "metric" },
  { text: "신규 리드 45건 유입 (Evolution School)", time: "5시간 전", type: "lead" },
  { text: "WIO 런칭 캠페인 크리에이티브 승인", time: "1일 전", type: "approval" },
  { text: "Badak 캠페인 최종 리포트 생성", time: "1일 전", type: "report" },
  { text: "A/B 테스트 결과: 변형 B 승리 (+23% CTR)", time: "2일 전", type: "test" },
  { text: "이메일 리스트 정리 (미인증 142명 제거)", time: "3일 전", type: "clean" },
  { text: "4월 캠페인 일정 캘린더 업데이트", time: "4일 전", type: "plan" },
];

const activityTypeColor: Record<string, string> = {
  send: "bg-emerald-400",
  metric: "bg-blue-400",
  lead: "bg-violet-400",
  approval: "bg-amber-400",
  report: "bg-cyan-400",
  test: "bg-rose-400",
  clean: "bg-neutral-400",
  plan: "bg-teal-400",
};

const typeStyle: Record<string, string> = {
  "이메일": "bg-blue-50 text-blue-700",
  "SNS": "bg-violet-50 text-violet-700",
  "멀티채널": "bg-amber-50 text-amber-700",
};

const statusStyle: Record<string, string> = {
  "진행중": "bg-emerald-50 text-emerald-700",
  "완료": "bg-neutral-100 text-neutral-500",
  "준비중": "bg-amber-50 text-amber-700",
};

export default function SmarCommPage() {
  const totalLeads = 1247;
  const activeDeals = 23;
  const activeCampaigns = campaigns.filter((c) => c.status === "진행중").length;
  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);

  return (
    <div>
      <PageHeader title="SmarComm 관리" description="마케팅 커뮤니케이션 솔루션 운영 관리">
        <Link
          href="/smarcomm"
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
          label="활성 캠페인"
          value={activeCampaigns + "개"}
          sub={`총 ${campaigns.length}개 캠페인`}
          icon={<Megaphone className="h-4 w-4" />}
        />
        <StatCard
          label="리드"
          value={totalLeads.toLocaleString() + "명"}
          sub="+45 이번주"
          icon={<UserCheck className="h-4 w-4" />}
        />
        <StatCard
          label="활성 딜"
          value={activeDeals + "건"}
          sub="₩48.5M 파이프라인"
          icon={<Handshake className="h-4 w-4" />}
        />
        <StatCard
          label="발송량"
          value={(totalSent / 1000).toFixed(1) + "K"}
          sub="이번달 누적"
          icon={<Mail className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 캠페인 현황 */}
        <Card>
          <SectionTitle title="캠페인 현황" action="캠페인 관리" actionHref="/intra/marketing/campaigns" />
          <div className="space-y-0">
            {campaigns.map((c) => {
              const openRate = c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(1) : "0";
              const ctr = c.sent > 0 ? ((c.clicked / c.sent) * 100).toFixed(1) : "0";
              return (
                <div
                  key={c.name}
                  className="py-3 border-b border-neutral-50 last:border-0"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-800">{c.name}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm ${statusStyle[c.status]}`}>
                        {c.status}
                      </span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeStyle[c.type] || "bg-neutral-50 text-neutral-500"}`}>
                      {c.type}
                    </span>
                  </div>
                  {c.sent > 0 ? (
                    <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                      <span>발송 {c.sent.toLocaleString()}</span>
                      <span>오픈 {openRate}%</span>
                      <span>CTR {ctr}%</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-neutral-400">
                      시작일: {c.startDate}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* 우측 패널 */}
        <div className="space-y-6">
          {/* 퍼포먼스 요약 */}
          <Card>
            <SectionTitle title="이번달 퍼포먼스" />
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                <p className="text-lg font-semibold text-neutral-800">62.3%</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">평균 오픈율</p>
              </div>
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                <p className="text-lg font-semibold text-neutral-800">15.8%</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">평균 CTR</p>
              </div>
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                <p className="text-lg font-semibold text-neutral-800">₩2.1M</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">이번달 딜 클로즈</p>
              </div>
              <div className="text-center py-3 bg-neutral-50 rounded-sm">
                <p className="text-lg font-semibold text-neutral-800">34건</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">전환 (리드 → 딜)</p>
              </div>
            </div>
          </Card>

          {/* 최근 활동 */}
          <Card>
            <SectionTitle title="최근 활동" />
            <div className="space-y-0">
              {activities.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 py-2.5 border-b border-neutral-50 last:border-0"
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${activityTypeColor[a.type] || "bg-neutral-300"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-neutral-700 leading-relaxed">{a.text}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
