# 작업 현황

> 마지막 업데이트: 2026-04-14 (집, 세션 44)

---

## 이번 세션 (세션 44) 완료 항목

| 항목 | 내용 |
|------|------|
| Vercel Pro 전환 대응 | 반복 배포로 크레딧 급속 소진 원인 분석. 동일 커밋 20+회 배포 확인 |
| 프리뷰 배포 차단 | `vercel.json`에 `git.deploymentEnabled` 설정 — dev/feature-* 브랜치 배포 비활성화 |
| 작업 가이드 업데이트 | CLAUDE.md에 Vercel 비용 관리 규칙 추가 (작업 중 push 금지, 작업 종료 시 1회만) |

## 이전 세션 (세션 43) 완료 항목

| 항목 | 내용 |
|------|------|
| 인트라 메뉴 구조 감사 | 204개 페이지 전수 조사. 5모듈별 DB 구현율 산출 (MARKETING 94%, INTEL 61%, UNIVERSE 59%, ERP 50%, MY 17%) |
| nav 정비 (5건) | ① Mindle "뉴스레터" 항목 추가 ② WIO redirect 오류 수정 ③ Planner's 미구현 badge:"soon" ④ SubItem badge 렌더링 ⑤ UNIVERSE 브랜드별 알파벳 순 정렬 |
| GPR cascade DB 연동 | `erp/gpr/cascade/page.tsx` — hardcoded mock 제거 → members + gpr_goals 테이블에서 department별 동적 계층 생성 |
| Studio Brands 실구현 | `studio/brands/page.tsx` — 정적 플레이스홀더 → DB 로드(fallback: static) + 검색/필터 + 통계 + 브랜드 등록 모달. 22개 브랜드 표시 |
| Mindle 트렌드 정합성 | ① 메뉴명 "트렌드 현황"→"트렌드 카드" 통일 ② Mock fallback 완전 제거(DB 전용) ③ pipeline status hack 제거 ④ **"검토 후 발행" 워크플로우 확정** |

## 이전 세션 (세션 42) 완료 항목

| 항목 | 내용 |
|------|------|
| Mindle 뉴스레터 관리 페이지 | `ums/mindle/newsletter/page.tsx` — newsletter_subscribers + mindle_trends 실데이터 로드. 3탭(개요/구독자/트렌드이슈) |
| Mindle 트렌드 수동 등록 | `ums/mindle/pipeline/page.tsx` — '트렌드 등록' 버튼 + 모달. mindle_trends INSERT |

---

## Vercel 상태 (2026-04-14 기준)

| 항목 | 상태 |
|------|------|
| 플랜 | Pro ($20/월) |
| 포함 크레딧 | $1.90 / $20.00 사용 (9.5%) |
| On-Demand 상한 | $100 |
| 프리뷰 배포 | 차단됨 (dev/feature-* 비활성화) |

---

## 인트라 현황 진단 (세션 43 기준)

| 모듈 | 총 페이지 | 실DB | 구현율 |
|------|----------|------|--------|
| MARKETING | 17 | 16 | 94% |
| INTEL | 61 | 37 | 61% |
| UNIVERSE | 46 | 27 | 59% |
| ERP | 56 | 28 | 50% |
| MY | 24 | 4 | 17% |
| **합계** | **204** | **112** | **55%** |

---

## 다음 스텝 (우선순위순)

### 즉시 (Phase B — Mock 정리)
1. **ERP biz/* 9개 + settings/* 8개** — 형식적 Mock → "준비 중" 전환
2. **Agent 대시보드** — mock → agent_profiles 실DB 연동
3. **MY workspace mock 정리** — 핵심 기능만 DB, 나머지 "준비 중" 배너

### 이후 (P1)
4. **Phase 1-B: SmarComm Intra 연결** — `/intra/marketing` WIO MKT-* 실데이터
5. **Phase 1-C: WIO 구독 관리** — DB 연동
6. **Phase 1-D: 바닥쇠 에이전트** — `/api/agent/badaksoe`
7. **Phase C-4: UNIVERSE 브랜드 셀렉터** — 실 필터링
8. **Naver API 연결** — Brand Gravity 인지도/호감도 실측

---

## QA 이력 (미처리)

- **N-03** 뉴스레터 구독 폼 3곳 중복 — 통일 방향 결정 필요
- **SmarComm DB 연결** — 전체 Mock 상태 (5월 예정)
- **MADLeague DB 연결** — 전체 Mock (5월 예정)
