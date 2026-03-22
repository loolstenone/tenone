# TenOne 프로젝트 현황 브리핑 (Claude Chat용)

> 이 문서는 Claude Chat에서 TenOne 프로젝트를 심도 있게 논의하기 위한 현황 자료입니다.
> 생성일: 2026-03-22

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | **Ten:One™** (tenone.biz) |
| 정의 | 멀티 브랜드 생태계 "Ten:One Universe" 운영 플랫폼 |
| 구성 | 퍼블릭 포털(홈페이지) + 인트라 오피스(내부 관리) |
| 단계 | **MVP (Phase A)** — 프론트엔드 중심, Mock 데이터 |
| 기술 스택 | Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 |
| 코드 규모 | **143페이지, 약 41,000줄**, 타입 15개, 컴포넌트 13개 |

### 핵심 철학
- **본질 (Essence)**: 변하지 않을 가치에 집요하게 집중
- **속도 (Speed)**: 옳은 방향을 확인하며 빠르게 전진
- **이행 (Carry Out)**: 본질이 확인되면 바로 실행

---

## 2. 사용자 유형 (People System)

| AccountType | 설명 | Intra 접근 | 접근 가능 모듈 |
|-------------|------|-----------|---------------|
| **staff** | 직원 | Full | Myverse-Full, Townity-Full, Project, ERP, HeRo, Education, Wiki-Full, CMS |
| **partner** | 외부 파트너 | 제한적 | Myverse, Townity, Project, HeRo, Education, Wiki |
| **junior-partner** | 주니어 파트너 | 제한적 | Myverse, Townity, Project, HeRo, Education, Wiki |
| **crew** | MADLeague/YouInOne 멤버 | 최소 | Myverse, Townity, Project, HeRo, Education, Wiki |
| **member** | 일반 가입자 | 불가 | 퍼블릭만 |

### Staff 세부 권한 (SystemAccess)
- `project`: 프로젝트/스튜디오/워크플로우
- `erp-hr`: HR/GPR/근태/급여
- `erp-finance`: 경비/법인카드/청구지급
- `erp-admin`: 설정/권한/전체 데이터
- `marketing`: 캠페인/리드/딜/콘텐츠
- `wiki`: 위키 열람/편집

---

## 3. 인트라 모듈 구조 (9개 모듈)

### Module 1: Myverse (개인 포털)
- Dashboard (Staff: 풀 대시보드 / Crew: HIT+교육+Todo만)
- 메신저 (3컬럼 레이아웃, 이모지, 파일첨부, 그룹채팅)
- Todo (일반/프로젝트/기타 통합)
- 타임시트 입력 (주간 그리드, 월~일, 공휴일/휴가, 마감→PM승인)
- 결재 (대기/기안/완료 탭, 결재라인 스텝퍼, 승인/반려) [staff only]
- GPR (3차원 평가: What+How+Attitude) [staff only]
- 근태/급여/경비 [staff only]
- Library (내 자료 + 즐겨찾기)

### Module 2: Townity (커뮤니티)
- 공지사항 (분류, 기간, **공개 대상** 선택)
- 자유게시판 (**공개 대상** 선택)
- 전체 일정 (캘린더/리스트, **공개 대상** 선택)
- 공개 대상 옵션: 전체 / Staff / Partner 이상 / Crew 이상 / Admin Only

### Module 3: Project
- 프로젝트 관리 (등록/목록/상세)
  - 등록: 코드 자동생성, PM=작성자, 투입인원 추가, 예상손익, 임시저장, 결재요청
  - 상세: 개요/Job관리/손익/인력/파일 5개 탭
- Job 관리 (PRJ-YYYY-NNNN-{Type}-{Detail}{Seq} 코드체계)
  - Job별 여러명 투입 가능 (members 배열)
- 타임시트 (PM 관점 집계)

### Module 4: HeRo (인재 성장)
- HIT 검사 (DISC + MBTI + 강점 통합 진단)
- 이력서 (작성 + AI 컨설팅)
- 커리어 개발 (역량진단 + 성장 로드맵 + 멘토 매칭)
- 퍼스널 브랜딩

### Module 5: Evolution School (교육)
- 20개 과정 (필수 7 + 전문 7 + 심화 6)
- 퀴즈 시스템 (10문항, 80점 이상 이수)
- 상태: 미이수 → 학습중 → 퀴즈 → 이수완료

### Module 6: SmarComm. (마케팅)
- Studio: Workflow(Pipeline/Kanban/Automation), Schedule, Assets, Brands
- Marketing: Campaigns, Leads, Deals, Activities, Contacts, Analytics

### Module 7: Wiki (지식관리)
- Culture, Onboarding, Handbook, FAQ
- **Knowledge Library**: 게시판형, 20개씩 페이징, 권한별 노출, 즐겨찾기

### Module 8: ERP (기업관리)
- 전자결재: 결재함(대기/진행/완료) + 기안하기(기안/품의/보고)
- GPR: 전사현황, 목표 캐스케이드, 평가, 인센티브
- HR: People(50명 Mock), 직원관리, 조직도, 근태, 급여, 교육, 인재관리(Talent Pool/Pipeline/Programs)
- Project: 프로젝트 손익, 입찰관리, 협력사, 투입인원단가
- 경영관리: 계획(연간/부문별), 관리(월별추정/실적확정/Gap분석), 분석(손익/부문별/프로젝트/비용)
- Finance: 경비관리, 법인카드, 청구/지급, 경리리포트
- 운영설정: 결재라인, 권한, HR설정, Finance설정

### Module 9: CMS (콘텐츠관리)
- 콘텐츠 관리 (Works/Newsroom 채널, 에디터, 상태관리)
- 뉴스레터 관리 (발송/구독자 회원+비회원 구분)
- 전체 일정 관리 (공개/내부 구분)
- 라이브러리 관리

---

## 4. 퍼블릭 사이트 (11페이지)

- 홈 (히어로 + 크루 모집 + 핵심 가치 + Works + 뉴스룸)
- Works, Newsroom (CMS 연동)
- About, Universe, History, Brands, Contact
- Newsletter (비회원 구독 신청)
- Profile (비밀번호 확인 후 수정, 뉴스레터 구독관리)
- CrewInvite (크루 지원) → Invite (초대 기반 가입 + 이메일 인증)

---

## 5. 데이터 모델 요약

### 프로젝트 구조
```
프로젝트 (PRJ-YYYY-NNNN)
  ├─ 유형: 커뮤니티 / 클라이언트 / 내부
  ├─ 세부유형: 동아리운영, 경쟁PT, 캠페인, 브랜딩 등 11종
  ├─ 손익: 취급액(Billing) - 외부비(Ex-Cost) = 매출(Revenue) - 내부비(In-Cost) = 이익(Profit)
  └─ Job (PRJ-YYYY-NNNN-{PR|ME|PT}-{PL|DO|RE}{Seq})
       ├─ 유형: PR(제작) / ME(Media) / PT
       ├─ 세부: PL(기획) / DO(실행) / RE(Report)
       └─ 투입인원: members[] (여러명, 각각 시수/기간)
```

### 라이브러리
```
LibraryItem
  ├─ source: myverse(개인) / wiki(지식) / cms(관리)
  ├─ category: 10개 카테고리
  ├─ permission: all / staff / partner / admin
  └─ 즐겨찾기: userId + itemId + source → Myverse에서 통합 조회
```

### 결재
```
ApprovalItem
  ├─ factor: 일반/프로젝트/타임시트/경비/구매/인사/계약
  ├─ approvalLine: [기안자 → 관리자 → 최종결재] (스텝퍼 UI)
  └─ status: 대기 / 진행중 / 완료 / 반려
```

---

## 6. 브랜드 생태계

| 브랜드 | 카테고리 | 설명 |
|--------|---------|------|
| **LUKI** | AI Idol | AI 4인조 걸그룹 |
| **RooK** | AI Creator | AI 크리에이터 플랫폼 |
| **Badak** | Network | 현업자 네트워크 |
| **MAD League** | Community | 대학생 프로젝트 연합 (7개 동아리) |
| **YouInOne** | Alliance | 기업 프로젝트 그룹 |
| **HeRo** | Talent Agency | 인재 발굴 & 성장 |
| **Brand Gravity** | Consulting | 브랜드 컨설팅 |
| **FWN** | Fashion | 패션 위크 네트워크 |
| **0gamja** | Character | 캐릭터 브랜드 |
| **SmarComm.** | Service | AI 마케팅 플랫폼 |

---

## 7. 테스트 계정

| 구분 | 이메일 | 비밀번호 | AccountType |
|------|--------|----------|-------------|
| Admin | lools@tenone.biz | Test1234! | staff |
| Manager | manager@tenone.com | Test1234! | staff |
| Editor | official@madleap.co.kr | Test1234! | staff |
| Partner | partner@test.com | Test1234! | partner |
| Junior Partner | jp@test.com | Test1234! | junior-partner |
| Crew | crew@test.com | Test1234! | crew |
| Member | lools@kakao.com | Test1234! | member |

---

## 8. 아키텍처 패턴

- **상태관리**: React Context (auth, crm, staff, gpr, marketing, workflow, library, cms 각각 별도)
- **데이터**: `lib/*-data.ts`에 Mock 데이터, `lib/*-context.tsx`에 상태 로직
- **타입**: `types/` 디렉토리에 모든 인터페이스 정의 (strict typing)
- **라우팅**: Next.js App Router, `(public)` 그룹으로 레이아웃 분리
- **경로 별칭**: `@/*` → 프로젝트 루트
- **스타일**: Tailwind 유틸리티, 라이트 모노크롬 뉴트럴 테마
- **아이콘**: Lucide-React
- **localStorage**: 인증, 라이브러리 북마크 등 클라이언트 저장

---

## 9. 연관 프로젝트

### SmarComm (C:\Projects\SmarComm)
- Ten:One Universe의 독립 서비스
- AI 기반 올인원 마케팅 커뮤니케이션 플랫폼
- Phase 1: SEO/GEO Visibility Scanner (MVP)
- Phase 2: 미팅/컨설팅 전환
- Phase 3: Creative Studio (소재 제작)
- Phase 4: Channel Hub (채널 집행)
- Phase 5~7: CRM+뉴스레터, 콘텐츠 팩토리, 영상+TV
- 수익 모델: SaaS 구독 + 광고비 수수료 + 컨설팅
- 요금제: Free / Lite(29~49만) / Growth(99~199만) / Pro(299~499만) / Enterprise
- BEP: 약 5~6개월차 (유료 고객 60~100개사)

---

## 10. 최근 수정 내역 (2026-03-22)

1. **Crew/Partner/JP 로그인 → Intra 리다이렉트 수정** (login/page.tsx)
   - 기존: staff만 /intra로, 나머지는 /로
   - 수정: member 제외 모든 accountType → /intra로
2. **Townity 공개 대상 추가** (notice, free, calendar 3페이지)
   - 등록 모달에 공개 대상 선택 필드 추가
   - 옵션: 전체/Staff/Partner 이상/Crew 이상/Admin Only
3. **프로젝트 정리 (site-packages 삭제)**: 258MB → 2.1MB

---

## 11. To-Be 시스템 아키텍처 (v3.0)

### 11.1 TenOne = 회사 + 인큐베이터
- **회사 기능**: ERP, 인력관리, 프로젝트관리, 결재, 재무
- **플랫폼 기능**: 멤버 네트워크, 커뮤니티, 교육
- **인큐베이팅**: 곁가지 프로젝트 실험 → 사업화

### 11.2 3층 사업 구조
| 층 | 사업 | 역할 |
|---|------|------|
| **코어** | MADLeague, MADLeap, Badak | 사람과 데이터를 모으는 엔진 |
| **우선 확장** | HeRo, SmarComm. | 코어 자산으로 수익 창출 |
| **곁가지** | RooK, Brand Gravity, FWN, 0gamja, LUKI 등 | 실험 → 검증 → 사업화 or 종료 |

### 11.3 전체 모듈 맵 (기존 9 + 신규 4 = 13개)
| # | 모듈 | 구분 | 핵심 변경/추가 |
|---|------|------|---------------|
| 1 | Myverse | 확장 | 포인트 시스템, 알림 센터, 모바일 최적화 |
| 2 | Townity | 확장 | Badak 9천명 통합, 오픈채팅방 |
| 3 | Project | 확장 | AI 크롤링 기회 연동, 외부 프리랜서, 결재→ERP 정산 |
| 4 | HeRo | 확장 | 포인트 기반 인재 등급, 기업 매칭, 탈랜트 에이전시 |
| 5 | Evolution School | 확장 | LMS 고도화, 유료 과정, 수료증 |
| 6 | SmarComm (인트라) | 유지 | 내부 마케팅 도구 유지 |
| 7 | Wiki | 확장 | 프로젝트 결과물 자동 아카이브 |
| 8 | ERP | 확장 | 크루정산, 사업단위별 손익, 법인구조 |
| 9 | CMS | 확장 | AI 콘텐츠 생성, 멀티 브랜드 |
| 10 | **Opportunity** | 신규 | AI 크롤링(나라장터/공고), 외부 의뢰, 기회 DB |
| 11 | **Commerce** | 신규 | 디지털+물리 상품, PG 결제, 주문/배송 |
| 12 | **BI Dashboard** | 신규 | 전체 사업 현황 통합 대시보드 |
| 13 | **Partner Pool** | 신규 | 외부 협력사/프리랜서 등록, 프로젝트 투입 |

### 11.4 백엔드 기술 선택
```
DB:       PostgreSQL (Supabase)
인증:     Supabase Auth (이메일 + 카카오)
API:      Next.js API Routes
파일:     Supabase Storage
실시간:   Supabase Realtime (메신저, 알림)
배포:     Google Cloud Run
AI:       Claude API (콘텐츠, 분석)
크롤링:   Node.js cron + Puppeteer
결제:     포트원(PortOne)
```

### 11.5 포인트 시스템
- 모든 멤버 활동(프로젝트, 교육, 멘토링 등)이 포인트로 축적
- 등급: Bronze → Silver → Gold → Platinum → Diamond
- HeRo 인재 DB의 핵심 평가 기준

### 11.6 수익분배 기본 규칙
| 프로젝트 유형 | Ten:One | PM | 크루 |
|-------------|---------|-----|------|
| 클라이언트 | 30% | 20% | 50% |
| 경쟁PT 수상 | 20% | 10% | 70% |
| 내부 프로젝트 | 100% | - | 포인트 |

---

## 12. 개발 로드맵 (Phase 1~4)

### Phase 1: 백엔드 기반 (1~8주)
Mock → 실제 DB 전환. Supabase 셋업, 인증 전환, 9개 모듈 DB 연동.
- 주 1~2: Supabase 셋업 + Auth 전환
- 주 3~4: 핵심 테이블 + API Routes
- 주 5~6: Myverse, Townity, Project, CMS 전환
- 주 7~8: ERP, Wiki, HeRo, Evolution School 전환

### Phase 2: 신규 모듈 + 고도화 (8~16주)
Opportunity, Partner Pool, BI, 포인트 시스템, Badak 9천명 마이그레이션.

### Phase 3: 커머스 + 사업 확장 (16~24주)
Commerce 모듈, 유료 교육, HeRo 기업 매칭, SNS 연동.

### Phase 4: 생태계 완성 (24주~)
모바일 앱, AI 추천, 오픈 API, 솔루션 외부 라이선스.

### 성공 지표
| Phase | 핵심 지표 | 목표 |
|-------|---------|------|
| 1 (8주) | 실제 가입/DB 모듈 수 | 50명+, 9개 전환 |
| 2 (16주) | 크롤링 기회/활성 멤버 | 월 50건+, 100명+ |
| 3 (24주) | 커머스 매출/통합 회원 | 매출 발생, 5,000명+ |
| 4 (24주~) | 전체 활성/외부 라이선스 | 500명+, 1건+ |

---

## 13. 기존 사이트 통합 전략

| 사이트 | 회원 수 | 우선순위 |
|--------|--------|---------|
| badak.biz | ~9,000명 | Phase 2 |
| madleague.net | 확인 필요 | Phase 2 |
| madleap.co.kr | 확인 필요 | Phase 3 |

원칙: 한 번 가입 어디서든 로그인, 유입 경로(origin_site) 추적, 마이그레이션 전 재동의.

---

## 14. 연관 프로젝트: SmarComm

- 독립 서비스 (C:\Projects\SmarComm)
- AI 기반 올인원 마케팅 커뮤니케이션 플랫폼
- Phase 1~4: SEO/GEO → 컨설팅 → 소재제작 → 채널집행
- Phase 5~7: CRM+뉴스레터, 콘텐츠 팩토리, 영상+TV
- BEP: 5~6개월차 (유료 60~100개사)

---

## 15. 기술 스택 상세

```json
{
  "framework": "Next.js 16.1.6 (App Router)",
  "react": "19.2.3",
  "typescript": "^5 (strict mode)",
  "styling": "Tailwind CSS v4 + PostCSS",
  "icons": "lucide-react 0.563.0",
  "utilities": ["clsx", "tailwind-merge"],
  "build": "Standalone (Google Cloud Run)",
  "deployment": {
    "dev": "npm run deploy:dev",
    "prod": "npm run deploy:prod"
  }
}
```

---

## 16. 핵심 용어
| 용어 | 정의 |
|------|------|
| WIO | Work In One — 유인원 업무 프로토콜 |
| Vrief | 조사분석 → 가설검증 → 전략수립 프레임워크 |
| GPR | Goal·Plan·Result — 3차원 평가(What+How+Attitude) |
| NAO | Networked Autonomous Organization |
| Ten:One Wheel | 연결→프로젝트→성과→축적→연결 플라이휠 |
| Principle 10 | Ten:One™ 10대 행동 원칙 |
| origin_site | 멤버의 최초 가입 사이트 (유입 경로 추적) |

---

> **이 문서를 Claude Chat에 첨부하면 현재 개발 현황 + 미래 아키텍처 + 사업 전략까지 완전히 이해한 상태에서 심도 있는 논의가 가능합니다.**
