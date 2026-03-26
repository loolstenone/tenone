# Ten:One™ Universe 권한 정책

> 모든 서비스의 접근 제어 기준. 코드 구현 시 이 문서를 참조.

---

## 1. 권한 레이어 구조

```
Layer 1: Universe 멤버십 (누구인가)
  └── AccountType: staff / partner / alliance / crew / madleaguer / member

Layer 2: 서비스별 역할 (무엇을 할 수 있는가)
  ├── TenOne Intra: UserRole (Admin/Manager/Editor/Viewer)
  ├── WIO App: TenantRole (owner/admin/manager/member/guest)
  └── SmarComm: Tier (enterprise/pro/growth/starter/free)

Layer 3: 기능별 접근 (어디까지 볼 수 있는가)
  ├── moduleAccess: 인트라 모듈별
  ├── systemAccess: ERP 세부 시스템별
  └── featureAccess: 서비스 기능별 (개발중 포함)
```

---

## 2. Universe 멤버십 (AccountType)

| 유형 | 설명 | 인트라 접근 | 가입 경로 |
|------|------|-----------|----------|
| **staff** | 직원 (정규/계약) | ✅ 전체 | 관리자 등록 |
| **partner** | 외부 파트너 | ✅ 제한적 | 관리자 초대 |
| **alliance** | 얼라이언스 (지역 거점) | ✅ 제한적 | 관리자 초대 |
| **crew** | 프로젝트 크루 | ✅ 제한적 | 크루 지원 승인 |
| **madleaguer** | MADLeague 리거 | ✅ 제한적 | MADLeague 가입 |
| **member** | 일반 회원 | ❌ | 자유 가입 |

---

## 3. TenOne 인트라 권한

### UserRole (역할)

| 역할 | 할 수 있는 것 | 할 수 없는 것 |
|------|-------------|-------------|
| **Admin** | 모든 기능 + 설정 + 권한 관리 | — |
| **Manager** | 팀/프로젝트 관리 + 보고서 | 시스템 설정, 권한 변경 |
| **Editor** | 콘텐츠 작성/수정 | 삭제, 설정, 권한 |
| **Viewer** | 읽기 전용 | 작성, 수정, 삭제 |
| **Member** | 인트라 접근 불가 | — |

### moduleAccess (모듈)

| 모듈 | staff | partner | alliance | crew | madleaguer | member |
|------|-------|---------|----------|------|------------|--------|
| Myverse | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Townity | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Project | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| HeRo | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Evolution | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| SmarComm | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Wiki | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| ERP | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Vridge | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| BUMS | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. WIO App 권한

### TenantRole (조직 내 역할)

| 역할 | 설명 | 권한 |
|------|------|------|
| **owner** | 조직 소유자 | 전체 + 조직 삭제 + 빌링 |
| **admin** | 관리자 | 전체 - 조직 삭제 |
| **manager** | 매니저 | 팀/프로젝트 관리 + 멤버 초대 |
| **member** | 멤버 | 본인 업무 + 읽기 |
| **guest** | 게스트 | 읽기 전용 (초대된 프로젝트만) |

### 모듈 접근 (Plan 기반)

| 모듈 | Starter | Growth | Pro | Enterprise |
|------|---------|--------|-----|-----------|
| Home | ✅ | ✅ | ✅ | ✅ |
| Project | ✅ 기본 | ✅ | ✅ | ✅ |
| Talk | ✅ | ✅ | ✅ | ✅ |
| People | ❌ | ✅ | ✅ | ✅ |
| Sales | ❌ | ✅ | ✅ | ✅ |
| Finance | ❌ | ✅ | ✅ | ✅ |
| Timesheet | ❌ | ✅ | ✅ | ✅ |
| Learn | ❌ | ❌ | ✅ | ✅ |
| Content | ❌ | ❌ | ✅ | ✅ |
| Wiki | ❌ | ❌ | ✅ | ✅ |
| Insight | ❌ | ❌ | ✅ | ✅ |
| Shop | ❌ | ❌ | ❌ | ✅ |

---

## 5. SmarComm 권한

### Tier (요금제)

| Tier | 접근 가능 기능 | 제한 |
|------|-------------|------|
| **free** | 무료 진단 3회 | 대시보드 없음 |
| **starter** | Core 팩 (진단 + GEO/SEO) | 월 10회 |
| **growth** | + Action 팩 + CRM 팩 | 월 50회 |
| **pro** | + 실험 팩 + 운영 팩 | 무제한 |
| **enterprise** | + 집행 팩 + 전담 매니저 | 커스텀 |

### 기능별 접근 (개발중 포함)

| 기능 | free | starter | growth | pro | enterprise | 상태 |
|------|------|---------|--------|-----|-----------|------|
| 진단 (Scan) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 구현 |
| 대시보드 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ 구현 |
| 캠페인 관리 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ 구현 |
| AI 크리에이티브 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ 구현 |
| 퍼널 분석 | ❌ | ❌ | ❌ | ✅ | ✅ | 🚧 개발중 |
| 트래픽 분석 | ❌ | ❌ | ❌ | ✅ | ✅ | 🚧 개발중 |
| GEO AI 가시성 | ❌ | ✅ | ✅ | ✅ | ✅ | 🚧 개발중 |
| CRM 채널관리 | ❌ | ❌ | ✅ | ✅ | ✅ | 🚧 개발중 |
| 워크플로우 자동화 | ❌ | ❌ | ❌ | ✅ | ✅ | 🚧 개발중 |
| A/B 테스트 | ❌ | ❌ | ❌ | ✅ | ✅ | 🚧 개발중 |

**🚧 개발중 기능 처리 원칙:**
- 네비에서 숨기는 것이 아니라 **접근 시 "Coming Soon" 오버레이** 표시
- 해당 Tier의 사용자도 "이 기능은 준비 중입니다" 확인 가능
- URL 직접 접근도 동일하게 처리 (서버 사이드 체크)

---

## 6. 구현 원칙

### 절대 하지 말 것
- ❌ 네비에서 숨기는 것만으로 접근 제어 (URL 직접 접근 가능)
- ❌ 클라이언트 사이드만으로 권한 체크 (개발자 도구로 우회 가능)
- ❌ localStorage에 권한 정보 저장 (조작 가능)
- ❌ 하드코딩된 이메일로 관리자 판별

### 반드시 할 것
- ✅ 서버 사이드(middleware 또는 API)에서 세션 + 권한 검증
- ✅ DB(members 테이블)에서 accountType / role 조회
- ✅ 권한 없는 페이지 → 403 페이지 표시 (리다이렉트 아닌 설명)
- ✅ 개발중 기능 → "Coming Soon" 오버레이 (숨기지 않음)
- ✅ API 엔드포인트에도 동일한 권한 체크

### 권한 체크 순서
```
1. Supabase Auth 세션 확인 (로그인 여부)
2. members 테이블에서 accountType / role 조회
3. 서비스별 추가 권한 확인:
   - TenOne Intra: moduleAccess 배열 체크
   - WIO: tenant.plan + member.role 체크
   - SmarComm: subscription tier 체크
4. 권한 없음 → 403 "접근 권한이 없습니다" + 업그레이드 안내
```

---

## 7. 현재 상태 vs 목표

| 항목 | 현재 | 목표 |
|------|------|------|
| 인트라 접근 제어 | 클라이언트 useEffect 리다이렉트 | middleware 서버 체크 |
| WIO 모듈 접근 | 전체 모듈 노출 (plan 무시) | plan 기반 모듈 필터링 |
| SmarComm 개발중 | 네비에서 숨김 | Coming Soon 오버레이 |
| SmarComm TierGate | useAuth 클라이언트 체크 | API + 서버 사이드 체크 |
| 관리자 판별 | 이메일 하드코딩 | DB role === 'Admin' |
| API 권한 체크 | 대부분 없음 | 모든 API에 인증 미들웨어 |
