(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ErpSidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErpSidebar",
    ()=>ErpSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-check.js [app-client] (ecmascript) <export default as UserCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/git-branch.js [app-client] (ecmascript) <export default as GitBranch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-client] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript) <export default as DollarSign>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$receipt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Receipt$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/receipt.js [app-client] (ecmascript) <export default as Receipt>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-client] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tags$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tags$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tags.js [app-client] (ecmascript) <export default as Tags>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$contact$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Contact$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/contact.js [app-client] (ecmascript) <export default as Contact>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Logo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Logo.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
const navigationGroups = [
    {
        items: [
            {
                name: "Dashboard",
                href: "/intra/erp",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"]
            }
        ]
    },
    {
        label: "CRM",
        items: [
            {
                name: "Contacts",
                href: "/intra/erp/crm/people",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$contact$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Contact$3e$__["Contact"],
                children: [
                    {
                        name: "All",
                        href: "/intra/erp/crm/people"
                    },
                    {
                        name: "Students",
                        href: "/intra/erp/crm/people/students"
                    },
                    {
                        name: "Professionals",
                        href: "/intra/erp/crm/people/professionals"
                    },
                    {
                        name: "Mentors",
                        href: "/intra/erp/crm/people/mentors"
                    }
                ]
            },
            {
                name: "Segments",
                href: "/intra/erp/crm/segments",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tags$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tags$3e$__["Tags"]
            },
            {
                name: "Import",
                href: "/intra/erp/crm/import",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"]
            }
        ]
    },
    {
        label: "HR (HeRo)",
        items: [
            {
                name: "Staff",
                href: "/intra/erp/hr/staff",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"],
                children: [
                    {
                        name: "Staff List",
                        href: "/intra/erp/hr/staff"
                    },
                    {
                        name: "Register",
                        href: "/intra/erp/hr/staff/register"
                    }
                ]
            },
            {
                name: "GPR",
                href: "/intra/erp/hr/gpr",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"],
                children: [
                    {
                        name: "Dashboard",
                        href: "/intra/erp/hr/gpr"
                    },
                    {
                        name: "Goal Setting",
                        href: "/intra/erp/hr/gpr/goals"
                    },
                    {
                        name: "Evaluation",
                        href: "/intra/erp/hr/gpr/evaluation"
                    }
                ]
            },
            {
                name: "Talent Pool",
                href: "/intra/erp/hr/talent",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"]
            },
            {
                name: "Pipeline",
                href: "/intra/erp/hr/pipeline",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__["GitBranch"]
            },
            {
                name: "Programs",
                href: "/intra/erp/hr/programs",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"]
            }
        ]
    },
    {
        label: "FINANCE",
        items: [
            {
                name: "Revenue",
                href: "/intra/erp/finance/revenue",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"]
            },
            {
                name: "Expenses",
                href: "/intra/erp/finance/expenses",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"]
            },
            {
                name: "Invoices",
                href: "/intra/erp/finance/invoices",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$receipt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Receipt$3e$__["Receipt"]
            }
        ]
    },
    {
        items: [
            {
                name: "Settings",
                href: "/intra/erp/settings",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"]
            }
        ]
    }
];
function ErpSidebar({ className }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { user, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [openMenus, setOpenMenus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ErpSidebar.useEffect": ()=>{
            const newOpen = new Set(openMenus);
            for (const group of navigationGroups){
                for (const item of group.items){
                    if (item.children) {
                        const isChildActive = item.children.some({
                            "ErpSidebar.useEffect.isChildActive": (c)=>pathname === c.href || pathname.startsWith(c.href + '/')
                        }["ErpSidebar.useEffect.isChildActive"]);
                        if (isChildActive || pathname.startsWith(item.href)) newOpen.add(item.name);
                    }
                }
            }
            if (newOpen.size !== openMenus.size || [
                ...newOpen
            ].some({
                "ErpSidebar.useEffect": (v)=>!openMenus.has(v)
            }["ErpSidebar.useEffect"])) setOpenMenus(newOpen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["ErpSidebar.useEffect"], [
        pathname
    ]);
    const toggleMenu = (name)=>{
        setOpenMenus((prev)=>{
            const n = new Set(prev);
            n.has(name) ? n.delete(name) : n.add(name);
            return n;
        });
    };
    const isActive = (href)=>pathname === href;
    const isParentActive = (item)=>{
        if (pathname === item.href) return true;
        if (item.children) return item.children.some((c)=>pathname === c.href || pathname.startsWith(c.href + '/'));
        return pathname.startsWith(item.href + '/');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("flex h-full w-full flex-col bg-zinc-950 text-zinc-400 border-r border-zinc-800", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-16 items-center px-5 shrink-0 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Logo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Logo"], {
                        variant: "vertical",
                        size: "sm"
                    }, void 0, false, {
                        fileName: "[project]/components/ErpSidebar.tsx",
                        lineNumber: 115,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/intra/erp",
                        className: "text-2xl font-bold text-white tracking-tight hover:text-indigo-400 transition-colors",
                        children: "ERP"
                    }, void 0, false, {
                        fileName: "[project]/components/ErpSidebar.tsx",
                        lineNumber: 116,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ErpSidebar.tsx",
                lineNumber: 114,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex-1 overflow-y-auto px-3 py-2 space-y-1",
                children: navigationGroups.map((group, gIdx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            group.label ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 px-3 pt-5 pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-semibold tracking-widest text-zinc-600 uppercase",
                                        children: group.label
                                    }, void 0, false, {
                                        fileName: "[project]/components/ErpSidebar.tsx",
                                        lineNumber: 126,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 h-px bg-zinc-800/60"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ErpSidebar.tsx",
                                        lineNumber: 127,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ErpSidebar.tsx",
                                lineNumber: 125,
                                columnNumber: 29
                            }, this) : gIdx > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "my-2 mx-3 h-px bg-zinc-800/60"
                            }, void 0, false, {
                                fileName: "[project]/components/ErpSidebar.tsx",
                                lineNumber: 129,
                                columnNumber: 40
                            }, this) : null,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-0.5",
                                children: group.items.map((item)=>{
                                    const hasChildren = item.children && item.children.length > 0;
                                    const parentActive = isParentActive(item);
                                    const isOpen = openMenus.has(item.name);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            hasChildren ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    toggleMenu(item.name);
                                                    if (!isOpen) router.push(item.href);
                                                },
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(parentActive ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white", "group flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors"),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(parentActive ? "text-indigo-500" : "text-zinc-500 group-hover:text-zinc-300", "mr-3 h-[18px] w-[18px]")
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ErpSidebar.tsx",
                                                                lineNumber: 144,
                                                                columnNumber: 53
                                                            }, this),
                                                            item.name
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ErpSidebar.tsx",
                                                        lineNumber: 143,
                                                        columnNumber: 49
                                                    }, this),
                                                    isOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                        className: "h-3.5 w-3.5 text-zinc-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ErpSidebar.tsx",
                                                        lineNumber: 147,
                                                        columnNumber: 59
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                        className: "h-3.5 w-3.5 text-zinc-600"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ErpSidebar.tsx",
                                                        lineNumber: 147,
                                                        columnNumber: 115
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ErpSidebar.tsx",
                                                lineNumber: 139,
                                                columnNumber: 45
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: item.href,
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(parentActive ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white", "group flex items-center rounded-md px-2.5 py-2 text-sm font-medium transition-colors"),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(parentActive ? "text-indigo-500" : "text-zinc-500 group-hover:text-zinc-300", "mr-3 h-[18px] w-[18px]")
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ErpSidebar.tsx",
                                                        lineNumber: 151,
                                                        columnNumber: 49
                                                    }, this),
                                                    item.name
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ErpSidebar.tsx",
                                                lineNumber: 150,
                                                columnNumber: 45
                                            }, this),
                                            hasChildren && isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "ml-5 mt-0.5 space-y-0.5 border-l border-zinc-800/60 pl-3",
                                                children: item.children.map((child)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: child.href,
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(isActive(child.href) ? "text-white bg-zinc-900/50" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30", "block rounded-md px-2.5 py-1.5 text-[13px] transition-colors"),
                                                        children: child.name
                                                    }, child.href, false, {
                                                        fileName: "[project]/components/ErpSidebar.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 53
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/components/ErpSidebar.tsx",
                                                lineNumber: 156,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, item.name, true, {
                                        fileName: "[project]/components/ErpSidebar.tsx",
                                        lineNumber: 137,
                                        columnNumber: 37
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/ErpSidebar.tsx",
                                lineNumber: 131,
                                columnNumber: 25
                            }, this)
                        ]
                    }, gIdx, true, {
                        fileName: "[project]/components/ErpSidebar.tsx",
                        lineNumber: 123,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/ErpSidebar.tsx",
                lineNumber: 121,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t border-zinc-800",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs",
                                    children: user?.avatarInitials ?? 'U'
                                }, void 0, false, {
                                    fileName: "[project]/components/ErpSidebar.tsx",
                                    lineNumber: 175,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-white font-medium",
                                            children: user?.name ?? 'User'
                                        }, void 0, false, {
                                            fileName: "[project]/components/ErpSidebar.tsx",
                                            lineNumber: 177,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-zinc-500",
                                            children: user?.role ?? 'Viewer'
                                        }, void 0, false, {
                                            fileName: "[project]/components/ErpSidebar.tsx",
                                            lineNumber: 178,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ErpSidebar.tsx",
                                    lineNumber: 176,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ErpSidebar.tsx",
                            lineNumber: 174,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                logout();
                                router.push('/login');
                            },
                            className: "p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors",
                            title: "Sign out",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/components/ErpSidebar.tsx",
                                lineNumber: 182,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/ErpSidebar.tsx",
                            lineNumber: 181,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ErpSidebar.tsx",
                    lineNumber: 173,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ErpSidebar.tsx",
                lineNumber: 172,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ErpSidebar.tsx",
        lineNumber: 113,
        columnNumber: 9
    }, this);
}
_s(ErpSidebar, "iDWD8RQnNh1LTneBwox88+9lHEE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = ErpSidebar;
var _c;
__turbopack_context__.k.register(_c, "ErpSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Header.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Header",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
"use client";
;
;
function Header({ onMenuClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 md:px-6 shrink-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4 flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onMenuClick,
                        className: "md:hidden p-2 -ml-2 text-zinc-400 hover:text-white",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                            className: "h-6 w-6"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 17,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/Header.tsx",
                        lineNumber: 13,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative w-full max-w-sm md:max-w-md",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500"
                            }, void 0, false, {
                                fileName: "[project]/components/Header.tsx",
                                lineNumber: 20,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Search universe...",
                                className: "h-9 w-full md:w-64 rounded-md border border-zinc-800 bg-zinc-900 pl-9 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                            }, void 0, false, {
                                fileName: "[project]/components/Header.tsx",
                                lineNumber: 21,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Header.tsx",
                        lineNumber: 19,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Header.tsx",
                lineNumber: 12,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "relative rounded-full p-2 text-zinc-400 hover:text-white transition-colors",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-zinc-950"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 30,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                            className: "h-5 w-5"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 31,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Header.tsx",
                    lineNumber: 29,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/Header.tsx",
                lineNumber: 28,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Header.tsx",
        lineNumber: 11,
        columnNumber: 9
    }, this);
}
_c = Header;
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ErpShell.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErpShell",
    ()=>ErpShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ErpSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ErpSidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Header.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ErpShell({ children }) {
    _s();
    const [sidebarOpen, setSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ErpShell.useEffect": ()=>{
            setSidebarOpen(false);
        }
    }["ErpShell.useEffect"], [
        pathname
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full bg-black text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ErpSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErpSidebar"], {}, void 0, false, {
                    fileName: "[project]/components/ErpShell.tsx",
                    lineNumber: 16,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ErpShell.tsx",
                lineNumber: 15,
                columnNumber: 13
            }, this),
            sidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-40 bg-black/80 md:hidden backdrop-blur-sm",
                onClick: ()=>setSidebarOpen(false)
            }, void 0, false, {
                fileName: "[project]/components/ErpShell.tsx",
                lineNumber: 18,
                columnNumber: 29
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 transform transition-transform duration-300 ease-in-out md:hidden border-r border-zinc-800",
                style: {
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ErpSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErpSidebar"], {
                    className: "h-full"
                }, void 0, false, {
                    fileName: "[project]/components/ErpShell.tsx",
                    lineNumber: 20,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ErpShell.tsx",
                lineNumber: 19,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-1 flex-col md:pl-64 h-full overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Header"], {
                        onMenuClick: ()=>setSidebarOpen(true)
                    }, void 0, false, {
                        fileName: "[project]/components/ErpShell.tsx",
                        lineNumber: 23,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 overflow-y-auto p-4 md:p-8",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/ErpShell.tsx",
                        lineNumber: 24,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ErpShell.tsx",
                lineNumber: 22,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ErpShell.tsx",
        lineNumber: 14,
        columnNumber: 9
    }, this);
}
_s(ErpShell, "LesnLK1nR3Eq03crRi4Zpb5af2c=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = ErpShell;
var _c;
__turbopack_context__.k.register(_c, "ErpShell");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/crm-data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialActivities",
    ()=>initialActivities,
    "initialDeals",
    ()=>initialDeals,
    "initialOrganizations",
    ()=>initialOrganizations,
    "initialPeople",
    ()=>initialPeople
]);
const initialPeople = [
    // Students (MADLeague/MADLeap)
    {
        id: 'p1',
        name: '김지은',
        email: 'jieun@univ.ac.kr',
        phone: '010-1111-1001',
        type: 'Student',
        status: 'Active',
        company: '서울대학교',
        position: '마케팅학과 3학년',
        avatarInitials: 'JE',
        brandAssociation: [
            'madleap'
        ],
        tags: [
            'MADLeap 5기',
            '디지털 마케팅'
        ],
        source: 'MADLeap',
        cohort: 'MADLeap 5기',
        createdAt: '2025-03-01'
    },
    {
        id: 'p2',
        name: '박민수',
        email: 'minsu@univ.ac.kr',
        type: 'Student',
        status: 'Active',
        company: '고려대학교',
        position: '광고홍보학과 4학년',
        avatarInitials: 'MS',
        brandAssociation: [
            'madleap',
            'madleague'
        ],
        tags: [
            'MADLeap 4기',
            '경쟁PT 우수'
        ],
        source: 'MADLeap',
        cohort: 'MADLeap 4기',
        createdAt: '2024-03-01'
    },
    {
        id: 'p3',
        name: '이서연',
        email: 'seoyeon@univ.ac.kr',
        type: 'Student',
        status: 'Active',
        company: '부산대학교',
        position: '경영학과 3학년',
        avatarInitials: 'SY',
        brandAssociation: [
            'madleague'
        ],
        tags: [
            'PAM 2기',
            '브랜딩'
        ],
        source: 'MADLeague',
        cohort: 'PAM 2기',
        createdAt: '2025-03-15'
    },
    {
        id: 'p4',
        name: '정현우',
        email: 'hyunwoo@univ.ac.kr',
        type: 'Student',
        status: 'Alumni',
        company: '한양대학교',
        position: '시각디자인학과 졸업',
        avatarInitials: 'HW',
        brandAssociation: [
            'madleap'
        ],
        tags: [
            'MADLeap 3기',
            '디자인',
            'HeRo 후보'
        ],
        source: 'MADLeap',
        cohort: 'MADLeap 3기',
        lastContacted: '2025-08-20',
        createdAt: '2023-03-01'
    },
    {
        id: 'p5',
        name: '최유나',
        email: 'yuna@univ.ac.kr',
        type: 'Student',
        status: 'Active',
        company: '제주대학교',
        position: '관광학과 2학년',
        avatarInitials: 'YN',
        brandAssociation: [
            'madleague'
        ],
        tags: [
            'SUZAK 1기',
            '콘텐츠'
        ],
        source: 'MADLeague',
        cohort: 'SUZAK 1기',
        createdAt: '2025-03-20'
    },
    // Professionals (Badak)
    {
        id: 'p6',
        name: 'Sarah Kim',
        email: 'sarah.kim@cjenm.com',
        phone: '010-1234-5678',
        type: 'Professional',
        status: 'Active',
        company: 'CJ ENM',
        position: 'Brand Manager',
        avatarInitials: 'SK',
        brandAssociation: [
            'badak',
            'luki'
        ],
        tags: [
            '엔터테인먼트',
            '파트너'
        ],
        source: 'Badak',
        lastContacted: '2025-08-28',
        createdAt: '2024-06-01',
        notes: 'LUKI 데뷔 배급 핵심 파트너'
    },
    {
        id: 'p7',
        name: 'David Lee',
        email: 'david@vfx.kr',
        phone: '010-9876-5432',
        type: 'Professional',
        status: 'Active',
        company: 'Visual FX Studio',
        position: 'Creative Director',
        avatarInitials: 'DL',
        brandAssociation: [
            'badak',
            'rook'
        ],
        tags: [
            '3D',
            'VFX',
            '외주'
        ],
        source: 'Badak',
        lastContacted: '2025-07-15',
        createdAt: '2024-01-15',
        notes: 'RooK 3D 에셋 주 공급'
    },
    {
        id: 'p8',
        name: '한수진',
        email: 'sujin@digitalagency.kr',
        type: 'Professional',
        status: 'Active',
        company: 'Digital First',
        position: 'Account Director',
        avatarInitials: 'SJ',
        brandAssociation: [
            'badak'
        ],
        tags: [
            '디지털',
            '퍼포먼스'
        ],
        source: 'Badak',
        createdAt: '2024-08-01'
    },
    {
        id: 'p9',
        name: '오태영',
        email: 'taeyoung@startup.io',
        type: 'Professional',
        status: 'Active',
        company: 'GrowthLab',
        position: 'CMO',
        avatarInitials: 'TY',
        brandAssociation: [
            'badak',
            'youinone'
        ],
        tags: [
            '스타트업',
            '그로스'
        ],
        source: 'Badak',
        createdAt: '2024-05-01'
    },
    {
        id: 'p10',
        name: '김도현',
        email: 'dohyun@adagency.com',
        type: 'Professional',
        status: 'Lead',
        company: 'HSAD',
        position: 'AE',
        avatarInitials: 'DH',
        brandAssociation: [
            'badak'
        ],
        tags: [
            '광고',
            '기획'
        ],
        source: 'Referral',
        createdAt: '2025-09-01'
    },
    // Mentors (YouInOne)
    {
        id: 'p11',
        name: '이준혁',
        email: 'junhyuk@youinone.com',
        type: 'Mentor',
        status: 'Active',
        company: 'YouInOne',
        position: '거점 멘토 (서울)',
        avatarInitials: 'JH',
        brandAssociation: [
            'youinone',
            'madleap'
        ],
        tags: [
            '멘토',
            '마케팅 전략'
        ],
        source: 'MADLeap 출신',
        createdAt: '2024-01-01'
    },
    {
        id: 'p12',
        name: '박소현',
        email: 'sohyun@youinone.com',
        type: 'Mentor',
        status: 'Active',
        company: 'YouInOne',
        position: '거점 멘토 (부산)',
        avatarInitials: 'SH',
        brandAssociation: [
            'youinone',
            'madleague'
        ],
        tags: [
            '멘토',
            '브랜딩'
        ],
        source: 'Badak 출신',
        createdAt: '2024-06-01'
    },
    {
        id: 'p13',
        name: '강민재',
        email: 'minjae@youinone.com',
        type: 'Mentor',
        status: 'Active',
        company: 'YouInOne',
        position: '선배 멘토',
        avatarInitials: 'MJ',
        brandAssociation: [
            'youinone'
        ],
        tags: [
            '멘토',
            '콘텐츠'
        ],
        source: 'MADLeague 출신',
        createdAt: '2025-01-01'
    },
    // Partner/Client contacts
    {
        id: 'p14',
        name: 'Minji Park',
        email: 'minji.vlog@gmail.com',
        phone: '010-5555-5555',
        type: 'Partner',
        status: 'Lead',
        company: 'Freelance',
        position: 'Influencer',
        avatarInitials: 'MP',
        brandAssociation: [
            'madleague'
        ],
        tags: [
            '인플루언서',
            '앰배서더 후보'
        ],
        source: 'MADLeague',
        lastContacted: '2025-09-01',
        createdAt: '2025-07-01',
        notes: 'MAD League Season 2 앰배서더 후보'
    },
    {
        id: 'p15',
        name: '장우성',
        email: 'wooseong@youngyang.go.kr',
        type: 'Client',
        status: 'Active',
        company: '경상북도 영양군',
        position: '지역활성화팀 주임',
        avatarInitials: 'WS',
        brandAssociation: [
            'madleague'
        ],
        tags: [
            '지자체',
            '인사이트 투어링'
        ],
        source: 'Direct',
        lastContacted: '2025-09-10',
        createdAt: '2025-08-01',
        notes: '인사이트 투어링 담당자'
    }
];
const initialOrganizations = [
    {
        id: 'org1',
        name: 'CJ ENM',
        type: 'Partner',
        industry: '엔터테인먼트',
        website: 'https://cjenm.com',
        contactIds: [
            'p6'
        ],
        brandAssociation: [
            'luki',
            'badak'
        ],
        status: 'Active',
        createdAt: '2024-06-01'
    },
    {
        id: 'org2',
        name: 'Visual FX Studio',
        type: 'Vendor',
        industry: 'VFX/3D',
        website: 'https://vfx.kr',
        contactIds: [
            'p7'
        ],
        brandAssociation: [
            'rook'
        ],
        status: 'Active',
        createdAt: '2024-01-15'
    },
    {
        id: 'org3',
        name: '경상북도 영양군',
        type: 'Client',
        industry: '지방자치단체',
        contactIds: [
            'p15'
        ],
        brandAssociation: [
            'madleague'
        ],
        status: 'Active',
        createdAt: '2025-08-01',
        notes: '인사이트 투어링 파트너'
    },
    {
        id: 'org4',
        name: '지평막걸리',
        type: 'Sponsor',
        industry: '식음료',
        website: 'https://jipyeong.co.kr',
        contactIds: [],
        brandAssociation: [
            'madleague'
        ],
        status: 'Active',
        createdAt: '2025-01-01',
        notes: '경쟁PT 호스트 브랜드'
    },
    {
        id: 'org5',
        name: 'LG U+',
        type: 'Sponsor',
        industry: '통신',
        website: 'https://uplus.co.kr',
        contactIds: [],
        brandAssociation: [
            'madleague'
        ],
        status: 'Active',
        createdAt: '2025-03-01',
        notes: '경쟁PT 호스트 브랜드'
    },
    {
        id: 'org6',
        name: 'Digital First',
        type: 'Partner',
        industry: '디지털 마케팅',
        contactIds: [
            'p8'
        ],
        brandAssociation: [
            'badak'
        ],
        status: 'Active',
        createdAt: '2024-08-01'
    },
    {
        id: 'org7',
        name: 'GrowthLab',
        type: 'Partner',
        industry: '스타트업',
        contactIds: [
            'p9'
        ],
        brandAssociation: [
            'youinone'
        ],
        status: 'Active',
        createdAt: '2024-05-01'
    },
    {
        id: 'org8',
        name: 'SBA 서울산업진흥원',
        type: 'Partner',
        industry: '공공기관',
        contactIds: [],
        brandAssociation: [
            'tenone'
        ],
        status: 'Active',
        createdAt: '2024-01-01',
        notes: '심사위원 활동'
    }
];
const initialDeals = [
    {
        id: 'd1',
        title: 'MADLeague 인사이트 투어링 - 영양군',
        organizationId: 'org3',
        contactId: 'p15',
        stage: 'Negotiation',
        value: 8000000,
        currency: 'KRW',
        brandId: 'madleague',
        expectedCloseDate: '2025-10-15',
        createdAt: '2025-08-15',
        updatedAt: '2025-09-10',
        notes: '2025 하반기 인사이트 투어링 프로그램'
    },
    {
        id: 'd2',
        title: '지평막걸리 경쟁PT 스폰서십',
        organizationId: 'org4',
        contactId: '',
        stage: 'Won',
        value: 5000000,
        currency: 'KRW',
        brandId: 'madleague',
        createdAt: '2025-01-20',
        updatedAt: '2025-02-10'
    },
    {
        id: 'd3',
        title: 'LG U+ Re:zeros 경쟁PT',
        organizationId: 'org5',
        contactId: '',
        stage: 'Won',
        value: 7000000,
        currency: 'KRW',
        brandId: 'madleague',
        createdAt: '2025-03-01',
        updatedAt: '2025-04-15'
    },
    {
        id: 'd4',
        title: 'CJ ENM LUKI 콜라보레이션',
        organizationId: 'org1',
        contactId: 'p6',
        stage: 'Proposal',
        value: 20000000,
        currency: 'KRW',
        brandId: 'luki',
        expectedCloseDate: '2025-12-01',
        createdAt: '2025-09-01',
        updatedAt: '2025-09-10'
    },
    {
        id: 'd5',
        title: 'RooK VFX 제작 계약',
        organizationId: 'org2',
        contactId: 'p7',
        stage: 'Contacted',
        value: 3000000,
        currency: 'KRW',
        brandId: 'rook',
        createdAt: '2025-09-05',
        updatedAt: '2025-09-05'
    },
    {
        id: 'd6',
        title: 'Badak 밋업 스폰서 (Digital First)',
        organizationId: 'org6',
        contactId: 'p8',
        stage: 'Lead',
        value: 1000000,
        currency: 'KRW',
        brandId: 'badak',
        createdAt: '2025-09-12',
        updatedAt: '2025-09-12'
    }
];
const initialActivities = [
    {
        id: 'a1',
        type: 'Meeting',
        title: '영양군 인사이트 투어링 킥오프',
        description: '프로그램 일정 및 예산 논의',
        personId: 'p15',
        organizationId: 'org3',
        dealId: 'd1',
        date: '2025-09-10',
        createdAt: '2025-09-10'
    },
    {
        id: 'a2',
        type: 'Email',
        title: 'CJ ENM LUKI 콜라보 제안서 발송',
        personId: 'p6',
        organizationId: 'org1',
        dealId: 'd4',
        date: '2025-09-08',
        createdAt: '2025-09-08'
    },
    {
        id: 'a3',
        type: 'Call',
        title: 'David Lee RooK 프로젝트 논의',
        personId: 'p7',
        organizationId: 'org2',
        dealId: 'd5',
        date: '2025-09-05',
        createdAt: '2025-09-05'
    },
    {
        id: 'a4',
        type: 'Event',
        title: 'MADLeap 5기 OT',
        description: '신입 멤버 오리엔테이션',
        personId: 'p1',
        date: '2025-03-08',
        createdAt: '2025-03-08'
    },
    {
        id: 'a5',
        type: 'Meeting',
        title: 'YouInOne 멘토단 회의',
        description: '2025 하반기 멘토링 계획',
        personId: 'p11',
        date: '2025-09-01',
        createdAt: '2025-09-01'
    },
    {
        id: 'a6',
        type: 'Note',
        title: 'Badak 밋업 스폰서 아이디어',
        description: 'Digital First 한수진 대표와 밋업 협찬 논의 필요',
        personId: 'p8',
        dealId: 'd6',
        date: '2025-09-12',
        createdAt: '2025-09-12'
    },
    {
        id: 'a7',
        type: 'Email',
        title: 'MADLeague Season 2 앰배서더 제안',
        personId: 'p14',
        date: '2025-09-01',
        createdAt: '2025-09-01'
    },
    {
        id: 'a8',
        type: 'Meeting',
        title: '지평막걸리 경쟁PT 결과 보고',
        organizationId: 'org4',
        dealId: 'd2',
        date: '2025-04-20',
        createdAt: '2025-04-20'
    },
    {
        id: 'a9',
        type: 'Event',
        title: 'Re:zeros 경쟁PT 본선',
        description: '4팀 참가, LG U+ 본사',
        organizationId: 'org5',
        dealId: 'd3',
        date: '2025-04-10',
        createdAt: '2025-04-10'
    },
    {
        id: 'a10',
        type: 'Call',
        title: 'SBA 심사위원 일정 확인',
        organizationId: 'org8',
        date: '2025-08-25',
        createdAt: '2025-08-25'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/crm-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CrmProvider",
    ()=>CrmProvider,
    "useCrm",
    ()=>useCrm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$crm$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/crm-data.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const CrmContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function CrmProvider({ children }) {
    _s();
    const [people, setPeople] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$crm$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialPeople"]);
    const [organizations, setOrganizations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$crm$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialOrganizations"]);
    const [deals, setDeals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$crm$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialDeals"]);
    const [activities, setActivities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$crm$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialActivities"]);
    const addPerson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrmProvider.useCallback[addPerson]": (p)=>setPeople({
                "CrmProvider.useCallback[addPerson]": (prev)=>[
                        p,
                        ...prev
                    ]
            }["CrmProvider.useCallback[addPerson]"])
    }["CrmProvider.useCallback[addPerson]"], []);
    const updatePerson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrmProvider.useCallback[updatePerson]": (id, updates)=>{
            setPeople({
                "CrmProvider.useCallback[updatePerson]": (prev)=>prev.map({
                        "CrmProvider.useCallback[updatePerson]": (p)=>p.id === id ? {
                                ...p,
                                ...updates
                            } : p
                    }["CrmProvider.useCallback[updatePerson]"])
            }["CrmProvider.useCallback[updatePerson]"]);
        }
    }["CrmProvider.useCallback[updatePerson]"], []);
    const deletePerson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrmProvider.useCallback[deletePerson]": (id)=>setPeople({
                "CrmProvider.useCallback[deletePerson]": (prev)=>prev.filter({
                        "CrmProvider.useCallback[deletePerson]": (p)=>p.id !== id
                    }["CrmProvider.useCallback[deletePerson]"])
            }["CrmProvider.useCallback[deletePerson]"])
    }["CrmProvider.useCallback[deletePerson]"], []);
    const addOrganization = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrmProvider.useCallback[addOrganization]": (o)=>setOrganizations({
                "CrmProvider.useCallback[addOrganization]": (prev)=>[
                        o,
                        ...prev
                    ]
            }["CrmProvider.useCallback[addOrganization]"])
    }["CrmProvider.useCallback[addOrganization]"], []);
    const updateOrganization = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrmProvider.useCallback[updateOrganization]": (id, updates)=>{
            setOrganizations({
                "CrmProvider.useCallback[updateOrganization]": (prev)=>prev.map({
                        "CrmProvider.useCallback[updateOrganization]": (o)=>o.id === id ? {
                                ...o,
                                ...updates
                            } : o
                    }["CrmProvider.useCallback[updateOrganization]"])
            }["CrmProvider.useCallback[updateOrganization]"]);
        }
    }["CrmProvider.useCallback[updateOrganization]"], []);
    const addDeal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrmProvider.useCallback[addDeal]": (d)=>setDeals({
                "CrmProvider.useCallback[addDeal]": (prev)=>[
                        d,
                        ...prev
                    ]
            }["CrmProvider.useCallback[addDeal]"])
    }["CrmProvider.useCallback[addDeal]"], []);
    const updateDeal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrmProvider.useCallback[updateDeal]": (id, updates)=>{
            setDeals({
                "CrmProvider.useCallback[updateDeal]": (prev)=>prev.map({
                        "CrmProvider.useCallback[updateDeal]": (d)=>d.id === id ? {
                                ...d,
                                ...updates,
                                updatedAt: new Date().toISOString().split('T')[0]
                            } : d
                    }["CrmProvider.useCallback[updateDeal]"])
            }["CrmProvider.useCallback[updateDeal]"]);
        }
    }["CrmProvider.useCallback[updateDeal]"], []);
    const moveDeal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrmProvider.useCallback[moveDeal]": (id, stage)=>{
            setDeals({
                "CrmProvider.useCallback[moveDeal]": (prev)=>prev.map({
                        "CrmProvider.useCallback[moveDeal]": (d)=>d.id === id ? {
                                ...d,
                                stage,
                                updatedAt: new Date().toISOString().split('T')[0]
                            } : d
                    }["CrmProvider.useCallback[moveDeal]"])
            }["CrmProvider.useCallback[moveDeal]"]);
        }
    }["CrmProvider.useCallback[moveDeal]"], []);
    const addActivity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrmProvider.useCallback[addActivity]": (a)=>setActivities({
                "CrmProvider.useCallback[addActivity]": (prev)=>[
                        a,
                        ...prev
                    ]
            }["CrmProvider.useCallback[addActivity]"])
    }["CrmProvider.useCallback[addActivity]"], []);
    const getPersonById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrmProvider.useCallback[getPersonById]": (id)=>people.find({
                "CrmProvider.useCallback[getPersonById]": (p)=>p.id === id
            }["CrmProvider.useCallback[getPersonById]"])
    }["CrmProvider.useCallback[getPersonById]"], [
        people
    ]);
    const getOrgById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrmProvider.useCallback[getOrgById]": (id)=>organizations.find({
                "CrmProvider.useCallback[getOrgById]": (o)=>o.id === id
            }["CrmProvider.useCallback[getOrgById]"])
    }["CrmProvider.useCallback[getOrgById]"], [
        organizations
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CrmContext.Provider, {
        value: {
            people,
            addPerson,
            updatePerson,
            deletePerson,
            organizations,
            addOrganization,
            updateOrganization,
            deals,
            addDeal,
            updateDeal,
            moveDeal,
            activities,
            addActivity,
            getPersonById,
            getOrgById
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/crm-context.tsx",
        lineNumber: 62,
        columnNumber: 9
    }, this);
}
_s(CrmProvider, "K3+L+lPSIRqW8I5w7vwfZnuLNAA=");
_c = CrmProvider;
function useCrm() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CrmContext);
    if (!context) throw new Error('useCrm must be used within CrmProvider');
    return context;
}
_s1(useCrm, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "CrmProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/staff-data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "accessOptions",
    ()=>accessOptions,
    "brandOptions",
    ()=>brandOptions,
    "divisionDefaultAccess",
    ()=>divisionDefaultAccess,
    "divisions",
    ()=>divisions,
    "initialStaff",
    ()=>initialStaff,
    "positions",
    ()=>positions
]);
const initialStaff = [
    {
        id: 's1',
        employeeId: '2019-0001',
        name: 'Cheonil Jeon',
        email: 'lools@tenone.biz',
        role: 'Admin',
        accessLevel: [
            'office',
            'erp-crm',
            'erp-hr',
            'erp-finance',
            'erp-admin'
        ],
        division: 'Management',
        department: '경영기획',
        position: '대표',
        brandAssociation: [
            'tenone',
            'luki',
            'rook',
            'hero',
            'badak',
            'madleap',
            'madleague',
            'youinone',
            'fwn',
            '0gamja'
        ],
        startDate: '2019-10-01',
        status: 'Active',
        phone: '010-2795-1001',
        avatarInitials: 'CJ',
        bio: '가치로 연결된 세계관을 만드는 사람',
        goals: '10,000명의 기획자를 발굴하고 연결한다',
        values: '본질, 속도, 이행',
        createdAt: '2019-10-01',
        updatedAt: '2025-03-01'
    },
    {
        id: 's2',
        employeeId: '2024-0001',
        name: 'Sarah Kim',
        email: 'manager@tenone.com',
        role: 'Manager',
        accessLevel: [
            'office',
            'erp-crm'
        ],
        division: 'Business',
        department: '브랜드관리',
        position: '매니저',
        brandAssociation: [
            'luki',
            'badak'
        ],
        startDate: '2024-06-01',
        status: 'Active',
        avatarInitials: 'SK',
        createdAt: '2024-06-01',
        updatedAt: '2025-01-15'
    },
    {
        id: 's3',
        employeeId: '2025-0001',
        name: '김준호',
        email: 'official@madleap.co.kr',
        role: 'Editor',
        accessLevel: [
            'office'
        ],
        division: 'Support',
        department: '커뮤니티운영',
        position: '주임',
        brandAssociation: [
            'madleap',
            'madleague'
        ],
        startDate: '2025-03-01',
        status: 'Active',
        phone: '010-1234-5678',
        avatarInitials: 'JH',
        bio: 'MADLeap 5기 출신, 서울·경기 동아리 운영 담당',
        createdAt: '2025-03-01',
        updatedAt: '2025-03-01'
    }
];
const divisions = [
    {
        id: 'Management',
        name: '관리부서',
        departments: [
            '경영기획',
            '인사',
            '회계/재무'
        ]
    },
    {
        id: 'Business',
        name: '사업부서',
        departments: [
            '브랜드관리',
            '파트너십',
            '영업'
        ]
    },
    {
        id: 'Production',
        name: '제작부서',
        departments: [
            '콘텐츠제작',
            '디자인',
            'AI크리에이티브'
        ]
    },
    {
        id: 'Support',
        name: '지원부서',
        departments: [
            '커뮤니티운영',
            '교육(Evolution School)',
            'MADLeague운영'
        ]
    }
];
const positions = [
    '대표',
    '이사',
    '팀장',
    '매니저',
    '선임',
    '주임',
    '사원',
    '인턴'
];
const divisionDefaultAccess = {
    Management: [
        'office',
        'erp-crm',
        'erp-hr',
        'erp-finance'
    ],
    Business: [
        'office',
        'erp-crm'
    ],
    Production: [
        'office'
    ],
    Support: [
        'office'
    ]
};
const accessOptions = [
    {
        id: 'office',
        label: 'Office',
        desc: '세계관 운영 도구'
    },
    {
        id: 'erp-crm',
        label: 'ERP CRM',
        desc: '고객/거래 관리'
    },
    {
        id: 'erp-hr',
        label: 'ERP HR',
        desc: '인사/GPR 관리'
    },
    {
        id: 'erp-finance',
        label: 'ERP Finance',
        desc: '재무/회계 관리'
    },
    {
        id: 'erp-admin',
        label: 'ERP Admin',
        desc: '전체 관리자'
    }
];
const brandOptions = [
    {
        id: 'tenone',
        name: 'Ten:One™'
    },
    {
        id: 'badak',
        name: 'Badak'
    },
    {
        id: 'madleap',
        name: 'MADLeap'
    },
    {
        id: 'madleague',
        name: 'MAD League'
    },
    {
        id: 'youinone',
        name: 'YouInOne'
    },
    {
        id: 'hero',
        name: 'HeRo'
    },
    {
        id: 'rook',
        name: 'RooK'
    },
    {
        id: 'luki',
        name: 'LUKI'
    },
    {
        id: 'fwn',
        name: 'FWN'
    },
    {
        id: '0gamja',
        name: '0gamja'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/staff-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StaffProvider",
    ()=>StaffProvider,
    "useStaff",
    ()=>useStaff
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$staff$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/staff-data.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const StaffContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function StaffProvider({ children }) {
    _s();
    const [staff, setStaff] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$staff$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialStaff"]);
    const addStaff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StaffProvider.useCallback[addStaff]": (member)=>setStaff({
                "StaffProvider.useCallback[addStaff]": (prev)=>[
                        member,
                        ...prev
                    ]
            }["StaffProvider.useCallback[addStaff]"])
    }["StaffProvider.useCallback[addStaff]"], []);
    const updateStaff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StaffProvider.useCallback[updateStaff]": (id, updates)=>{
            setStaff({
                "StaffProvider.useCallback[updateStaff]": (prev)=>prev.map({
                        "StaffProvider.useCallback[updateStaff]": (s)=>s.id === id ? {
                                ...s,
                                ...updates,
                                updatedAt: new Date().toISOString().split('T')[0]
                            } : s
                    }["StaffProvider.useCallback[updateStaff]"])
            }["StaffProvider.useCallback[updateStaff]"]);
        }
    }["StaffProvider.useCallback[updateStaff]"], []);
    const deleteStaff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StaffProvider.useCallback[deleteStaff]": (id)=>setStaff({
                "StaffProvider.useCallback[deleteStaff]": (prev)=>prev.filter({
                        "StaffProvider.useCallback[deleteStaff]": (s)=>s.id !== id
                    }["StaffProvider.useCallback[deleteStaff]"])
            }["StaffProvider.useCallback[deleteStaff]"])
    }["StaffProvider.useCallback[deleteStaff]"], []);
    const getStaffById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StaffProvider.useCallback[getStaffById]": (id)=>staff.find({
                "StaffProvider.useCallback[getStaffById]": (s)=>s.id === id
            }["StaffProvider.useCallback[getStaffById]"])
    }["StaffProvider.useCallback[getStaffById]"], [
        staff
    ]);
    const getStaffByEmail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StaffProvider.useCallback[getStaffByEmail]": (email)=>staff.find({
                "StaffProvider.useCallback[getStaffByEmail]": (s)=>s.email === email
            }["StaffProvider.useCallback[getStaffByEmail]"])
    }["StaffProvider.useCallback[getStaffByEmail]"], [
        staff
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StaffContext.Provider, {
        value: {
            staff,
            addStaff,
            updateStaff,
            deleteStaff,
            getStaffById,
            getStaffByEmail
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/staff-context.tsx",
        lineNumber: 30,
        columnNumber: 9
    }, this);
}
_s(StaffProvider, "s8Z2jTtuyXX6eRtxEJ3cYlfQOgM=");
_c = StaffProvider;
function useStaff() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(StaffContext);
    if (!context) throw new Error('useStaff must be used within StaffProvider');
    return context;
}
_s1(useStaff, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "StaffProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/gpr-data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialGprGoals",
    ()=>initialGprGoals,
    "ratingLabels",
    ()=>ratingLabels
]);
const initialGprGoals = [
    // Cheonil Jeon (s1)
    {
        id: 'gpr1',
        staffId: 's1',
        level: 'GPR-III',
        title: '10,000명의 기획자 발굴 네트워크 구축',
        description: 'MADLeague 전국 확장 + Badak 네트워킹 활성화를 통한 기획자 풀 확대',
        kpi: '연간 네트워크 가입자 500명 이상',
        weight: 30,
        status: 'In Progress',
        progress: 25,
        dueDate: '2025-12-31',
        agreedBy: 's1',
        agreedAt: '2025-01-15',
        period: '2025',
        createdAt: '2025-01-10',
        updatedAt: '2025-09-01'
    },
    {
        id: 'gpr2',
        staffId: 's1',
        level: 'GPR-II',
        title: 'MADLeague 인사이트 투어링 성공적 운영',
        description: '영양군 지역 활동가와 학생 연계 프로그램 실행',
        kpi: '참가 학생 30명, 기업 만족도 4.0 이상',
        weight: 25,
        status: 'In Progress',
        progress: 60,
        dueDate: '2025-10-15',
        agreedBy: 's1',
        agreedAt: '2025-08-01',
        period: '2025-Q3',
        createdAt: '2025-07-20',
        updatedAt: '2025-09-10'
    },
    {
        id: 'gpr3',
        staffId: 's1',
        level: 'GPR-II',
        title: 'LUKI 데뷔 캠페인 완료',
        description: 'AI 4인조 걸그룹 LUKI 공식 데뷔 및 콘텐츠 배포',
        kpi: '유튜브 구독자 1,000명',
        weight: 20,
        status: 'Evaluated',
        progress: 100,
        selfRating: 5,
        selfComment: '성공적으로 데뷔 완료. 예상보다 높은 초기 반응',
        selfEvaluatedAt: '2025-09-05',
        supervisorRating: 4,
        supervisorComment: '데뷔는 성공적이나 후속 콘텐츠 전략 보강 필요',
        supervisorId: 's1',
        evaluatedAt: '2025-09-10',
        period: '2025-Q3',
        createdAt: '2025-06-01',
        updatedAt: '2025-09-10'
    },
    {
        id: 'gpr4',
        staffId: 's1',
        level: 'GPR-I',
        title: '주간 콘텐츠 파이프라인 운영',
        description: 'Badak, MADLeague, FWN 채널 주기적 콘텐츠 발행',
        kpi: '주 3회 이상 콘텐츠 발행',
        weight: 15,
        status: 'In Progress',
        progress: 70,
        agreedBy: 's1',
        agreedAt: '2025-01-15',
        period: '2025',
        createdAt: '2025-01-10',
        updatedAt: '2025-09-12'
    },
    {
        id: 'gpr5',
        staffId: 's1',
        level: 'GPR-II',
        title: 'Vrief 프레임워크 매드리그 교육 적용',
        description: '매드리그 대학생 대상 Vrief 3Step 교육 프로그램 운영',
        kpi: '교육 참여 학생 50명, 만족도 4.5',
        weight: 10,
        status: 'In Progress',
        progress: 40,
        dueDate: '2025-11-30',
        period: '2025-Q4',
        createdAt: '2025-09-01',
        updatedAt: '2025-09-15'
    },
    // Sarah Kim (s2)
    {
        id: 'gpr6',
        staffId: 's2',
        level: 'GPR-II',
        title: 'LUKI 브랜드 파트너십 3건 확보',
        description: 'CJ ENM, 음원 유통사 등 파트너십 체결',
        kpi: '파트너십 계약 3건',
        weight: 40,
        status: 'Pending Approval',
        progress: 0,
        dueDate: '2025-12-31',
        period: '2025-Q4',
        createdAt: '2025-09-15',
        updatedAt: '2025-09-15'
    },
    {
        id: 'gpr7',
        staffId: 's2',
        level: 'GPR-I',
        title: 'Badak 밋업 월 1회 운영',
        description: '현업자 네트워킹 밋업 정기 개최',
        kpi: '월 1회 20명 참가',
        weight: 30,
        status: 'Agreed',
        progress: 30,
        agreedBy: 's1',
        agreedAt: '2025-09-01',
        period: '2025',
        createdAt: '2025-08-20',
        updatedAt: '2025-09-10'
    },
    // 김준호 (s3)
    {
        id: 'gpr8',
        staffId: 's3',
        level: 'GPR-I',
        title: 'MADLeap 5기 운영 관리',
        description: '5기 멤버 모집, OT, 정기 모임 운영',
        kpi: '신규 멤버 30명 모집, 잔존율 80%',
        weight: 50,
        status: 'In Progress',
        progress: 55,
        agreedBy: 's1',
        agreedAt: '2025-03-15',
        period: '2025',
        createdAt: '2025-03-01',
        updatedAt: '2025-09-10'
    },
    {
        id: 'gpr9',
        staffId: 's3',
        level: 'GPR-II',
        title: '경쟁PT 프로그램 기획',
        description: '2025 하반기 경쟁PT 호스트 브랜드 섭외 및 프로그램 설계',
        kpi: '호스트 브랜드 2개 확보',
        weight: 30,
        status: 'Draft',
        progress: 0,
        period: '2025-Q4',
        createdAt: '2025-09-10',
        updatedAt: '2025-09-10'
    }
];
const ratingLabels = {
    1: '기대 이하',
    2: '개선 필요',
    3: '기대 충족',
    4: '기대 초과',
    5: '탁월'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/gpr-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GprProvider",
    ()=>GprProvider,
    "useGpr",
    ()=>useGpr
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gpr$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/gpr-data.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const GprContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function GprProvider({ children }) {
    _s();
    const [goals, setGoals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gpr$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialGprGoals"]);
    const now = ()=>new Date().toISOString().split('T')[0];
    const addGoal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GprProvider.useCallback[addGoal]": (goal)=>setGoals({
                "GprProvider.useCallback[addGoal]": (prev)=>[
                        goal,
                        ...prev
                    ]
            }["GprProvider.useCallback[addGoal]"])
    }["GprProvider.useCallback[addGoal]"], []);
    const updateGoal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GprProvider.useCallback[updateGoal]": (id, updates)=>{
            setGoals({
                "GprProvider.useCallback[updateGoal]": (prev)=>prev.map({
                        "GprProvider.useCallback[updateGoal]": (g)=>g.id === id ? {
                                ...g,
                                ...updates,
                                updatedAt: now()
                            } : g
                    }["GprProvider.useCallback[updateGoal]"])
            }["GprProvider.useCallback[updateGoal]"]);
        }
    }["GprProvider.useCallback[updateGoal]"], []);
    const deleteGoal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GprProvider.useCallback[deleteGoal]": (id)=>setGoals({
                "GprProvider.useCallback[deleteGoal]": (prev)=>prev.filter({
                        "GprProvider.useCallback[deleteGoal]": (g)=>g.id !== id
                    }["GprProvider.useCallback[deleteGoal]"])
            }["GprProvider.useCallback[deleteGoal]"])
    }["GprProvider.useCallback[deleteGoal]"], []);
    const submitForApproval = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GprProvider.useCallback[submitForApproval]": (id)=>{
            setGoals({
                "GprProvider.useCallback[submitForApproval]": (prev)=>prev.map({
                        "GprProvider.useCallback[submitForApproval]": (g)=>g.id === id ? {
                                ...g,
                                status: 'Pending Approval',
                                updatedAt: now()
                            } : g
                    }["GprProvider.useCallback[submitForApproval]"])
            }["GprProvider.useCallback[submitForApproval]"]);
        }
    }["GprProvider.useCallback[submitForApproval]"], []);
    const agreeGoal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GprProvider.useCallback[agreeGoal]": (id, supervisorId)=>{
            setGoals({
                "GprProvider.useCallback[agreeGoal]": (prev)=>prev.map({
                        "GprProvider.useCallback[agreeGoal]": (g)=>g.id === id ? {
                                ...g,
                                status: 'Agreed',
                                agreedBy: supervisorId,
                                agreedAt: now(),
                                updatedAt: now()
                            } : g
                    }["GprProvider.useCallback[agreeGoal]"])
            }["GprProvider.useCallback[agreeGoal]"]);
        }
    }["GprProvider.useCallback[agreeGoal]"], []);
    const selfEvaluate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GprProvider.useCallback[selfEvaluate]": (id, rating, comment)=>{
            setGoals({
                "GprProvider.useCallback[selfEvaluate]": (prev)=>prev.map({
                        "GprProvider.useCallback[selfEvaluate]": (g)=>g.id === id ? {
                                ...g,
                                status: 'Self Evaluated',
                                selfRating: rating,
                                selfComment: comment,
                                selfEvaluatedAt: now(),
                                updatedAt: now()
                            } : g
                    }["GprProvider.useCallback[selfEvaluate]"])
            }["GprProvider.useCallback[selfEvaluate]"]);
        }
    }["GprProvider.useCallback[selfEvaluate]"], []);
    const supervisorEvaluate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GprProvider.useCallback[supervisorEvaluate]": (id, supervisorId, rating, comment)=>{
            setGoals({
                "GprProvider.useCallback[supervisorEvaluate]": (prev)=>prev.map({
                        "GprProvider.useCallback[supervisorEvaluate]": (g)=>g.id === id ? {
                                ...g,
                                status: 'Evaluated',
                                supervisorRating: rating,
                                supervisorComment: comment,
                                supervisorId,
                                evaluatedAt: now(),
                                updatedAt: now()
                            } : g
                    }["GprProvider.useCallback[supervisorEvaluate]"])
            }["GprProvider.useCallback[supervisorEvaluate]"]);
        }
    }["GprProvider.useCallback[supervisorEvaluate]"], []);
    const getGoalsByStaff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GprProvider.useCallback[getGoalsByStaff]": (staffId)=>goals.filter({
                "GprProvider.useCallback[getGoalsByStaff]": (g)=>g.staffId === staffId
            }["GprProvider.useCallback[getGoalsByStaff]"])
    }["GprProvider.useCallback[getGoalsByStaff]"], [
        goals
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GprContext.Provider, {
        value: {
            goals,
            addGoal,
            updateGoal,
            deleteGoal,
            submitForApproval,
            agreeGoal,
            selfEvaluate,
            supervisorEvaluate,
            getGoalsByStaff
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/gpr-context.tsx",
        lineNumber: 50,
        columnNumber: 9
    }, this);
}
_s(GprProvider, "Q5e9QxaPTlXErHGdGdHjUhVNu2o=");
_c = GprProvider;
function useGpr() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(GprContext);
    if (!context) throw new Error('useGpr must be used within GprProvider');
    return context;
}
_s1(useGpr, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "GprProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/intra/erp/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ErpLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ErpShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ErpShell.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$crm$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/crm-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$staff$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/staff-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gpr$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/gpr-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldAlert$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-alert.js [app-client] (ecmascript) <export default as ShieldAlert>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
function ErpLayout({ children }) {
    _s();
    const { isAuthenticated, isLoading, isStaff } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ErpLayout.useEffect": ()=>{
            if (!isLoading && !isAuthenticated) router.replace('/login');
        }
    }["ErpLayout.useEffect"], [
        isLoading,
        isAuthenticated,
        router
    ]);
    if (isLoading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full bg-black flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"
        }, void 0, false, {
            fileName: "[project]/app/intra/erp/layout.tsx",
            lineNumber: 22,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/intra/erp/layout.tsx",
        lineNumber: 21,
        columnNumber: 9
    }, this);
    if (!isAuthenticated) return null;
    if (!isStaff) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full bg-black flex items-center justify-center px-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center max-w-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldAlert$3e$__["ShieldAlert"], {
                        className: "h-12 w-12 text-red-500 mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/app/intra/erp/layout.tsx",
                        lineNumber: 32,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-white mb-2",
                        children: "접근 권한이 없습니다"
                    }, void 0, false, {
                        fileName: "[project]/app/intra/erp/layout.tsx",
                        lineNumber: 33,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-zinc-400 text-sm mb-6",
                        children: "접근이 허용되지 않았습니다. 관리자에게 권한을 요청하세요."
                    }, void 0, false, {
                        fileName: "[project]/app/intra/erp/layout.tsx",
                        lineNumber: 34,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>window.location.href = '/',
                        className: "px-6 py-2.5 rounded-lg bg-zinc-800 text-sm text-white hover:bg-zinc-700 transition-colors",
                        children: "홈으로 돌아가기"
                    }, void 0, false, {
                        fileName: "[project]/app/intra/erp/layout.tsx",
                        lineNumber: 35,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/intra/erp/layout.tsx",
                lineNumber: 31,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/intra/erp/layout.tsx",
            lineNumber: 30,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full bg-black",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$crm$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CrmProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$staff$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StaffProvider"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gpr$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GprProvider"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ErpShell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErpShell"], {
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/app/intra/erp/layout.tsx",
                        lineNumber: 48,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/intra/erp/layout.tsx",
                    lineNumber: 47,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/intra/erp/layout.tsx",
                lineNumber: 46,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/intra/erp/layout.tsx",
            lineNumber: 45,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/intra/erp/layout.tsx",
        lineNumber: 44,
        columnNumber: 9
    }, this);
}
_s(ErpLayout, "0mcuubkNK4Zo+mUT1t2Uk2XdqWA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ErpLayout;
var _c;
__turbopack_context__.k.register(_c, "ErpLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>LayoutDashboard
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "rect",
        {
            width: "7",
            height: "9",
            x: "3",
            y: "3",
            rx: "1",
            key: "10lvy0"
        }
    ],
    [
        "rect",
        {
            width: "7",
            height: "5",
            x: "14",
            y: "3",
            rx: "1",
            key: "16une8"
        }
    ],
    [
        "rect",
        {
            width: "7",
            height: "9",
            x: "14",
            y: "12",
            rx: "1",
            key: "1hutg5"
        }
    ],
    [
        "rect",
        {
            width: "7",
            height: "5",
            x: "3",
            y: "16",
            rx: "1",
            key: "ldoo1y"
        }
    ]
];
const LayoutDashboard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("layout-dashboard", __iconNode);
;
 //# sourceMappingURL=layout-dashboard.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LayoutDashboard",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Users
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
            key: "1yyitq"
        }
    ],
    [
        "path",
        {
            d: "M16 3.128a4 4 0 0 1 0 7.744",
            key: "16gr8j"
        }
    ],
    [
        "path",
        {
            d: "M22 21v-2a4 4 0 0 0-3-3.87",
            key: "kshegd"
        }
    ],
    [
        "circle",
        {
            cx: "9",
            cy: "7",
            r: "4",
            key: "nufk8"
        }
    ]
];
const Users = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("users", __iconNode);
;
 //# sourceMappingURL=users.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Users",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/user-check.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>UserCheck
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m16 11 2 2 4-4",
            key: "9rsbq5"
        }
    ],
    [
        "path",
        {
            d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
            key: "1yyitq"
        }
    ],
    [
        "circle",
        {
            cx: "9",
            cy: "7",
            r: "4",
            key: "nufk8"
        }
    ]
];
const UserCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("user-check", __iconNode);
;
 //# sourceMappingURL=user-check.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/user-check.js [app-client] (ecmascript) <export default as UserCheck>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserCheck",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-check.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/git-branch.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>GitBranch
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "line",
        {
            x1: "6",
            x2: "6",
            y1: "3",
            y2: "15",
            key: "17qcm7"
        }
    ],
    [
        "circle",
        {
            cx: "18",
            cy: "6",
            r: "3",
            key: "1h7g24"
        }
    ],
    [
        "circle",
        {
            cx: "6",
            cy: "18",
            r: "3",
            key: "fqmcym"
        }
    ],
    [
        "path",
        {
            d: "M18 9a9 9 0 0 1-9 9",
            key: "n2h4wq"
        }
    ]
];
const GitBranch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("git-branch", __iconNode);
;
 //# sourceMappingURL=git-branch.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/git-branch.js [app-client] (ecmascript) <export default as GitBranch>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GitBranch",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/git-branch.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>GraduationCap
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
            key: "j76jl0"
        }
    ],
    [
        "path",
        {
            d: "M22 10v6",
            key: "1lu8f3"
        }
    ],
    [
        "path",
        {
            d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5",
            key: "1r8lef"
        }
    ]
];
const GraduationCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("graduation-cap", __iconNode);
;
 //# sourceMappingURL=graduation-cap.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-client] (ecmascript) <export default as GraduationCap>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GraduationCap",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>DollarSign
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "line",
        {
            x1: "12",
            x2: "12",
            y1: "2",
            y2: "22",
            key: "7eqyqh"
        }
    ],
    [
        "path",
        {
            d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
            key: "1b0p4s"
        }
    ]
];
const DollarSign = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("dollar-sign", __iconNode);
;
 //# sourceMappingURL=dollar-sign.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript) <export default as DollarSign>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DollarSign",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/receipt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Receipt
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z",
            key: "q3az6g"
        }
    ],
    [
        "path",
        {
            d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8",
            key: "1h4pet"
        }
    ],
    [
        "path",
        {
            d: "M12 17.5v-11",
            key: "1jc1ny"
        }
    ]
];
const Receipt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("receipt", __iconNode);
;
 //# sourceMappingURL=receipt.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/receipt.js [app-client] (ecmascript) <export default as Receipt>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Receipt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$receipt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$receipt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/receipt.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>CreditCard
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "rect",
        {
            width: "20",
            height: "14",
            x: "2",
            y: "5",
            rx: "2",
            key: "ynyp8z"
        }
    ],
    [
        "line",
        {
            x1: "2",
            x2: "22",
            y1: "10",
            y2: "10",
            key: "1b3vmo"
        }
    ]
];
const CreditCard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("credit-card", __iconNode);
;
 //# sourceMappingURL=credit-card.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-client] (ecmascript) <export default as CreditCard>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CreditCard",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Settings
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
            key: "1i5ecw"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "3",
            key: "1v7zrd"
        }
    ]
];
const Settings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("settings", __iconNode);
;
 //# sourceMappingURL=settings.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Settings",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ChevronDown
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m6 9 6 6 6-6",
            key: "qrunsl"
        }
    ]
];
const ChevronDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("chevron-down", __iconNode);
;
 //# sourceMappingURL=chevron-down.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChevronDown",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ChevronRight
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m9 18 6-6-6-6",
            key: "mthhwq"
        }
    ]
];
const ChevronRight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("chevron-right", __iconNode);
;
 //# sourceMappingURL=chevron-right.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChevronRight",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Target
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "10",
            key: "1mglay"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "6",
            key: "1vlfrh"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "2",
            key: "1c9p78"
        }
    ]
];
const Target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("target", __iconNode);
;
 //# sourceMappingURL=target.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Target",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Upload
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 3v12",
            key: "1x0j5s"
        }
    ],
    [
        "path",
        {
            d: "m17 8-5-5-5 5",
            key: "7q97r8"
        }
    ],
    [
        "path",
        {
            d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
            key: "ih7n3h"
        }
    ]
];
const Upload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("upload", __iconNode);
;
 //# sourceMappingURL=upload.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Upload",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/tags.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Tags
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z",
            key: "16rjxf"
        }
    ],
    [
        "path",
        {
            d: "M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193",
            key: "178nd4"
        }
    ],
    [
        "circle",
        {
            cx: "10.5",
            cy: "6.5",
            r: ".5",
            fill: "currentColor",
            key: "12ikhr"
        }
    ]
];
const Tags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("tags", __iconNode);
;
 //# sourceMappingURL=tags.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/tags.js [app-client] (ecmascript) <export default as Tags>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tags",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tags$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tags$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tags.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/contact.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Contact
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M16 2v2",
            key: "scm5qe"
        }
    ],
    [
        "path",
        {
            d: "M7 22v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2",
            key: "1waht3"
        }
    ],
    [
        "path",
        {
            d: "M8 2v2",
            key: "pbkmx"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "11",
            r: "3",
            key: "itu57m"
        }
    ],
    [
        "rect",
        {
            x: "3",
            y: "4",
            width: "18",
            height: "18",
            rx: "2",
            key: "12vinp"
        }
    ]
];
const Contact = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("contact", __iconNode);
;
 //# sourceMappingURL=contact.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/contact.js [app-client] (ecmascript) <export default as Contact>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Contact",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$contact$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$contact$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/contact.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Bell
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M10.268 21a2 2 0 0 0 3.464 0",
            key: "vwvbt9"
        }
    ],
    [
        "path",
        {
            d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
            key: "11g9vi"
        }
    ]
];
const Bell = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("bell", __iconNode);
;
 //# sourceMappingURL=bell.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-client] (ecmascript) <export default as Bell>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Bell",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Search
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m21 21-4.34-4.34",
            key: "14j7rj"
        }
    ],
    [
        "circle",
        {
            cx: "11",
            cy: "11",
            r: "8",
            key: "4ej97u"
        }
    ]
];
const Search = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("search", __iconNode);
;
 //# sourceMappingURL=search.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Search",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Menu
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M4 5h16",
            key: "1tepv9"
        }
    ],
    [
        "path",
        {
            d: "M4 12h16",
            key: "1lakjw"
        }
    ],
    [
        "path",
        {
            d: "M4 19h16",
            key: "1djgab"
        }
    ]
];
const Menu = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("menu", __iconNode);
;
 //# sourceMappingURL=menu.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Menu",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_38c3eba9._.js.map