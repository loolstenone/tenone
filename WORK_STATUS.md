# 작업 현황

> 마지막 업데이트: 2026-03-31 (사무실, 2차)

## 오늘 한 작업 (3/31)

### MyVerse + ERP DB 연동 완료
- myverse/gpr → gpr_goals 테이블 실DB 연동 ✅
- myverse/projects → fetchMyProjects DB 연동 ✅
- myverse/payroll, attendance, expenses → 이전 세션 완료 ✅
- myverse/approval → approvals 테이블 연동 ✅
- project/financials → projects 테이블 연동 ✅
- erp/settings/approval-line → approval_templates 테이블 연동 ✅
- sql/approval_templates.sql Prod 실행 완료 ✅

### 버그 수정
- GET /api/board/posts 500 에러 → is_secret, author_name 없는 컬럼 제거 ✅
- tags contains JSON.stringify 버그 수정 ✅
- api/newsroom/feed 브라우저 client → 서버 client 수정 ✅

### Director Priority 작업
- **Priority 1 (Phase 2)**: identity-context.tsx + useIdentityAdapter + IntraSidebar 3계층 연동 ✅
- **Priority 2**: features/[brand] 폴더 분리 — 46개 컴포넌트 이동, import 경로 전체 업데이트 ✅
- **Priority 3**: next.config.ts 캐시 헤더 설정 (마케팅 1h, 인트라 no-store, API no-store) ✅

### settings localStorage → Supabase DB 마이그레이션 (완료)
- lib/supabase/settings.ts: member_id/settings JSONB 스키마 전면 재작성 ✅
- lib/wio-modules.ts: loadOrbiConfigDB / saveOrbiConfigDB / loadAccordionStateDB / saveAccordionStateDB ✅
- wio/app/layout.tsx + settings/page.tsx: DB-first 전환 ✅
- lib/library-context.tsx: bookmarks/user_items DB 연동 ✅
- lib/smarcomm/chart-palette.ts + scan-data.ts: DB 헬퍼 추가 ✅
- smarcomm/dashboard/scan, glossary, profile 페이지: DB 연동 ✅

---

## 다음 할 일

### 즉시
1. **Prod DB**: `sql/approval_templates.sql` 실행 완료 ✅
2. Multiple GoTrueClient — 모니터링 계속 (11976ed 커밋 이후 안정)

### 단기 — TenOne
3. ~~설정 서비스/모듈 → Supabase 저장 (localStorage → DB)~~ ✅ 완료
4. Rule Engine + Event Bus 구현 (Universe OS Phase 2)
5. SmarComm 독립 배포

### 단기 — Myverse 앱 착수 준비
6. 맥북 구매 확정 후 → Expo 프로젝트 초기화
7. Myverse 전용 Supabase 프로젝트 생성
8. Myverse_Dev_Guide_v3_final.md를 프로젝트 CLAUDE.md로 정제

---

## 참고
- WIO Glossary: docs/WIO_Glossary_v1.md
- Director 가이드라인: docs/DIRECTOR_COMMENTS.md
- MyVerse 기획서: docs/Myverse_Dev_Guide_v3_final.md (G드라이브)
- 개발 현황: docs/PROJECT_STATUS.md
