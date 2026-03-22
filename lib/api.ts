// ============================================
// API 클라이언트 유틸 (프론트엔드용)
// ============================================

const BASE_URL = '/api';

interface ApiResponse<T> {
    data: T;
    total?: number;
    error?: string;
}

async function request<T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });

    const json = await res.json();

    if (!res.ok) {
        throw new Error(json.error || `API 오류 (${res.status})`);
    }

    // 목록 응답: { data, total }
    if (json.data !== undefined && json.total !== undefined) {
        return { data: json.data, total: json.total };
    }
    // 단일 응답
    return { data: json.data ?? json };
}

// ── CRUD 헬퍼 ──

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint),

    post: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),

    patch: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),

    delete: <T>(endpoint: string) =>
        request<T>(endpoint, { method: 'DELETE' }),
};

// ── 모듈별 API ──

export const membersApi = {
    list: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get<unknown[]>(`/members${qs}`);
    },
    get: (id: string) => api.get<Record<string, unknown>>(`/members/${id}`),
    update: (id: string, data: unknown) => api.patch<Record<string, unknown>>(`/members/${id}`, data),
    create: (data: unknown) => api.post<Record<string, unknown>>('/members', data),
};

export const projectsApi = {
    list: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get<unknown[]>(`/projects${qs}`);
    },
    get: (id: string) => api.get<Record<string, unknown>>(`/projects/${id}`),
    create: (data: unknown) => api.post<Record<string, unknown>>('/projects', data),
    update: (id: string, data: unknown) => api.patch<Record<string, unknown>>(`/projects/${id}`, data),
    delete: (id: string) => api.delete(`/projects/${id}`),
    // Jobs
    listJobs: (projectId: string) => api.get<unknown[]>(`/projects/${projectId}/jobs`),
    createJob: (projectId: string, data: unknown) => api.post<Record<string, unknown>>(`/projects/${projectId}/jobs`, data),
};

export const postsApi = {
    list: (board?: string, params?: Record<string, string>) => {
        const p = { ...params, ...(board ? { board } : {}) };
        const qs = '?' + new URLSearchParams(p).toString();
        return api.get<unknown[]>(`/posts${qs}`);
    },
    create: (data: unknown) => api.post<Record<string, unknown>>('/posts', data),
};

export const eventsApi = {
    list: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get<unknown[]>(`/events${qs}`);
    },
    create: (data: unknown) => api.post<Record<string, unknown>>('/events', data),
};

export const approvalsApi = {
    list: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get<unknown[]>(`/approvals${qs}`);
    },
    create: (data: unknown) => api.post<Record<string, unknown>>('/approvals', data),
    update: (id: string, data: unknown) => api.patch<Record<string, unknown>>(`/approvals/${id}`, data),
};

export const contentsApi = {
    list: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get<unknown[]>(`/contents${qs}`);
    },
    create: (data: unknown) => api.post<Record<string, unknown>>('/contents', data),
};

export const libraryApi = {
    list: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get<unknown[]>(`/library${qs}`);
    },
    create: (data: unknown) => api.post<Record<string, unknown>>('/library', data),
};

export const notificationsApi = {
    list: (memberId: string, unreadOnly?: boolean) => {
        const params: Record<string, string> = { memberId };
        if (unreadOnly) params.unreadOnly = 'true';
        return api.get<unknown[]>(`/notifications?${new URLSearchParams(params)}`);
    },
    markRead: (ids: string[]) => api.patch('/notifications', { ids }),
};

export const timesheetsApi = {
    list: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get<unknown[]>(`/timesheets${qs}`);
    },
    save: (entries: unknown[]) => api.post<unknown[]>('/timesheets', entries),
};
