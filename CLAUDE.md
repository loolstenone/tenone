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

### "작업 종료" 명령어

사용자가 **"사무실 작업 종료"** 또는 **"집 작업 종료"**라고 하면:

1. **WORK_STATUS.md 업데이트**
   - 오늘 한 작업 요약
   - 현재 진행 중인 작업 (어디까지 했는지 구체적으로)
   - 다음에 할 일 (바로 이어서 할 수 있게)
   - 주의사항/이슈

2. **CHANGELOG.md에 기록 추가**
   - 날짜, 장소(집/사무실)
   - 완료 항목, 생성/수정된 파일, 결정 사항

3. **ROADMAP.md 진척도 반영**
   - 완료된 항목 체크 `[x]`
   - 새로 발견된 작업 추가

4. **Git 커밋 & push**
   - 변경된 코드 + 관리 파일 모두 커밋
   - 반드시 push까지 완료

### "작업 시작" 프로세스

새 대화가 시작되면 클로드는:

1. `WORK_STATUS.md`를 읽고 현재 상황 파악
2. `ROADMAP.md`에서 다음 할 일 확인
3. 필요 시 `CHANGELOG.md`에서 최근 히스토리 확인
4. 사용자에게 현황 브리핑 후 작업 시작

---

## 현재 상태

- MVP 단계: 프론트엔드 중심, Mock 데이터 기반
- 백엔드 API / 데이터베이스 미연동
- 인증: Mock 인증 (실제 인증 서비스 미연동)
- 상세 로드맵: `ROADMAP.md` 참조
- 작업 현황: `WORK_STATUS.md` 참조
- 변경 이력: `CHANGELOG.md` 참조
