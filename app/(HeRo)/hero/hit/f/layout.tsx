import HitMemberGate from "@/features/hit/HitMemberGate";

// HIT 검사는 회원 전용 — 소개·검사·결과·리포트 전부 (2026-10-12)
export default function Layout({ children }: { children: React.ReactNode }) {
  return <HitMemberGate>{children}</HitMemberGate>;
}
