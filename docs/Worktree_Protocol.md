# 워크트리 프로토콜 — 텐원 멀티 사이트 + 단일 DB

> **목적**: 26+ 브랜드를 단일 Next.js·단일 Supabase·1인 개발자가 집·사무실 양쪽에서 멀티 워크트리로 동시에 굴리되, 작업이 끊기지 않고·충돌이 없고·데이터 손실이 없도록 한다.
>
> SSOT: 이 문서. CLAUDE.md § 3.4·§ 4.1·§ 4.2가 이 문서를 참조한다.
>
> 작성: 2026-05-16

---

## 1. 핵심 통찰 — 무엇이 동기화되고 무엇이 안 되는가

| 객체 | 동기화 | 비고 |
|---|---|---|
| **브랜치** (origin push 시) | ✅ 글로벌 | 진짜 동기화 단위 |
| **commit** (origin push 시) | ✅ 글로벌 | git이 옮겨줌 |
| **워크트리 폴더** | ❌ 로컬 | `.claude/worktrees/*`는 git 추적 안 됨 |
| **미커밋 변경** | ❌ 로컬 | 퇴근 전 commit 안 하면 잃음 |
| **Claude Code 세션 (Recents)** | ❌ 로컬 | IDE 상태 |
| **대화 히스토리** | ❌ 로컬 | 컨텍스트는 PC별 |
| **WORK_STATUS·CHANGELOG (git 추적)** | ✅ 글로벌 | 문서로 동기화 |

→ **작업 재개의 단위는 "워크트리 폴더"가 아니라 "브랜치 + WORK_STATUS 메모"**.

---

## 2. 4 규칙 — 끊김 없는 집/사무실 동기화

### 규칙 1. 브랜치 이름은 의미 있게

워크트리 만들 때 브랜치를 명시적으로 작명:

```bash
git worktree add .claude/worktrees/smarcomm-honesty -b brand/smarcomm-honesty-7
```

**명명 규칙** (§ 3 6 유형 참조):

| 패턴 | 예시 |
|---|---|
| `brand/{siteId}-{task}` | `brand/badak-my-redirect-fix` |
| `shared/{component}` | `shared/utility-bar-notif` |
| `infra/{topic}` | `infra/auth-callback` |
| `schema/{date}-{topic}` | `schema/2026-05-16-uc-rules` |
| `hotfix/{issue}` | `hotfix/badak-login-500` |
| `exp/{name}` | `exp/openclaw-poc` |

Claude Code 자동 생성 브랜치명(`claude/eager-kapitsa-e1ef5a`)은 의미 없음 — **수동 명시 권장**.

### 규칙 2. 퇴근 전 반드시 origin push (미커밋 0)

```bash
# 모든 활성 워크트리에서
git status --short                    # 비어야 함
git push origin HEAD:<branch-name>    # 자기 브랜치 push
```

미완성이어도 `WIP: <어디까지>` commit으로 push. 집에서 받아 이어 작업, 나중에 squash.

**금지**: 워크트리 안에 미커밋 변경 둔 채 퇴근 → 집에서 그 변경 안 보임.

### 규칙 3. WORK_STATUS.md = 동기화의 SSOT

WORK_STATUS.md 최상단에 **"현재 활성 워크트리"** 표 의무:

```markdown
## 현재 활성 워크트리 (2026-05-16 18:00 사무실 종료 시점)

| 브랜치 | 작업 | 진행률 | 다음 첫 액션 (구체적으로) |
|---|---|---|---|
| brand/smarcomm-honesty-7 | 홈 mock 매출 제거 | 70% | `app/(SmarComm)/smarcomm/dashboard/page.tsx` 211줄 — wio_campaigns 실 집계로 교체 |
| brand/badak-redirect | 마이페이지 로그인 후 복귀 | 30% | `features/badak/MyPage.tsx` 45줄 — loginHref import 추가 |
| shared/utility-bar | 알림 드롭다운 | 90% | `/api/notifications` PATCH 액션만 남음 |
```

→ 집/사무실 전환 시 이 표만 보면 어디까지·다음 뭘 할지 즉시 파악.

**원칙**: "다음 첫 액션"은 **파일·라인·구체 행동** 단위로. "그 작업 이어서"·"개선"·"마무리" 같은 막연한 표현 금지.

### 규칙 4. 회사에서 작업 시작 — 4 명령

```bash
# 1. master 동기화
git checkout master && git pull

# 2. 어제 작업 브랜치 fetch
git fetch origin

# 3. 워크트리 재생성 (폴더명은 새로, 브랜치는 같은 것)
git worktree add .claude/worktrees/<your-folder> brand/smarcomm-honesty-7

# 4. 그 워크트리에서 Claude 시작
cd .claude/worktrees/<your-folder>
claude
```

→ WORK_STATUS의 "다음 첫 액션"부터 즉시 시작. 끊김 0.

---

## 3. 6 워크트리 유형

| 유형 | 명명 | 용도 | 동시 가능 | 머지 정책 |
|---|---|---|---|---|
| 🟢 **brand/** | `brand/{siteId}-{task}` | 단일 브랜드 작업 | 3~4개 | 자유롭게 master push |
| 🟡 **shared/** | `shared/{component}` | 공용 컴포넌트 | **1개** | 회귀 테스트 후 push |
| 🔴 **infra/** | `infra/{topic}` | 인증·도메인 SSOT | **1개** | 다른 worktree 머지 후 push |
| 🔴 **schema/** | `schema/{date}-{topic}` | DB 스키마 변경 | **1개** | **같은 날** master 머지 의무 |
| 🟢 **hotfix/** | `hotfix/{issue}` | 긴급 prod 버그 | **1개 선순위** | 즉시 push |
| 🔬 **exp/** | `exp/{name}` | 실험·POC | 무제한 | master 머지 안 함 |

**1인 개발자 동시 활성 권장 상한: 4개** (오케스트레이터 1 + 워커 3).

---

## 4. 작업 분류 결정 트리

```
새 작업 시작 →
  Q1. DB 스키마 건드리나? ──── YES → 🔴 schema/* (같은 날 머지)
       │NO
  Q2. 공용 컴포넌트·인프라? ── YES → 🟡 shared/* 또는 🔴 infra/* (단독)
       │NO
  Q3. 긴급 prod 버그? ──────── YES → 🟢 hotfix/* (선순위)
       │NO
  Q4. 단일 브랜드? ─────────── YES → 🟢 brand/{siteId}-* (병렬 가능)
       │NO
  Q5. 실험·검증용? ─────────── YES → 🔬 exp/* (머지 X)
       │NO
  → master 직접 (자잘한 doc 수정 등)
```

---

## 5. 오케스트레이터 + 워커 모델

```
오케스트레이터 세션 (master, Recents 상단 고정)
  ├── 역할: WORK_STATUS·CHANGELOG·문서, git pull/push 직렬화
  └── ★ 코드 직접 안 건드림. 큰 변경은 워커에 위임

워커 세션 1 (brand/badak-*)
워커 세션 2 (brand/smarcomm-*)
워커 세션 3 (shared/* 또는 infra/*)
```

**책임 분담**:
- 오케스트레이터: § 3 동기화 의무 (CLAUDE.md 갱신, WORK_STATUS, 집/사무실 인계)
- 워커: 자기 브랜드 코드만, commit + push도 자기 책임

---

## 6. DB 스키마 변경 특별 프로토콜

DB는 공유 자원 — 가장 위험.

```
1. 다른 워크트리 활성 중이면 → 알림 ("스키마 변경 예정")
2. schema/{date}-{topic} 워크트리 생성
3. sql/*.sql 파일 작성
4. mcp__execute_sql 또는 scripts/run-sql.js로 prod DB 실행
5. ⚠️ 이 시점부터 다른 모든 worktree는 새 스키마 가정 코드만 작성 가능
6. 같은 날 master 머지 + push
7. 다른 worktree들에서 git fetch + rebase 또는 작업 commit·rebase
```

**금지**: 스키마 변경을 며칠 묵혀두기 → 다른 워크트리가 어떤 스키마 기준일지 혼란.

---

## 7. 충돌 다발 영역 — 동시 편집 금지

다음 파일은 **한 번에 1 워크트리만**:

```
CLAUDE.md
WORK_STATUS.md
CHANGELOG.md
ROADMAP.md
lib/site-config.ts
lib/domain-registry.ts
package.json · tsconfig.json
features/smarcomm/DashboardSidebar.tsx  (SmarComm 팩 SSOT)
lib/action-hub-registry.ts
components/UniverseUtilityBar.tsx
components/UniverseFooter.tsx
components/UniverseMobileMenu.tsx
sql/*.sql (새 파일 추가는 OK, 같은 파일 동시 편집은 X)
```

→ 이 파일 만지는 작업은 다른 워크트리와 **시간 겹치지 않게**.

---

## 8. 정리 디스크 절약 — 매주 월요일

```bash
# 오케스트레이터 세션에서 매주 월요일 1회
git worktree prune                    # 끊긴 worktree 정리

# 1주일 이상 묵은 활성 worktree 점검
git worktree list

# backup 브랜치 점검
git ls-remote --heads origin 'backup/*'
```

**규칙**:
- 작업 완료 후 **같은 날 worktree remove**
- 1주일 묵으면 → backup branch로 옮기고 worktree 제거
- backup branch가 3개월 묵으면 → 통합하거나 영구 삭제 (CHANGELOG에 기록)

---

## 9. 미완성 작업 보존 — Backup 브랜치 패턴

작업 중 충돌이나 일시 중단 시:

```bash
# 미커밋 commit
git add -A && git commit -m "WIP: <어디까지>"

# backup 브랜치로 origin 보존 (Vercel 빌드 X)
git push origin HEAD:backup/{siteId}-{topic}

# 워크트리 정리
git worktree remove .claude/worktrees/<folder>
```

→ origin에 안전 보존. 나중에 `git cherry-pick` 또는 `git merge`로 부분 적용.

---

## 10. 종합 체크리스트

### 작업 시작 (집 또는 사무실)
- [ ] `git checkout master && git pull` (오케스트레이터에서)
- [ ] WORK_STATUS.md의 "현재 활성 워크트리" 표 읽기
- [ ] § 4 결정 트리로 워크트리 유형 결정
- [ ] `git worktree add ... -b <명명규칙>` 워크트리 생성
- [ ] cd 후 `claude` 새 세션 시작
- [ ] WORK_STATUS의 "다음 첫 액션"부터 작업

### 작업 종료 (퇴근·세션 전환 전)
- [ ] 각 워크트리: `git status --short` (미커밋 0 확인)
- [ ] 미완성이면 `WIP: <어디까지>` commit
- [ ] 각 워크트리: `git push origin HEAD:<branch>` (자기 브랜치)
- [ ] 오케스트레이터: WORK_STATUS·CHANGELOG·해당 브랜드 CLAUDE.md 갱신
- [ ] 오케스트레이터: master push (Vercel 빌드 1회)
- [ ] 끝난 워크트리 → `git worktree remove`
- [ ] 미완성·일시 중단 → backup 브랜치로 push 후 워크트리 제거 (옵션)
