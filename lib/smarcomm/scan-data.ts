// SmarComm 스캔 데이터 유틸리티
// auth와 무관한 localStorage 기반 스캔 히스토리 관리

export function saveScanUrl(url: string, score: number, seoScore?: number, geoScore?: number) {
    const scans = JSON.parse(localStorage.getItem('smarcomm_scan_log') || '[]');
    scans.push({ url, date: new Date().toISOString(), score, seoScore: seoScore ?? 0, geoScore: geoScore ?? 0 });
    localStorage.setItem('smarcomm_scan_log', JSON.stringify(scans));
}

export function getScanLog(): { url: string; date: string; score: number; seoScore?: number; geoScore?: number }[] {
    return JSON.parse(localStorage.getItem('smarcomm_scan_log') || '[]');
}
