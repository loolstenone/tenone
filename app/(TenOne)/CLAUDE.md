# TenOne 브랜드 가이드

> **TenOne** — Ten:One Universe의 마스터 포탈 & 인트라 오피스. "모든 접점에서 연결되는 유니버스"

---

## 정체성

- **한 줄 소개**: Ten:One Universe의 중추 포탈 (퍼블릭 + 인트라 + 프로필 + 대시보드)
- **톤앤매너**: 기업 표준이면서 따뜻함. 신뢰감·투명성·연결감.
- **주 컬러**: 파란색 + 주황색 (신뢰 + 에너지)
- **디자인 방향**: 중앙 허브. 모든 브랜드로 가는 게이트웨이. 개인 프로필 중심.

---

## 접근 모델

- **유형**: 오픈 + 직원 (누구나 회원가입 가능, 일부 기능은 직원 전용)
- **가입 경로**:
  1. 회원가입 (이메일 또는 소셜)
  2. 유니버스 프로필 설정 (이름, 아바타, 소속, bio)
  3. 즉시 접근 가능 (`members` 레코드 생성)
  4. 각 브랜드 사이트로 이동 가능
- **멤버 권한**:
  - `member` — 일반 사용자 (프로필, 서비스 접근)
  - `staff` — 직원 (Intra 기본 접근)
  - `manager` — 팀 리더 (Intra + 부하직원 관리)
  - `super_admin` — 마스터 (전체 시스템 제어)

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 `members` 테이블만 사용)
- **공통 필드**:
  - `email` — 이메일 (고유)
  - `name` — 이름
  - `avatar_url` — 아바타 (Supabase Storage `avatars`)
  - `bio` — 자기소개
  - `company` — 소속 회사
  - `phone` — 연락처
  - `affiliations[]` — 참여 중인 브랜드 목록 (MADLeague, Badak, HeRo 등)
- **universe-profile.ts**: 모든 브랜드 서비스 현황 조회 (읽기 전용)

---

## 권한 체계

- **role 종류**:
  - `member` — 기본 회원 (context: 없음 또는 각 브랜드별)
  - `staff` — 직원 (context: tenone)
  - `manager` — 팀 리더 (context: tenone)
  - `super_admin` — 마스터 (context: tenone, 전체 시스템 권한)
- **context**: `tenone` (TenOne 전용) 또는 각 브랜드별
- **인트라 관리 권한**: `/intra/*` (Intra 전체 = TenOne이 운영하는 중앙 관리 콘솔)

---

## 인트라 구조 (TenOne = 유니버스 중추)

| 섹션 | 역할 | 담당자 |
|------|------|--------|
| **Intra ERP** | 기업 운영 (HR, 결재, 재무, GPR) | HR팀 |
| **Intra Marketing** | 마케팅 자동화, 캠페인 관리 | 마케팅팀 |
| **Intra Studio** | 브랜드 관리, WIO, 에이전트 운영 | 제품팀 |
| **Intra Wiki** | 내부 위키, 지식 기반 | 전사 |
| **UMS (User Management)** | 모든 브랜드 사용자 관리 | 제품팀 |
| **Universe Analytics** | 전체 유니버스 분석 (크로스 브랜드) | 분석팀 |

---

## UC 정책 특이사항

- **TenOne 자체는 UC 미사용** (직원 급여/운영비로 운영)
- **UC 정책 제정자**: TenOne이 모든 브랜드의 UC 정책 수립·감시
- **brand_id 지정**: 없음 (tenone 고정)

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/page.tsx` | 랜딩 (Hero · Crew CTA · Works · Universe 8 그룹 · Core Values · News · Newsletter) |
| `app/(TenOne)/profile/page.tsx` | 유니버스 프로필 (모든 서비스 현황) |
| `app/(TenOne)/universe/page.tsx` | 유니버스 맵 (3대 자원·WIO/YIO·사업 포트폴리오·시너지 체인) |
| `app/(TenOne)/brands/page.tsx` | 브랜드 갤러리 (전체 브랜드 카테고리 필터) |
| `app/(TenOne)/about/page.tsx` | TenOne 소개 (Philosophy/Universe/Brands/History 4탭) |
| `app/(TenOne)/history/page.tsx` | 별도 History 페이지 (lib/data.ts historyEvents) |
| `app/(TenOne)/works/page.tsx` | Works 보드 (BoardPage 위임) |
| `app/(TenOne)/newsroom/page.tsx` | Newsroom 피드 (NewsTicker + NewsroomFeed) |
| `app/(TenOne)/newsletter/page.tsx` | 뉴스레터 아카이브 |
| `app/(TenOne)/contact/page.tsx` | 파트너십/비즈니스 문의 |
| `features/tenone/PublicHeader.tsx` | 공통 헤더 (TenOne 테마) |
| `features/tenone/PublicFooter.tsx` | 공통 푸터 |
| `features/tenone/TenOneThemeWrapper.tsx` | 테마 변수 wrapper (--tn-bg/text/accent 등) |
| `app/intra/layout.tsx` | Intra 마스터 레이아웃 |
| `app/intra/erp/*` | ERP (HR·결재·재무·GPR) |
| `app/intra/marketing/*` | 마케팅 관리 |
| `app/intra/studio/*` | 브랜드·WIO·에이전트 관리 |
| `app/intra/wiki/*` | 내부 위키 |
| `app/intra/ums/*` | 사용자 관리 (26개 브랜드별 UMS 패널) |
| `components/UniverseProfile.tsx` | 프로필 배너 (유니버스 전체 현황) |
| `components/MyProfileCard.tsx` | 프로필 카드 (공통 아바타·이름·소속) |
| `lib/supabase/members.ts` | members 테이블 CRUD |
| `lib/supabase/universe-profile.ts` | 모든 서비스 프로필 조회 (양방향 동기화) |

---

## 인트라 관리 경로

| 경로 | 역할 |
|------|------|
| `/intra/erp/people` | 직원 관리 |
| `/intra/erp/gpr` | 결재 시스템 |
| `/intra/erp/finance` | 재무 관리 |
| `/intra/marketing/campaigns` | 캠페인 관리 |
| `/intra/marketing/content` | 콘텐츠 제작 |
| `/intra/studio/brands` | 브랜드 정보 관리 |
| `/intra/studio/sites` | 사이트 메타데이터 + SEO |
| `/intra/studio/wio` | WIO 전체 관리 |
| `/intra/studio/agents` | 에이전트 운영 |
| `/intra/ums/sites` | 사이트 오픈/닫기 |
| `/intra/ums/[brand]/*` | 각 브랜드별 UMS (9개 패널) |
| `/intra/wiki/*` | 위키 관리 |

---

## 개발 주의사항

### 유니버스 프로필 (members 테이블)

- ❌ 브랜드별 프로필 테이블에서 직접 수정 금지 → TenOne 프로필에서 수정
- ✅ 공통 필드(이름, 아바타, 소속) 수정은 어디서든 → `members` 테이블로 동기화
- ✅ 서비스 고유 필드(직무, 기수 등) 수정은 → 해당 서비스 마이페이지에서

### 모든 브랜드 Intra UMS

- **UMS = User Management System** (`/intra/ums/[brand]`)
- 각 브랜드별 1개 패널 (멤버 검색, 승인, 권한 관리)
- TenOne이 중앙에서 모든 브랜드 사용자를 통제·감시

### 사이트 메타데이터 + 온/오프

- **온오프 (is_open)**: `/intra/studio/sites`에서만 제어 (페이지 컴포넌트 X)
- **SEO 메타**: 인트라에서 저장 → DB → ISR 10분 내 반영
- **파비콘/로고**: Supabase Storage `site-branding` 버킷

### 보안 — TenOne만 가능

- ❌ 브랜드 직원이 다른 브랜드 데이터 접근 금지
- ✅ super_admin만 전체 접근 (lools@tenone.biz)
- ✅ staff/manager는 tenone 범위만 (Intra)

### 에이전트 운영

- **Agent Hub** (`/intra/studio/agents`)에서 모든 에이전트 운영
- 에이전트 추가/수정/삭제는 TenOne만
- 각 브랜드의 API는 에이전트 → Supabase 직접 호출 (TenOne Intra 통하지 않음)

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Mature (2026-05-28) — 포탈·프로필·Intra 모두 프로덕션. 28+ 브랜드 통제 중. 본사이트 정직성·정합성 회복 1차 완료 (세션 154). |
| **개발 수준** | 완성. SSOT 일원화 단계. |
| **이월 작업** | DB `brands` 테이블 시드 부재 — brands page는 lib/data.ts staticBrands fallback에만 의존 (DB 채우면 자동 우선). Mindle Phase 3 PRO 결제 등 별 트랙 |
| **최근 결정** | (2026-05-28) **본사이트 정직성·정합성 회복**: ① `app/(public)/` 경로 표기를 실제 `app/(TenOne)/`·`app/page.tsx`로 정정 ② Universe "Coming Soon" 8건(7건 실제 운영 중) 섹션 통째 삭제 ③ Universe stats "23 브랜드/14 WIO 모듈" → `siteConfigs.length` 동적 28 + 8 역할 그룹 ④ brands page fallback 22→26개 (jakka·townity·mullaesian·naturebox 추가, internal dokdae·wiki 제외) ⑤ history SSOT를 `lib/data.ts historyEvents`로 일원화 (about HISTORY_DATA dead code 제거 + 27건으로 보강 — 0gamja·ChangeUp·Chat with ChatGPT·Creazy Challenge·DAM Be·Mindle 2026·MADLeap 2026 포함) ⑥ Crew CTA `cursor-default` → `/contact?from=crew` Link + Contact partner 탭 카피 변형 ⑦ `lib/universe-map.ts` 신설 — `UNIVERSE_ROLE_GROUPS` SSOT 추출. 랜딩 + about Brand Ecosystem 모두 import (about BRAND_DIRECTORY 56줄 dead code 제거) |

---

## 참고

- 유니버스 도메인 분기: [CLAUDE.md § 2.1](../../CLAUDE.md#21-유니버스-도메인-분기-시스템-절대-잊지-말-것)
- 유니버스 프로필 연동: [CLAUDE.md § 2.2](../../CLAUDE.md#22-유니버스-프로필-연동-체계-절대-잊지-말-것)
- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- WIO 인프라: [CLAUDE.md § 1.8](../../CLAUDE.md#18-아키텍처-철학-wio-중심-솔루션-공유)
