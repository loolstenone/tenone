"use client";

import { useMarketing } from "@/lib/marketing-context";

const statusColor: Record<string, string> = { Draft: 'bg-zinc-800 text-zinc-400', Scheduled: 'bg-amber-500/10 text-amber-400', Published: 'bg-emerald-500/10 text-emerald-400', Archived: 'bg-zinc-800 text-zinc-500' };
const typeColor: Record<string, string> = { Article: 'text-blue-400', Newsletter: 'text-purple-400', SNS: 'text-pink-400', Video: 'text-amber-400', Shorts: 'text-cyan-400' };

export default function ContentPage() {
    const { contentPosts } = useMarketing();
    const channels = [...new Set(contentPosts.map(p => p.channel))];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Content</h2>
                <p className="mt-2 text-zinc-400">채널별 콘텐츠 발행을 관리합니다.</p>
            </div>

            <div className="grid grid-cols-5 gap-3">
                {channels.map(ch => {
                    const posts = contentPosts.filter(p => p.channel === ch);
                    const published = posts.filter(p => p.status === 'Published').length;
                    return (
                        <div key={ch} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                            <p className="text-lg font-bold text-white">{posts.length}</p>
                            <p className="text-xs text-indigo-400">{ch}</p>
                            <p className="text-[10px] text-zinc-600">{published} published</p>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                            <th className="px-6 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Channel</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Engagement</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {contentPosts.map(post => (
                            <tr key={post.id} className="hover:bg-zinc-900/50">
                                <td className="px-6 py-3 text-sm text-white">{post.title}</td>
                                <td className={`px-4 py-3 text-xs font-medium ${typeColor[post.type]}`}>{post.type}</td>
                                <td className="px-4 py-3 text-xs text-indigo-400">{post.channel}</td>
                                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[post.status]}`}>{post.status}</span></td>
                                <td className="px-4 py-3 text-xs text-zinc-500">{post.publishDate ?? '-'}</td>
                                <td className="px-4 py-3 text-xs text-zinc-400">{post.engagement ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
