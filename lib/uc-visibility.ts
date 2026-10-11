/**
 * UC(유니버스 코인) 사용자 노출 스위치 — 2026-10-12 사용자 결정
 *
 * UC는 1 UC = 1원이라 결제·사용처가 갖춰지기 전에 보여주면 부담과 오해만 생긴다.
 * 그래서 시스템 완성(결제 PG·사용처·규칙 재정의·약관 고지) 전까지:
 *   - 적립은 서버에서 그대로 계속 쌓는다 (뒤에서만 작동)
 *   - 사용자 화면·이메일에는 UC 잔액·적립액·보상 문구를 보여주지 않는다
 *   - 인트라(직원)는 그대로 본다
 *
 * 공개할 때: Vercel env `NEXT_PUBLIC_UC_PUBLIC=true` + 재배포 (코드 수정 불필요).
 * ❌ 사용자 화면에 UC를 새로 표시할 때 이 스위치를 거치지 않기
 */
export const UC_PUBLIC = process.env.NEXT_PUBLIC_UC_PUBLIC === 'true';

/** 회원 1명이 한 달에 받을 수 있는 UC 총량 (모든 브랜드·규칙 합산). 1 UC = 1원 실비 상한 */
export const UC_MEMBER_MONTHLY_CAP = 3000;
