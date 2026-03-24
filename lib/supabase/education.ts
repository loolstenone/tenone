/**
 * Evolution School Supabase CRUD 함수
 * courses, enrollments 테이블
 */
import { createClient } from './client';

const supabase = createClient();

// ── Courses ──

export async function fetchCourses(options?: {
    category?: string;
    search?: string;
    limit?: number;
}) {
    let query = supabase.from('courses').select('*', { count: 'exact' });

    if (options?.category && options.category !== 'all') {
        query = query.eq('category', options.category);
    }
    if (options?.search) {
        query = query.ilike('title', `%${options.search}%`);
    }

    query = query.order('created_at', { ascending: false });
    if (options?.limit) query = query.limit(options.limit);

    const { data, error, count } = await query;
    if (error) throw error;
    return { courses: data || [], total: count || 0 };
}

export async function fetchCourseById(id: string) {
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
    if (error) return null;
    return data;
}

export async function createCourse(course: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('courses')
        .insert(course)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateCourse(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Enrollments ──

export async function fetchEnrollments(memberId: string) {
    const { data, error } = await supabase
        .from('enrollments')
        .select('*, course:courses(*)')
        .eq('member_id', memberId);
    if (error) throw error;
    return data || [];
}

export async function enrollCourse(memberId: string, courseId: string) {
    const { data, error } = await supabase
        .from('enrollments')
        .insert({
            member_id: memberId,
            course_id: courseId,
            status: 'not-started',
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateEnrollment(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('enrollments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function completeEnrollment(id: string, quizScore: number) {
    const { data, error } = await supabase
        .from('enrollments')
        .update({
            status: 'completed',
            quiz_score: quizScore,
            completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── 통계 ──

export async function getEducationStats(memberId: string) {
    const enrollments = await fetchEnrollments(memberId);
    const { courses } = await fetchCourses();

    return {
        totalCourses: courses.length,
        enrolled: enrollments.length,
        completed: enrollments.filter((e: Record<string, unknown>) => e.status === 'completed').length,
        inProgress: enrollments.filter((e: Record<string, unknown>) => e.status === 'in-progress').length,
        notStarted: enrollments.filter((e: Record<string, unknown>) => e.status === 'not-started').length,
    };
}
