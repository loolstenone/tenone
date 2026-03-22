"use client";

import { useMarketing } from "@/lib/marketing-context";

export default function ContentPage() {
    const { contentPosts } = useMarketing();
    const channels = [...new Set(contentPosts.map(p => p.channel))];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Content</h2>
                <p className="mt-2 text-neutral-500">채널별 콘텐츠 발행을 관리합니다.</p>
            </div>

            <div className="grid grid-cols-5 gap-3">
                {channels.map(ch => {
                    const posts = contentPosts.filter(p => p.channel === ch);
                    const published = posts.filter(p => p.status === 'Published').length;
                    return (
                        <div key={ch} className="border border-neutral-200 bg-white p-4 text-center">
                            <p className="text-lg font-bold">{posts.length}</p>
                            <p className="text-xs text-neutral-500">{ch}</p>
                            <p className="text-xs text-neutral-300">{published} published</p>
                        </div>
                    );
                })}
            </div>

            <div className="border border-neutral-200 bg-white overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
                            <th className="px-6 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Channel</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Engagement</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {contentPosts.map(post => (
                            <tr key={post.id} className="hover:bg-neutral-50">
                                <td className="px-6 py-3 text-sm">{post.title}</td>
                                <td className="px-4 py-3 text-xs font-medium text-neutral-500">{post.type}</td>
                                <td className="px-4 py-3 text-xs text-neutral-500">{post.channel}</td>
                                <td className="px-4 py-3"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{post.status}</span></td>
                                <td className="px-4 py-3 text-xs text-neutral-400">{post.publishDate ?? '-'}</td>
                                <td className="px-4 py-3 text-xs text-neutral-500">{post.engagement ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
