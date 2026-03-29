# WIO — 구현 현황 보고서

> 기준일: 2026-03-30
> 설계 문서: docs/WIO_EUS_v2.md (EUS v2.0, 27챕터, 1,514줄)
> 조직도 설계: docs/WIO_OrgDesign_v1.md
> 프로젝트: C:\Projects\TenOne\app\(WIO)\

---

## 1. WIO 전체 구조

```
WIO = 제조사 브랜드 (개발·운영·판매)
├── 소개 페이지 (마케팅) — /wio/*
├── Orbi APP (실제 사용) — /wio/app/*
└── Orbi 설정 — /wio/app/settings
```

---

## 2. 소개 페이지 (마케팅 사이트)

| # | 페이지 | URL | 상태 | 내용 |
|---|--------|-----|------|------|
| 1 | 랜딩 | /wio | ✅ | 6트랙, 3대자원, Culture Engine, 가격표, CTA |
| 2 | Framework | /wio/framework | ✅ | 17파트 (권한/워크플로우/보안/UI/KPI) |
| 3 | Solutions | /wio/solutions | ✅ | ~110개 모듈 카탈로그 (검색+필터+자원뱃지) |
| 4 | Setup | /wio/setup | ✅ | 5단계 세팅 플로우 |
| 5 | Evaluation | /wio/evaluation | ✅ | 평가·보상 체계 (360도, GPR, 피드백 넛지) |
| 6 | CRM | /wio/crm | ✅ | 3층 Golden Record + Identity Resolution |
| 7 | Marketing | /wio/marketing | ✅ | 매체관리 + 캠페인 10단계 |
| 8 | Data | /wio/data | ✅ | CDO Office + AI/ML 4종 |
| 9 | Pricing | /wio/pricing | ✅ | 4단 (Starter ₩15K ~ Custom 협의) + 볼륨과금 |
| 10 | AI Matrix | /wio/ai-matrix | ✅ | 20모듈 × 6 AI유형 인터랙티브 매트릭스 |
| 11 | E2E Flows | /wio/e2e-flows | ✅ | 4개 흐름도 (수주→정산, 채용→퇴직, 캠페인→ROI, 기안→정산) |
| 12 | Presets | /wio/presets | ✅ | 업종별 4종 (에이전시/제조/IT/유통) |
| 13 | Migration | /wio/migration | ✅ | 순차 전환 6단계 + 데이터 이관 체크리스트 |
| 14 | About | /wio/about | ✅ | WIO 소개 |
| 15 | Contact | /wio/contact | ✅ | 문의 |

**소개 페이지 완성도: 100% (15/15)**

---

## 3. Orbi APP — 모듈 현황

### 3.1 카테고리별 모듈 수 + 실DB 연동

| 카테고리 | 모듈 수 | 실DB | 비율 | 비고 |
|---------|---------|------|------|------|
| Track 6 공통 | 19 | 12 | 63% | 메일/AI/전산/리포트 mock |
| Track 1 운영·관리 | 22 | 15 | 68% | 세무/보상 mock |
| Track 2 사업 | 28 | 10 | 36% | 마케팅14+CRM6 대부분 mock |
| Track 3 생산 | 9 | 5 | 56% | 생산계획/품질/설비 연동 |
| Track 4 지원 | 8 | 1 | 13% | DAM만, 나머지 mock |
| Track 5 파트너 | 4 | 1 | 25% | 파트너관리만 |
| Track 7 시스템 | 14 | 8 | 57% | 조직/역할/설정/연동/Culture/워크플로우 |
| 개인 (MY) | 5 | 4 | 80% | MY-HR만 mock |
| 지주사 (HLD) | 3 | 3 | 100% | |
| 기타 | 2 | 0 | 0% | 설문/투표 mock |
| **합계** | **125** | **56** | **45%** | |

### 3.2 전체 모듈 리스트 (125개)

#### Track 6 공통 (19)
| 코드 | 모듈명 | 경로 | 실DB |
|------|--------|------|------|
| — | 홈 | /wio/app | ✅ |
| COM-BRD | 게시판 | /wio/app/talk | ✅ |
| COM-APR | 전자결재 | /wio/app/approval | ✅ 워크플로우엔진 연동 |
| COM-MAL | 메일 | /wio/app/comm/mail | ❌ mock |
| COM-MSG | 메신저 | /wio/app/comm/messenger | ✅ conversations+messages |
| COM-CAL | 캘린더 | /wio/app/comm/calendar | ✅ events |
| COM-WCL | 업무캘린더 | /wio/app/comm/work-calendar | ❌ mock |
| COM-DOC | 문서관리 | /wio/app/comm/document | ✅ documents |
| COM-NTF | 알림센터 | /wio/app/comm/notification | ✅ notifications |
| COM-RPT | 리포트 | /wio/app/comm/report | ❌ mock |
| COM-AI | AI어시스턴트 | /wio/app/comm/ai | ❌ mock (Agent Hub 연동 예정) |
| COM-STR | 전산관리 | /wio/app/comm/it | ❌ mock |
| — | 설문조사 | /wio/app/survey | ❌ mock |
| — | 투표 | /wio/app/vote | ❌ mock |
| — | 프로젝트 | /wio/app/project | ✅ |
| — | 프로젝트 상세 | /wio/app/project/[id] | ✅ |
| — | 프로젝트 생성 | /wio/app/project/new | ✅ |
| — | 인재 | /wio/app/people | ✅ |
| — | 인재 상세 | /wio/app/people/[id] | ✅ |

#### Track 1 운영·관리 (22)
| 코드 | 모듈명 | 경로 | 실DB |
|------|--------|------|------|
| STR-PLN | 경영기획 | /wio/app/strategy/planning | ✅ wio_strategies |
| STR-KPI | 전사목표 | /wio/app/strategy/kpi | ✅ wio_kpi_targets |
| STR-ADJ | 사업조정 | /wio/app/strategy/adjustment | ✅ wio_strategies |
| HR-REC | 채용관리 | /wio/app/hr/recruit | ✅ job_postings |
| HR-ATT | 근태관리 | /wio/app/hr/attendance | ✅ attendance |
| HR-PAY | 급여관리 | /wio/app/hr/payroll | ✅ payroll |
| HR-EVL+ | 통합평가 | /wio/app/hr/evaluation | ✅ evaluations |
| HR-REW | 보상관리 | /wio/app/hr/reward | ❌ mock |
| HR-INC | 인센티브 | /wio/app/hr/incentive | ✅ wio_incentive_* |
| HR-RCG | 인정/포상 | /wio/app/hr/recognition | ✅ wio_recognitions |
| HR-WRK | 업무관리 | /wio/app/hr/work | ✅ wio_work_assignments |
| HR-ORG | 조직관리 | /wio/app/hr/org | ✅ wio_departments+personnel_orders |
| HR-FBK | 피드백 | /wio/app/hr/feedback | ✅ feedback |
| HR-EDU | 교육 | /wio/app/learn | ✅ |
| — | GPR | /wio/app/gpr | ✅ |
| FIN-GL | 총계정원장 | /wio/app/finance/gl | ✅ journals |
| FIN-AP | 매입관리 | /wio/app/finance/ap | ✅ invoices(ap) |
| FIN-AR | 매출관리 | /wio/app/finance/ar | ✅ invoices(ar) |
| FIN-BUD | 예산관리 | /wio/app/finance/budget | ✅ budgets |
| FIN-TAX | 세무관리 | /wio/app/finance/tax | ❌ mock |
| FIN-AST | 자산관리 | /wio/app/finance/asset | ✅ assets |
| — | 재무 | /wio/app/finance | ✅ |

#### Track 2 사업 (28)
| 코드 | 모듈명 | 경로 | 실DB |
|------|--------|------|------|
| MKT-STR | 마케팅전략 | /wio/app/marketing/strategy | ❌ mock |
| MKT-CMP | 캠페인 | /wio/app/marketing/campaign | ❌ mock |
| MKT-MDI | 매체관리 | /wio/app/marketing/media | ❌ mock |
| MKT-PFM | 퍼포먼스 | /wio/app/marketing/performance | ❌ mock |
| MKT-SOC | 소셜 | /wio/app/marketing/social | ❌ mock |
| MKT-INF | 인플루언서 | /wio/app/marketing/influencer | ❌ mock |
| MKT-CRT | 크리에이티브 | /wio/app/marketing/creative | ❌ mock |
| MKT-AUT | 마케팅자동화 | /wio/app/marketing/automation | ❌ mock |
| MKT-DTA | 데이터허브 | /wio/app/marketing/data-hub | ❌ mock |
| MKT-ATR | 어트리뷰션 | /wio/app/marketing/attribution | ❌ mock |
| MKT-MMM | 미디어믹스 | /wio/app/marketing/mmm | ❌ mock |
| MKT-ABT | A/B테스트 | /wio/app/marketing/abtest | ❌ mock |
| MKT-SEN | 감성분석 | /wio/app/marketing/sentiment | ❌ mock |
| MKT-OPS | 마케팅운영 | /wio/app/marketing/ops | ❌ mock |
| SAL-PIP | 영업파이프라인 | /wio/app/sales/pipeline | ✅ wio_sales_pipeline |
| SAL-QOT | 견적관리 | /wio/app/sales/quote | ✅ wio_quotes |
| SAL-ORD | 수주관리 | /wio/app/sales/order | ✅ wio_orders |
| — | 영업 | /wio/app/sales | ✅ |
| — | 경연 | /wio/app/competition | ✅ competitions |
| — | 네트워킹 | /wio/app/networking | ✅ networking_events |
| CRM-CST | 고객관리 | /wio/app/crm/customers | ❌ mock |
| CRM-SVC | 고객지원 | /wio/app/crm/support | ❌ mock |
| CRM-CX | 고객경험 | /wio/app/crm/cx | ❌ mock |
| CRM-MBR | 멤버십 | /wio/app/crm/membership | ❌ mock |
| CRM-CDP | CDP | /wio/app/crm/cdp | ❌ mock |
| CRM-PVY | 개인정보 | /wio/app/crm/privacy | ❌ mock |
| BD-PRJ | 신사업기획 | /wio/app/bd/project | ✅ wio_bd_projects |
| — | 콘텐츠 | /wio/app/content | ✅ |

#### Track 3 생산 (9)
| 코드 | 모듈명 | 경로 | 실DB |
|------|--------|------|------|
| PRD-PLN | 생산계획 | /wio/app/support/production | ✅ wio_production_plans |
| PRD-MES | 공정관리 | /wio/app/support/process | ❌ mock |
| PRD-QC | 품질관리 | /wio/app/support/qc | ✅ wio_quality_inspections |
| PRD-EQP | 설비관리 | /wio/app/support/equipment | ✅ wio_equipment |
| PRD-PRC | 구매·조달 | /wio/app/production/procurement | ✅ wio_purchase_orders+suppliers |
| PRD-INV | 재고관리 | /wio/app/production/inventory | ✅ wio_inventory |
| LOG-WMS | 창고관리 | /wio/app/support/warehouse | ❌ mock |
| LOG-TMS | 운송관리 | /wio/app/support/transport | ❌ mock |
| LOG-SCM | 공급망 | /wio/app/support/scm | ❌ mock |

#### Track 4 지원 (8)
| 코드 | 모듈명 | 경로 | 실DB |
|------|--------|------|------|
| RND-PRJ | R&D | /wio/app/support/rnd | ❌ mock |
| RND-PAT | 특허 | /wio/app/support/patent | ❌ mock |
| DEV-TSK | 개발관리 | /wio/app/support/dev | ❌ mock |
| DEV-REL | 배포관리 | /wio/app/support/deploy | ❌ mock |
| DSG-PRJ | 디자인 | /wio/app/support/design | ❌ mock |
| DSG-AST | 디자인자산 | /wio/app/support/design-asset | ❌ mock |
| DAT-PLT | 데이터플랫폼 | /wio/app/support/data-platform | ❌ mock |
| CNT-DAM | DAM | /wio/app/support/dam | ✅ |

#### Track 5 파트너 (4)
| 코드 | 모듈명 | 경로 | 실DB |
|------|--------|------|------|
| PTN-MGT | 파트너관리 | /wio/app/partner | ✅ partners |
| PTN-PRT | 포털 | /wio/app/partner/portal | ❌ mock |
| PTN-SRM | 벤더 | /wio/app/partner/vendor | ❌ mock |
| PTN-FRE | 프리랜서 | /wio/app/partner/freelancer | ❌ mock |

#### Track 7 시스템 (14)
| 코드 | 모듈명 | 경로 | 실DB |
|------|--------|------|------|
| SYS-USR | 사용자 | /wio/app/system/users | ❌ mock |
| SYS-ROL | 역할/권한 | /wio/app/system/roles | ✅ wio_role_permissions |
| SYS-ORG | 조직관리 | /wio/app/system/org-setup | ✅ wio_departments |
| SYS-MOD | 모듈관리 | /wio/app/system/module-mgmt | ❌ mock |
| SYS-WFL | 워크플로우 | /wio/app/system/workflow | ✅ wio_workflow_definitions+instances |
| SYS-STR | 전산 | /wio/app/comm/it | ❌ mock |
| SYS-MON | 모니터링 | /wio/app/system/monitor | ❌ mock |
| SYS-SEC | 보안 | /wio/app/system/security | ❌ mock |
| SYS-LOG | 감사로그 | /wio/app/system/audit-log | ✅ audit_logs |
| SYS-CFG | 시스템설정 | /wio/app/system/config | ✅ wio_system_config |
| SYS-INT | 외부연동 | /wio/app/system/integration | ✅ wio_integrations |
| SYS-CUL | Culture Engine | /wio/app/system/culture | ✅ wio_culture_values+metrics |
| SYS-TPL | 양식관리 | /wio/app/system/template | ❌ mock |
| DAT-GOV | 데이터거버넌스 | /wio/app/data/governance | ❌ mock |

#### 개인 MY (5)
| 코드 | 모듈명 | 경로 | 실DB |
|------|--------|------|------|
| MY-HOME | 내 대시보드 | /wio/app/my | ✅ todos+events+approvals+notifications |
| MY-HR | 내 인사 | /wio/app/my/hr | ❌ mock |
| MY-EVL | 내 평가 | /wio/app/my/evaluation | ✅ wio_gpr |
| MY-WRK | 내 업무 | /wio/app/my/work | ✅ wio_jobs+projects |
| MY-APR | 내 기안 | /wio/app/my/approval | ✅ wio_approvals (읽기+쓰기) |

#### 지주사 HLD (3)
| 코드 | 모듈명 | 경로 | 실DB |
|------|--------|------|------|
| HLD-MKI | 마케팅인텔리전스 | /wio/app/holding/market-intel | ✅ wio_market_intel |
| HLD-MDB | 경영대시보드 | /wio/app/holding/dashboard | ✅ wio_holding_brands+bi_snapshots |
| HLD-MBH | 브랜드허브 | /wio/app/holding/brand-hub | ✅ wio_holding_brands |

#### 기타 (2)
| 모듈명 | 경로 | 실DB |
|--------|------|------|
| 설문조사 | /wio/app/survey | ❌ mock |
| 투표 | /wio/app/vote | ❌ mock |

---

## 4. 핵심 엔진

| 엔진 | 파일 | 기능 | 연동 상태 |
|------|------|------|----------|
| **RBAC** | lib/rbac.ts | 6단계 권한 (super_admin→guest), 모듈접근/데이터범위/기능권한 | ✅ 사이드바 미들웨어 적용 |
| **워크플로우** | lib/workflow-engine.ts | startWorkflow, advanceStep, checkSLA, getActiveInstances | ✅ 결재(COM-APR) + 시스템(SYS-WFL) 연동 |
| **Culture** | lib/culture-engine.ts | evaluateCultureFit, getCultureHealth, CRUD | ✅ 시스템(SYS-CUL) 연동 |

---

## 5. 설정 페이지 (/wio/app/settings)

| 탭 | 내용 | 상태 |
|---|------|------|
| **세팅 — 조직 모드** | OrgTreeBuilder: 조직 트리 CRUD + 인력 배치 + 정원 관리 | ✅ Supabase 실연동 |
| **세팅 — 모듈 모드** | 레고 블록 팔레트, 조직에 모듈 끼워넣기 | ✅ Mock (localStorage) |
| **세팅 — 워크플로우 모드** | 노드 플로우 빌더, 7 결재 템플릿 | ✅ Mock |
| **권한** | 5 역할 템플릿, 모듈 접근 매트릭스, 시뮬레이터 | ✅ Mock |
| **테마** | 5 프리셋 + 커스텀 컬러 | ✅ localStorage |
| **시스템** | 조직정보 + 멤버 관리 | ✅ |

---

## 6. DB 테이블 (WIO 관련)

### 6.1 코어 (기존)
wio_tenants, wio_members, wio_projects, wio_jobs, wio_timesheets, wio_project_members, wio_posts, wio_comments, wio_likes, wio_bookmarks, wio_todos, wio_notifications, wio_approvals, wio_expenses, wio_settlements, wio_events, wio_chat_threads, wio_chat_messages, wio_points, wio_opportunities, wio_leads, wio_gpr, wio_courses, wio_enrollments, wio_contents, wio_documents

### 6.2 HR/재무 (batch1)
job_postings, attendance, payroll, evaluations, feedback, org_units, journals, invoices, budgets, assets, contracts, messages, conversations, events, documents, notifications, partners, audit_logs, workflows

### 6.3 확장 (remaining)
wio_strategies, wio_kpi_targets, wio_sales_pipeline, wio_quotes, wio_orders, wio_bd_projects, wio_work_assignments, wio_incentive_policies, wio_incentive_records, wio_recognitions, wio_suppliers, wio_purchase_orders, wio_inventory, wio_inventory_movements, wio_production_plans, wio_quality_inspections, wio_equipment, wio_bi_snapshots, wio_content_hub, wio_workflow_definitions, wio_workflow_instances, wio_culture_values, wio_culture_scores, wio_culture_metrics, wio_departments, wio_positions, wio_role_permissions, wio_system_config, wio_integrations, wio_holding_brands, wio_market_intel

### 6.4 조직도 (신규)
wio_headcount, wio_personnel_orders, wio_org_change_history, wio_org_simulations, wio_handover_checklists, wio_user_assignments

**총 WIO 관련 테이블: ~80개**

---

## 7. 3모드 운영

| 모드 | 조건 | 데이터 | 사이드바 뱃지 |
|------|------|--------|------------|
| **데모** | 로그인 없이 /wio/app | Mock (더미) | DEMO |
| **SaaS** | 로그인 + 테넌트 소속 | Supabase 실데이터 | 플랜뱃지 |
| **마스터** | lools@tenone.biz + tenone 테넌트 | 전체 접근 | MASTER |

---

## 8. 외부 연동 (코드 준비)

| 서비스 | 라이브러리 | API 라우트 | 상태 |
|--------|----------|-----------|------|
| Google Calendar | lib/integrations/google-calendar.ts | /api/integrations/google/* | 코드 완성, 키 미설정 |
| Kakao | lib/integrations/kakao.ts | /api/integrations/kakao/* | 코드 완성, 키 미설정 |
| Slack | lib/integrations/slack.ts | /api/integrations/slack/* | 코드 완성, 키 미설정 |

---

## 9. EUS 문서 대비 구현율

| Part | 섹션 | 구현 상태 |
|------|------|----------|
| Part I | 시스템 기반 (개요, 3대자원, Culture) | ✅ 100% |
| Part II | 조직·인력·권한 | ✅ 90% (시뮬레이션 가안 mock) |
| Part III | 모듈 카탈로그 ~110개 | ✅ 100% UI, 45% 실DB |
| Part IV | 워크플로우·평가·보상 | ✅ 80% (워크플로우 실작동, 평가 mock) |
| Part V | CRM·마케팅·매체 | ✅ 100% UI, 0% 실DB (전용 테이블 없음) |
| Part VI | 데이터·분석·AI | ✅ 80% (BI+분석 UI, AI엔진 mock) |
| Part VII | 기술·보안·UI·로드맵 | ✅ 60% (아키텍처 반영, 보안 mock) |
| Part VIII | 고도화 설계 (AI매트릭스, E2E, 과금, 프리셋, 마이그레이션) | ✅ 100% UI |

---

## 10. 남은 작업

| 우선순위 | 작업 | 영향 |
|---------|------|------|
| 🟡 | 나머지 69개 모듈 실DB 연동 | 실사용 |
| 🟡 | 마케팅 14개 모듈 전용 테이블 + 연동 | SmarComm 연계 |
| 🟡 | CRM 6개 모듈 전용 테이블 + 연동 | 고객 관리 |
| 🟢 | 외부 API 키 설정 | 기업 고객 도입 시 |
| 🟢 | 설정 모듈/워크플로우 모드 실DB 전환 | 설정 완성 |
| 🟢 | 시뮬레이션 모드 (가안) 실작동 | 조직 개편 |
| 🟢 | 모바일 최적화 | 결재/메신저 우선 |

---

*WIO — Enterprise Unified System*
*Powered by Ten:One™ Universe + Claude Code*
