/**
 * 환경 판별 유틸리티
 * Prod DB를 바라보면 = 프로덕션 (Mock 금지)
 * Dev DB를 바라보면 = 개발 (Mock 허용)
 */

const PROD_DB_REF = 'ziotlxkdctlhiwkgmmsh';

/** Prod DB에 연결된 환경인지 (tenone.biz 라이브) */
export function isProductionDB(): boolean {
    return process.env.NEXT_PUBLIC_SUPABASE_URL?.includes(PROD_DB_REF) ?? false;
}

/** Mock 데이터 사용 가능 여부 (Dev DB 또는 localhost) */
export function isMockAllowed(): boolean {
    return !isProductionDB();
}
