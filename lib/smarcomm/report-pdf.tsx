// SmarComm Index PDF 리포트 — @react-pdf/renderer
// 서버 사이드 렌더링 전용 (Next.js API Route)

import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';

// ─── 타입 ───────────────────────────────────────────────────────────────────

export interface ReportData {
    domain: string;
    url: string;
    industry: string;
    findability: number;
    trust: number;
    citability: number;
    index_score: number;
    grade: string;
    scanned_at: string;
    score_delta?: number | null;
    breakdown?: Record<string, unknown>;
    benchmark?: Record<string, unknown> | null;
}

// ─── 색상 팔레트 ─────────────────────────────────────────────────────────────

const COLOR = {
    primary:    '#1e40af',   // 파란색
    accent:     '#3b82f6',
    findability:'#3B82F6',
    trust:      '#A855F7',
    citability: '#10B981',
    gradeS:     '#16A34A',
    gradeA:     '#22C55E',
    gradeB:     '#3B82F6',
    gradeC:     '#F59E0B',
    gradeD:     '#DC2626',
    bg:         '#f8fafc',
    card:       '#ffffff',
    border:     '#e2e8f0',
    text:       '#1e293b',
    muted:      '#64748b',
    lightText:  '#ffffff',
};

function gradeColor(grade: string) {
    const map: Record<string, string> = { S: COLOR.gradeS, A: COLOR.gradeA, B: COLOR.gradeB, C: COLOR.gradeC, D: COLOR.gradeD };
    return map[grade] ?? COLOR.gradeB;
}

// ─── 스타일 ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    page: {
        backgroundColor: COLOR.bg,
        paddingHorizontal: 40,
        paddingVertical: 36,
        fontFamily: 'Helvetica',
        color: COLOR.text,
        fontSize: 10,
    },
    // Header
    headerBar: {
        backgroundColor: COLOR.primary,
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: { flex: 1 },
    headerBrand: { color: COLOR.lightText, fontSize: 9, opacity: 0.8, marginBottom: 4 },
    headerDomain: { color: COLOR.lightText, fontSize: 18, fontFamily: 'Helvetica-Bold' },
    headerUrl: { color: COLOR.lightText, fontSize: 8, opacity: 0.7, marginTop: 2 },
    headerRight: { alignItems: 'flex-end' },
    headerGrade: { color: COLOR.lightText, fontSize: 36, fontFamily: 'Helvetica-Bold', lineHeight: 1 },
    headerScore: { color: COLOR.lightText, fontSize: 12, opacity: 0.9 },
    headerDate: { color: COLOR.lightText, fontSize: 8, opacity: 0.6, marginTop: 4 },
    // Section
    sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLOR.primary, marginBottom: 10, marginTop: 16 },
    // 3 axis cards
    axisRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    axisCard: { flex: 1, backgroundColor: COLOR.card, borderRadius: 6, padding: 12, borderWidth: 1, borderColor: COLOR.border },
    axisLabel: { fontSize: 8, color: COLOR.muted, marginBottom: 4 },
    axisScore: { fontSize: 22, fontFamily: 'Helvetica-Bold' },
    axisBar: { height: 5, backgroundColor: COLOR.border, borderRadius: 3, marginTop: 6 },
    axisBarFill: { height: 5, borderRadius: 3 },
    axisPct: { fontSize: 8, color: COLOR.muted, marginTop: 3 },
    // Benchmark table
    table: { borderWidth: 1, borderColor: COLOR.border, borderRadius: 6, overflow: 'hidden', marginBottom: 16 },
    tableHeader: { backgroundColor: '#f1f5f9', flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: COLOR.border },
    tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    tableRowLast: { flexDirection: 'row', padding: 8 },
    tableCell: { flex: 1, fontSize: 9 },
    tableCellBold: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold' },
    tableHeaderCell: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLOR.muted },
    // Footer
    footer: { borderTopWidth: 1, borderTopColor: COLOR.border, paddingTop: 10, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerText: { fontSize: 8, color: COLOR.muted },
    // Delta badge
    deltaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    deltaBadgeText: { fontSize: 9 },
    // Checklist
    checkRow: { flexDirection: 'row', gap: 6, marginBottom: 4, alignItems: 'flex-start' },
    checkDot: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
    checkLabel: { flex: 1, fontSize: 9, lineHeight: 1.5 },
    // Info label
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    infoItem: { backgroundColor: COLOR.card, borderRadius: 6, padding: 10, borderWidth: 1, borderColor: COLOR.border, width: '48%' },
    infoLabel: { fontSize: 8, color: COLOR.muted, marginBottom: 2 },
    infoValue: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
});

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    try {
        const d = new Date(iso);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    } catch { return iso; }
}

function industryLabel(key: string): string {
    const MAP: Record<string, string> = {
        ecommerce: '이커머스', saas: 'SaaS', restaurant: '식당/F&B',
        healthcare: '의료/헬스케어', finance: '금융/핀테크', education: '교육/에듀테크',
        startup: '스타트업', general: '업종 미지정',
    };
    return MAP[key] ?? key;
}

function gradeLabel(grade: string): string {
    const MAP: Record<string, string> = { S: '최상위', A: '우수', B: '양호', C: '개선 필요', D: '심각' };
    return MAP[grade] ?? '';
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

interface ScoreBarProps {
    score: number;
    color: string;
}

function ScoreBar({ score, color }: ScoreBarProps) {
    return (
        <View style={s.axisBar}>
            <View style={[s.axisBarFill, { width: `${score}%`, backgroundColor: color }]} />
        </View>
    );
}

interface BenchmarkTableProps {
    benchmark: Record<string, unknown> | null | undefined;
    scores: { findability: number; trust: number; citability: number; index: number };
}

function BenchmarkTable({ benchmark, scores }: BenchmarkTableProps) {
    if (!benchmark) {
        return (
            <View style={{ padding: 12, backgroundColor: COLOR.card, borderRadius: 6, borderWidth: 1, borderColor: COLOR.border }}>
                <Text style={{ fontSize: 9, color: COLOR.muted }}>업종 벤치마크 데이터를 불러올 수 없습니다.</Text>
            </View>
        );
    }

    const percentiles = (benchmark as { percentiles?: Record<string, number> }).percentiles;
    const axes = [
        { key: 'findability', label: '발견 가능성', score: scores.findability, color: COLOR.findability },
        { key: 'trust',       label: '신뢰도',     score: scores.trust,       color: COLOR.trust },
        { key: 'citability',  label: '인용 가능성', score: scores.citability,  color: COLOR.citability },
        { key: 'index',       label: '종합 Index',  score: scores.index,       color: COLOR.primary },
    ];

    return (
        <View style={s.table}>
            <View style={s.tableHeader}>
                <Text style={s.tableHeaderCell}>항목</Text>
                <Text style={s.tableHeaderCell}>내 점수</Text>
                <Text style={s.tableHeaderCell}>업종 중간값(p50)</Text>
                <Text style={s.tableHeaderCell}>상위 25%(p75)</Text>
                <Text style={s.tableHeaderCell}>백분위</Text>
            </View>
            {axes.map((axis, idx) => {
                const bRow = (benchmark as Record<string, Record<string, { p50: number; p75: number }>>).benchmark?.[axis.key];
                const pct = percentiles?.[axis.key] ?? '-';
                const isLast = idx === axes.length - 1;
                return (
                    <View key={axis.key} style={isLast ? s.tableRowLast : s.tableRow}>
                        <Text style={s.tableCellBold}>{axis.label}</Text>
                        <Text style={[s.tableCell, { color: axis.color }]}>{axis.score}점</Text>
                        <Text style={s.tableCell}>{bRow?.p50 ?? '-'}점</Text>
                        <Text style={s.tableCell}>{bRow?.p75 ?? '-'}점</Text>
                        <Text style={s.tableCellBold}>상위 {100 - Number(pct)}%</Text>
                    </View>
                );
            })}
        </View>
    );
}

// ─── 메인 PDF 문서 ──────────────────────────────────────────────────────────

export function SmarCommReportPDF({ data }: { data: ReportData }) {
    const gColor = gradeColor(data.grade);
    const scannedDate = formatDate(data.scanned_at);
    const deltaSign = data.score_delta != null && data.score_delta > 0 ? '+' : '';
    const hasDelta = data.score_delta != null && data.score_delta !== 0;

    return (
        <Document
            title={`SmarComm Index 리포트 — ${data.domain}`}
            author="SmarComm by Ten:One™"
        >
            <Page size="A4" style={s.page}>
                {/* ─── Header ─── */}
                <View style={s.headerBar}>
                    <View style={s.headerLeft}>
                        <Text style={s.headerBrand}>SmarComm Index Report</Text>
                        <Text style={s.headerDomain}>{data.domain}</Text>
                        <Text style={s.headerUrl}>{data.url}</Text>
                        {hasDelta && (
                            <View style={s.deltaBadge}>
                                <Text style={[s.deltaBadgeText, { color: (data.score_delta! > 0) ? '#86efac' : '#fca5a5' }]}>
                                    {data.score_delta! > 0 ? '▲' : '▼'} {deltaSign}{data.score_delta}점 (전주 대비)
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={s.headerRight}>
                        <Text style={[s.headerGrade, { color: gColor === COLOR.gradeD ? '#fca5a5' : COLOR.lightText }]}>
                            {data.grade}
                        </Text>
                        <Text style={s.headerScore}>{data.index_score}점</Text>
                        <Text style={s.headerDate}>{scannedDate} 기준</Text>
                    </View>
                </View>

                {/* ─── 기본 정보 ─── */}
                <View style={s.infoGrid}>
                    <View style={s.infoItem}>
                        <Text style={s.infoLabel}>업종</Text>
                        <Text style={s.infoValue}>{industryLabel(data.industry)}</Text>
                    </View>
                    <View style={s.infoItem}>
                        <Text style={s.infoLabel}>등급</Text>
                        <Text style={[s.infoValue, { color: gColor }]}>{data.grade} — {gradeLabel(data.grade)}</Text>
                    </View>
                    <View style={s.infoItem}>
                        <Text style={s.infoLabel}>스캔 URL</Text>
                        <Text style={s.infoValue}>{data.url}</Text>
                    </View>
                    <View style={s.infoItem}>
                        <Text style={s.infoLabel}>스캔 일시</Text>
                        <Text style={s.infoValue}>{scannedDate}</Text>
                    </View>
                </View>

                {/* ─── 3축 점수 ─── */}
                <Text style={s.sectionTitle}>3축 평가 점수</Text>
                <View style={s.axisRow}>
                    {([
                        { label: '🔍 발견 가능성 (Findability)', score: data.findability, color: COLOR.findability, weight: '30%' },
                        { label: '⭐ 신뢰도 (Trust)',            score: data.trust,       color: COLOR.trust,       weight: '30%' },
                        { label: '🤖 인용 가능성 (Citability)',  score: data.citability,  color: COLOR.citability,  weight: '40%' },
                    ] as const).map((axis) => (
                        <View key={axis.label} style={s.axisCard}>
                            <Text style={s.axisLabel}>{axis.label}</Text>
                            <Text style={[s.axisScore, { color: axis.color }]}>{axis.score}점</Text>
                            <ScoreBar score={axis.score} color={axis.color} />
                            <Text style={s.axisPct}>가중치 {axis.weight}</Text>
                        </View>
                    ))}
                </View>

                {/* ─── 업종 벤치마크 ─── */}
                <Text style={s.sectionTitle}>업종 벤치마크 비교</Text>
                <BenchmarkTable
                    benchmark={data.benchmark as Record<string, unknown> | null}
                    scores={{ findability: data.findability, trust: data.trust, citability: data.citability, index: data.index_score }}
                />

                {/* ─── Action Plan (breakdown에 있으면) ─── */}
                {Array.isArray((data.breakdown as Record<string, unknown>)?.actionPlan) && (
                    <>
                        <Text style={s.sectionTitle}>우선 개선 액션 (Quick Wins)</Text>
                        {((data.breakdown as Record<string, unknown>).actionPlan as Array<{ title: string; impact: string; quadrant: string; action: string }>)
                            .filter(a => a.quadrant === 'quick-win')
                            .slice(0, 6)
                            .map((item, i) => (
                                <View key={i} style={s.checkRow}>
                                    <View style={[s.checkDot, { backgroundColor: i % 2 === 0 ? COLOR.accent : COLOR.citability }]}>
                                        <Text style={{ fontSize: 7, color: COLOR.lightText }}>{i + 1}</Text>
                                    </View>
                                    <Text style={s.checkLabel}>{item.action}</Text>
                                </View>
                            ))}
                    </>
                )}

                {/* ─── Footer ─── */}
                <View style={s.footer}>
                    <Text style={s.footerText}>SmarComm by Ten:One™ Universe — smarcomm.biz</Text>
                    <Text style={s.footerText}>Generated {scannedDate}</Text>
                </View>
            </Page>
        </Document>
    );
}
