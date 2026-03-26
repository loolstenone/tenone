# Ten:One™ Universe 접근 제어 가이드

> 복잡한 세계관을 효율적으로 운영하기 위한 권한 설계 가이드
> Google Workspace IAM + GCP RBAC 모델 참고

---

## Google은 어떻게 하는가

Google은 수백 개의 서비스(Gmail, Drive, Cloud, Workspace 등)를 **3가지 개념**으로 관리한다:

```
Principal (누구) × Role (역할) × Scope (범위)
```

- **Principal**: 사용자, 그룹, 서비스 계정
- **Role**: 권한 묶음 (Viewer/Editor/Admin + 커스텀)
- **Scope**: 어디에 적용 (조직/프로젝트/리소스)

핵심 원칙:
1. **최소 권한** — 필요한 것만 허용
2. **역할 기반** — 개인이 아닌 역할에 권한 부여
3. **상속** — 상위 조직 권한이 하위로 흐름
4. **커스텀 역할** — 기본 역할로 안 되면 새로 만듦

---

## Ten:One Universe에 적용

### 우리의 복잡성

```
23개 브랜드 × 6가지 멤버 유형 × 각 브랜드별 기능 = 수백 가지 경우의 수
```

이걸 단순하게 만드는 방법: **Google처럼 3층 구조**.

---

## 1층: Principal (누구인가)

### Universe 멤버십

| 유형 | 설명 | 예시 |
|------|------|------|
| **staff** | Ten:One 직원 | 대표, 기획팀, 운영팀 |
| **partner** | 외부 전문가 | 프리랜서, 협력사 |
| **alliance** | 지역 거점 사업자 | YouInOne Alliance 멤버 |
| **crew** | 프로젝트 참여자 | 단기 프로젝트 크루 |
| **madleaguer** | MADLeague 리거 | 대학생 동아리 멤버 |
| **member** | 일반 가입자 | 서비스 이용자 |

### 그룹 (Google의 Group 개념)

개인에게 일일이 권한을 주지 않고, **그룹에 권한을 준다.**

| 그룹 | 소속 멤버 | 권한 |
|------|----------|------|
| `@tenone-core` | staff 전원 | 인트라 전체 |
| `@madleague-8기` | 8기 리거들 | MADLeague 8기 콘텐츠 |
| `@project-luki` | LUKI 프로젝트 팀 | LUKI 관련 리소스 |
| `@smarcomm-clients` | SmarComm 고객사 | SmarComm 워크스페이스 |

→ **affiliations[] 배열이 이 역할을 한다.** `['madleague', 'project-luki']`

---

## 2층: Role (무엇을 할 수 있는가)

### 기본 역할 (Google의 Predefined Roles)

| 역할 | 할 수 있는 것 | 코드 |
|------|-------------|------|
| **Super Admin** | 모든 것 + 시스템 설정 + 다른 Admin 관리 | `role: 'Admin'` |
| **Manager** | 팀/프로젝트 관리 + 멤버 초대 + 보고서 | `role: 'Manager'` |
| **Editor** | 콘텐츠 작성/수정 + 자기 데이터 관리 | `role: 'Editor'` |
| **Viewer** | 읽기만 | `role: 'Viewer'` |

### 서비스별 역할 (Google의 Custom Roles)

**WIO:**
| 역할 | 범위 |
|------|------|
| owner | 조직 전체 + 삭제 + 빌링 |
| admin | 조직 전체 - 삭제 |
| manager | 팀/프로젝트 범위 |
| member | 본인 업무만 |
| guest | 읽기 (초대된 프로젝트만) |

**SmarComm:**
| 역할 | 범위 |
|------|------|
| enterprise | 모든 기능 + 전담 매니저 |
| pro | 전체 솔루션 + AI |
| growth | 기본 + CRM + 영업 |
| starter | 진단 + 기본 대시보드 |
| free | 무료 진단 3회 |

---

## 3층: Scope (어디까지)

### Google의 리소스 계층

```
Organization → Folder → Project → Resource
```

### TenOne의 리소스 계층

```
Universe (Ten:One)
├── Service (WIO, SmarComm, Mindle...)
│   ├── Tenant/Workspace (고객사, 팀)
│   │   ├── Module (Project, Sales, Finance...)
│   │   │   └── Resource (프로젝트, 딜, 문서...)
```

**권한 상속:**
- Universe Admin → 모든 Service 접근 가능
- Service Admin → 해당 Service 내 모든 Tenant
- Tenant Admin → 해당 Tenant 내 모든 Module
- Module Manager → 해당 Module 내 모든 Resource

---

## 권한 판단 플로우

```
요청 → 인증(WHO) → 역할 조회(WHAT) → 범위 확인(WHERE) → 허용/거부

1. Supabase Auth → 세션 유효?
2. members 테이블 → accountType, role 조회
3. 서비스별 체크:
   ├── TenOne Intra: moduleAccess[] 포함?
   ├── WIO: tenant.plan에 해당 모듈 포함? + member.role 권한?
   └── SmarComm: subscription.tier에 해당 기능 포함?
4. 결과:
   ├── 허용 → 정상 렌더링
   ├── 권한 부족 → 403 "접근 권한이 없습니다" + 업그레이드 안내
   └── 미인증 → 로그인 페이지
```

---

## 구현 패턴

### 1. 서버 사이드 체크 (middleware)

```typescript
// middleware.ts — 모든 보호 경로에 적용
if (pathname.startsWith('/intra')) {
  const session = await getSession(request);
  if (!session) return redirect('/login');
  const member = await getMember(session.user.id);
  if (!member.intraAccess) return render403('인트라 접근 권한이 없습니다');
}
```

### 2. 클라이언트 체크 (UI 가이드)

```typescript
// 서버에서 이미 체크했으므로, 클라이언트는 UI만 담당
function ModuleCard({ module }) {
  const { hasModuleAccess } = useAuth();
  const accessible = hasModuleAccess(module);

  return accessible
    ? <ActiveModule />           // 접근 가능 → 정상 표시
    : <LockedModule              // 접근 불가 → 잠금 + 안내
        reason="Pro 플랜에서 사용 가능"
        upgradePath="/pricing"
      />;
}
```

### 3. API 체크

```typescript
// 모든 API 라우트에 적용
export async function POST(request) {
  const session = await getServerSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getMember(session.user.id);
  if (member.role !== 'Admin' && member.role !== 'Manager') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 비즈니스 로직
}
```

---

## 핵심 원칙 요약

| # | 원칙 | 설명 |
|---|------|------|
| 1 | **기본 거부** | 명시적으로 허용된 것만 접근 가능 |
| 2 | **역할 기반** | 개인이 아닌 역할(accountType + role)에 권한 부여 |
| 3 | **서버에서 판단** | 클라이언트는 UI만, 진짜 체크는 서버/API |
| 4 | **투명하게** | 숨기지 말고 "왜 안 되는지" + "어떻게 하면 되는지" 안내 |
| 5 | **상속** | Universe Admin → Service → Tenant → Module 순 |
| 6 | **최소 권한** | 필요한 것만 열어줌 |
| 7 | **감사 가능** | 누가 언제 무엇에 접근했는지 기록 |

---

## 현재 → 목표 로드맵

| 현재 | 목표 | 우선순위 |
|------|------|----------|
| 클라이언트 useEffect 리다이렉트 | middleware 서버 체크 | 🔴 |
| 이메일 하드코딩 관리자 | DB role 기반 | 🔴 |
| API 권한 체크 없음 | 모든 API에 인증 미들웨어 | 🔴 |
| WIO plan 무시 모듈 전체 노출 | plan 기반 모듈 필터링 | 🟡 |
| SmarComm 클라이언트 TierGate | 서버+API 체크 | 🟡 |
| 감사 로그 없음 | 접근 로그 테이블 | 🟢 |
