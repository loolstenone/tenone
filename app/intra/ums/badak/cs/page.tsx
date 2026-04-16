"use client";

import { useState, useEffect } from "react";
import { Bell, MessageSquare, Flag, CheckCircle, Clock, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { PageHeader, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

type TabType = "notifications" | "guide";

export default function BadakCSPage() {
  const [tab, setTab] = useState<TabType>("notifications");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.from("badak_notifications")
        .select("id, user_id, type, title, body, link, read, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      setNotifications((data ?? []) as Notification[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const TYPE_STYLE: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    group_join:     { label: "모임 참여", icon: <MessageSquare className="h-3.5 w-3.5" />, color: "text-blue-500 bg-blue-50" },
    group_approved: { label: "참여 승인", icon: <CheckCircle className="h-3.5 w-3.5" />, color: "text-emerald-500 bg-emerald-50" },
    group_rejected: { label: "참여 거절", icon: <Flag className="h-3.5 w-3.5" />, color: "text-red-500 bg-red-50" },
    need_matched:   { label: "니즈 매칭", icon: <Bell className="h-3.5 w-3.5" />, color: "text-amber-500 bg-amber-50" },
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div>
      <PageHeader title="CS / 알림 관리" description="사용자 알림 현황 및 CS 가이드">
        <button onClick={loadData} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600">
          <RefreshCw className="h-3.5 w-3.5" /> 새로고침
        </button>
      </PageHeader>

      {/* 탭 */}
      <div className="flex gap-1 mb-5 border-b border-neutral-200">
        {([
          ["notifications", `알림 현황 (미읽음 ${unread})`],
          ["guide", "CS 대응 가이드"],
        ] as [TabType, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "notifications" && (
        <Card>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
          ) : notifications.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-12">알림 내역이 없습니다</p>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => {
                const ts = TYPE_STYLE[n.type] ?? { label: n.type, icon: <Bell className="h-3.5 w-3.5" />, color: "text-neutral-400 bg-neutral-100" };
                const isExpanded = expandedId === n.id;
                return (
                  <div key={n.id} className={`border rounded-lg overflow-hidden ${n.read ? "border-neutral-100 bg-neutral-50/50" : "border-neutral-200 bg-white"}`}>
                    <button className="w-full flex items-start gap-3 p-3 text-left" onClick={() => setExpandedId(isExpanded ? null : n.id)}>
                      <div className={`flex items-center justify-center h-7 w-7 rounded-full shrink-0 mt-0.5 ${ts.color}`}>
                        {ts.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-800">{n.title}</span>
                          {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                          <span className="bg-neutral-100 px-1.5 py-0.5 rounded">{ts.label}</span>
                          <span>{new Date(n.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-neutral-400 shrink-0 mt-0.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    {isExpanded && n.body && (
                      <div className="px-13 pb-3 pl-13 border-t border-neutral-100">
                        <div className="pl-10">
                          <p className="text-xs text-neutral-600 py-2">{n.body}</p>
                          {n.link && (
                            <a href={n.link} target="_blank" rel="noreferrer"
                              className="text-[11px] text-blue-500 hover:underline">링크 보기 →</a>
                          )}
                          <p className="text-[10px] text-neutral-300 mt-1">사용자 ID: {n.user_id}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {tab === "guide" && (
        <div className="space-y-4">
          {[
            {
              title: "모임 관련 문의",
              items: [
                "모임 참여 취소 요청 → 모임 관리 페이지에서 해당 모임 멤버 직접 삭제",
                "모임 개설자 변경 요청 → DB에서 badak_groups.leader_id 직접 수정",
                "정원 초과 참여 요청 → max_members 수치 조정 (모임 관리 → 수정)",
              ],
            },
            {
              title: "계정 관련 문의",
              items: [
                "닉네임 변경 → 멤버 관리 페이지에서 직접 수정 예정 (현재 DB 직접)",
                "탈퇴 요청 → members.affiliations에서 'badak' 제거 + badak_members.is_active = false",
                "바닥장 권한 부여 → 멤버 관리 > 역할 드롭다운에서 '바닥장'으로 변경",
              ],
            },
            {
              title: "게시글/니즈 관련",
              items: [
                "부적절한 게시글 신고 → 커뮤니티 관리 > 해당 글 숨김 또는 삭제",
                "니즈 키워드 부적절 → 니즈 관리 > 해당 항목 거절 처리",
                "중복 니즈 정리 → 니즈 관리 > count 낮은 항목 삭제 후 상위 항목 count 합산",
              ],
            },
            {
              title: "향후 추가 예정",
              items: [
                "badak_reports 테이블: 게시글/멤버 신고 접수 및 처리 플로우",
                "이메일 템플릿 관리: 알림 발송 내역 확인",
                "FAQ 관리: 자주 묻는 질문 직접 등록/편집",
              ],
            },
          ].map(section => (
            <Card key={section.title}>
              <SectionTitle title={section.title} />
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
