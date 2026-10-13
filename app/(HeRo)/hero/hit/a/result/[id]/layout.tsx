import type { Metadata } from 'next';

/**
 * 결과는 회원 본인·운영자 전용 — 링크 미리보기에 유형·별명 등 개인 결과를 싣지 않는다.
 * (DB 조회 없음, 검색 노출 차단)
 */
export const metadata: Metadata = {
  title: '기본 성향 검사 결과',
  description: 'HeRo 기본 성향 검사 결과',
  robots: { index: false, follow: false },
};

export default function HitResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
