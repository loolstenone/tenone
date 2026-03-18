# TenOne 프로젝트 리서치 보고서

## 1. 프로젝트 개요
TenOne은 **Ten:One Universe**라고 불리는 멀티 브랜드 생태계를 관리하기 위해 설계된 정교한 "통합 관리 시스템 및 본부(Headquarters)"입니다. 이 시스템은 다양한 브랜드들을 위한 공개 포털 역할과 브랜드 간의 활동을 조율하기 위한 내부 관리 도구("Office") 역할을 동시에 수행합니다.

### 비전 및 미션
- **Connect (연결)**: 다양한 분야, 사람, 브랜드를 연결합니다.
- **Create (창조)**: 발견된 기회를 실제 현실로 구현합니다.
- **Community (커뮤니티)**: 10,000명의 기획자를 위한 생태계를 구축합니다.
- **Universe (세계관)**: 개별 브랜드들을 하나의 응집력 있는 서사적 세계로 통합합니다.

---

## 2. 기술 스택
본 프로젝트는 현대적이고 성능 지향적인 스택을 사용합니다.

- **프레임워크**: Next.js 16.1.6 (최신 사양)
- **라이브러리**: React 19.2.3
- **스타일링**: Tailwind CSS v4.0.0
- **아이콘**: Lucide-React
- **데이터 핸들링**: 
  - `xlsx`: 엑셀 기반 연락처 가져오기 기능.
  - `clsx` & `tailwind-merge`: 동적 클래스 관리.
- **언어**: TypeScript 5.x
- **인프라**: Docker & Google Cloud Run

---

## 3. 상세 디렉토리 구조

### `/app`
Next.js App Router 구현의 핵심입니다.
- `(public)`: 'About', 'Contact', 'Projects'와 같은 공개 페이지를 포함합니다. `PublicHeader`와 `PublicFooter`를 사용합니다.
- `/office`: 내부 관리 대시보드입니다. `brands`, `contacts`, `schedule`, `assets`, `studio` 등의 하위 라우트를 포함합니다.
- `page.tsx`: Ten:One Universe의 비전과 주요 프로젝트를 보여주는 임팩트 있는 랜딩 페이지입니다.
- `layout.tsx`: 전역 미학(다크 모드, Inter 폰트 등)을 정의하는 루트 레이아웃입니다.

### `/lib`
- `data.ts`: 목(Mock) 데이터의 중앙 저장소입니다. 브랜드, 이벤트, 자산, 연락처의 초기 상태를 정의합니다.
- `universe.ts`: 타임라인 항목 및 관계 그래프 노드/링크를 포함한 "Universe" 설정 및 로직을 관리합니다.

### `/types`
모든 핵심 엔티티에 대한 엄격한 TypeScript 인터페이스를 정의합니다.
- `Brand`, `UniverseEvent`, `Asset`, `Contact`, `UniverseNode`, `UniverseLink`.

### `/components`
재사용 가능한 UI 컴포넌트들입니다.
- `AppShell.tsx`: Office 대시보드의 메인 래퍼입니다.
- `BrandCard.tsx`: 브랜드의 시각적 표현 카드입니다.
- `ContactImportModal.tsx`: 엑셀-JSON 매핑을 위한 고난도 도구입니다.
- `RelationshipMap.tsx`: 브랜드 간 연결을 시각화하는 SVG 기반 맵입니다.
- `TimelineView.tsx`: Universe 역사를 보여주는 연대기 보기입니다.

---

## 4. 핵심 엔티티 및 데이터 아키텍처

### 브랜드 (핵심)
브랜드는 시스템의 주요 엔티티입니다. 다음과 같이 분류됩니다:
- `AI Idol` (예: LUKI)
- `AI Creator` (예: RooK)
- `Community` (예: Badak)
- `Project Group` (예: MAD League)
- `Corporate` (Ten:One 본체)

### Universe 시스템 (설정)
- **타임라인**: 역사적 사건들을 추적합니다 (예: "루미나 행성의 파괴").
- **관계도 (Relationship Map)**: 브랜드 간 상호작용 방식을 정의합니다 (예: "Ten:One이 LUKI를 관리함", "Badak이 MAD League를 후원함").

### 연락처 관리
- 강력한 **엑셀 가져오기(Import)** 시스템을 갖추고 있습니다.
- 이름, 역할, 회사, 이메일, 관련 브랜드 등의 필드를 표준화하여 관리합니다.

---

## 5. 주요 기능 및 로직

### 프리미엄 미학 및 애니메이션
랜딩 페이지와 공개 컴포넌트들은 다음을 활용합니다:
- 커스텀 애니메이션 (예: `animate-pulse-slow`, `animate-fade-in-up`).
- 하이엔드 "테크/미래" 느낌을 주는 방사형 그라데이션 및 그리드 배경.
- Office 대시보드의 글래스모피즘(Glassmorphism) 효과.

### 연락처 가져오기 로직 (`ContactImportModal.tsx`)
1. **드래그 앤 드롭**: 사용자가 `.xlsx` 또는 `.csv` 파일을 업로드합니다.
2. **파싱**: `xlsx` 라이브러리를 사용하여 바이너리 데이터를 읽고 첫 번째 시트를 JSON으로 변환합니다.
3. **스마트 매핑**: 다양한 헤더 명칭(영문/국문)을 내부 `Contact` 인터페이스에 자동으로 매핑하려고 시도합니다.
4. **미리보기**: 최종 가져오기 전에 데이터의 일부를 보여줍니다.

---

## 6. 배포 및 환경

프로젝트는 **Google Cloud Run**에 최적화되어 있습니다.
- **컨테이너화**: 프로덕션 빌드 표준화를 위한 `Dockerfile`이 제공됩니다.
- **독립 빌드 (Standalone)**: `next.config.ts`에서 효율적인 컨테이너 배포를 위해 `output: 'standalone'`으로 설정되어 있습니다.
- **배포 유틸리티**: `scripts/deploy.js`는 `gcloud` 명령어를 사용하여 멀티 환경(dev/prod) 배포를 처리합니다.

### 환경 변수
- `NEXT_PUBLIC_ENV`: 환경별 로직 및 설정을 전환하는 데 사용됩니다.

---

## 7. 심층 통찰 (Insights)
- **데이터 격리**: 현재 로직은 `lib/data.ts`의 목 데이터에 크게 의존하고 있으며, 이는 향후 백엔드 및 DB 통합 계획을 시사합니다.
- **세계관 통합**: "Universe" 개념이 UI(맵/타임라인)와 데이터 구조(타임라인/관계의 외래 키로서의 브랜드 ID) 모두에 깊이 통합되어 있습니다.
- **확장성**: Tailwind v4 및 Next.js 16/React 19의 사용은 최신 웹 기능을 활용하기 위한 미래 지향적인 아키텍처임을 나타냅니다.
