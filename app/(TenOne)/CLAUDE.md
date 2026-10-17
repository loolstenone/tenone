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

- **role × context (v3, CLAUDE.md §1.6)**: `super_admin`·`staff`·`manager`·`member` @ `universe` · 인트라 메뉴 `intra_access` @ `system` · 모듈 `{erp·hero…}` @ `module` · 브랜드 관리 `tenone` @ `brand`
- 서버 직원 판단은 `lib/api-guard.ts` `requireStaff`, RLS는 `auth_is_staff()` (JWT is_staff = staff@universe)
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
| `app/page.tsx` | 랜딩 (Hero · Works · Core Values · CTA · Newsletter) — 2026-10-05 Crew CTA·세계관(Universe 8 그룹)·새로운 소식 섹션 삭제 |
| `app/(TenOne)/profile/page.tsx` | 유니버스 프로필 (모든 서비스 현황) |
| `app/(TenOne)/universe/page.tsx` · `brands/page.tsx` · `history/page.tsx` | About 탭으로 308 (2026-10-17 합침) |
| `app/(TenOne)/about/page.tsx` | TenOne 소개 4탭 (2026-10-17 역할 정리): **Philosophy** = Ten:One™의 철학 · **Universe** = 세계관 철학(사람·돈·시간, 순환, 연결 방식 - 브랜드 목록 없음) · **Brands** = 세계관 안에서 만들어 가는 브랜드(역할 그룹 `lib/universe-map.ts` + 상태 운영 중·만드는 중·구상 = DB `ums_sites`, `useBrandStatus`) · **History** = 실행해 온 이야기. `?tab=` 동기화 |
| `lib/data.ts` `historyEvents` | 연혁 SSOT — **공개(published) Works 글 1개 = 연혁 1줄** (32건). 항목마다 `postId`(Works 글) · 날짜 = 그 글 날짜 · About › History 제목을 누르면 그 Works 글로 (2026-10-18 맞춤: 보관 상태 LUKI 글 → 공개 글 'AI dol' 2026-03-24). Works 글을 공개·보관하면 여기도 같이 |
| `app/(TenOne)/works/page.tsx` | Works 보드 (BoardPage 위임, `showWriteButton/showStats/showReactions=false`) — 글은 인트라 TenOne > Works에서 |
| `app/(TenOne)/newsletter/page.tsx` | 뉴스레터 아카이브 |
| `app/(TenOne)/contact/page.tsx` | 파트너·크루·프로젝트 의뢰 문의 (form_type `tenone_partner/crew/business`, Turnstile, 개인정보 동의, 첨부 10MB×3) |
| `lib/contact-attachments.ts` · `lib/contact-inquiry.ts` | 첨부 규칙·링크 보정 / 문의 상태·응대 기록 규칙 |
| `app/api/contact/route.ts` | 문의 저장 + 첨부 서명 업로드 URL 발급 (비공개 버킷 `contact-attachments`) |
| `app/api/intra/contact-submissions/[id]` · `app/api/intra/contact-attachment` | 문의 상세·응대 기록 / 첨부 다운로드 (직원 전용) |
| `components/intra/BrandInquiryInbox.tsx` | 브랜드 고객 문의 인박스 (행 클릭 → 상세·응대 기록) |
| `app/intra/ums/tenone/*` | 인트라 TenOne: 대시보드 · Works(목록·작성·수정·삭제) · 고객 문의 |
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
| `/intra/ums/tenone` | **TenOne 집중 브랜드 패널** — 대시보드 · `/works`(BoardContentList·BoardPostEditor) · `/cs`(고객 문의) |
| `/intra/ums/[brand]/*` | 각 브랜드별 UMS (9개 패널) |
| `/intra/wiki/*` | 위키 관리 |

---

## Ten:One™ 프로젝트 (사회 이슈 바이럴 사이트, 2026-10-13 사용자 결정)

- **주소**: `{프로젝트}.tenone.biz` 서브도메인 — 도메인 비용 0. `lib/domain-registry.ts`에 `siteId: 'tenone'`으로 등록 (브랜드 아님 → `ums_sites`·`siteConfigs` 없음), 화면은 `app/(Projects)/{프로젝트}/`, 데이터는 `lib/projects/`
- **기록**: 출시하면 tenone.biz **Works**에 올린다 (Works 메뉴 유지). 크게 터지면 그때 단독 도메인·매각 검토
- **Ten:One 노출**: 결과 화면 아래 'Presented by Ten:One™' 한 곳만 — 광고처럼 보이지 않게
- **규칙**: 입력은 저장하지 않는다(필요하면 URL 코드로 결과 재현) · 실존 기업·인물·제품 이름, 정부·공공기관 사칭 금지 · "재미로 보는 풍자, 실제와 무관" 고지 · 신상 공개형 금지 · 결과 공유 미리보기 이미지는 `opengraph-image.tsx` + `lib/projects/og-font.ts`(한글 글꼴)
- **외부 작업** (서브도메인마다): Vercel › Domains에 `{프로젝트}.tenone.biz` 추가 → 가비아 DNS에 Vercel 권장 CNAME (tenone.biz 네임서버 = 가비아)
- **1호 — AI 면접 예행연습** `ai-interview.tenone.biz` (`app/(Projects)/interview`, `lib/projects/interview.ts`): '인간 지원자 사전 검수' — AI 면접관 HR-0이 7문항을 묻고 고른 답을 조합해 결과 통지서(판정 5종·판정 사유 3·AI 대체 가능성). 결과 주소 `/r/{코드 7자}`. 판정이 고르게 나오도록 동점 우선순위 조정(전 16,384 조합 점검). **2026-10-14 공개** (Vercel 연결·인증서·결과 페이지·공유 이미지 실서버 확인). 남은 것: Works 게시글 · 판정 사유를 7문항 전체에서 고를지(통지서 문구 245 → 더 다양하게) 결정
  - ❌ 공유 이미지 본문 폭을 도장 영역까지 넓히기 — 긴 도장('예비 999번')이 문장을 덮는다 (본문 maxWidth 640)
- **푸터 (2026-10-13)**: 슬로건 '기획하고, 연결하고, 확장한다.' · Universe 열 = 주력 개발 사이트(Badak·MADLeague·MADLeap·HeRo) — `features/tenone/PublicFooter.tsx`

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

- **2026-10-16 (세션 178)**: 마이페이지 '내 게시글'이 사이트 전체 글을 보여 주던 버그 수정 — `author_id`(members.id)로 내 글만. 마이페이지 카드 색 띠 제거·'Ten:One 프로필 · 계정'(/profile) 링크로 통일 (루트 CLAUDE.md §1.3 공개 프로필) · **`/profile` 개편** = 왼쪽 프로필 내용 + 오른쪽 공개 설정 패널(`ProfileVisibilityRail` — 공개·주소(핸들)·보일 항목(관심 분야 포함)·검색 노출·미리보기·공유) · 계정 메뉴 '내 공개 프로필'·'계정 관리' → 'Ten:One 프로필 · 계정' 하나 · 도메인별 robots·sitemap·llms.txt(`lib/site-seo.ts`)
- **2026-10-13 (세션 170)**: 처리방침 HeRo HIT 수집 항목·MADLeap 지원서 추가 — **10-13 공지 · 10-20 시행** (배포일 기준 7일 전 공지; 커밋일이 아니라 실제 배포일로 계산). 후속: 10-14 이후 RooK 공지 줄, 10-20 이후 HeRo·MADLeap 공지 줄 삭제 + `lib/company-info.ts` LEGAL_DOCUMENTS.privacy version·effectiveDate 갱신
- **2026-10-12 (세션 168)**: `/profile`의 `UCBalanceCard`·UniverseProfile UC 잔액은 `UC_PUBLIC`일 때만 표시·조회 (UC 비공개 운영 — 적립은 계속, 인트라는 그대로, 루트 §1.5 · `lib/uc-visibility.ts`)
- **2026-10-08 (세션 165)**: `/profile/[handle]` 본인 판정을 email → `members.auth_id`로 · 공개 프로필 RPC `get_public_profile` 공개 필드만(이메일은 privacy_settings.email 동의 시) · 서비스 프로필은 본인만 · `/my` LoginRequired

| 항목 | 내용 |
|------|------|
| **Phase** | Mature (2026-05-28) — 포탈·프로필·Intra 모두 프로덕션. 28+ 브랜드 통제 중. 본사이트 정직성·정합성 회복 1차 완료 (세션 154). |
| **개발 수준** | 완성. SSOT 일원화 단계. |
| **이월 작업** | ① ~~문의 RLS 잠금~~ ✅ 2026-10-06 운영 적용 (`contact_submissions_rls_lockdown` — 직원(`auth_is_staff()` = JWT `app_metadata.is_staff`)만 조회, anon·회원 쓰기 차단. **직원 추가 시 is_staff 없으면 인박스 빈 화면**) ② 인트라 문의 상세·응대 기록 직원 로그인 실사용 확인 ③ Contact 실제 제출 1건(첨부 포함) E2E ④ Works 15건 이미지 없음 ⑤ 홈 하단 'Join the Universe' 버튼 존치 여부 ⑥ DB `brands` 테이블 시드 부재 — brands page는 lib/data.ts staticBrands fallback에만 의존 (DB 채우면 자동 우선). Mindle Phase 3 PRO 결제 등 별 트랙 |
| **법무 문서 (2026-10-05)** | `app/(TenOne)/privacy/page.tsx`(유니버스 공통 개인정보처리방침) · `app/(TenOne)/terms/page.tsx`(Ten:One 통합 이용약관) — 전 브랜드 도메인에서 /privacy·/terms로 서빙(middleware skipPaths). 버전·사업자 정보 SSOT = `lib/company-info.ts`. 문서 개정 시 LEGAL_DOCUMENTS.version 올리고 변경 고지 |
| **최근 변경 (2026-10-05 세션 158)** | ① 인트라에서 TenOne = 집중 브랜드 (Universe > 집중 브랜드 > TenOne) ② 뉴스룸 폐지 (`/newsroom` → `/` 308, newsroom_items DROP) ③ Works: 관리자 작성 전용, 대표 이미지 미지정 시 본문 첫 이미지, 날짜 연도 표시, 수정 시 발행일 유지, 이미지 브라우저 압축(`lib/board-image-upload.ts`), 조회수·좋아요·북마크 숨김, 상단 메뉴 재클릭 시 목록 복귀 ③ About 연혁 Works 기준 재작성 · Founder 이미지 삭제·연락처 이메일 ④ 홈 Crew CTA·세계관 섹션 삭제, 홈에서 로고 클릭 시 맨 위로 ⑤ Contact: 링크 https 자동 보정·첨부파일, 인트라 문의 상세·응대 기록(handling_log) |
| **문의 운영 규칙** | 답변/미답변 근거 = `contact_submissions.handling_log` (응대 방법·상태·메모·처리자 members.id). 이메일·전화 등 인트라 밖 응대도 기록. 상태 `pending/in_progress/resolved/closed`, 답변 완료는 메모 필수. 첨부는 비공개 버킷 + 직원 5분 서명 URL. 보관: 처리 완료 후 1년 파기(동의 문구) |
| **최근 결정 (2026-05-28)** | 본사이트 정직성·정합성 회복 1차 (경로 표기 정정, Coming Soon 삭제, stats 동적화, brands fallback 26개, history SSOT, universe-map SSOT) — 세부는 CHANGELOG 세션 154 |

---

## 참고

- 유니버스 도메인 분기: [CLAUDE.md § 2.1](../../CLAUDE.md#21-유니버스-도메인-분기-시스템-절대-잊지-말-것)
- 유니버스 프로필 연동: [CLAUDE.md § 2.2](../../CLAUDE.md#22-유니버스-프로필-연동-체계-절대-잊지-말-것)
- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- WIO 인프라: [CLAUDE.md § 1.8](../../CLAUDE.md#18-아키텍처-철학-wio-중심-솔루션-공유)
