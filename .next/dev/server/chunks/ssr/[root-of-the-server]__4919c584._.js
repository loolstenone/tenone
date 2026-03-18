module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/lib/auth-data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isStaffEmail",
    ()=>isStaffEmail,
    "registerMember",
    ()=>registerMember,
    "validateCredentials",
    ()=>validateCredentials,
    "validatePassword",
    ()=>validatePassword
]);
// Staff accounts (registered via ERP)
const staffAccounts = [
    {
        email: 'lools@tenone.biz',
        password: 'ilove2ne1**',
        user: {
            id: 'u1',
            name: 'Cheonil Jeon',
            email: 'lools@tenone.biz',
            role: 'Admin',
            accountType: 'staff',
            avatarInitials: 'CJ',
            brandAccess: [
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
            systemAccess: [
                'studio',
                'erp-crm',
                'erp-hr',
                'erp-finance',
                'erp-admin',
                'marketing',
                'wiki'
            ],
            createdAt: '2019-10-01'
        }
    },
    {
        email: 'manager@tenone.com',
        password: 'tenone1234',
        user: {
            id: 'u2',
            name: 'Sarah Kim',
            email: 'manager@tenone.com',
            role: 'Manager',
            accountType: 'staff',
            avatarInitials: 'SK',
            brandAccess: [
                'luki',
                'badak'
            ],
            systemAccess: [
                'studio',
                'erp-crm',
                'marketing',
                'wiki'
            ],
            createdAt: '2024-06-01'
        }
    },
    {
        email: 'official@madleap.co.kr',
        password: '12345678',
        user: {
            id: 'u3',
            name: '김준호',
            email: 'official@madleap.co.kr',
            role: 'Editor',
            accountType: 'staff',
            avatarInitials: 'JH',
            brandAccess: [
                'madleap',
                'madleague'
            ],
            systemAccess: [
                'studio',
                'marketing',
                'wiki'
            ],
            createdAt: '2025-03-01',
            company: 'MADLeap',
            phone: '010-1234-5678'
        }
    }
];
// Pre-registered member test accounts
const defaultMembers = [
    {
        email: 'cheonil.jeon@gmail.com',
        password: '12345678',
        user: {
            id: 'm1',
            name: '전천일',
            email: 'cheonil.jeon@gmail.com',
            role: 'Member',
            accountType: 'member',
            avatarInitials: '천일',
            brandAccess: [],
            systemAccess: [],
            createdAt: '2025-03-15',
            phone: '010-2795-1001',
            bio: '마케팅·광고 20년차, Ten:One™ Universe 탐험가'
        }
    },
    {
        email: 'lools@kakao.com',
        password: '12345678',
        user: {
            id: 'm2',
            name: '전천일',
            email: 'lools@kakao.com',
            role: 'Member',
            accountType: 'member',
            avatarInitials: '천일',
            brandAccess: [],
            systemAccess: [],
            createdAt: '2025-03-15',
            company: 'Ten:One™',
            phone: '010-2795-1001',
            bio: 'Ten:One™ Universe 기업 파트너'
        }
    }
];
// Member accounts (self-registered via homepage)
const MEMBERS_STORAGE_KEY = 'tenone_members';
function getMembers() {
    if ("TURBOPACK compile-time truthy", 1) return defaultMembers;
    //TURBOPACK unreachable
    ;
}
function saveMembers(members) {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
}
function validatePassword(password) {
    if (password.length < 8) return {
        valid: false,
        error: '비밀번호는 8자 이상이어야 합니다.'
    };
    if (!/[a-zA-Z]/.test(password)) return {
        valid: false,
        error: '비밀번호에 영문이 포함되어야 합니다.'
    };
    if (!/[0-9]/.test(password)) return {
        valid: false,
        error: '비밀번호에 숫자가 포함되어야 합니다.'
    };
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) return {
        valid: false,
        error: '비밀번호에 특수문자가 포함되어야 합니다.'
    };
    return {
        valid: true
    };
}
function validateCredentials(email, password) {
    const allAccounts = [
        ...staffAccounts,
        ...getMembers()
    ];
    const account = allAccounts.find((a)=>a.email === email && a.password === password);
    return account?.user ?? null;
}
function registerMember(name, email, password, company) {
    const allAccounts = [
        ...staffAccounts,
        ...getMembers()
    ];
    if (allAccounts.some((a)=>a.email === email)) {
        return {
            success: false,
            error: '이미 등록된 이메일입니다.'
        };
    }
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) return {
        success: false,
        error: pwCheck.error
    };
    const initials = name.split(' ').map((n)=>n[0]).join('').toUpperCase().slice(0, 2) || name.slice(0, 2).toUpperCase();
    const user = {
        id: `m${Date.now()}`,
        name,
        email,
        role: 'Member',
        accountType: 'member',
        avatarInitials: initials,
        brandAccess: [],
        systemAccess: [],
        createdAt: new Date().toISOString().split('T')[0],
        company: company || undefined
    };
    const members = getMembers();
    members.push({
        email,
        password,
        user
    });
    saveMembers(members);
    return {
        success: true,
        user
    };
}
function isStaffEmail(email) {
    return staffAccounts.some((a)=>a.email === email);
}
}),
"[project]/lib/auth-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-data.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const STORAGE_KEY = 'tenone_auth_user';
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setUser(JSON.parse(stored));
        } catch  {
            localStorage.removeItem(STORAGE_KEY);
        }
        setIsLoading(false);
    }, []);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((email, password)=>{
        const validatedUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateCredentials"])(email, password);
        if (validatedUser) {
            setUser(validatedUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedUser));
            return {
                success: true
            };
        }
        return {
            success: false,
            error: '이메일 또는 비밀번호가 올바르지 않습니다.'
        };
    }, []);
    const register = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((name, email, password)=>{
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["registerMember"])(name, email, password);
        if (result.success && result.user) {
            setUser(result.user);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        }
        return {
            success: result.success,
            error: result.error
        };
    }, []);
    const updateProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((updates)=>{
        setUser((prev)=>{
            if (!prev) return prev;
            const updated = {
                ...prev,
                ...updates
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);
    const isStaff = user?.accountType === 'staff';
    const hasAccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((system)=>{
        if (!user) return false;
        if (user.role === 'Admin') return true;
        return user.systemAccess?.includes(system) ?? false;
    }, [
        user
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isAuthenticated: !!user,
            isLoading,
            isStaff,
            hasAccess,
            login,
            register,
            updateProfile,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/auth-context.tsx",
        lineNumber: 76,
        columnNumber: 9
    }, this);
}
function useAuth() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4919c584._.js.map