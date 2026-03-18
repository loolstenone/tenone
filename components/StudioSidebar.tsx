"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Globe, Calendar, FolderOpen, Settings,
  Users, Contact, Palette, Workflow, LogOut, ChevronDown,
  ChevronRight, GitBranch, KanbanSquare, FolderKanban, Zap,
  PenTool,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/Logo";
import type { LucideIcon } from "lucide-react";

interface NavChild {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  children?: NavChild[];
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    items: [
      { name: "Dashboard", href: "/intra/studio", icon: LayoutDashboard },
    ],
  },
  {
    label: "OPERATE",
    items: [
      {
        name: "Workflow", href: "/intra/studio/workflow", icon: Workflow,
        children: [
          { name: "Pipeline", href: "/intra/studio/workflow/pipeline" },
          { name: "Kanban Board", href: "/intra/studio/workflow/kanban" },
          { name: "Projects", href: "/intra/studio/workflow/projects" },
          { name: "Automation", href: "/intra/studio/workflow/automation" },
        ],
      },
      { name: "Schedule", href: "/intra/studio/schedule", icon: Calendar },
      { name: "Contacts", href: "/intra/studio/contacts", icon: Contact },
    ],
  },
  {
    label: "UNIVERSE",
    items: [
      { name: "Brands", href: "/intra/studio/brands", icon: Users },
      { name: "Universe", href: "/intra/studio/universe", icon: Globe },
    ],
  },
  {
    label: "CREATE",
    items: [
      {
        name: "Studio", href: "/intra/studio/studio", icon: Palette,
        children: [
          { name: "Studio Home", href: "/intra/studio/studio" },
          { name: "Editor", href: "/intra/studio/studio/editor" },
        ],
      },
      { name: "Assets", href: "/intra/studio/assets", icon: FolderOpen },
    ],
  },
  {
    items: [
      { name: "Settings", href: "/intra/studio/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function StudioSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

  // Auto-open parent menus when navigating to a child route
  useEffect(() => {
    const newOpen = new Set(openMenus);
    for (const group of navigationGroups) {
      for (const item of group.items) {
        if (item.children) {
          const isChildActive = item.children.some(c =>
            c.href === pathname || (c.href !== "/intra/studio" && pathname.startsWith(c.href))
          );
          const isParentActive = pathname === item.href || pathname.startsWith(item.href + "/");
          if (isChildActive || isParentActive) {
            newOpen.add(item.name);
          }
        }
      }
    }
    if (newOpen.size !== openMenus.size || [...newOpen].some(v => !openMenus.has(v))) {
      setOpenMenus(newOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/intra/studio") return pathname === "/intra/studio";
    return pathname === href;
  };

  const isParentActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some(c => pathname === c.href || (c.href !== "/intra/studio" && pathname.startsWith(c.href)));
    }
    return pathname.startsWith(item.href + "/");
  };

  return (
    <div className={clsx("flex h-full w-full flex-col bg-zinc-950 text-zinc-400 border-r border-zinc-800", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center px-5 shrink-0 gap-3">
        <Logo variant="vertical" size="sm" />
        <Link href="/intra/studio" className="text-2xl font-bold text-white tracking-tight hover:text-indigo-400 transition-colors">
          Studio
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx}>
            {/* Group label / separator */}
            {group.label ? (
              <div className="flex items-center gap-2 px-3 pt-5 pb-2">
                <span className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-zinc-800/60" />
              </div>
            ) : gIdx > 0 ? (
              <div className="my-2 mx-3 h-px bg-zinc-800/60" />
            ) : null}

            {/* Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const parentActive = isParentActive(item);
                const isOpen = openMenus.has(item.name);

                return (
                  <div key={item.name}>
                    {/* Parent item */}
                    {hasChildren ? (
                      <button
                        onClick={() => {
                          toggleMenu(item.name);
                          if (!isOpen) router.push(item.href);
                        }}
                        className={clsx(
                          parentActive
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white",
                          "group flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={clsx(
                              parentActive ? "text-indigo-500" : "text-zinc-500 group-hover:text-zinc-300",
                              "mr-3 h-[18px] w-[18px] flex-shrink-0"
                            )}
                          />
                          {item.name}
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                        )}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={clsx(
                          parentActive
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white",
                          "group flex items-center rounded-md px-2.5 py-2 text-sm font-medium transition-colors"
                        )}
                      >
                        <item.icon
                          className={clsx(
                            parentActive ? "text-indigo-500" : "text-zinc-500 group-hover:text-zinc-300",
                            "mr-3 h-[18px] w-[18px] flex-shrink-0"
                          )}
                        />
                        {item.name}
                      </Link>
                    )}

                    {/* Children */}
                    {hasChildren && isOpen && (
                      <div className="ml-5 mt-0.5 space-y-0.5 border-l border-zinc-800/60 pl-3">
                        {item.children!.map((child) => {
                          const childActive = isActive(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={clsx(
                                childActive
                                  ? "text-white bg-zinc-900/50"
                                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30",
                                "block rounded-md px-2.5 py-1.5 text-[13px] transition-colors"
                              )}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
              {user?.avatarInitials ?? "U"}
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">{user?.name ?? "User"}</p>
              <p className="text-xs text-zinc-500">{user?.role ?? "Viewer"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
