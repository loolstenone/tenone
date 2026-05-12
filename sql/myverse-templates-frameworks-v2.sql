-- 신규 프레임워크 4종 시드 (세션 130) — RACI / Pre-mortem / OKR Roll-up / SAFe PI Planning
-- 변수 치환 패턴({{today}}/{{user}})을 자연스럽게 포함

INSERT INTO myverse_templates (key, category, subcategory, label, description, body_md, role_tags) VALUES

-- ─── RACI Matrix ───
('raci', 'framework', 'collaboration', 'RACI 매트릭스',
 '역할 분담 명확화 — 책임자(Responsible)/의사결정자(Accountable)/자문(Consulted)/통보대상(Informed)',
'# RACI 매트릭스 — {{today}}

> R(Responsible) = 실제 수행자 / A(Accountable) = 최종 책임자 / C(Consulted) = 자문 / I(Informed) = 통보 대상

| 업무 / 산출물 | 담당자 1 | 담당자 2 | 담당자 3 | 담당자 4 |
|---|---|---|---|---|
| (예) 디자인 시안 작성 | R | A | C | I |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## 검증 체크
- [ ] 모든 업무 행에 정확히 1명의 A가 있는가?
- [ ] R이 비어있는 업무는 없는가?
- [ ] C/I가 너무 많아 의사결정이 지연되지 않는가?
- [ ] R = A 인 경우(자기 자신 책임)는 합리적인가?

## 충돌·합의
- C의 의견이 R/A와 충돌하면 → 어떻게 결정하나?
- 모호한 항목:
',
 ARRAY['leader','employee','entrepreneur','planner']),

-- ─── Pre-mortem ───
('pre_mortem', 'framework', 'risk', '프리모템 (Pre-mortem)',
 '프로젝트 시작 전, 실패 후 시점에서 거꾸로 원인을 상상',
'# 프리모템 — {{today}}

## 시나리오
이 프로젝트가 6개월 뒤 **완전히 실패**했다고 가정.
그 실패의 모습을 구체적으로 묘사하라.

> "우리는 ___ 때문에 ___ 까지 ___ 을 못 했고, 그 결과 ___ 이 되었다."

## 실패 원인 — 머릿속에 떠오르는 대로 모두 적기
1.
2.
3.
4.
5.
(20개를 목표로)

## 분류 — 각 원인을 4분면에 배치
### 외부 통제 불가 (Black Swan)
-

### 외부 통제 가능 (소통·관계)
-

### 내부 통제 불가 (기술·자원 한계)
-

### 내부 통제 가능 (실행·문화)
-

## 대응책 — 통제 가능한 위험에 우선
| 위험 | 발생 확률 | 영향 | 대응 (예방·완화·이전·수용) | 담당 |
|---|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |

## 트리거 — 이 신호가 보이면 즉시 멈추고 재평가
-
-
',
 ARRAY['leader','entrepreneur','planner']),

-- ─── OKR Roll-up ───
('okr_rollup', 'framework', 'alignment', 'OKR Roll-up',
 '조직 → 팀 → 개인 OKR 정렬. 상위 KR이 하위 O의 출발점',
'# OKR Roll-up — {{quarter}} / {{year}}

## 조직 OKR (회사 전체)
**Objective**:
- KR 1:
- KR 2:
- KR 3:

---

## 팀 OKR — 상위 KR 어디에 정렬되는가
**Objective**: (위 KR 중 어느 것에서 출발?)
**정렬 대상 (상위 KR)**: KR ___

- 팀 KR 1:
- 팀 KR 2:
- 팀 KR 3:

### 의존성 — 다른 팀과 합의 필요한 사항
-

---

## 개인 OKR — {{user|나}}의 {{quarter}}
**Objective**: (위 팀 KR 중 어느 것에 기여?)
**정렬 대상 (팀 KR)**: KR ___

- 개인 KR 1:
- 개인 KR 2:
- 개인 KR 3:

### 시간 배분
- 위 OKR에 ___ %
- 운영·BAU에 ___ %
- 학습·R&D에 ___ %

---

## 회고 ({{quarter}} 종료 시 채움)
- 달성:
- 미달:
- 다음 분기 조정:
',
 ARRAY['leader','employee','entrepreneur']),

-- ─── SAFe PI Planning ───
('safe_pi', 'framework', 'planning', 'SAFe PI Planning',
 'Scaled Agile — 8~12주 PI(Program Increment)의 팀 일정·의존성·위험 정렬',
'# SAFe PI Planning — PI {{quarter}}

## Business Context
- 비전 / 시장 변화:
- 상위 우선순위 (탑 3):
  1.
  2.
  3.

## PI Objectives (팀별 목표)
| 팀 | Objective (Stretch=★) | Business Value (1-10) | 마감 Sprint |
|---|---|---|---|
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

## ART Risks (조직 차원 위험)
| 위험 | 영향 | ROAM (Resolved/Owned/Accepted/Mitigated) | 담당 |
|---|---|---|---|
|  |  |  |  |

## 의존성 보드 (Cross-team Dependency)
| 요청 팀 | 공급 팀 | 무엇이 필요 | 언제까지 | 합의 |
|---|---|---|---|---|
|  |  |  |  |  |

## Confidence Vote
- 팀1: ___ / 5
- 팀2: ___ / 5
- 팀3: ___ / 5
- 평균: ___

## Iteration Plan (요약)
- Iteration 1 (Sprint 1):
- Iteration 2 (Sprint 2):
- Iteration 3 (Sprint 3):
- IP Iteration (혁신·여유):

## Stretch Objectives
- (Business value 있지만 commit하지 않음. 가능하면 추가 수행)
',
 ARRAY['leader','employee','planner'])

ON CONFLICT (key) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    body_md = EXCLUDED.body_md,
    role_tags = EXCLUDED.role_tags;
