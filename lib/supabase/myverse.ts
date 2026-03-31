/**
 * MyVerse 대시보드 DB 쿼리
 * 각 위젯별 데이터를 Supabase에서 조회
 */
import { createClient } from './client';

const supabase = createClient();

// ── 결재 현황 ──
export async function fetchMyApprovals(memberId: string) {
    try {
        // 결재 대기 (내가 결재해야 할 건 — approval_line JSONB에서 검색)
        const { data: pending } = await supabase
            .from('approvals')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(20);

        // approval_line에 내 ID가 포함된 건만 필터
        const myPending = (pending || []).filter((a: any) => {
            const line = a.approval_line;
            if (!line) return false;
            return JSON.stringify(line).includes(memberId);
        });

        // 내가 기안한 건 (진행 중)
        const { data: myDrafts } = await supabase
            .from('approvals')
            .select('*')
            .eq('drafter_id', memberId)
            .in('status', ['pending', 'in-progress'])
            .order('created_at', { ascending: false })
            .limit(10);

        return {
            pending: myPending,
            myDrafts: myDrafts || [],
            pendingCount: myPending.length,
            inProgressCount: myDrafts?.filter((d: any) => d.status === 'in-progress').length || 0,
            draftsCount: myDrafts?.filter((d: any) => d.status === 'pending').length || 0,
        };
    } catch {
        return { pending: [], myDrafts: [], pendingCount: 0, inProgressCount: 0, draftsCount: 0 };
    }
}

// ── 투입 프로젝트 ──
export async function fetchMyProjects(memberId: string) {
    try {
        const { data } = await supabase
            .from('project_members')
            .select('role, project:projects(id, code, name, status, progress)')
            .eq('member_id', memberId)
            .limit(10);

        return (data || []).map((pm: any) => ({
            name: pm.project?.name || '',
            code: pm.project?.code || '',
            role: pm.role || '',
            progress: pm.project?.progress || 0,
            status: pm.project?.status || '진행중',
        }));
    } catch {
        return [];
    }
}

// ── 교육 이수 현황 ──
export async function fetchMyEnrollments(memberId: string) {
    try {
        const { data } = await supabase
            .from('enrollments')
            .select('*, course:courses(*)')
            .eq('member_id', memberId)
            .order('updated_at', { ascending: false })
            .limit(20);

        if (!data || data.length === 0) return null;

        const completed = data.filter((e: any) => e.status === 'completed');
        const inProgress = data.filter((e: any) => e.status === 'in-progress');
        const courses = data.filter((e: any) => e.course?.category === 'required');
        const mandatoryCompleted = courses.filter((e: any) => e.status === 'completed').length;

        return {
            mandatory: { total: courses.length || 0, completed: mandatoryCompleted },
            recent: data.slice(0, 5).map((e: any) => ({
                name: e.course?.title || '과정명 없음',
                status: e.status === 'completed' ? '수료' as const :
                    e.status === 'in-progress' ? '진행중' as const : '미시작' as const,
            })),
            totalCompleted: completed.length,
            totalInProgress: inProgress.length,
        };
    } catch {
        return null;
    }
}

// ── 타임시트 (근태) ──
export async function fetchMyAttendance(memberId: string) {
    try {
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const today = now.toISOString().split('T')[0];

        const { data } = await supabase
            .from('timesheets')
            .select('*')
            .eq('member_id', memberId)
            .gte('date', monthStart)
            .lte('date', today)
            .order('date', { ascending: false });

        if (!data || data.length === 0) return null;

        const todayEntry = data.find((t: any) => t.date === today);
        const totalHours = data.reduce((sum: number, t: any) => sum + (t.hours || 0), 0);
        const avgHours = data.length > 0 ? totalHours / data.length : 0;

        return {
            thisMonth: {
                workDays: data.length,
                avgHours: `${Math.floor(avgHours)}h ${Math.round((avgHours % 1) * 60)}m`,
                overtime: '0h', // 추후 구현
            },
            today: todayEntry ? {
                checkIn: todayEntry.check_in || '-',
                checkOut: todayEntry.check_out || '-',
                status: todayEntry.status || '정상',
            } : null,
        };
    } catch {
        return null;
    }
}
