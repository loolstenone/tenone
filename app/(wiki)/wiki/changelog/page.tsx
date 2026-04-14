import Link from "next/link";
import { fetchWikiLog } from "@/lib/supabase/wiki-public";

export const revalidate = 3600;

export const metadata = { title: "변경 이력" };

const ACTION_LABELS: Record<string, string> = {
    create: "생성",
    update: "수정",
    link: "연결",
    lint: "감사",
};

export default async function ChangelogPage() {
    let logs: Array<{ page_slug: string | null; action: string; diff_summary: string | null; created_at: string }> = [];

    try {
        logs = await fetchWikiLog(100);
    } catch {
        // DB 연결 실패
    }

    // 날짜별 그룹핑
    const byDate: Record<string, typeof logs> = {};
    for (const log of logs) {
        const date = new Date(log.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(log);
    }

    return (
        <div>
            <h1 className="text-lg font-bold mb-1">변경 이력</h1>
            <p className="text-xs text-neutral-400 mb-6">위키 페이지의 생성, 수정, 연결 이력</p>

            {logs.length === 0 ? (
                <div className="border border-neutral-200 bg-white p-8 text-center">
                    <p className="text-xs text-neutral-400">아직 변경 이력이 없습니다</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(byDate).map(([date, dayLogs]) => (
                        <div key={date}>
                            <h2 className="text-xs font-semibold text-neutral-500 mb-2">{date}</h2>
                            <div className="border border-neutral-200 bg-white">
                                {dayLogs.map((log, i) => (
                                    <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i < dayLogs.length - 1 ? "border-b border-neutral-100" : ""}`}>
                                        <span className="text-[10px] text-neutral-300 w-12 shrink-0">
                                            {new Date(log.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                                            log.action === "create" ? "bg-green-50 text-green-600" :
                                            log.action === "update" ? "bg-blue-50 text-blue-600" :
                                            log.action === "link" ? "bg-purple-50 text-purple-600" :
                                            "bg-neutral-100 text-neutral-500"
                                        }`}>
                                            {ACTION_LABELS[log.action] || log.action}
                                        </span>
                                        {log.page_slug ? (
                                            <Link href={`/wiki/${log.page_slug}`} className="text-xs hover:underline flex-1 truncate">
                                                {log.page_slug}
                                            </Link>
                                        ) : (
                                            <span className="text-xs text-neutral-400 flex-1">-</span>
                                        )}
                                        {log.diff_summary && (
                                            <span className="text-[10px] text-neutral-400 truncate max-w-64">{log.diff_summary}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
