# WIO 모듈 맵 v3 — 최종

> **WIO**: 모든 기능을 만들어내는 공장
> **TenOne**: 23개 브랜드를 종합 관리하는 컨트롤타워
> **각 브랜드**: 자기만의 특화 기능을 WIO에서 가져다 쓴다

---

## 구조

```
WIO (기능 공장)
  ↓ 모듈을 만든다
TenOne (컨트롤타워)
  ↓ 종합 관리한다
23개 브랜드 (각자 특화 기능)
  ↓ 필요한 모듈을 가져다 쓴다
```

---

## WIO가 만들어야 하는 모듈 전체

### 공통 모듈 (모든 브랜드가 쓰는 것)

| 모듈 | 기능 | 왜 모두에게 필요한가 |
|------|------|-------------------|
| **Home** | 대시보드, 알림, 오늘 할 일 | 시작점 |
| **People** | 멤버 DB, 프로필, 역할, 등급, 포인트, 활동 이력 | 커뮤니티 = 사람 |
| **Talk** | 공지, 게시판, Q&A, 일정/이벤트, 채팅 | 커뮤니티 = 소통 |
| **Content** | 콘텐츠 작성/발행, 뉴스레터, 미디어 관리 | 브랜드 = 콘텐츠 |
| **Insight** | 통계, KPI, 차트, 리포트 | 관리 = 측정 |

### 운영 모듈 (조직 운영에 필요한 것)

| 모듈 | 기능 |
|------|------|
| **Project** | 프로젝트/프로그램/경연 관리, 팀 구성, Job, 마감, 상태 |
| **Learn** | LMS, 교육 과정, 퀴즈, 수료, 인증서 |
| **GPR** | 목표 관리 (Goal→Plan→Result), 개인/팀/조직 캐스케이드 |
| **Wiki** | 지식 관리, 매뉴얼, 아카이브, 템플릿 |

### 비즈니스 모듈 (수익 사업에 필요한 것)

| 모듈 | 기능 |
|------|------|
| **Sales** | CRM, 리드→기회→제안→수주 파이프라인 |
| **Finance** | 결재, 경비, 청구/지급, 예산, 손익 |
| **Timesheet** | 시수 기록, 프로젝트별 시간·비용 계산 |
| **Approval** | 전자결재, 다단계 승인 체인 |
| **HR** | 인사관리, 근태, 급여, 조직도 |
| **Shop** | 커머스, 상품, 주문, 정산, 멤버십 결제 |

### AI 모듈 (자동화)

| 모듈 | 기능 |
|------|------|
| **AI Assistant** | Claude 업무 비서, 회의록, 요약, 추천 |
| **AI Crawler** | 트렌드 수집, RSS/Discord/Web/카카오 |
| **AI Creative** | 콘텐츠 자동 생성 (글, 이미지, SNS) |
| **AI Matching** | 인재-프로젝트 자동 매칭 |

### 특화 모듈 (특정 브랜드 니즈에서 탄생)

| 모듈 | 탄생 배경 | 범용 가치 |
|------|----------|----------|
| **Competition** | MADLeague 경연 PT | 해커톤, 공모전, 경진대회 운영 |
| **Certificate** | MADLeague 활동인증서 | 수료증, 자격증, 인증서 발급 |
| **Networking** | Badak 연결 요청 | 매칭, 소개, 1:1 미팅 |
| **Mentoring** | HeRo 멘토링 | 멘토-멘티 매칭, 세션 관리 |
| **Portfolio** | Jakka/RooK 작품 | 작품 전시, 포트폴리오 관리 |
| **Counseling** | 0gamja 상담 | 익명 상담, 심리 지원 |
| **Local** | Townity 지역 | 지역 정보, 장소, 동네 지도 |
| **Newsletter** | Mindle/전체 | 구독자 관리, 발송, 통계 |

> **특화 모듈의 원칙**: 한 브랜드에서 필요해서 만들지만, **범용으로 쓸 수 있게** 설계한다.
> MADLeague의 Competition 모듈 → 외부 기업이 해커톤 운영에 사용 가능.

---

## 각 브랜드의 특화 기능

### 🏢 TenOne — 컨트롤타워

**특화**: 23개 브랜드 종합 관리

| 특화 기능 | 설명 | WIO 모듈 |
|----------|------|----------|
| Universe Dashboard | 전 브랜드 멤버/매출/프로젝트/콘텐츠 한눈에 | Insight(크로스 테넌트) |
| 인재 파이프라인 뷰 | MAD→HeRo→Badak→SmarComm 전환 추적 | People + Insight |
| 브랜드 건강도 | 각 브랜드 활동률, 성장률, 위험 신호 | Insight |
| 통합 결재 | 전 브랜드 결재건 한곳에서 처리 | Approval(크로스 테넌트) |
| 전사 ERP | HR, 재무, GPR | HR + Finance + GPR |

---

### 💜 WIO — 솔루션 공장

**특화**: 솔루션 개발 + 외부 고객 프로젝트

| 특화 기능 | 설명 | WIO 모듈 |
|----------|------|----------|
| 클라이언트 프로젝트 관리 | 수주→개발→납품→정산 | Project + Sales + Finance |
| 모듈 개발 트래커 | WIO 자체 모듈 개발 진행 관리 | Project |
| 외부 고객 온보딩 | 테넌트 생성→설정→교육 | 자체 Admin |
| API 사용량 모니터링 | 외부 고객 API 콜 추적 | Insight |

---

### 🟢 YouInOne — 크루 운영

**특화**: 프로젝트별 최적 크루 구성

| 특화 기능 | 설명 | WIO 모듈 |
|----------|------|----------|
| 크루 매칭 | 프로젝트 요구 역량 ↔ 크루 역량 매칭 | AI Matching + People |
| 시수 정산 | 크루별 투입 시간 → 자동 정산 | Timesheet + Finance |
| 크루 평가 | 프로젝트 종료 후 상호 평가 | GPR + People |
| 얼라이언스 관리 | 지역 거점 파트너 조직 관리 | People(그룹) |

---

### 🔴 MADLeague — 대학생 동아리 연합

**특화**: 경연 PT, 기수제, 대학 거점 네트워크

| 특화 기능 | 설명 | WIO 모듈 |
|----------|------|----------|
| 경연 PT 시스템 | 팀 구성→기획안 제출→심사→수상→아카이브 | **Competition** + Project |
| 기수 관리 | 기수별 멤버, 활동, 졸업, 동문 관리 | People(기수 태그) |
| 대학 거점 관리 | 7개 대학별 활동 현황, 거점장 | People(그룹) |
| 활동 인증서 | 참여/수료 인증서 자동 발급 | **Certificate** |
| 리거→인재 추천 | 우수 리거 → HeRo 인재 DB 연동 | People → AI Matching |
| Idea Movement | 아이디어 공모전 플랫폼 | Competition |
| MADzine 발행 | 대학생 마케팅 매거진 | Content |

---

### 🌙 Badak — 현업 네트워킹 (9,000명)

**특화**: 프로필 기반 네트워킹, 약한 연결

| 특화 기능 | 설명 | WIO 모듈 |
|----------|------|----------|
| 프로필 + 연결 요청 | LinkedIn식 연결 신청/수락 | **Networking** + People |
| 바닥 스타 | 추천 멤버 하이라이트 | People(추천 시스템) |
| DAM 이벤트 | 오프라인 네트워킹 행사 관리 | Talk(일정) + People |
| 바닥쇠 봇 | 카카오 오픈채팅 자동 수집 | AI Crawler |
| 멘토 풀 | 현업 멘토 → Evo School 강사 | People → Learn |
| 업종별 방 | 직종/업종별 커뮤니티 채널 | Talk(카테고리) |

---

### 🟠 HeRo — 인재 에이전시

**특화**: 인재 발굴→역량 진단→매칭→데뷔

| 특화 기능 | 설명 | WIO 모듈 |
|----------|------|----------|
| HIT 통합검사 | 역량 진단 테스트 (HeRo Integrated Test) | 자체 + People |
| 인재-기업 매칭 | AI 기반 자동 매칭 + 컨설턴트 수동 매칭 | **AI Matching** + Sales |
| 커리어 디자인 | 개인 커리어 로드맵 설계 | **Mentoring** + GPR |
| 기업 CRM | 인재 요청 기업 관리 | Sales |
| 포트폴리오 | 인재 포트폴리오 관리/공유 | **Portfolio** + People |
| 수료→인재 연동 | Evo School 수료 → 인재 풀 자동 등록 | Learn → People |

---

### 🟡 SmarComm — AI 마케팅 대행

**특화**: AI 6대 솔루션, 캠페인 운영, 크루 투입

| 특화 기능 | 설명 | WIO 모듈 |
|----------|------|----------|
| GEO/SEO 진단 | AI 검색 노출 점검 | 자체 Scan + AI |
| 캠페인 자동화 | 전략→소재→집행→분석 파이프라인 | Project + AI Creative |
| 크리에이티브 생성 | AI 기반 광고 소재 자동 생성 | AI Creative |
| 클라이언트 워크스페이스 | 고객사별 격리된 대시보드 | 멀티테넌트 |
| 성과 리포트 | 캠페인 성과 자동 리포트 | Insight + Content |
| 크루 투입 | YouInOne 크루 → 캠페인 투입 | People + Timesheet |

---

### 🔵 Mindle — 트렌드 인텔리전스

**특화**: 크롤링→분석→콘텐츠 생산→전략 소스

| 특화 기능 | 설명 | WIO 모듈 |
|----------|------|----------|
| 멀티소스 크롤러 | RSS/Discord/Web/카카오 자동 수집 | **AI Crawler** |
| 콘텐츠 파이프라인 | 수집→분석→초안→검수→발행 | AI Creative + Content |
| 키워드 히트맵 | 트렌드 키워드 실시간 순위 | Insight |
| 구독 뉴스레터 | 주간 트렌드 브리핑 발송 | **Newsletter** |
| 전략 소스 공급 | SmarComm/BG/Planner's에 데이터 제공 | Insight(크로스) |
| Admin 대시보드 | 크롤러 상태, 수집량, AI 분석 트리거 | 자체 Admin |

---

### 📚 Evolution School — 직무 교육

**특화**: 현업 강사, 체계적 커리큘럼, 수료→취업 연계

| 특화 기능 | 설명 | WIO 모듈 |
|----------|------|----------|
| LMS | 과정/강의/퀴즈/과제/성적 | Learn |
| 강사 관리 | Badak 멘토 → 강사 섭외/평가 | People + **Mentoring** |
| 코호트 운영 | 기수별 수강생 그룹 관리 | People(그룹) |
| 수료→인재 | 수료 → HeRo 인재 풀 자동 등록 | Learn → People |
| 수료증 발급 | 과정별 수료증 자동 발급 | **Certificate** |

---

### 📐 Planner's — 기획 도구·교육

**특화**: Vrief·GPR 도구, 기획 교육

| 특화 기능 | 설명 | WIO 모듈 |
|----------|------|----------|
| Vrief 도구 | 조사분석→가설검증→전략수립 디지털 템플릿 | Wiki(템플릿) |
| GPR 도구 | Goal→Plan→Result 디지털 도구 | GPR |
| 기획 워크숍 | 온/오프라인 기획 교육 | Learn |
| 플래너 앱/굿즈 | 시스템 플래너 판매 | Shop |
| 기획 콘텐츠 | "기획자의 기획" 블로그/매거진 | Content |

---

### 기타 브랜드 특화

| 브랜드 | 특화 기능 | WIO 모듈 |
|--------|----------|----------|
| **MADLeap** | MADLeague 서울/경기 거점 운영 | = MADLeague 구조 |
| **Brand Gravity** | 브랜딩 프로젝트 + Mindle 트렌드 연계 | Project + Sales + Insight |
| **Naming Factory** | 네이밍 프로젝트 + 네임드림(재고 네임 유통) | Project + **Shop** + Sales |
| **RooK** | AI 콘텐츠 제작 파이프라인 | AI Creative + Content + Project |
| **0gamja** | 공감 콘텐츠 + 익명 커뮤니티 + 굿즈 | Content + Talk(**Counseling**) + Shop |
| **domo** | 시니어 네트워킹 + B2B 기회 공유 | People + Talk + **Networking** |
| **FWN** | 패션위크 + 업계 네트워크 | Content + People + **Networking** |
| **ChangeUp** | 창업 프로그램 + 학부모/학교 투자 | Project + Learn + **Competition** |
| **MoNTZ** | 크리에이터 발굴 + 매니지먼트 | People + AI Creative + **Portfolio** |
| **Myverse** | 개인 세계관 기록 + 정체성 자산화 | Wiki + People + Content |
| **Townity** | 동네 커뮤니티 + 공동육아 + 마을 프로젝트 | Talk + People + **Local** + Shop |
| **Seoul360** | 서울 여행 가이드 + 지역 콘텐츠 | Content + **Local** |
| **Jakka** | 아티스트 포트폴리오 + 작품 판매 | **Portfolio** + Content + Shop |
| **NatureBox** | 자연 식품 + 정선 지역 스토리 | Shop + Content + **Local** |
| **Mullaesian** | 문래동 창작촌 + 아티스트 연결 | People + Content + **Local** |

---

## TenOne 종합 관리 체계

### Universe Dashboard에서 봐야 하는 것

```
1. 멤버 전체 현황
   - 총 멤버수, 브랜드별 분포, 월간 증감
   - 멤버 유형별 (staff/partner/crew/madleaguer/member)
   - 활성율 (30일 내 로그인/활동)

2. 인재 파이프라인
   - 0gamja(접점) → MADLeague(발굴) → Evo School(육성) → HeRo(매칭) → Badak(현업) → SmarComm(실전)
   - 각 단계 전환율, 병목 지점

3. 수익 현황
   - 브랜드별 매출 (SmarComm, HeRo, WIO, BG, NF, Evo, Planner's)
   - 프로젝트별 손익
   - MRR/ARR 추적

4. 콘텐츠 성과
   - 브랜드별 발행 수, 조회수, 구독자
   - 트렌드 키워드 (Mindle)
   - SNS 도달/전환

5. 커뮤니티 건강도
   - 브랜드별 게시글/댓글 수
   - 이벤트 참석률
   - NPS/만족도

6. 위험 신호
   - 활동률 급락 브랜드
   - 마감 임박 프로젝트
   - 미처리 결재건
   - 이탈 위험 멤버
```

### TenOne이 각 브랜드를 관리하는 방식

| 관리 영역 | 주기 | 방법 |
|----------|------|------|
| 멤버 현황 | 실시간 | Universe Dashboard |
| 브랜드 건강도 | 주간 | Insight 주간 리포트 자동 생성 |
| 수익 관리 | 월간 | Finance 크로스 테넌트 집계 |
| 인재 파이프라인 | 월간 | People 크로스 브랜드 전환 추적 |
| 전략 방향 | 분기 | GPR 전사→브랜드 캐스케이드 |
| 콘텐츠 성과 | 주간 | Content + Insight 자동 리포트 |

---

## WIO가 만들어야 할 모듈 총 정리

### 기본 모듈 (19개)

| # | 모듈 | 현재 상태 | 우선순위 |
|---|------|---------|----------|
| 1 | Home | ✅ 구현 (Mock) | 🔴 완성 필요 |
| 2 | People | ✅ 구현 (기본) | 🔴 완성 필요 |
| 3 | Talk | ✅ 구현 (기본) | 🔴 완성 필요 |
| 4 | Content | ✅ 구현 (기본) | 🔴 완성 필요 |
| 5 | Insight | ✅ 구현 (Mock) | 🔴 완성 필요 |
| 6 | Project | ✅ 구현 (DB) | 🟡 고도화 |
| 7 | Learn | ✅ 구현 (Mock) | 🟡 DB 연결 |
| 8 | GPR | ✅ 구현 (기본) | 🟡 고도화 |
| 9 | Wiki | ✅ 구현 (DB) | 🟡 고도화 |
| 10 | Sales | ✅ 구현 (Mock) | 🟡 DB 연결 |
| 11 | Finance | ✅ 구현 (기본) | 🟡 DB 연결 |
| 12 | Timesheet | ✅ 구현 (Mock) | 🟡 DB 연결 |
| 13 | Approval | ✅ 인트라에 있음 | 🟢 WIO 통합 |
| 14 | HR | ✅ 인트라에 있음 | 🟢 WIO 통합 |
| 15 | Shop | ❌ 미구현 | 🟢 새로 만들기 |
| 16 | AI Assistant | ❌ 미구현 | 🟢 Claude API |
| 17 | AI Crawler | ✅ Mindle에 있음 | 🟢 WIO 통합 |
| 18 | AI Creative | ✅ 기초 있음 | 🟢 고도화 |
| 19 | AI Matching | ❌ 미구현 | 🟢 새로 만들기 |

### 특화 모듈 (8개)

| # | 모듈 | 탄생 브랜드 | 현재 상태 |
|---|------|-----------|---------|
| 20 | Competition | MADLeague | ❌ 새로 만들기 |
| 21 | Certificate | MADLeague/Evo | ❌ 새로 만들기 |
| 22 | Networking | Badak | ❌ 새로 만들기 |
| 23 | Mentoring | HeRo/Evo | ❌ 새로 만들기 |
| 24 | Portfolio | Jakka/RooK | ❌ 새로 만들기 |
| 25 | Counseling | 0gamja | ❌ 새로 만들기 |
| 26 | Local | Townity | ❌ 새로 만들기 |
| 27 | Newsletter | Mindle/전체 | ✅ 기초 있음 |

**총 27개 모듈. 현재 15개 기초 구현, 12개 미구현.**
