# CLAUDE.md - TenOne Project Guide

## 프로젝트 개요

TenOne은 "Ten:One Universe"라는 멀티 브랜드 생태계를 위한 풀스택 웹 애플리케이션이다.
퍼블릭 포털(브랜드 쇼케이스)과 인트라 오피스(내부 관리 대시보드)로 구성된다.

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
- DB 테이블은 `wio_` 프리픽스 (멀티테넌트)
- 각 브랜드 사이트는 WIO API를 호출하거나 `lib/supabase/wio.ts`를 직접 사용

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

---

#### "작업 시작" 프로토콜

```
1. git pull        ← 다른 장소에서 push한 최신 코드 받기
2. 상황 파악        ← WORK_STATUS.md → CHANGELOG.md → ROADMAP.md 순서로 읽기
3. 개발 서버 실행    ← 실제 화면을 눈으로 확인 (코드만 보고 판단 금지)
4. 브리핑 보고      ← 아래 양식으로 사용자에게 보고
5. 사용자 확인 후 작업 시작
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
2. git commit      ← 코드 + 관리 파일 모두
3. git push        ← 반드시 push까지 (안 하면 다른 장소에서 못 받음)
```

**WORK_STATUS.md "다음 할 일"은 이렇게 쓴다:**
- ❌ "스캔 페이지 개선" (막연함)
- ✅ "스캔 페이지 > 경쟁사 비교 섹션 > 레이더 차트 아래에 상세 테이블 추가. 현재 Mock 데이터 3개 있고, 컬럼은 항목/자사/경쟁사A/경쟁사B. components/ScanPage.tsx 350번째 줄부터."

---

#### 절대 하지 말 것
- ❌ pull 안 하고 로컬 파일만 보고 시작하기
- ❌ 화면 안 보고 코드만 보고 판단하기
- ❌ push 빼먹기 (다음 장소에서 못 이어감)
- ❌ 실제로 안 한 작업을 완료라고 기록하기
- ❌ "다음 할 일"을 막연하게 쓰기
- ❌ "작업 종료할까요?" / "이어갈까요?" 등 묻지 않기 — 사용자가 말할 때까지 계속 진행
- ❌ 각 서비스의 디자인 톤앤매너를 무시하고 코드만 짜기 — 반드시 기존 테마에 맞출 것

---

## 현재 상태

- MVP 단계: 프론트엔드 중심, Mock 데이터 기반
- 백엔드 API / 데이터베이스 미연동
- 인증: Mock 인증 (실제 인증 서비스 미연동)
- 상세 로드맵: `ROADMAP.md` 참조
- 작업 현황: `WORK_STATUS.md` 참조
- 변경 이력: `CHANGELOG.md` 참조
