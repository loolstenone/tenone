# Ten:One™ Universe UX Guide

**버전**: v1.0 (2026-04-17)  
**상위 문서**: Charter v4 (철학) → CLAUDE.md 8원칙 (구조) → **이 문서 (경험)**  
**적용 범위**: 전 브랜드 사이트 + Intra UI  
**사용법**: UI 작업 시 해당 섹션 참조. 매 세션 자동 로드 아님.

**상태 라벨**
- 🟢 Standard — 전 사이트 적용 확정
- 🟡 Proposed — 검토 중, 새 작업에 적용 후 피드백
- ⚪ Case-by-case — 상황에 따라 판단

---

## 1. 텍스트·콘텐츠 표시

### 1.1 긴 텍스트 — line-clamp + 더 보기 🟢

**원칙**: 3줄 이상은 접힌 상태가 기본. 사용자가 원할 때 펼친다.

```tsx
// ✅ DO — 줄 수 추정 후 더 보기 버튼
const COLLAPSE_LINES = 3;
const estimatedLines = text.split('\n').reduce(
  (acc, line) => acc + Math.max(1, Math.ceil(line.length / 40)), 0
);
const needsCollapse = estimatedLines > COLLAPSE_LINES;

<p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden"
   style={{ maxHeight: needsCollapse && !expanded ? '66px' : 'none' }}>
  {text}
</p>
{needsCollapse && (
  <button onClick={() => setExpanded(v => !v)}
    className="mt-1 text-[11px] tn-text-sub hover:tn-text flex items-center gap-0.5 cursor-pointer">
    {expanded ? <><ChevronUp className="h-3 w-3" /> 접기</>
               : <><ChevronDown className="h-3 w-3" /> 더 보기</>}
  </button>
)}

// ❌ DON'T — 무한히 펼치는 콘텐츠, 또는 line-clamp CSS만 사용 (접기 불가)
```

### 1.2 날짜·시간 표현 🟢

**원칙**: 가까울수록 상대시간, 멀수록 절대날짜. 컨텍스트에 따라 분기.

```ts
function formatDate(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const min = Math.floor(diff / 60000);
  const hour = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);

  if (min < 1)   return '방금 전';
  if (min < 60)  return `${min}분 전`;
  if (hour < 24) return `${hour}시간 전`;
  if (day < 7)   return `${day}일 전`;
  return new Date(isoString).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}
// 1년 이상: year 포함 → { year: 'numeric', month: 'short', day: 'numeric' }
```

### 1.3 숫자 포맷 🟡

**원칙**: 4자리 이상은 K/M 단위 축약. 정밀도가 필요한 수치는 쉼표 구분.

```ts
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('ko-KR');
}
// 금액 등 정밀도 필요: n.toLocaleString('ko-KR') → "1,234,000"
```

### 1.4 빈 상태 (Empty State) 🟢

**원칙**: "없다"만 말하지 말고 "왜 없는지 + 다음 행동"을 함께 제공한다.

```tsx
// ✅ DO
<div className="text-center py-12">
  <p className="text-sm font-medium tn-text mb-1">아직 방명록이 없습니다</p>
  <p className="text-xs tn-text-sub">첫 번째로 메시지를 남겨보세요.</p>
</div>

// ❌ DON'T
<p>데이터 없음</p>
```

### 1.5 숨김·비공개 상태 🟢

**원칙**: 숨겨진 콘텐츠는 존재를 보이되 내용을 가린다. 완전히 제거하지 않는다 (소유자 확인용).

```tsx
// 숨김 댓글 — opacity로 시각 구분, 배지로 이유 표시
<div className={c.is_hidden ? 'opacity-40' : ''}>
  {c.is_hidden && (
    <span className="inline-flex items-center gap-0.5 text-[10px] tn-text-sub">
      <EyeOff className="h-2.5 w-2.5" /> 숨김
    </span>
  )}
  <p>{c.body}</p>
</div>
```

---

## 2. 인터랙션

### 2.1 버튼 상태 5종 🟢

**원칙**: default → hover → active → loading → disabled. 5종 모두 시각적으로 구분.

```tsx
// 기본 버튼 패턴
<button
  onClick={handleSave}
  disabled={loading || !isValid}
  className="
    flex items-center gap-1.5 text-xs font-medium
    text-white bg-neutral-900 px-3 py-1.5 rounded-lg
    hover:bg-neutral-700          /* hover */
    active:scale-95               /* active */
    disabled:opacity-40           /* disabled */
    disabled:cursor-not-allowed
    transition-all cursor-pointer
  ">
  {loading
    ? <><div className="h-3 w-3 border border-white/40 border-t-white rounded-full animate-spin" /> 저장 중...</>
    : <><Check className="h-3 w-3" /> 저장</>}
</button>
```

### 2.2 토글 🟢

**원칙**: ON = 컬러 (blue-600 기본), OFF = muted (neutral-500/40). 포커스링은 버튼에만, 텍스트 레이블은 분리.

```tsx
// ✅ DO — 버튼과 레이블 분리, focus:outline-none
<div className="flex items-center gap-1.5 cursor-pointer select-none"
     onClick={() => setValue(v => !v)}>
  <button type="button" role="switch" aria-checked={value}
    onClick={e => { e.stopPropagation(); setValue(v => !v); }}
    className={`relative w-9 h-5 rounded-full transition-all focus:outline-none shrink-0
      ${value ? 'bg-blue-600' : 'bg-neutral-500/40'}`}>
    <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform
      ${value ? 'translate-x-4' : 'translate-x-0'}`} />
  </button>
  <span className={`text-[11px] select-none transition-colors ${value ? 'text-blue-400' : 'tn-text-sub'}`}>
    레이블
  </span>
</div>

// ❌ DON'T — <label> 안에 <button> (이중 클릭 버그)
<label><button onClick={toggle}>...</button> 레이블</label>
```

### 2.3 복사·공유 피드백 🟢

**원칙**: 복사 즉시 시각 피드백, 2초 후 원상복귀. 별도 토스트 불필요.

```tsx
const [copied, setCopied] = useState(false);

async function handleCopy(text: string) {
  await navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

<button onClick={() => handleCopy(url)} className="...">
  {copied
    ? <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> 복사됨!</>
    : <><Copy className="h-3 w-3" /> 복사</>}
</button>
```

### 2.4 삭제·취소 — 확인 모달 기준 🟢

**원칙**: 복구 불가능 + 영향 범위 큰 것만 확인 모달. 나머지는 즉시 실행.

| 액션 | 처리 방식 |
|------|---------|
| 댓글 삭제 (본인 것) | 즉시 삭제 (간단, 본인만 영향) |
| 게시글 삭제 (많은 댓글 포함) | 확인 모달 |
| 계정 탈퇴 | 확인 모달 + 재확인 입력 |
| 폼 작성 취소 | 내용 있을 때만 "저장하지 않고 나가겠습니까?" |
| 파일 업로드 취소 | 즉시 취소 |

### 2.5 드래그앤드롭·파일 업로드 🟡

```tsx
// 업로드 영역 — 호버 시 점선 하이라이트, 진행 중 스피너
<div
  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
  onDragLeave={() => setDragOver(false)}
  onDrop={handleDrop}
  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
    ${dragOver ? 'border-blue-400 bg-blue-500/5' : 'tn-border hover:border-neutral-400'}`}>
  {uploading
    ? <div className="h-5 w-5 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin mx-auto" />
    : <p className="text-xs tn-text-sub">파일을 끌어다 놓거나 클릭해서 선택하세요</p>}
</div>
```

---

## 3. 피드백·알림

### 3.1 토스트 🟡

**원칙**: 성공 = emerald, 실패 = red, 경고 = amber, 정보 = blue. 3초 자동 사라짐.

```tsx
// 간단한 인라인 피드백 (토스트 라이브러리 없이)
// 성공: text-emerald-600 bg-emerald-50
// 실패: text-red-600 bg-red-50
// 저장 완료 후 메시지
{saveSuccess && (
  <p className="text-xs text-emerald-600 flex items-center gap-1">
    <CheckCircle2 className="h-3.5 w-3.5" /> 저장됐습니다.
  </p>
)}
{saveError && (
  <p className="text-xs text-red-500">{saveError}</p>
)}
```

### 3.2 폼 에러 🟢

**원칙**: 필드 바로 아래 인라인. 다수 에러는 상단 요약 추가.

```tsx
<div>
  <input className={`... ${error ? 'border-red-400 focus:ring-red-400' : 'tn-border'}`} />
  {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
</div>
```

### 3.3 로딩 — 스피너 vs 스켈레톤 선택 기준 🟢

| 상황 | 사용 |
|------|------|
| 버튼 클릭 후 즉각 응답 (< 1초 예상) | 버튼 내 작은 스피너 |
| 페이지/섹션 첫 로드 | 스켈레톤 |
| 파일 업로드·무거운 처리 | 프로그레스바 또는 퍼센트 |
| 인라인 검색 | 스피너 (입력 필드 우측) |

```tsx
// 스피너 (버튼용)
<div className="h-3 w-3 border border-white/40 border-t-white rounded-full animate-spin" />

// 스피너 (섹션 로딩용)
<div className="flex justify-center py-8">
  <div className="h-5 w-5 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
</div>

// 스켈레톤
<div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
```

---

## 4. 이미지·미디어

### 4.1 아바타 fallback 🟢

**원칙**: 이미지 없으면 이니셜 2자. 색상은 neutral 계열 고정.

```tsx
function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

{avatarUrl ? (
  <Image src={avatarUrl} alt={name} width={32} height={32}
    className="h-8 w-8 rounded-full object-cover" />
) : (
  <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center
                  text-[11px] font-bold text-neutral-600">
    {initials(name)}
  </div>
)}
```

### 4.2 이미지 로딩 실패 처리 🟢

```tsx
const [imgError, setImgError] = useState(false);

{!imgError ? (
  <Image src={src} onError={() => setImgError(true)} ... />
) : (
  <div className="... bg-neutral-100 flex items-center justify-center">
    <ImageOff className="h-4 w-4 text-neutral-400" />
  </div>
)}
```

### 4.3 호버 오버레이·액션 🟢

**원칙**: 호버 시에만 나타나는 액션 버튼. group/group-hover 패턴.

```tsx
<div className="relative group">
  <Image ... />
  <div className="absolute inset-0 rounded-full bg-black/50 
                  opacity-0 group-hover:opacity-100 transition-opacity
                  flex items-center justify-center cursor-pointer"
       onClick={handleAction}>
    <Camera className="h-5 w-5 text-white" />
  </div>
</div>
```

---

## 5. 네비게이션·계층

### 5.1 탭 vs 세그먼트 vs 드롭다운 선택 기준 ⚪

| 항목 수 | 레이아웃 | 사용 |
|---------|---------|------|
| 2~4개 | 수평 공간 충분 | 탭 (border-b 언더라인) |
| 2~3개 | 버튼처럼 보이길 원함 | 세그먼트 컨트롤 (rounded-full 배경) |
| 5개+ 또는 가변 | — | 드롭다운 |
| 모바일에서 4개+ | — | 드롭다운으로 자동 전환 |

### 5.2 페이지네이션 vs 무한스크롤 vs 더보기 선택 기준 🟡

| 상황 | 사용 |
|------|------|
| 검색 결과, 관리자 목록 | 페이지네이션 (위치 기억 필요) |
| 피드, 댓글, 타임라인 | 무한스크롤 |
| 프로필 섹션 내 목록 | 더보기 버튼 (초기 5~10개) |

### 5.3 뒤로가기·취소 처리 🟢

```tsx
// 편집 중 취소: 내용 있으면 경고
function handleCancel() {
  const isDirty = editForm.name !== user.name || editForm.bio !== user.bio;
  if (isDirty && !confirm('변경사항이 저장되지 않습니다. 취소하시겠습니까?')) return;
  setEditing(false);
}
```

---

## 6. 접근성·반응형

### 6.1 최소 터치 타겟 🟢

**원칙**: 모바일 터치 영역 최소 44×44px. 시각적 크기와 실제 클릭 영역은 다를 수 있다.

```tsx
// 시각은 작지만 터치 영역은 충분히
<button className="p-2 -m-2 rounded cursor-pointer"> {/* p-2로 영역 확장, -m-2로 레이아웃 유지 */}
  <X className="h-4 w-4" />
</button>
```

### 6.2 포커스링 🟢

**원칙**: 키보드 사용자를 위한 포커스링은 유지. 마우스 클릭 시 포커스링 제거는 `focus-visible` 사용.

```tsx
// ✅ 키보드는 보이고, 마우스는 안 보임
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"

// ❌ 키보드 사용자도 포커스링 없음
className="focus:outline-none"
```

### 6.3 색상에만 의존하지 않기 🟡

**원칙**: 색맹 사용자를 위해 상태 표현 시 색상 + 아이콘/텍스트 병용.

```tsx
// ✅ 색상 + 아이콘
<span className="text-emerald-500 flex items-center gap-1">
  <CheckCircle2 className="h-3.5 w-3.5" /> 사용 가능
</span>

// ❌ 색상만
<span className="text-emerald-500">사용 가능</span>
```

### 6.4 반응형 중단점 🟢

```
기본(모바일)  : 320px+  — 1열, 풀위드 패딩 px-4
sm            : 640px+  — 2열 그리드 가능
md            : 768px+  — 사이드바 고려
lg            : 1024px+ — 데스크탑 레이아웃
xl            : 1280px+ — 넓은 대시보드

max-w-2xl mx-auto  : 프로필·포스트 등 읽기 최적화 컨텐츠
max-w-7xl mx-auto  : 대시보드·전체 레이아웃
```

---

## 7. 한국어·로케일

### 7.1 한글 줄바꿈 🟢

```css
/* 한글 단어 중간 줄바꿈 방지 — Tailwind: break-keep */
.prose p { word-break: keep-all; }

/* 긴 URL/코드 줄바꿈 허용 — Tailwind: break-words */
.code-block { word-break: break-all; }
```

### 7.2 에러·안내 메시지 톤 🟢

**원칙**: 사용자를 탓하지 않는다. 시스템 문제임을 인정하거나 다음 행동을 제시한다.

| ❌ DON'T | ✅ DO |
|---------|------|
| "잘못된 요청입니다" | "다시 시도해주세요" |
| "유효하지 않은 형식" | "010-0000-0000 형식으로 입력해주세요" |
| "권한이 없습니다" | "이 기능은 로그인 후 이용할 수 있습니다" |
| "오류가 발생했습니다" | "일시적인 오류입니다. 잠시 후 다시 시도해주세요" |

### 7.3 상대시간 표현 🟢

```
방금 전      (< 1분)
n분 전       (1분 ~ 59분)
n시간 전     (1시간 ~ 23시간)
n일 전       (1일 ~ 6일)
n월 n일      (7일 이상, 같은 해)
n년 n월 n일  (다른 해)
```

### 7.4 존댓말 기준 🟢

| 대상 | 말투 |
|------|------|
| 안내문·플레이스홀더 | 해요체 ("입력해주세요", "남겨보세요") |
| 에러 메시지 | 해요체 ("다시 시도해주세요") |
| 버튼·액션 | 명사형 ("저장", "취소", "더 보기") |
| 빈 상태 설명 | 해요체 ("아직 없습니다") |

---

## 부록 A: 자주 쓰는 Tailwind 패턴 모음

```tsx
// 카드 컨테이너
"rounded-2xl border tn-border tn-surface p-6"

// 섹션 구분선
"border-t tn-border"

// 보조 텍스트
"text-[10px] font-medium uppercase tracking-wider tn-text-sub"

// 작은 배지
"text-[10px] font-medium px-2 py-0.5 rounded-full"

// 호버 트랜지션
"transition-colors hover:bg-neutral-50"

// 아이콘 버튼 (작은 것)
"p-1 rounded hover:bg-neutral-100 tn-text-sub transition-colors cursor-pointer"

// 인라인 링크 스타일
"inline-flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-colors"
```

---

## 부록 B: 추가 예정 (실제 구현 후 채울 것)

- [ ] 모달·오버레이 표준 구조
- [ ] 무한스크롤 구현 패턴
- [ ] 폼 유효성 검사 표준
- [ ] 스켈레톤 컴포넌트 표준
- [ ] 다크모드 컬러 토큰 정리

---

**문서 끝** · 실제 구현 시 발견되는 패턴은 해당 섹션에 추가.
