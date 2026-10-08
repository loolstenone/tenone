# Planner's 브랜드 가이드

> **Planner's** — 기획자 훈련 브랜드. "우리는 모두 기획자다"
> Tier **실험** · 주소 `planners.tenone.biz` (로컬 `/planners`) · 공식 주소(CANONICAL) 없음 — 스테이징 성격

---

## 정체성

- **한 줄 소개**: 기획은 꾀하는 것이고, 계획은 세우는 것이다. Why를 찾고 What을 만드는 사람, 그것이 기획자다.
- **서비스**: 실전 전략 기획 훈련 과정 + 실전 프로젝트 (코어 프로그램 모듈 `program_*` 위에서 운영, RooK `/rook/projects`와 같은 방식)
- **톤앤매너**: 따뜻하고 전문적인 기획자 커뮤니티
- **주 컬러**: 틸 `#0F766E`(흰 배경 본문·버튼) · `#14B8A6`(어두운 배경 강조) · 헤더 `#134E4A`
- **디자인 방향**: 진한 틸 헤더/푸터 + 흰 본문, 사각 모서리

## 접근 모델

- 유형: 구매/승인형 프로그램 — 회차 신청 → 운영진 선발 → 팀 배정 → 결과 발표 → 참여 확인서
- 가입 경로: Ten:One ID (이메일·Google·Kakao)
- 멤버 권한: member (프로그램 참가자는 `program_*` 모듈이 관리)
- capability: `course`, `community`

## 프로필 특화

- 특화 테이블 없음 (공통 `members`). 마이페이지 = MyProfileCard(siteBadge "Planner") + CapabilitySection

## 권한 체계

- 브랜드 자체 권한 없음 (데이터 계약 2조). 인트라 관리 = `member_roles(role='planners', context='brand')`

## UC 정책 특이사항

- 브랜드 전용 액션 없음

## Action Hub Entries

- `program_applications` (brand planners) · status='pending' · `/intra/ums/planners/programs` · category=approval · priority=normal

## 핵심 파일

- `app/(Planners)/layout.tsx` — generateMetadata
- `app/(Planners)/planners/page.tsx` — 랜딩 (모집 중 프로젝트 ProgramBoard)
- `app/(Planners)/planners/projects/**` — 회차 목록·방·팀·초대 (코어 프로그램 컴포넌트 얇은 래퍼)
- `app/(Planners)/planners/certificate/**` — 참여 확인서 발급·인쇄·진위 확인
- `app/(Planners)/planners/my/page.tsx` — 마이페이지
- `features/planners/PlannersHeader.tsx`, `PlannersFooter.tsx`
- `lib/brand-site-menus.ts` (siteId planners) · `features/programs/ProgramTheme.ts` · `lib/programs/paths.ts`
- 인트라: `app/intra/ums/planners/programs/**`

## 인트라 관리 경로

- `/intra/ums/planners/programs` (프로젝트 회차·신청)
- 기존 PP AI 관리(`/intra/planners`)는 MyVerse 구독자 관리 — 그대로 유지

## 개발 주의사항

- **MyVerse와 분리**: 과거 Planner's Planner AI 앱은 MyVerse로 흡수되었다. `features/myverse/planner/Planners*.tsx`는 고아 파일 — 재사용·import 금지
- `middleware.ts`의 `/api/planners/*` → `/api/myverse/*` rewrite는 유지 (vercel.json 크론·Google OAuth 콘솔이 호출). 페이지 `/planners/*`는 더 이상 myverse로 308 하지 않는다
- 정적 PWA 파일 `/planners-sw.js`·`/planners-manifest.json`·`/planners-icon-*`는 MyVerse 레거시 — 건드리지 않는다
- "준비 중/Coming Soon" 텍스트 직접 표시 금지 (§1.1)

## 현재 상태

- Phase: 부활 — 실험 Tier 스테이징 (2026-10-09)
- 이월 작업:
  - DB: `ums_sites` planners row tier/lifecycle/hosting/is_open 확인, `brand_capabilities`(community·course) 시드
  - 첫 회차 개설 (`/intra/ums/planners/programs`), 파비콘·OG 이미지 전용 에셋
  - 개인정보처리방침에 Planner's 수집 항목 반영, 출시 전 `npm run site:check -- planners --live`
