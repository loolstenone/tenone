# Director's Review & Architect Comments
> **Version:** 1.3 (Last Updated: 2026-03-31)
> **To:** Claude (Development Team)
> **From:** Antigravity (Architecture Consultant / Director)
> **Status:** Phase 2 (Frontend Context Adapter) 진행 중

---

## 🎯 Current Priorities (현재 최우선 과제)

20개가 넘는 브랜드가 하나의 모놀리식 모노레포에 통합되는 거대한 스케일업 상황에서 '보안, 체계, 안전성, 확장성'은 나중으로 미룰 선택이 아닌 플랫폼의 생존 문제입니다. 다음 우선순위를 뼈에 새기고 개발에 임하십시오.

### [Priority 1] 3계층 신원 아키텍처의 프론트엔드 안착 (Active)
* **액션:** 기존 인증 코드를 깨뜨리지 않으면서 Phase 2 (`identity-context.tsx` 생성 및 `auth-context.tsx` 어댑터 연결)를 무사히 완수해라.
* DB 엔진(Phase 1)은 가동 확인되었으니 브릿지 연결 로직에만 100% 집중할 것.

### [Priority 2] 스파게티 붕괴 방어선 구축 (Pending)
* **액션:** 공용 부품(`components/ui`)과 20개 브랜드 개별 부품(`features/[brand]`) 격리.
* 한 브랜드 사이트를 고치다 다른 사이트가 깨지는 연쇄 붕괴를 원천 차단하는 폴더 구조 분리를 Phase 3에서 진행해야 한다.

### [Priority 3] 100만 트래픽 하이브리드 캐싱 (Pending)
* 소개/랜딩 페이지는 정적 캐싱(SSG/ISR)으로 서버 부하를 0으로 만들고, 마이버스(채팅)나 대시보드만 SSR을 타도록 트래픽 분산 설계를 적용해라.

---

## ⚠️ Engineering Rules (디렉터 엄수 명령 / 헌법)

### 1. [핵심 헌법] 코어(Common Core) 훼손 금지 vs 어댑터 확장 허용의 명확한 경계
어느 한 사이트의 특수 기능을 개발하기 위해 유니버스의 생명줄(코어)을 건드려 19개 사이트가 연쇄 붕괴되는 대형 사고를 금지한다. 하지만 현재 진행 중인 [Priority 1]의 '코어 확장'과는 그 성격을 명확히 구분한다.

* **✅ 허용 (코어 업그레이드 및 어댑터 확장):** 
  현재 수행해야 할 `auth-context.tsx` 내부 수정은, 신규 `identity-context.tsx`의 3계층 데이터를 받아서 기존 143개 레거시 페이지가 뻗지 않도록 **'표준 인터페이스로 규칙을 변환(Adapter)해 주는 작업'**이므로 필수적인 시스템 통합(Integration)이다. 이는 허용된다.
* **❌ 금지 (코어 훼손 및 오염 - 스파게티의 주범):** 
  단지 '바닥(badak)'이나 '스마컴(smarcomm)' 등 특정 한두 개 사이트에만 종속된 특수 기능(`is_certified`, `company_size` 등)을 처리하겠답시고, 공용 코어인 `auth-context.tsx`나 `middleware.ts` 안에 **`if (brand === 'badak') { ... }` 같은 브랜드별 하드코딩 예외 처리 문을 덕지덕지 이어 붙이는 행위.** 이것이 바로 엄격히 금지하는 **"코어 훼손"**이다. 개별 자산은 무조건 `features/badak` 같은 이름표가 달린 격리 폴더에서 따로 처리해라.

### 2. 프리뷰 서버 좀비 포트 크래시 방지
로컬에서 테스트하려고 `npm run dev`를 켤 때 의도치 않게 서버가 즉사하는 현상을 방지하라.
* **조치:** 에러가 나면 멍청하게 재시도하지 말고, 명령어로 3000번 포트 좀비 프로세스를 죽이거나 `npm run dev -p 4000` 처럼 대체 포트를 지정해서 반드시 한 번에 테스트 환경을 띄워라.

### 3. 무관용 RLS 보안 & 에러 로깅
* 신규 API를 짤 때 RLS 정책이 뚫리지 않았는지 먼저 입증할 것.
* 에러 발생 시 중앙에서 관제할 수 있는 로깅 시스템(Sentry 등) 도입을 염두에 두고 에러 핸들링 코드를 작성할 것.

---

## 🗄️ Version History & Archived Comments
* **v1.0:** Phase 1 DB 아키텍처 설계 수립 및 Dev DB 에러 수정. 
* **v1.1:** Phase 2 우선순위 세팅, 개발 서버 좀비 현상 방지 지침.
* **v1.2:** 모노레포 사고 방지 헌법(코어 수정 금지) 등록.
* **v1.3 (2026-03-31):** Priority 1(어댑터 연결 허용)과 Rule 1(코어 훼손 금지) 간의 아키텍처적 경계(허용 vs 금지의 기준) 명확화.
