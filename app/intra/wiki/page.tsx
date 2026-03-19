"use client";

import Link from "next/link";
import { BookOpen, Compass, GraduationCap, FileText, HelpCircle, ArrowRight } from "lucide-react";

const sections = [
    { name: "Culture", description: "Ten:One™ 기업 컬쳐, Principle 10, Core Value", href: "/intra/wiki/culture", icon: BookOpen },
    { name: "Onboarding", description: "신입 직원 온보딩 가이드", href: "/intra/wiki/onboarding", icon: Compass },
    { name: "Education", description: "Vrief, GPR 등 업무 도구 교육", href: "/intra/wiki/education", icon: GraduationCap },
    { name: "Handbook", description: "직원 핸드북, 업무 규정", href: "/intra/wiki/handbook", icon: FileText },
    { name: "FAQ", description: "자주 묻는 질문", href: "/intra/wiki/faq", icon: HelpCircle },
];

export default function WikiHome() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">Wiki</h2>
                <p className="mt-1 text-sm text-neutral-500">Ten:One™ Universe 교육, 온보딩, 기업 컬쳐</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map(sec => (
                    <Link key={sec.name} href={sec.href} className="group border border-neutral-200 bg-white p-6 hover:border-neutral-900 transition-all">
                        <div className="flex items-start justify-between">
                            <sec.icon className="h-5 w-5 text-neutral-400" />
                            <ArrowRight className="h-4 w-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">{sec.name}</h3>
                        <p className="mt-2 text-sm text-neutral-500">{sec.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
