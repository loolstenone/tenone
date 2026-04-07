# 작업 현황

> 마지막 업데이트: 2026-04-07 (집, 세션 27)

---

## 다음 할 일

### 1. 정밀 QA 잔여 항목 처리

**완료된 항목:**
- ✅ C-01 /about → Next.js 내부 About 페이지 이미 존재 (배포 확인 필요)
- ✅ C-02 HeRo 파트너/멘토 대기업명 제거
- ✅ C-03 가짜 수치 제거 — hero/about (500+/200+ 등 → 준비중), brandgravity (50+/92% → 준비중, 케이스 수치 → 진행중)
- ✅ C-04 Mindle 가공 통계 → 준비중/샘플 표시
- ✅ M-01 HeRo 메인 네비 (HeRoHeader.tsx에서 수정됨)
- ✅ M-02 HeRo 로고 링크 /hero로 설정됨
- ✅ M-03 /works GNB 임시 비노출 (PublicHeader.tsx 주석 처리)
- ✅ M-05 Newsletter STATIC_ISSUES 제거 + 빈 상태 안내
- ✅ M-06 /goods 404 → / 301 리다이렉트
- ✅ N-05 Mindle About 브랜드 수 12 → 26

**미완료 항목 (우선순위순):**
1. **M-04** /newsroom 빈 페이지 — DB에 뉴스 콘텐츠 없음 (데이터 직접 입력 필요)
2. **N-01~N-10** Minor 항목들 (우선순위 낮음)

### 2. hit_c_results DB 테이블 생성 ✅ (세션 27)
- `hit_d/e/f_results`: 이미 존재 확인됨
- `hit_c_results`: 세션 27에서 apply_migration으로 생성 완료
  - 컬럼: capital_scores(JSONB), motivation_push/pull(INT), motivation_type, transferability_index, target_job, gap_areas(JSONB), transition_readiness, ai_report, journey_stage

### 3. Vercel 재배포 대기
- 세션 26~27 커밋 push 완료 → Vercel 자동 배포 중
- 배포 후 확인 항목:
  - /about 페이지 (Google Sites가 아닌 Next.js 페이지로 보이는지)
  - /hero 네비/로고 (M-01/M-02)
  - /works GNB에서 사라졌는지 (M-03)

### 사용자 결정 후
- M-04 /newsroom: 뉴스 데이터 어떻게 입력할지 결정 (Intra BUMS에서 직접 작성 vs 텍스트 전달)
- PG 연동: 토스페이먼츠/포트원 선택 후 진행
- 도메인: hero.ne.kr Vercel 연결

---

## 현재 DB 상태 (2026-04-07 기준)

| 테이블 | 건수 | 비고 |
|--------|------|------|
| agent_profiles | 21개 | L0×1, L1×3, L2×17 |
| mindle_trends | 52건 | 11개 카테고리 |
| hit_c_results | 스키마 생성 완료 | 세션 27에서 생성 |
| hit_d_results | 생성 완료 | |
| hit_e_results | 생성 완료 | |
| hit_f_results | 생성 완료 | |
| newsletter_issues | 0건 발행 | Resend 연결 완료, 발행 이력 없음 |

---

## 오늘 한 작업 (4/7 집, 세션 27)

### 정밀 QA 잔여 항목 처리 ✅
- C-03: brandgravity/page.tsx — 50+/92% 가짜 수치 → "준비 중", 케이스 성과수치(5만 팔로워/30%증가) → "(진행 중)" 텍스트로 교체
- C-03: hero/about/page.tsx — 500+/200+/150+/10+ → 모두 "준비 중", 레이블 "발굴 인재" → "HIT 진단"
- M-03: features/tenone/PublicHeader.tsx — Works 링크 주석 처리 (콘텐츠 없는 빈 페이지 노출 방지)
- hit_c_results DB 테이블 생성 (apply_migration)

### 커밋 이력
- aa36609: fix(C-03) 공개 페이지 가짜 통계 수치 제거
- d543b66: fix(M-03) GNB에서 Works 링크 임시 비노출
