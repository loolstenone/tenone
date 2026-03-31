# Dev DB Setup Guide

> Dev Supabase: https://supabase.com/dashboard/project/dwdoxzksvzjnsgupjzob
> Prod Supabase: https://supabase.com/dashboard/project/ziotlxkdctlhiwkgmmsh (절대 개발 중 사용 금지)

## SQL 실행 순서

Supabase SQL Editor에서 아래 순서대로 실행. **순서 중요!**

### Phase 1: 기반 (필수)

| 순서 | 파일 | 내용 | 비고 |
|------|------|------|------|
| 1 | `supabase/schema.sql` | ENUM + members, projects, jobs 등 기본 테이블 | 반드시 첫 번째 |
| 2 | `supabase/phase2-tables.sql` | opportunities, partners | schema.sql 의존 |
| 3 | `supabase/board-system.sql` | 게시판 시스템 (board_configs, posts 재정의) | ⚠️ posts 테이블 충돌 — schema.sql의 posts를 덮어씀 |

### Phase 2: 독립 모듈

| 순서 | 파일 | 내용 | 비고 |
|------|------|------|------|
| 4 | `sql/crm_tables.sql` | CRM (people, orgs, deals, activities) | 독립 (brand_id 기반) |
| 5 | `supabase/marketing-tables.sql` | 마케팅 (campaigns, leads, content, deals) | 독립 |
| 6 | `supabase/user-settings.sql` | 사용자 설정 (key-value) | 독립 |
| 7 | `supabase/agent-core-tables.sql` | 에이전트 프로필/메시지 | 독립 + seed 포함 |
| 8 | `supabase/bums-tables.sql` | CMS 멀티사이트 | members 참조 |

### Phase 3: WIO (순서 중요)

| 순서 | 파일 | 내용 | 비고 |
|------|------|------|------|
| 9 | `supabase/wio-sprint1.sql` | WIO 기반 (tenants, members, projects) | seed 포함 |
| 10 | `supabase/wio-sprint2.sql` | WIO 소통/재무 | sprint1 의존 |
| 11 | `supabase/wio-sprint3.sql` | WIO 영업/GPR | sprint1 의존 |
| 12 | `supabase/wio-sprint4.sql` | WIO 교육/콘텐츠 | sprint1 의존 |
| 13 | `supabase/wio-fix-rls.sql` | WIO RLS 수정 | sprint1~4 이후 |

### Phase 4: 브랜드별 모듈

| 순서 | 파일 | 내용 | 비고 |
|------|------|------|------|
| 14 | `supabase/badak-tables.sql` | Badak 네트워킹 | 독립 |
| 15 | `supabase/hero-tables.sql` | HeRo HIT | 독립 |
| 16 | `supabase/networking-tables.sql` | 네트워킹 이벤트 | 독립 |
| 17 | `supabase/competition-tables.sql` | 대회/공모전 | 독립 |
| 18 | `supabase/certificate-tables.sql` | 수료증 | 독립 |
| 19 | `supabase/trendhunter-tables.sql` | 트렌드헌터 봇 | 독립 |
| 20 | `supabase/myverse-tables.sql` | MyVerse | 독립 |

### Phase 5: Seed 데이터

| 순서 | 파일 | 내용 |
|------|------|------|
| 21 | `supabase/seed.sql` | Mock 데이터 INSERT (개발용) |

## 알려진 이슈

1. **posts 테이블 충돌**: `schema.sql`과 `board-system.sql` 둘 다 `posts` 생성. board-system이 실제 사용중인 버전.
2. **orbi-modules 파일들**: `orbi-modules-batch1.sql`, `orbi-modules-remaining.sql`은 아직 미사용. 필요 시 추가.

## 환경별 DB 매핑

| 환경 | Supabase | URL |
|------|----------|-----|
| Production (main) | TenOne (Prod) | ziotlxkdctlhiwkgmmsh.supabase.co |
| Preview (develop) | TenOne Dev | dwdoxzksvzjnsgupjzob.supabase.co |
| Local (localhost) | TenOne Dev | dwdoxzksvzjnsgupjzob.supabase.co |
