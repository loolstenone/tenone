'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, BookOpen, Calendar, Target, Briefcase, Bot, Orbit } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const TABS = [
  { key: 'me',    label: 'ME',    href: '/myverse/app',          icon: User },
  { key: 'log',   label: 'LOG',   href: '/myverse/app/log',      icon: BookOpen },
  { key: 'plan',  label: 'PLAN',  href: '/myverse/app/plan',     icon: Calendar },
  { key: 'dream', label: 'DREAM', href: '/myverse/app/dream',    icon: Target },
  { key: 'work',  label: 'WORK',  href: '/myverse/app/work',     icon: Briefcase },
  { key: 'ai',    label: 'AI',    href: '/myverse/app/ai',       icon: Bot },
  { key: 'verse', label: 'VERSE', href: '/myverse/app/verse',    icon: Orbit },
] as const;

export default function MyVerseAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/myverse');
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0B0D17] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeTab = TABS.find(
    (t) => pathname === t.href || (t.key !== 'me' && pathname.startsWith(t.href + '/'))
  )?.key ?? 'me';

  return (
    <div className="min-h-screen bg-[#0B0D17] text-white flex flex-col">
      {/* Content area */}
      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#0B0D17]/95 backdrop-blur-lg border-t border-white/5">
        <div className="max-w-lg mx-auto flex">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                  isActive
                    ? 'text-indigo-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && (
                  <span className="absolute top-0 w-6 h-0.5 bg-indigo-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
