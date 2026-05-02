# PP Canvas Engine — 자체 구축 계획

> **결정**: Planner's Planner AI는 Excalidraw 의존을 제거하고 자체 캔버스 엔진을
> 구축한다. HandNote(필기 노트)와 Canvas(자유 사고)가 동일 엔진을 공유하도록
> 통합한다.
>
> **결정 일자**: 2026-05-02
> **승인자**: Cheonil Jeon (lools@tenone.biz)

---

## 1. 목적

### 1.1 왜 자체 엔진인가
| | Excalidraw 유지 | 자체 엔진 |
|---|---|---|
| 코드 통제 | 외부 50,000줄 종속 | 100% 우리 자산 |
| UI/UX 일관성 | 우리 UI ↔ 외부 UI 봉합 어색 | PP 디자인 가이드 일관 적용 |
| 기능 확장 | 외부 PR 의존 또는 fork | 즉시 추가 가능 |
| 라이선스 | MIT (안전), 단 정책 변경 위험 | 자체 통제 |
| 마이그레이션 부담 | 라이브러리 deprecation 위험 | 없음 |
| 초기 비용 | 0 (현재 사용 중) | ~10주 풀타임 |

### 1.2 통합 비전
HandNote와 CanvasStudio는 별개 코드베이스 → 동일 엔진의 두 표현으로 통합:

```
        ┌─────────────────────────────────────┐
        │   PP Canvas Engine                   │
        │                                      │
        │  ┌──────┐ ┌──────┐ ┌──────┐         │
        │  │필기   │ │도형   │ │텍스트│         │
        │  │레이어 │ │레이어 │ │레이어│         │
        │  └──────┘ └──────┘ └──────┘         │
        │  └──────────────────────────┘        │
        │       선택·이동·리사이즈              │
        └────────────┬───────────┬─────────────┘
                     ↓           ↓
            ┌────────────┐ ┌────────────┐
            │ HandNote   │ │ Canvas     │
            │ Wrapper    │ │ Wrapper    │
            │ (노트 안   │ │ (전체화면) │
            │  작은 영역)│ │            │
            └────────────┘ └────────────┘
```

각 wrapper는 toolbar, 화면 크기, 저장 정책만 다름. 엔진 코어는 단일.

---

## 2. 아키텍처

### 2.1 파일 구조
```
lib/planners/canvas-engine/
├── index.ts              # 공개 API barrel
├── engine.ts             # CanvasEngine 메인 클래스
├── types.ts              # 공유 타입 (Element, Stroke, Shape, ...)
├── layers/
│   ├── strokes.ts        # 자유 그리기 (perfect-freehand 활용)
│   ├── shapes.ts         # 사각·원·다이아·화살표·선
│   ├── texts.ts          # 인라인 텍스트
│   └── background.ts     # 배경 템플릿 (점·모눈·줄)
├── interaction/
│   ├── selection.ts      # 선택·이동·리사이즈·회전
│   ├── pointer.ts        # 통합 포인터 핸들러 (마우스·터치·펜)
│   ├── palm-rejection.ts # 팜 리젝션 (HandNote에서 추출)
│   └── pan-zoom.ts       # 무한 캔버스 + 줌
├── history.ts            # 멀티 엘리먼트 Undo/Redo
├── render.ts             # Canvas 2D 또는 SVG 렌더러
├── export.ts             # PNG·SVG·JSON 내보내기
└── serialize.ts          # 저장 포맷 직렬화

features/planners/
├── HandNote.tsx          # 엔진 wrapper — 작은 영역, 펜 위주 chrome
└── PpCanvas.tsx          # 엔진 wrapper — 전체화면, 풍부한 toolbar (구 CanvasStudio)
```

### 2.2 데이터 모델
```typescript
// lib/planners/canvas-engine/types.ts

export interface CanvasDocument {
  version: 1;
  elements: CanvasElement[];
  background: BackgroundTemplate;
  viewport?: { x: number; y: number; zoom: number };
}

export type CanvasElement =
  | StrokeElement
  | ShapeElement
  | TextElement
  | ImageElement;

export interface BaseElement {
  id: string;          // ULID 또는 nanoid
  type: string;
  x: number; y: number;
  rotation: number;    // radians
  opacity: number;     // 0-100
  zIndex: number;
  createdAt: number;
  updatedAt: number;
}

export interface StrokeElement extends BaseElement {
  type: "stroke";
  points: [number, number, number][];  // [x, y, pressure]
  color: string;
  size: number;
  pen: "pen" | "pencil" | "fountain" | "marker" | "highlighter";
  streamline: number;  // 0-1 (스무딩)
}

export interface ShapeElement extends BaseElement {
  type: "rect" | "ellipse" | "diamond" | "arrow" | "line";
  width: number; height: number;
  strokeColor: string; fillColor?: string;
  strokeWidth: number; strokeStyle: "solid" | "dashed" | "dotted";
  // arrow/line 전용
  endpoints?: { from: [number, number]; to: [number, number] };
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: "left" | "center" | "right";
  maxWidth?: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  width: number; height: number;
  src: string;  // data URL or remote URL
}

export type BackgroundTemplate = "blank" | "dots" | "grid" | "lines";
```

### 2.3 엔진 API
```typescript
// lib/planners/canvas-engine/engine.ts

export class CanvasEngine {
  // 라이프사이클
  constructor(canvas: HTMLCanvasElement, options?: EngineOptions);
  destroy(): void;

  // 데이터
  load(doc: CanvasDocument): void;
  serialize(): CanvasDocument;
  
  // 도구 모드
  setTool(tool: ToolMode): void;
  
  // 엘리먼트
  addElement(el: CanvasElement): void;
  updateElement(id: string, patch: Partial<CanvasElement>): void;
  removeElement(id: string): void;
  
  // 선택
  selectElements(ids: string[]): void;
  getSelection(): string[];
  
  // 기록
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  
  // 뷰포트
  setViewport(viewport: Viewport): void;
  zoomTo(level: number, center?: [number, number]): void;
  fitToContent(): void;
  
  // 이벤트 (구독)
  on(event: "change" | "select" | "tool-change", handler: Function): () => void;
  
  // 내보내기
  exportPng(): Promise<Blob>;
  exportSvg(): string;
  exportThumbnail(maxSize: number): Promise<string>; // data URL
}
```

---

## 3. Phase 계획

### Phase 1 — 코어 추출 (1~2주)
**목표**: HandNote 내부를 재사용 가능한 `CanvasEngine` 클래스로 분리.

작업:
- [ ] `lib/planners/canvas-engine/` 디렉토리 생성
- [ ] `types.ts` — 공유 데이터 모델 정의
- [ ] `engine.ts` — 엔진 클래스 골격
- [ ] `layers/strokes.ts` — HandNote의 perfect-freehand 로직 이전
- [ ] `layers/background.ts` — CanvasStudio의 배경 템플릿 이전
- [ ] `interaction/pointer.ts` — 포인터 통합 핸들러 (HandNote에서 추출)
- [ ] `interaction/palm-rejection.ts` — 팜 리젝션 (HandNote에서 추출)
- [ ] `interaction/pan-zoom.ts` — 줌·팬
- [ ] `render.ts` — Canvas 2D 렌더러 (HandNote의 그리기 로직 이전)
- [ ] `history.ts` — Undo/Redo (HandNote의 50단계 스택 이전)
- [ ] `serialize.ts` — JSON 저장/로드
- [ ] HandNote.tsx 리팩토링 — 새 엔진 사용. 외부 동작 동일 보장.

산출: HandNote 내부만 바뀌고 외부 동작은 동일. 캔버스 모드는 아직 영향 없음.

### Phase 2 — 도형 레이어 (2~3주)
**목표**: 사각·원·다이아·화살표·선 5종 추가.

작업:
- [ ] `layers/shapes.ts` — 도형 데이터 모델 + 렌더링
- [ ] 클릭 드래그로 도형 그리기 (포인터 인터랙션 확장)
- [ ] Shift 키 — 정사각/정원 강제, 화살표 직각 강제
- [ ] PP Canvas Wrapper(`PpCanvas.tsx`) 신규 — 전체화면, 도형 가능
- [ ] 캔버스 노트 페이지에서 PP Canvas와 Excalidraw 옵션 토글

산출: 기존 캔버스 데이터(Excalidraw)와 새 PP 캔버스 병행.

### Phase 3 — 선택·이동·리사이즈 (2~3주)
**목표**: 진짜 편집 가능한 캔버스.

작업:
- [ ] `interaction/selection.ts` — 클릭 선택, 드래그 박스 선택, 다중 선택
- [ ] 선택 후 8핸들 리사이즈 + 회전 핸들
- [ ] 드래그로 이동
- [ ] Delete 키로 삭제, Ctrl+D 복제
- [ ] 그룹화/그룹 해제 (Ctrl+G / Ctrl+Shift+G)
- [ ] 클립보드 복붙 (시스템 클립보드 연동)

산출: Excalidraw 비교 우위 확보. 이 시점부터 새 PP Canvas를 기본으로.

### Phase 4 — 인라인 텍스트 (1~2주)
**목표**: 캔버스 위 텍스트 편집.

작업:
- [ ] `layers/texts.ts` — 텍스트 엘리먼트
- [ ] contenteditable 오버레이 (포지셔닝·줌 동기화)
- [ ] 폰트 크기·색상·정렬
- [ ] 텍스트 박스 자동 리사이즈 또는 maxWidth 모드

산출: 다이어그램에 라벨링 가능.

### Phase 5 — 폴리시 (1주)
**목표**: 일상 사용 품질.

작업:
- [ ] 멀티 엘리먼트 Undo/Redo
- [ ] PNG·SVG·JSON 내보내기 마무리
- [ ] 모바일 터치 최적화 (핀치 줌, 두 손가락 팬)
- [ ] Apple Pencil·S Pen 압력 감지 통합
- [ ] 성능 최적화 (오프스크린 캔버스, 가상화 렌더링)

산출: 정식 사용 가능 수준.

### Phase 6 — 마이그레이션 (1주)
**목표**: Excalidraw 의존성 제거.

작업:
- [ ] 기존 Excalidraw 데이터 → PP Canvas 변환 스크립트 (best effort)
  - 자유 그리기: 100% 보존 (perfect-freehand 호환)
  - 도형: 매핑 가능한 것만 변환
  - 텍스트: 위치·내용 보존
  - 매핑 불가 요소: 사용자에게 알림
- [ ] CanvasStudio.tsx 삭제, PpCanvas.tsx로 대체
- [ ] `@excalidraw/excalidraw` 제거
- [ ] CanvasToolbar에서 `apiRef` 타입 → 자체 엔진 타입으로 교체
- [ ] 회귀 테스트

산출: 외부 의존 0. 단일 PP Canvas Engine.

---

## 4. 데이터 마이그레이션 정책

| 시기 | 기존 데이터 처리 |
|------|----------------|
| Phase 1~5 | Excalidraw 데이터는 그대로 작동 (CanvasStudio 유지) |
| Phase 6 | 변환 시도 → 실패 시 사용자에게 "이전 형식" 배너로 알림 + 빈 캔버스 |
| 사용자 옵트아웃 | 설정에서 "PP Canvas로 전환" 토글 — 기본 OFF, 사용자가 켜면 새 노트는 PP Canvas |

데이터 손실 위험 최소화 원칙:
- **자유 그리기는 절대 손실 없음** (포인트 좌표 + 압력 그대로 보존)
- **도형은 베스트 에포트** — 호환 안 되면 SVG 이미지로 임베드해 시각만 보존
- **사용자 작업 직전 자동 백업** (DB의 `data.legacy` 필드에 원본 JSON 보관)

---

## 5. HandNote 호환성

HandNote는 Phase 1에서 새 엔진을 쓰지만 **외부 인터페이스 동일**:
- 저장 포맷 — 기존 `{ strokes, width, height }` 유지 (어댑터로 변환)
- 모든 기능 — 펜 6종, 20색, undo/redo, 팜 리젝션, 자동 확장 — 그대로
- 사용자가 인지할 변화 — 없음

---

## 6. 의존성 관리

| 패키지 | 역할 | 라이선스 | 유지 여부 |
|--------|------|---------|---------|
| `perfect-freehand` | 자유 그리기 수학 (Bezier·압력) | MIT | **유지** (직접 다시 짜면 700줄 + 검증 부담) |
| `@excalidraw/excalidraw` | 캔버스 엔진 | MIT | **Phase 6에서 제거** |
| `tldraw` | (이전 캔버스) | 상용 | 이미 제거됨 |

---

## 7. 리스크와 완화

| 리스크 | 완화 |
|------|------|
| 10주 일정 슬립 | Phase 단위로 가치 출하 — 어디서 멈춰도 손실 적음 |
| 기존 사용자 데이터 손실 | 마이그레이션 정책 6장 + 자동 백업 + 옵트아웃 |
| 모바일 터치 까다로움 | HandNote가 이미 검증 — 같은 코드 재사용 |
| 성능 (수백 엘리먼트) | 가상화 렌더링·오프스크린 캔버스로 단계적 최적화 |
| 텍스트 편집 복잡도 | contenteditable로 시작, 필요시 자체 캐럿 구현 |

---

## 8. 성공 기준

각 Phase 완료 시 통과해야 할 체크:
- 기존 HandNote 사용자 → 인지 가능한 차이 없음 (Phase 1)
- 캔버스에서 도형 5종 그리고 저장·재로드 가능 (Phase 2)
- 다중 선택 → 그룹 이동 가능 (Phase 3)
- 캔버스에 텍스트 입력하고 이동·리사이즈 가능 (Phase 4)
- 모바일에서 30분 사용해도 끊김·버그 없음 (Phase 5)
- Excalidraw 노트 90% 이상 정상 변환 (Phase 6)

---

## 9. 추적

- 진행 상황: `WORK_STATUS.md`의 "PP Canvas Engine" 섹션
- 일별 변경: `CHANGELOG.md`
- 마일스톤: `ROADMAP.md`
- 이 문서: 결정·아키텍처·Phase 정의의 단일 진실 소스
