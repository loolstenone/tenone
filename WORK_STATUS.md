# 작업 현황

> 마지막 업데이트: 2026-04-16 (사무실, 세션 52 Part 6 — MADLeague 전체 리디자인 + 도메인 분기 문서화)

## 다음 할 일 (이어서 시작 지점)

1. **로그인 문제** — `lools@tenone.biz` signInWithPassword 실패. 계정 존재·이메일 인증·ban 없음 확인. 비밀번호 불일치 의심. Supabase 어드민으로 비밀번호 재설정 필요 시 `execute_sql`로 처리
2. **M2-C** `/madleague/member/projects` — `mad_competition_teams` + `mad_submissions` 스키마 설계 (`sql/madleague_phase2_projects.sql` 신규)
3. **M2-E** `/madleague/member/portfolio` + 공개용 `/portfolio/[member-id]`
4. **MQ-A** `/programs/im` 363줄 legacy 다크 테마 클린업 (나머지 프로그램 페이지와 톤 정리)
5. **MQ-B** `mad_post_likes` — 커뮤니티 게시글 좋아요
6. **M1-G** 동아리 로고 실제 에셋 교체 (현재 이니셜 플레이스홀더)
7. **SQL 미실행** — `sql/madleague_competition_archive.sql` PAT 만료로 미실행. PAT 갱신 후 `node scripts/run-sql.js` 실행 필요

---

## 세션 52 Part 6 완료 — MADLeague 전체 리디자인 + 도메인 분기 문서화

| 항목 | 내용 |
|------|------|
| **MADLeague 전체 리디자인** | 큰 글씨·여백·다크 테마 전체 반영. Hero 단순화, Clubs "경쟁을 통한 성장" 2컬럼 레이아웃, CTA DAMbe 캐릭터 |
| **MadLeagueHeader** | 로고 `madleague-circle-sq.png`, 네비 "동아리" 삭제, 로그인 onError 폴백 |
| **MadLeagueFooter** | `footer_Logo.png` 적용, 연락처 `lools@tenone.biz` |
| **Programs 서브내비** | `app/(MADLeague)/madleague/programs/layout.tsx` — sticky 수평 탭 6개 |
| **경쟁PT 아카이브** | Static 이미지 3개 대회 (리제로스 2차/대성학원 1차/지평주조 2024) |
| **MADzine 레이아웃** | 매거진 피처(16:9 메인+사이드2+와이드1) + 게시판 테이블 하이브리드 |
| **Clubs 페이지** | `py-32`, `text-4xl` 클럽명, 2컬럼 그리드 |
| **site-context.tsx** | 경로 기반 사이트 감지 추가 (pathSiteMap). localhost·www.tenone.biz에서 `/madleague` 경로 → `isMadLeague=true` |
| **site-config.ts** | `domainMap`에 `madleague.tenone.biz` 추가 |
| **CLAUDE.md** | 유니버스 도메인 분기 시스템 섹션 신규 추가 (원칙·파일·도메인 목록·체크리스트) |
| **KoreaClubMap** | `overflow-hidden rounded-2xl` 라운드 코너 |

---

## 세션 52 Part 5 완료 — MADzine 고도화 + 공통 헤더 ABOUT 정리

| 항목 | 내용 |
|------|------|
| **MI-A** Intra 관리 대시보드 | `/intra/ums/madleague` 실DB 연동. 4탭(개요/지원서/HeRo/MADzine), 승인·반려·상태전환·발행토글 |
| **Admin API 3종** | `/api/madleague/admin/{applications, hero, articles}` + `_auth.ts` (Bearer + members 테이블 검증) |
| **M2-A** mad_members 테이블 | `sql/madleague_phase2_members.sql` Prod 적용. RLS, updated_at 트리거, auth.users FK |
| **자동 승격 트리거** | `mad_applications.status='accepted'` → `mad_members` 자동 생성 + cohort count ++ |
| **계정 연동** | `/api/madleague/member/link` POST — 이메일 기반 user_id 연결 |
| **/member 페이지** | 3-state 게이트 (미로그인 / 미연동 / 멤버) + Phase 2 Coming Soon |

---

## 세션 52 완료 항목 — MADLeague 사이트 Phase 1 완료

### 파트 1 — 기반
| 항목 | 내용 |
|------|------|
| 기획서 | `docs/MADLeague_Site_Plan_v2.md` |
| DB | `sql/madleague_phase1.sql` 8 테이블 + RLS + 시드 (7 동아리, 14 cohorts, 3 경쟁PT) |
| 확장 시드 | `scripts/seed-madleague-results.js` — 9 results, 6 archive, 6 articles |
| 인코딩 복구 | `scripts/reseed-madleague.js` (Node fetch) |
| run-sql.js | `SUPABASE_ACCESS_TOKEN` 우선 fallback |
| DB 헬퍼 | `lib/supabase/madleague.ts` |
| Layout/Header/Footer | 다크 모드, #EC1D25 액센트, 로고 교체, "7개 권역" |

### 파트 2 — 페이지 (M1-A ~ M1-J)
| 페이지 | 경로 | 핵심 |
|-------|------|------|
| Home | `/madleague` | Hero+Numbers+Programs+Clubs+HallOfFame+MADzine+CTA |
| About | `/madleague/about` | MAD Mission/Members/Programs/BI/DAMbe/Contact |
| Clubs | `/clubs`, `/clubs/[slug]` | 동아리 목록 + 상세(활동연도/수상/갤러리) |
| Programs 인덱스 | `/programs` | 6 카드 |
| 경쟁PT | `/programs/competition` | Static Hall of Fame 아카이브 |
| 개별 프로그램 | `/programs/{project, markethon, insight-touring, im, dam}` | 5개 상세 |
| MADzine | `/madzine`, `/madzine/[slug]` | 카테고리·연도 필터 + 아티클 상세 |
| Archive | `/archive`, `/archive/[id]` | 4축 필터(연도/유형/동아리/수상) |
| Apply | `/apply` + `/api/madleague/apply` | 폼 + API |
| HeRo | `/hero` + `/api/madleague/hero` | 폼 + API |

---

## 다음 할 일

### MADLeague Phase 1 이월 (자산 대기)
| # | 작업 |
|---|------|
| **M1-G** | 동아리 로고 이미지 7종 확보 후 `mad_clubs.logo_url` 업데이트 (Storage 업로드 포함) |
| **ML-E** | 실제 MADzine 콘텐츠 이관 (/59 → mad_articles), Hall of Fame 이미지, DAM 히스토리 사진 |

### MADLeague Phase 2 — 멤버 허브 (예상 4주)
| # | 작업 |
|---|------|
| **M2-A** | `mad_members` 테이블 추가 + tenone.biz auth 연동 + 매드리거 가입 플로우 |
| **M2-B** | `/member` 대시보드 (내 동아리/기수/프로젝트/포트폴리오 완성도) |
| **M2-C** | `/member/profile` 기본 정보 + 활동 이력 자동 집계 + 스킬 태그 |
| **M2-D** | `/member/projects` 참여 프로젝트 목록 |
| **M2-E** | `/member/portfolio` + 퍼블릭 `/portfolio/[member-id]` |
| **M2-F** | ⭐ `/member/certificate` 인증서 4종 자동 발급 (PDF + QR + 고유코드) |
| **M2-G** | `/certificate/verify/[code]` 퍼블릭 검증 |
| **M2-H** | `/competition` 경쟁PT 워크스페이스 + `mad_competition_teams`, `mad_submissions` 테이블 |
| **M2-I** | `/community` 피드/동아리별/핀보드/공지 + `mad_posts`, `mad_comments` |

### MADLeague Phase 3 — Universe 연계 (예상 3주)
| # | 작업 |
|---|------|
| **M3-A** | `/growth/career` HeRo 연계 |
| **M3-B** | `/growth/network` Badak 연계 |
| **M3-C** | `/growth/crew` YouInOne 연계 |
| **M3-D** | `/programs/dam` 참가신청 학생/현업/기업 탭 통합 |

### Phase 0 병행 (원래 계획)
| # | 작업 |
|---|------|
| **0-A** | `tenant_id` 63개 테이블 일괄 추가 + RLS 업데이트 |
| **0-B** | 고객 신원 4계층 (auth.users → profiles → member_brand_joins → wio_members) |
| **0-C** | 중복 테이블 정리 (expenses/approvals/timesheets/chat → wio_*) |
| **0-D** | WIO 서비스 인프라 (wio_tenant_configs, wio_feature_flags) |

### Badak 잔여
- 멤버 검색/필터 고도화
- 모임 상세 페이지 완성
- 알림 시스템
- 온보딩 플로우

---

## Vercel 상태 (2026-04-14 기준)

| 항목 | 상태 |
|------|------|
| 플랜 | Pro ($20/월) |
| 포함 크레딧 | $1.90 / $20.00 사용 (9.5%) |
| On-Demand 상한 | $100 |
| 프리뷰 배포 | 차단됨 (dev/feature-* 비활성화) |
