# CLAUDE.md - TenOne Project Guide

## 프로젝트 개요

TenOne은 "Ten:One Universe"라는 멀티 브랜드 생태계를 위한 풀스택 웹 애플리케이션이다.
퍼블릭 포털(브랜드 쇼케이스)과 인트라 오피스(내부 관리 대시보드)로 구성된다.

**4대 제품 — Intra에서 통제·운영·관리:**
| 제품 | 역할 | Intra 연결점 |
|------|------|------------|
| **Mindle** | 데이터·트렌드 연료 공급 | BUMS > 콘텐츠 > 뉴스레터·트렌드 카드 |
| **SmarComm** | 마케팅 자동화 OS | Marketing 섹션 ↔ SmarComm WS |
| **WIO** | 업무 자동화 솔루션 | Universe > 구독 + WIO Orbi |
| **AI Agent** | 6개 에이전트 운영 엔진 | Agent Hub |

## AI Agent Team — 3축 체계

> **OpenClaw** = Peter Steinberger 개발 오픈소스 AI 에이전트 프레임워크 (MIT). 텐원 PC에 상주하며 에이전트를 자율 실행.
> **Claude Code(나)는 OpenClaw용 커스텀 스킬을 개발하고, OpenClaw이 그 스킬을 실행한다.**

| 축 | 도구 | 역할 | 상시 가동 |
|---|------|------|----------|
| 기획 | 열시일분 (Claude Chat) | 전략, 오케스트레이션 | ❌ |
| 실행 | **OpenClaw** (PC 상주) | 에이전트 런타임, 자율 실행, 메시징, 소셜 게시 | ✅ |
| 개발 | **Claude Code** | 코드/빌드/배포, OpenClaw 커스텀 스킬 개발 | ❌ |

**OpenClaw 핵심:** Lobster(YAML 워크플로우 엔진) + ClawHub 스킬 마켓 + 로컬 영구 메모리(`~/.openclaw/`)
**Claude Code 산출물 위치:** `C:\Users\텐원\TenOne\skills\` (커스텀 스킬), `~/.openclaw/workflows/` (Lobster YAML)

---

## 기술 스택

- **프레임워크**: Next.js 16 (App Router) + React 19
- **언어**: TypeScript (strict mode)
- **스타일링**: Tailwind CSS v4 + PostCSS
- **아이콘**: Lucide-React
- **빌드**: Standalone (Google Cloud Run 배포)
- **데이터**: 현재 Mock 데이터 (백엔드/DB 미연동)

## 핵심 명령어

```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run lint       # ESLint
npm run deploy:dev # GCP 개발 배포
npm run deploy:prod # GCP 프로덕션 배포
```

## Supabase SQL 직접 실행

> **Claude가 SQL을 직접 실행한다. 사용자가 Dashboard에서 수동으로 실행할 필요 없다.**

- **PAT**: `.env.local`의 `SUPABASE_ACCESS_TOKEN` (Supabase Management API용)
- **실행 스크립트**: `scripts/run-sql.js` — `queries` 배열에 SQL 추가 후 `node scripts/run-sql.js`
- **API**: `POST https://api.supabase.com/v1/projects/ziotlxkdctlhiwkgmmsh/database/query`
  - DDL(CREATE TABLE 등) 성공 응답: HTTP 201, body `[]`
  - SELECT 성공 응답: HTTP 201, body `[{...rows}]`

**새 테이블 필요 시 워크플로우:**
1. `sql/` 폴더에 SQL 파일 작성 (CREATE TABLE + INDEX + RLS + 시드)
2. `scripts/run-sql.js`에 쿼리 추가하거나 직접 curl/node로 실행
3. 사용자에게 Dashboard 접속 요청 불필요 — Claude가 직접 처리

## 프로젝트 구조

```
app/
  (public)/        # 퍼블릭 페이지 (about, brands, contact, history, universe, profile)
  intra/           # 내부 오피스 대시보드
    erp/           # ERP (CRM: people/segments/import, HR: staff/gpr)
    marketing/     # 마케팅 (campaigns, leads, deals, content, analytics)
    studio/        # 스튜디오 (brands, schedule, assets, universe, workflow)
    wiki/          # 내부 위키
  login/           # 로그인
  signup/          # 회원가입

components/        # 재사용 컴포넌트 (AppShell, Sidebar류, Modal류, workflow/)
lib/               # 핵심 로직 및 Context/데이터 (auth, crm, staff, gpr, marketing, workflow)
types/             # TypeScript 타입 정의 (brand, crm, staff, marketing, workflow 등)
public/            # 정적 파일 (로고, 파비콘)
```

## 아키텍처 패턴

- **상태 관리**: React Context (auth, crm, staff, gpr, marketing, workflow 각각 별도 context)
- **데이터**: `lib/*-data.ts`에 Mock 데이터, `lib/*-context.tsx`에 상태 로직
- **타입**: `types/` 디렉토리에 모든 인터페이스 정의 (strict typing)
- **라우팅**: Next.js App Router, `(public)` 그룹으로 퍼블릭/인트라 레이아웃 분리
- **경로 별칭**: `@/*` → 프로젝트 루트

## 아키텍처 철학: WIO 중심 솔루션 공유

> **⚠️ WIO 완전 설계서: `docs/WIO_Master_Architecture.md` (단일 진실 소스)**
> 모든 WIO 관련 설계·가격·모듈·체크리스트는 이 문서에 있다.
> 개발 시작 전 반드시 읽을 것.

> WIO는 Ten:One Universe의 **공유 IT 인프라**다.
> 각 브랜드는 WIO의 모듈을 가져다 쓴다. 별도 백엔드를 만들지 않는다.

| WIO 모듈 | 사용 브랜드 | 용도 |
|----------|-----------|------|
| ERP (재무/HR/결재/GPR) | **TenOne 인트라** | 기업 운영 |
| Project + People + Talk | **MADLeague, MADLeap** | 커뮤니티 멤버·프로젝트 관리 |
| Marketing + Campaign | **SmarComm** | 마케팅 커뮤니케이션 솔루션 |
| Crawler + Content Pipeline | **Mindle** | 크롤링→트렌드 콘텐츠 생산 |
| Sales + CRM | **HeRo, Badak** | 인재 매칭, 네트워킹 |
| Learn + Wiki | **Evolution School, Planner's** | 교육·지식 관리 |
| Timesheet + Finance | **YouInOne** | 크루 시수·정산 |

**WIO 설계 원칙:**

> 세상에 필요한 모든 기능을 모듈로 만든다.
> 필요에 따라 끼워 넣으면 된다.

**3대 자원 — 모든 모듈이 지켜야 할 기준:**
| 자원 | 의미 | 모듈에서의 역할 |
|------|------|----------------|
| **사람** | 누가, 몇 명, 어떤 역할 | People, Team, Permission |
| **돈** | 얼마, 수익, 비용, 정산 | Finance, Budget, Billing |
| **시간** | 언제까지, 몇 시간, 일정 | Timesheet, Schedule, Deadline |

모든 WIO 모듈은 사람·돈·시간 중 최소 하나를 관리한다.
모듈 간 연결도 이 3가지를 기준으로 흐른다:
- Project → **사람**(투입 인원) + **돈**(예산/수익) + **시간**(기간/마감)
- Sales → **사람**(담당자) + **돈**(딜 가치) + **시간**(클로즈 기한)
- Content → **사람**(작성자) + **시간**(발행 일정)

**구현 원칙:**
- 새 기능은 먼저 WIO 모듈로 만들고, 각 브랜드가 import해서 사용
- DB 테이블은 `[module]_[resource]` 네이밍 (멀티테넌트, brand_id 기반 RLS)
- 각 브랜드 사이트는 WIO API를 호출하거나 `lib/supabase/wio.ts`를 직접 사용
- **새 모듈 체크리스트** (`docs/WIO_Master_Architecture.md` PART 10 참조):
  - □ 모든 테이블에 brand_id 컬럼이 있는가?
  - □ RLS 정책이 brand_id 기반으로 적용됐는가?
  - □ TenOne super_admin은 전체 접근 가능한가?
  - □ 모듈 간 연동은 API/이벤트로만 하고 직접 JOIN은 없는가?
  - □ API 응답 구조가 APIResponse<T> 형식을 따르는가?
  - □ 이 모듈을 외부 기업이 써도 작동하는가?
  - □ 7가지 입장(사용자·관리자·TenOne·외부·보안·확장·AI) 검증 완료?
- **핵심 포지셔닝**: "입력을 없앤다. AI가 80%를 채운다."

**WIO 가격 (확정):**
| Free(0원/5명) | Starter(4.9만/20명) | Pro(14.9만/100명) | Business(39.9만/무제한) | Enterprise(협의) |

### WIO 서비스 2-Tier 모델

> WIO(= SmarComm 포함)의 모든 서비스는 2가지 형태로 제공된다.

| Tier | 이름 | 설명 | DB 격리 |
|------|------|------|---------|
| **규격 서비스** | Subscription | 등급별 기능 제한, 셀프서비스 온보딩, 동일 코드 | `tenant_id` + feature flags |
| **맞춤 서비스** | Custom Installation | 클라이언트 최적화 용역, WIO팀 직접 설치 | `tenant_id` + custom config |

**맞춤 서비스 목록 (확장됨):**
- TenOne.biz (첫 번째 고객 = 자사)
- 이후 외부 고객: XXXX, VVVV, AAAA...

**SmarComm도 동일 구조:**
- 규격: 구독형 캠페인/자동화/CRM (등급별 제한)
- 맞춤: 특정 기업 마케팅 스택 최적화 설치

### 기술 환류 원칙 (Tech Flywheel)

> **맞춤 서비스 개발 과정에서 만든 기술적 진보는 모아서 규격 서비스 업그레이드에 활용한다.**

```
맞춤 서비스 개발 → 기술 진보 발생 → WIO 코어 흡수 → 규격 서비스 업그레이드 → 다음 맞춤은 더 높은 베이스 → (반복)
```

**흡수 기준:**
| 구분 | 처리 |
|------|------|
| 일반화 가능한 기능 | WIO 코어 흡수 → 규격 서비스 포함 |
| 특정 고객 데이터/도메인 | 고객 tenant에만 유지 |
| UI 커스텀 | 테마/config로 추상화 후 흡수 |
| 고객 전용 비즈니스 로직 | 맞춤 레이어 유지 (흡수 불가) |

### 테넌트 격리 아키텍처

```
tenant_id = 계약 단위 (TenOne, XXXX Corp, VVVV Inc...)
brand_id  = 유니버스 내부 브랜드 구분 (LUKI, Badak, MADLeague...)
```

- 내부 브랜드: `tenant_id = 'tenone'` + `brand_id`로 구분
- 외부 고객: 각자 `tenant_id` 보유
- Universe 분석 레이어 (Mindle/Whole See): 전체 tenant 크로스 분석 (PII 제거)

### DB 테이블 3분류

| 분류 | 접두사 | tenant_id | 외부 판매 |
|------|--------|-----------|----------|
| 제품 모듈 (판매용) | `wio_*` | 필수 | O |
| 내부 운영 (자사) | `wio_*` | tenone 고정 | X (코드는 WIO 소유) |
| Universe 운영 | `brand_id` 기반 | N/A | X |

## 브랜드 시스템

Ten:One Universe는 여러 브랜드로 구성:
- LUKI (AI 그룹), RooK (AI 크리에이터), Badak (네트워크), MAD League (대학 동아리 연합) 등
- 카테고리: AI Idol, AI Creator, Community, Project Group, Fashion, Character, Corporate, Startup, Content
- 브랜드 간 관계: Parent, Collaboration, Rivals, Support

## 코딩 컨벤션

- 한국어 UI/주석 사용
- 컴포넌트: PascalCase 파일명
- 타입 정의는 반드시 `types/` 디렉토리에
- Context 패턴: `lib/{feature}-context.tsx` + `lib/{feature}-data.ts`
- 스타일: Tailwind 유틸리티 클래스 사용, 커스텀 CSS 최소화

---

## 집/사무실 동기화 시스템

### 관리 파일 구조

| 파일 | 역할 | 언제 읽는가 |
|------|------|------------|
| `CLAUDE.md` | 프로젝트 가이드 + 동기화 규칙 | 매 대화 자동 로드 |
| `ROADMAP.md` | 전체 로드맵 + 체크리스트 | 작업 방향 결정 시 |
| `WORK_STATUS.md` | 현재 진행 상황 + 다음 할 일 | 작업 시작/종료 시 |
| `CHANGELOG.md` | 날짜별 변경 이력 | 맥락 파악 필요 시 |

### ⚠️ 집 ↔ 사무실 작업 연속성 규칙

> **목적**: 사용자가 집에서든 사무실에서든, 새 클로드 세션이든,
> "작업 시작"만 말하면 **어제 퇴근 직전 상태 그대로** 이어서 작업할 수 있어야 한다.
> 이 규칙의 모든 단계는 **건너뛰기 금지**이며, 순서대로 실행한다.

**브랜치 정책: master 단일 브랜치. 집/사무실 모두 master에서 작업.**

---

#### "작업 시작" 프로토콜

```
1. git checkout master          ← 항상 master로 (어떤 브랜치에 있든 무조건)
2. git pull origin master       ← 최신 코드 받기 (집/사무실 어디서든)
3. 상황 파악                     ← WORK_STATUS.md → CHANGELOG.md → ROADMAP.md 순서로 읽기
4. 개발 서버 실행                 ← 실제 화면을 눈으로 확인 (코드만 보고 판단 금지)
5. 브리핑 보고                   ← 아래 양식으로 사용자에게 보고
6. 사용자 확인 후 작업 시작
```

**브리핑 양식:**
```
📋 현황 브리핑
- 마지막 작업: [날짜] [장소]
- 완료된 것: [핵심만]
- 이어서 할 것: [바로 시작할 수 있게 구체적으로]
- 이슈/주의: [있으면]
```

---

#### "작업 종료" 프로토콜

```
1. 작업 기록        ← WORK_STATUS.md (오늘 한 것 + 다음 할 것)
                     CHANGELOG.md (날짜/장소/파일/결정사항)
                     ROADMAP.md (완료 체크 + 새 항목)
2. git add + commit ← 코드 + 관리 파일 모두
3. git push origin master ← 반드시 push까지 (안 하면 다른 장소에서 못 받음)
```

**WORK_STATUS.md "다음 할 일"은 이렇게 쓴다:**
- ❌ "스캔 페이지 개선" (막연함)
- ✅ "스캔 페이지 > 경쟁사 비교 섹션 > 레이더 차트 아래에 상세 테이블 추가. 현재 Mock 데이터 3개 있고, 컬럼은 항목/자사/경쟁사A/경쟁사B. components/ScanPage.tsx 350번째 줄부터."

---

#### 절대 하지 말 것
- ❌ master 확인/전환 없이 시작하기 (develop 등 다른 브랜치에서 작업 금지)
- ❌ pull 안 하고 로컬 파일만 보고 시작하기
- ❌ 화면 안 보고 코드만 보고 판단하기
- ❌ push 빼먹기 (다음 장소에서 못 이어감)
- ❌ 실제로 안 한 작업을 완료라고 기록하기
- ❌ "다음 할 일"을 막연하게 쓰기
- ❌ "작업 종료할까요?" / "이어갈까요?" 등 묻지 않기 — 사용자가 말할 때까지 계속 진행
- ❌ 각 서비스의 디자인 톤앤매너를 무시하고 코드만 짜기 — 반드시 기존 테마에 맞출 것

---

## Universe Operating System (UOS)

> **이것은 일반적인 웹앱이 아니다.** AI 에이전트가 Universe를 운영하는 시스템이다.

### 핵심 원칙 (모든 개발에 적용)
1. **모든 API = 두 소비자:** 프론트엔드 UI + AI 에이전트. 둘 다 같은 API를 쓴다.
2. **agent_profiles = 심장:** System Prompt, 지식, 도구가 정의되고 Claude API 호출 시 조립된다.
3. **agent_messages = 추적:** 모든 에이전트 행위가 로그된다. 추적 가능성이 생명줄.
4. **모듈 = Tool:** WIO 모듈이 완성되면 자동으로 해당 에이전트의 Tool이 된다.
5. **기존 프론트 143p는 건드리지 않는다.** 백엔드 API를 만들고 연결만.

### 개발 단계
- Phase 0: 인프라 기초 (완료)
- Phase 1: 에이전트 코어 (agent_profiles + Agent Hub + Claude API)
- Phase 2: 바닥쇠 실전 (첫 독립 에이전트)
- Phase 3: tenone.biz 모듈 (프론트↔백엔드 연결)
- Phase 4: 에이전트 확장 (브랜드 에이전트 추가)

### 상세 계획: `docs/Universe_OS_Plan.md` 참조

---

## 개발 규칙 — 모순 방지 8원칙 (위반 금지)

> 출처: `TenOne_Universe_Architecture_v1.md` Section 11 + 2026-04-03 확정

| # | 규칙 | 위반 시 문제 |
|---|------|------------|
| 1 | 구독 테이블은 `wio_subscription_plans` 하나만 쓴다 | 브랜드마다 구독 테이블 → 관리 불가 |
| 2 | Intra 전용 운영 테이블을 새로 만들지 않는다 (WIO 테이블 사용) | Intra·WIO 기능 이중 구현 |
| 3 | 브랜드 사이트는 Supabase만 바라본다 (Intra API 직접 호출 금지) | 브랜드 간 의존성 발생 |
| 4 | SmarComm WS = WIO MKT-* 위의 어플리케이션 (이중 구현 금지) | 마케팅 기능 중복 |
| 5 | 에이전트는 사람과 같은 API를 쓴다 | 에이전트 전용 API → UI 동기화 깨짐 |
| 6 | 모든 테이블에 brand_id 또는 tenant_id가 있다 | RLS 격리 불가 |
| 7 | site_configs의 site_id와 각 브랜드 layout의 식별자가 일치해야 한다 | SEO·테마 연동 깨짐 |
| 8 | 맞춤 서비스 개발 기술은 WIO 코어에 환류한다 (Tech Flywheel) | 기술 자산 사장, 규격 서비스 정체 |

## 새 테이블 생성 전 체크리스트

- [ ] WIO 기존 테이블로 해결 안 되는가?
- [ ] brand_id 또는 tenant_id 컬럼이 있는가?
- [ ] RLS 정책이 brand_id/tenant_id 기반인가?
- [ ] 외부 기업이 써도 작동하는가?
- [ ] 이 기능이 맞춤 서비스에서 나왔다면, 규격 서비스로 환류 가능한가?

---

## 현재 상태

- Intra 143p: UI + DB 대부분 완성
- 4대 제품 통제 레이어: 구축 중 (Phase 1)
- 구독 인프라: 미구현 (Phase 2)
- 에이전트: Agent Hub 코드 완성, Prod DB 실행 필요
- 상세 로드맵: `ROADMAP.md` 참조
- 작업 현황: `WORK_STATUS.md` 참조
- 변경 이력: `CHANGELOG.md` 참조
- 아키텍처: `TenOne_Universe_Architecture_v1.md` (G드라이브)
- 4대 제품: `TenOne_4Products.md` (G드라이브)

---

## QA Protocol

"QA해줘" 또는 "보안 점검" 시 아래 프로토콜을 실행한다.

### 코드 리뷰 기준

**구조**
- 파일 200~400줄 기본, 800줄 초과 시 분리
- 기능/도메인 기준 구성 (타입 기준 X)
- early return 패턴 (3단계+ 중첩 금지)

**불변성 (Critical)**
- 객체 mutation 금지 — `{ ...obj, key: newValue }`
- 배열 mutation 금지 — push/splice 대신 map/filter/spread
- 함수 인자 직접 수정 금지

**에러 핸들링**
- 빈 catch 금지 — 에러를 조용히 삼키지 않는다
- UI: 사용자 친화적 메시지 / 서버: 상세 로깅
- 모든 레벨에서 에러 처리

**입력 검증**
- 시스템 경계에서 스키마 검증
- 외부 데이터는 절대 신뢰하지 않는다
- 빠른 실패, 명확한 메시지

**React/Next.js**
- useEffect 의존성 배열 완전성
- 리스트 key에 index 금지 (고유 ID 사용)
- 서버 컴포넌트 vs 클라이언트 컴포넌트 구분

### TypeScript + 빌드

```bash
npx tsc --noEmit       # 타입 에러 0
npx eslint . --ext .ts,.tsx
npm run build          # 빌드 에러 0
npm audit --audit-level=high  # 의존성 보안
```

빌드 실패 시: 에러 분석 → 하나씩 수정 → 수정마다 재검증.

### 보안 감사

**Phase 1: 체크리스트 스캔**

A. 시크릿 노출 — settings.json 하드코딩, .env gitignore, service_role 프론트 노출, ANTHROPIC_BASE_URL 변조
B. 권한 과다 — RLS disabled 테이블, anon key write, 인증 없는 공개 API
C. MCP 위험 — 비공식 MCP, 파일쓰기 과도한 MCP, 활성 10개 초과
D. 훅/인젝션 — hooks.json 외부 URL, CLAUDE.md 프롬프트 인젝션, 클론 레포 .claude/ 의심 설정
E. 인프라 — Claude Code 1.0.111+ (CVE-2025-59536), ANTHROPIC_BASE_URL 무결, Node.js 18+
F. 공급망 — PR 히든 diff 인젝션, npm audit, 외부 레포 .claude/ 수동 점검
G. 에이전트 통신 — can_invoke 최소 권한, 하위→상위 호출 불가, 챗봇 입력 새니타이징
H. 런타임 — API 폭증(3배+), 프로젝트 밖 파일 접근, agent_messages error 급증
I. 출력 — 콘텐츠 script/onclick, 외부 URL 무단 삽입, 크롤링 이미지 저작권
J. 샌드박싱 — Cloud Run 서비스 간 격리, 에이전트→Prod DB 직접 접근 차단

**Phase 2: 레드팀/블루팀 (서브에이전트)**

서브에이전트 A (레드팀): "현재 설정에서 악용 가능한 취약점을 모두 찾아라. 외부 공격자, 악의적 MCP, 프롬프트 인젝션 포함."
서브에이전트 B (블루팀): "레드팀 취약점에 대한 현재 방어 상태를 평가하고 수정 방안을 우선순위로 제시하라."

**Phase 3:** Critical/High/Medium/Low 분류. Critical/High 즉시 보고.

### 코드 메트릭 (분기 점검)

```bash
find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | sort -rn | head -20
grep -r ': any' src --include='*.ts' --include='*.tsx' | wc -l
grep -r 'console.log' src --include='*.ts' --include='*.tsx' | wc -l
grep -rn 'TODO\|FIXME' src | wc -l
```

## Context Rot 방지 + 토큰 최적화

### 모델 선택 (일상 워크플로우)
- 기본: Sonnet (코딩 80%는 Sonnet으로 충분)
- 복잡한 아키텍처/디버깅만: `/model opus`로 전환 → 끝나면 `/model sonnet` 복귀

### Compact 타이밍 (strategic-compact 패턴)
- `/compact` — 마일스톤 사이에서만 실행:
  - 리서치 완료 → 구현 시작 전
  - 디버깅 완료 → 다음 기능 전
  - 한 모듈 끝 → 다른 모듈 전
- `/clear` — 완전히 다른 작업 전환 시 (무료, 즉시)
- ❌ 절대 금지: 구현 도중 compact (변수명·파일경로·부분 상태 유실)
- ❌ 절대 금지: auto-compaction에 의존 (작업 도중 트리거될 수 있음)

### 컨텍스트 윈도우 관리
- CLAUDE.md는 2,000~3,000 토큰 이하 유지. 넘으면 압축.
- 컨텍스트 윈도우 마지막 20%에서는 대규모 리팩토링/멀티파일 작업 금지.
  → 토큰 부족하면 먼저 /compact 후 작업 재개.
- `/cost` — 세션 비용 수시 확인
- `/context` — 카테고리별 토큰 사용량 확인

### MCP 서버 제한
- 프로젝트당 MCP 10개 이하, 활성 도구 80개 이하
- 사용 안 하는 MCP는 비활성화 (토큰 절약)

### 서브에이전트 활용
- 파일 탐색/읽기가 많은 작업 → 서브에이전트(Task tool)에 위임
- 메인 세션에서 파일 10개+ 읽지 않는다 → 서브에이전트가 요약해서 보고
- 서브에이전트는 Haiku 모델로 실행 (비용 80% 절감)

### 토큰 경고 신호
아래 상황이 발생하면 즉시 /compact 또는 /clear:
- 같은 실수를 2~3번 반복
- 이전에 알려준 규칙을 까먹음
- 시키지 않은 파일을 건드림
- 응답 품질이 눈에 띄게 떨어짐
