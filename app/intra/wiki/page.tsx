"use client";

import Link from "next/link";
import { BookOpen, Compass, GraduationCap, FileText, HelpCircle, ArrowRight } from "lucide-react";

const sections = [
    { name: "Culture", description: "Ten:One™ 기업 컬쳐, Principle 10, Core Value", href: "/intra/wiki/culture", icon: BookOpen, color: "text-purple-500 bg-purple-500/10" },
    { name: "Onboarding", description: "신입 직원 온보딩 가이드", href: "/intra/wiki/onboarding", icon: Compass, color: "text-blue-500 bg-blue-500/10" },
    { name: "Education", description: "Vrief, GPR 등 업무 도구 교육", href: "/intra/wiki/education", icon: GraduationCap, color: "text-emerald-500 bg-emerald-500/10" },
    { name: "Handbook", description: "직원 핸드북, 업무 규정", href: "/intra/wiki/handbook", icon: FileText, color: "text-amber-500 bg-amber-500/10" },
    { name: "FAQ", description: "자주 묻는 질문", href: "/intra/wiki/faq", icon: HelpCircle, color: "text-cyan-500 bg-cyan-500/10" },
];

export default function WikiHome() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Wiki</h2>
                <p className="mt-2 text-zinc-400">Ten:One™ Universe 교육, 온보딩, 기업 컬쳐</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map(sec => (
                    <Link key={sec.name} href={sec.href} className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 hover:border-indigo-500/50 transition-all">
                        <div className="flex items-start justify-between">
                            <div className={`rounded-lg p-3 ${sec.color.split(' ')[1]}`}>
                                <sec.icon className={`h-6 w-6 ${sec.color.split(' ')[0]}`} />
                            </div>
                            <ArrowRight className="h-5 w-5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-white">{sec.name}</h3>
                        <p className="mt-2 text-sm text-zinc-400">{sec.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
