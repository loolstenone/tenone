# 작업 현황

> 마지막 업데이트: 2026-04-07 (집, 세션 26)

---

## 다음 할 일

### 1. 정밀 QA 잔여 항목 처리

**완료된 항목:**
- ✅ C-02 HeRo 파트너/멘토 대기업명 제거
- ✅ C-04 Mindle 가공 통계 → 준비중/샘플 표시
- ✅ M-05 Newsletter STATIC_ISSUES 제거 + 빈 상태 안내
- ✅ M-06 /goods 404 → / 301 리다이렉트
- ✅ N-05 Mindle About 브랜드 수 12 → 26

**미완료 항목 (우선순위순):**
1. **C-01** /about → Google Sites 리디렉션 수정 — Next.js 내부 About 페이지 필요 (4~8시간 큰 작업)
2. **C-03** HeRo 가짜 매칭 수치("100+건", "92% 만족도") 찾아서 제거/라벨링 — 현재 for-business 페이지에는 없음, 다른 페이지 확인 필요
3. **M-01** HeRo 메인 네비 (이미 HeRoHeader.tsx에서 수정됨 — 배포 후 확인)
4. **M-02** HeRo 로고 링크 (이미 HeRoHeader.tsx에서 /hero 로 설정됨 — 배포 후 확인)
5. **M-03** /works 콘텐츠 추가 또는 GNB 임시 제거
6. **M-04** /newsroom 빈 페이지 — DB에 콘텐츠 없음 (뉴스 데이터 입력 필요)
7. **N-01~N-10** Minor 항목들 (우선순위 낮음)

### 2. HIT D/E/F DB 테이블 생성 (이미 완료됐을 수 있음)
- `sql/hit_d_results.sql`, `sql/create_hit_e_results.sql`, `sql/hit_f_results.sql`
- MCP execute_sql로 실행

### 3. HIT C~F 채점 로직 업데이트 완료 ✅ (세션 26)
- scoring-c/d/e/f.ts 전면 수정 완료
- 문항 파일 (c/d/e/f-questions.ts) 원본 460문항으로 전면교체 완료

### 4. Vercel 재배포
- 현재 커밋 push 완료 → Vercel 자동 배포 대기 중
- 배포 후 M-01/M-02 (네비/로고) 실제로 수정됐는지 확인

### 사용자 결정 후
- C-01 /about Next.js 전환: 어떤 콘텐츠를 담을지 결정 필요
- PG 연동: 토스페이먼츠/포트원 선택 후 진행
- 도메인: hero.ne.kr Vercel 연결

---

## 현재 DB 상태 (2026-04-07 기준)

| 테이블 | 건수 | 비고 |
|--------|------|------|
| agent_profiles | 21개 | L0×1, L1×3, L2×17 |
| mindle_trends | 52건 | 11개 카테고리 |
| hit_c_results | 스키마 존재 | |
| hit_d_results | 생성 완료 | |
| hit_e_results | 생성 완료 | |
| hit_f_results | 생성 완료 | |
| newsletter_issues | 0건 발행 | Resend 연결 완료, 발행 이력 없음 |

---

## 오늘 한 작업 (4/7 집, 세션 26)

### HIT C~F 문항 전면교체 + 채점 로직 수정 ✅
- c/d/e/f-questions.ts: AI생성 문항(60/70/60/55) → 원본(120/140/140/152) 전면교체
- scoring-c: careerCapital 모듈키, domain_expertise/achievement/relational/transferable 등
- scoring-d: LeadershipType 4종 변경, seniorReadiness 모듈 분리
- scoring-e: residual_passion, DirectionType 5종 (re_employment/mentoring 추가)
- scoring-f: latentSkills=viability, resilience=self_narrative/self_esteem/retry_willingness
- API routes (d/e/f): 라벨·AI 프롬프트 내 subscale 참조 업데이트

### 정밀 QA 리포트 기반 수정 ✅
- HeRo: 대기업명(네이버/카카오/토스/쿠팡 등) → 일반 직함/업종으로 교체
- Mindle: 가공 통계/조회수/퍼센트 → 준비중/샘플 라벨
- Newsletter: 가공된 6건 과거 목록 제거 → 빈 상태 안내
- next.config.ts: /goods 301 리다이렉트
- Mindle About: 브랜드 수 12→26
