# 작업 현황

> 마지막 업데이트: 2026-04-14 (집, 세션 41)

---

## 이번 세션 (세션 41) 완료 항목

| 항목 | 내용 |
|------|------|
| Vercel Pro 전환 대응 | 반복 배포로 크레딧 급속 소진 원인 분석. 동일 커밋 20+회 배포 확인 |
| 프리뷰 배포 차단 | `vercel.json`에 `git.deploymentEnabled` 설정 — dev/feature-* 브랜치 배포 비활성화 |
| 작업 가이드 업데이트 | CLAUDE.md에 Vercel 비용 관리 규칙 추가 (작업 중 push 금지, 작업 종료 시 1회만) |
| 절대 하지 말 것 추가 | "작업 중간에 push하기" 항목 추가 |

---

## Vercel 상태 (2026-04-14 기준)

| 항목 | 상태 |
|------|------|
| 플랜 | Pro ($20/월) |
| 포함 크레딧 | $1.90 / $20.00 사용 (9.5%) |
| On-Demand 상한 | $100 |
| 프리뷰 배포 | 차단됨 (dev/feature-* 비활성화) |

---

## 현재 미커밋 변경 (이전 세션에서 이어옴)

대규모 변경이 스테이징 안 된 상태로 남아있음:
- Badak: explore/join/my/page, groups/onboard/story 신규, cloud 기능, API
- Wiki: 퍼블릭 위키 시스템 신규 (`app/(wiki)/`, `app/api/wiki/`, `lib/wiki/`)
- Intra wiki: 기존 서브페이지 5개 삭제 → 통합 페이지로 변경
- Mindle: my 페이지 수정
- 인프라: middleware, auth-context, site-config, domain-registry 수정
- 패키지: package.json 의존성 추가

---

## 다음 할 것

1. **미커밋 변경 전체 커밋 + push** — 위의 Badak/Wiki/인프라 변경을 정리해서 커밋
2. **Naver API 연결** — `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` 환경변수 설정
3. **멀티모델 프로빙** — OpenAI/Gemini/Perplexity API 키 확보 후 probe/run 확장
4. **공유 링크** — `/brandgravity/report/[token]` 클라이언트 열람 URL

---

## QA 이력 (미처리)

- **N-03** 뉴스레터 구독 폼 3곳 중복 — 통일 방향 결정 필요
- **SmarComm DB 연결** — 전체 Mock 상태 (5월 예정)
- **MADLeague DB 연결** — 전체 Mock (5월 예정)
