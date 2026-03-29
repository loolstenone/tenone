# Orbi 개선 사항 종합

> 기준일: 2026-03-30
> 현재 상태: 모듈 125개 UI 완성, 56개(45%) 실DB, 핵심 엔진 3개 작동
> 비교 대상: Flow (마드라스체크, 2015~현재, 48만 팀)
> 분류: 🔴긴급 = 첫 수익 경로 차단 | 🟡중요 = 사용성·경쟁력 | 🟢개선 = 완성도

---

## A. Flow에 있지만 Orbi에 없는 기능

### 🔴 긴급 — 사용자 진입과 리텐션에 직결

| # | 기능 | Flow 구현 | Orbi 현재 | 개선 방향 |
|---|------|----------|----------|----------|
| A-01 | **화상회의** | 자체 내장, 채팅창/캘린더에서 바로 연결, 무료 제공 | 없음 | Zoom/Google Meet 딥링크 연동 (자체 구축 불필요). COM-CAL + COM-MSG에서 "회의 시작" 버튼 → 외부 화상회의 URL 자동 생성. 장기적으로 WebRTC 자체 구축 검토 |
| A-02 | **읽음 확인** | 메시지별 읽음/안읽음, 읽은 사람 목록 | COM-MSG 실DB 연동은 되어 있으나 읽음 확인 여부 미확인 | messages 테이블에 read_by[] 또는 read_receipts 테이블 추가. 그룹 채팅에서 "3명 읽음" 표시 |
| A-03 | **외부 게스트 초대** | 프로젝트에 외부인 무료 초대 (게스트 요금제) | 3모드(데모/SaaS/마스터) 중 게스트 모드 없음 | L6 External 권한이 RBAC에 설계되어 있으나, 초대 플로우(이메일 초대 → 게스트 가입 → 제한 접근) UI 구현 필요. PTN-PRT(파트너 포털) mock 상태를 실DB로 전환 |
| A-04 | **무료 체험** | 30일 무료 체험 (전 기능), 게스트 무료 | 없음 | EUS §21.3에 "30일 무료 (Starter 전 기능)" 설계 있음. 가입 플로우 + 자동 만료 + 유료 전환 UI 구현 필요 |

### 🟡 중요 — 사용성 격차

| # | 기능 | Flow 구현 | Orbi 현재 | 개선 방향 |
|---|------|----------|----------|----------|
| A-05 | **SNS형 타임라인** | 프로젝트 안에서 게시글 피드 (카톡/밴드 UX). 글+업무+일정+파일이 한 공간 | COM-BRD(게시판)과 프로젝트가 분리됨 | 프로젝트 상세(/wio/app/project/[id])에 "피드" 탭 추가. 게시글+업무+일정+파일이 타임라인으로 합쳐지는 뷰. Flow의 핵심 UX — "방에 들어가면 대화가 바로 시작된다" |
| A-06 | **시크릿 메시지** | 보안 채팅 기능 (자동 삭제, 캡처 방지) | 없음 | COM-MSG에 시크릿 모드 플래그 추가. 시크릿 메시지는 서버에 저장하지 않거나, TTL(Time To Live) 설정 후 자동 삭제. 캡처 방지는 CSS user-select:none + 워터마크 |
| A-07 | **실시간 번역** | 채팅 내 자동 번역 | 없음 | COM-MSG에 번역 버튼 추가. Claude API(Haiku)로 실시간 번역. EUS §27.2 다국어 설계에 이미 포함 |
| A-08 | **AI 프로젝트 설계** | 목적 입력 → 업무 구조+태스크+일정 자동 생성. WBS/기획서 업로드 → AI 분석 | COM-AI mock 상태 | 프로젝트 생성(/wio/app/project/new)에 "AI로 시작하기" 옵션 추가. Claude API(Sonnet)로 프로젝트 목적 → 태스크+일정+담당자 구조 자동 생성. Agent Hub 연동 |
| A-09 | **OKR 주간 리포트 자동화** | 주간별 성과 모아 OKR별 주간 리포트 자동 생성 | STR-KPI 실DB 연동되어 있으나 자동 리포트 여부 미확인 | STR-KPI + HR-WRK 데이터 기반으로 주간 체크인 → AI 리포트 자동 생성. COM-RPT(리포트) mock 상태를 실DB로 전환해야 가능 |
| A-10 | **간트차트 의존성(dependency)** | 태스크 간 의존성 설정, 선후 관계 시각화 | 프로젝트에 간트차트 있으나 의존성 설정 여부 미확인 | wio_jobs 테이블에 dependency_ids[] 추가. 간트차트 UI에서 선으로 연결하는 인터랙션 |
| A-11 | **PC 설치형 앱** | Electron 기반 데스크톱 앱 | 없음 (웹 전용) | PWA(Progressive Web App)로 대체. next.config에 PWA manifest 추가. 오프라인 캐시는 결재 열람 + 승인 큐잉 우선 |
| A-12 | **멀티 AI 모델** | ChatGPT + Gemini + Claude 선택 사용 | Claude 단일 (mock 상태) | 기업 보안 관점에서 단일 모델이 통제 용이. 단, COM-AI 설정에서 모델 선택 옵션(Claude Haiku/Sonnet + 향후 확장) 제공 가능 |

### 🟢 개선 — 완성도

| # | 기능 | Flow 구현 | Orbi 현재 | 개선 방향 |
|---|------|----------|----------|----------|
| A-13 | **쇼핑몰 연동** | 쇼핑몰(카페24 등) 주문 연동 | 없음 | EUS §22.4 유통/이커머스 프리셋에 설계 있음. Phase 확장 시 |
| A-14 | **구글 워크스페이스 심화 연동** | Drive 파일 접근, Gmail→업무 전환, Calendar 동기화 | Google Calendar 코드 완성(키 미설정). Drive/Gmail 미구현 | API 키 설정 후 즉시 활성화(Calendar). Gmail/Drive는 COM-MAL, COM-DOC에서 연동 |
| A-15 | **근태 서비스** | 타임인아웃 연동 (출퇴근, 유연근무, 휴가) | HR-ATT 실DB 연동 (자체 근태관리) | Flow보다 나음 — 자체 내장. QR/NFC 출퇴근은 EUS §24.2 모바일 전용 기능에 설계됨 |

---

## B. Orbi 내부 — mock → 실DB 전환 필요

### 🔴 긴급 — 첫 수익 경로("WIO for Agency")에 필수

| # | 모듈 | 현재 | 필요 이유 | 예상 테이블 |
|---|------|------|----------|-----------|
| B-01 | **COM-AI** (AI 어시스턴트) | mock | 모든 모듈의 AI 기능 허브. "AI가 80% 채운다"의 핵심 | Agent Hub 연동 (Claude API), ai_conversations, ai_usage_logs |
| B-02 | **COM-WCL** (업무 캘린더) | mock | Task 서비스의 핵심: 팀→부문→전사 상향 집계 | wio_work_calendar_entries (기존 wio_jobs 연동) |
| B-03 | **COM-RPT** (리포트) | mock | 주간/월간 자동 리포트, AI 리포트 생성 | wio_reports, wio_report_templates |
| B-04 | **COM-MAL** (메일) | mock | 사내 커뮤니케이션 기본. Gmail API 통합 뷰 | Gmail API 연동 (자체 테이블 불필요, API 프록시) |
| B-05 | **MKT 14개** (마케팅 전체) | 전부 mock | SmarComm 연계. 에이전시 프리셋 핵심 | wio_campaigns, wio_media_channels, wio_media_metrics, wio_creatives, wio_attributions 등 |
| B-06 | **CRM 6개** (고객관리 전체) | 전부 mock | 고객 관리 기본 없으면 영업 불가 | wio_customers, wio_customer_interactions, wio_segments, wio_consents 등 |

### 🟡 중요 — 설정 영속화

| # | 모듈 | 현재 | 필요 이유 |
|---|------|------|----------|
| B-07 | **설정 — 모듈 모드** | localStorage mock | 고객이 세팅한 모듈 배정이 브라우저 닫으면 날아감 |
| B-08 | **설정 — 워크플로우 모드** | localStorage mock | 결재 경로 설정이 저장되지 않음. 워크플로우 엔진은 실작동하나 정의(definition)가 mock |
| B-09 | **설정 — 권한** | mock | 5개 역할 템플릿이 저장되지 않음. RBAC 엔진은 실작동하나 설정 UI가 mock |
| B-10 | **SYS-USR** (사용자 관리) | mock | 어드민이 사용자를 추가/비활성화/역할 변경 못 함 |
| B-11 | **MY-HR** (내 인사) | mock | 직원이 자기 소속/직급/잔여휴가/근태를 못 봄 |

### 🟢 개선 — 후순위

| # | 모듈 | 현재 | 비고 |
|---|------|------|------|
| B-12 | Track 4 지원 7개 | mock | 에이전시 프리셋에서 비활성 |
| B-13 | Track 5 파트너 3개 | mock | 파트너 포털 Phase 확장 |
| B-14 | FIN-TAX (세무) | mock | 세무 자동화는 후순위 |
| B-15 | HR-REW (보상) | mock | 평가(실DB) → 보상 연결은 다음 |
| B-16 | 설문조사/투표 | mock | 부가 기능 |
| B-17 | SYS-MOD/MON/SEC | mock | 시스템 관리 고도화 |

---

## C. UX/사용성 개선 — Flow가 10년간 다듬은 것

| # | 영역 | Flow | Orbi 현재 | 개선 방향 |
|---|------|------|----------|----------|
| C-01 | **Progressive Disclosure** | "1초 만에 무료 시작". 첫 화면 3개 메뉴 | 125개 모듈이 사이드바에 노출될 가능성 | 업종 프리셋 적용 시 해당 트랙의 모듈만 사이드바에 표시. 첫 화면은 HOME + Talk + Approval 3개만 |
| C-02 | **프로젝트 = 대화 공간** | 프로젝트 방에 들어가면 게시글+업무+채팅이 하나 | 프로젝트와 메신저 분리 | 프로젝트 상세에 "채팅" 탭 추가. COM-MSG의 프로젝트 채널을 프로젝트 상세 안에 임베드 |
| C-03 | **온보딩 경험** | 회원가입 → 즉시 사용 가능, 교육 영상 제공 | 3모드 중 데모 모드는 있으나, 신규 사용자 온보딩 가이드 미확인 | 첫 로그인 시 5단계 가이드 투어 (세팅 → Talk → Task → Approval → AI). EUS §5의 세팅 플로우를 인터랙티브 위저드로 |
| C-04 | **모바일 최적화** | 웹+PC+모바일 전 플랫폼 일관 경험 | 웹 전용 (반응형 여부 미확인) | 결재 + 메신저 + 알림 3개 모바일 우선 최적화. Myverse(React Native)에서 Orbi 웹뷰 접근 시 모바일 레이아웃 필수 |
| C-05 | **알림 번들링** | 같은 프로젝트 알림 묶음, 방해 금지, 스마트 채널 | COM-NTF 실DB 연동되어 있으나 번들링 여부 미확인 | EUS §25 알림 전략에 설계 있음. 번들링 + 방해 금지 + 읽음 추적 구현 |
| C-06 | **통합 검색** | 대화·문서·업무·파일 맥락 기반 검색 | 미확인 | EUS §27.4 통합 검색 엔진 설계에 있음. Supabase full-text search → 장기적으로 Elasticsearch. 권한 필터링 필수 |

---

## D. Orbi가 Flow보다 이미 앞서는 것 (건드리지 말 것)

이미 구현되어 있고, Flow에 없는 WIO만의 차별점. 유지·강화만 하면 됨.

| # | 기능 | Orbi 상태 | Flow |
|---|------|----------|------|
| D-01 | **전자결재 (COM-APR)** | ✅ 실DB + 워크플로우 엔진 연동 | 없음 (그룹웨어 연동만) |
| D-02 | **Culture Engine** | ✅ 실작동 (가치 정합성 평가) | 없음 |
| D-03 | **RBAC 6단계 권한** | ✅ 사이드바 미들웨어 적용 | 관리자/참여자 2단계 |
| D-04 | **워크플로우 엔진** | ✅ 실작동 (startWorkflow, advanceStep, checkSLA) | 없음 |
| D-05 | **조직 트리 빌더** | ✅ Supabase 실연동 (설정 조직 모드) | 어드민에서 부서 등록만 |
| D-06 | **재무 모듈 (FIN-*)** | ✅ GL/AP/AR/BUD/AST 실DB | 없음 |
| D-07 | **HR 통합 (채용→평가)** | ✅ 대부분 실DB | 없음 |
| D-08 | **생산 모듈 (PRD-*)** | ✅ 5/9 실DB | 없음 |
| D-09 | **영업 파이프라인** | ✅ SAL-PIP/QOT/ORD 실DB | 없음 |
| D-10 | **3모드 운영** | ✅ 데모/SaaS/마스터 | 없음 |
| D-11 | **업종별 프리셋 4종** | ✅ UI 완성 (에이전시/제조/IT/유통) | 없음 |
| D-12 | **지주사 모듈** | ✅ HLD 3개 전부 실DB | 없음 |

---

## E. 실행 우선순위 요약

### Phase 즉시 (다음 Claude Code 세션)
1. **B-01** COM-AI → Agent Hub 연동 (Claude API 실연결)
2. **B-07~B-09** 설정 모드 실DB 전환 (모듈/워크플로우/권한 — localStorage → Supabase)
3. **B-10** SYS-USR 사용자 관리 실DB

### Phase 1 (이번 달)
4. **A-02** 읽음 확인 (COM-MSG)
5. **A-05** 프로젝트 내 SNS형 타임라인 피드
6. **C-02** 프로젝트 = 대화 공간 (프로젝트 상세에 채팅 임베드)
7. **B-02** COM-WCL 업무 캘린더 실DB
8. **B-11** MY-HR 내 인사 실DB

### Phase 2 (다음 달 — WIO for Agency)
9. **B-05** 마케팅 14개 모듈 실DB (SmarComm 연계)
10. **B-06** CRM 6개 모듈 실DB
11. **A-01** 화상회의 (Zoom/Meet 딥링크)
12. **A-03** 외부 게스트 초대 플로우
13. **A-08** AI 프로젝트 설계

### Phase 3 (안정화)
14. **C-01** Progressive Disclosure (업종별 사이드바 필터링)
15. **C-03** 온보딩 가이드 투어
16. **C-04** 모바일 최적화
17. **A-04** 무료 체험 30일
18. **A-14** Google Workspace API 키 설정

---

## F. Claude Code 프롬프트 (즉시 실행용)

> WIO_BUILD_STATUS.md를 읽어. 현재 mock 상태인 모듈 중 아래 3가지를 실DB로 전환해줘.
>
> **1. 설정 모듈 모드 (/wio/app/settings)**
> - 현재 localStorage에 저장되는 모듈 배정을 Supabase wio_org_module_assignments 테이블로 전환
> - 스키마: org_id, module_id, config(jsonb), status, created_at
>
> **2. 설정 워크플로우 모드**
> - 현재 localStorage의 워크플로우 정의를 wio_workflow_definitions 테이블(이미 존재)과 연결
> - 워크플로우 엔진(lib/workflow-engine.ts)은 실작동 중이니, UI 저장만 연결하면 됨
>
> **3. SYS-USR 사용자 관리 (/wio/app/system/users)**
> - wio_members 테이블 기반 CRUD
> - 사용자 추가(이메일 초대), 비활성화, 역할 변경
> - RBAC(lib/rbac.ts)과 연동
>
> 각 모듈에서 mock 데이터를 찾아 Supabase 호출로 교체. RLS 정책도 함께 추가.

---

*WIO Orbi — 125개 모듈, 56개 실DB, 69개 전환 대기*
*Powered by Ten:One™ Universe + Claude Code*
