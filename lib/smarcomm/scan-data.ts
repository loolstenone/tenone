// SmarComm 스캔 데이터 유틸리티
// DB 우선 + localStorage fallback 스캔 히스토리 관리
import { getSetting, setSetting } from '@/lib/supabase/settings';

const DB_APP = 'smarcomm';
const DB_KEY_SCAN_LOG = 'scan_log';
const LS_KEY = 'smarcomm_scan_log';

export interface ScanEntry {
    url: string;
    date: string;
    score: number;
    seoScore?: number;
    geoScore?: number;
}

export function saveScanUrl(url: string, score: number, seoScore?: number, geoScore?: number) {
    const scans = getScanLog();
    scans.push({ url, date: new Date().toISOString(), score, seoScore: seoScore ?? 0, geoScore: geoScore ?? 0 });
    if (typeof window !== 'undefined') localStorage.setItem(LS_KEY, JSON.stringify(scans));
    setSetting(DB_APP, DB_KEY_SCAN_LOG, scans, LS_KEY);
}

export function getScanLog(): ScanEntry[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
}

/** mount 시 DB에서 스캔 로그 로드 → localStorage 동기화 */
export async function loadScanLogFromDB(): Promise<ScanEntry[]> {
    const dbLog = await getSetting<ScanEntry[]>(DB_APP, DB_KEY_SCAN_LOG, LS_KEY);
    if (dbLog && dbLog.length > 0 && typeof window !== 'undefined') {
        localStorage.setItem(LS_KEY, JSON.stringify(dbLog));
    }
    return dbLog ?? getScanLog();
}

// ── 경쟁사 목록 ──
const LS_COMPETITORS = 'smarcomm_competitors';
export function saveCompetitorList(list: string[]) {
    if (typeof window !== 'undefined') localStorage.setItem(LS_COMPETITORS, JSON.stringify(list));
    setSetting(DB_APP, 'competitors', list, LS_COMPETITORS);
}
export async function loadCompetitorListFromDB(): Promise<string[]> {
    const db = await getSetting<string[]>(DB_APP, 'competitors', LS_COMPETITORS);
    if (db && db.length > 0 && typeof window !== 'undefined') localStorage.setItem(LS_COMPETITORS, JSON.stringify(db));
    if (typeof window !== 'undefined') {
        const ls = localStorage.getItem(LS_COMPETITORS);
        return ls ? JSON.parse(ls) : (db ?? []);
    }
    return db ?? [];
}

// ── 비교 로그 ──
const LS_COMPARE_LOG = 'smarcomm_compare_log';
export interface CompareEntry { url: string; score: number; seo: number; geo: number; date: string; }
export function saveCompareLog(log: CompareEntry[]) {
    if (typeof window !== 'undefined') localStorage.setItem(LS_COMPARE_LOG, JSON.stringify(log));
    setSetting(DB_APP, 'compare_log', log, LS_COMPARE_LOG);
}
export function getCompareLog(): CompareEntry[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(LS_COMPARE_LOG) || '[]'); } catch { return []; }
}
export async function loadCompareLogFromDB(): Promise<CompareEntry[]> {
    const db = await getSetting<CompareEntry[]>(DB_APP, 'compare_log', LS_COMPARE_LOG);
    if (db && db.length > 0 && typeof window !== 'undefined') localStorage.setItem(LS_COMPARE_LOG, JSON.stringify(db));
    return db ?? getCompareLog();
}
