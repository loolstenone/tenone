/**
 * RBAC (Role-Based Access Control) — WIO Orbi
 *
 * 권한 레벨 체계:
 *   super_admin > admin > manager > member > viewer > guest
 *
 * 모듈 접근, 데이터 범위, 기능 권한을 통합 관리한다.
 */

import type { WIOMember } from '@/types/wio';
import { MODULE_CATALOG } from '@/lib/wio-modules';

/* ── 권한 레벨 타입 ── */
export type PermissionLevel =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'member'
  | 'viewer'
  | 'guest';

/* ── 데이터 접근 범위 ── */
export type DataScope = 'all' | 'division' | 'team' | 'self';

/* ── 기능 액션 ── */
export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export';

/* ── WIORole → PermissionLevel 매핑 ── */
// WIORole: 'owner' | 'admin' | 'manager' | 'member' | 'guest'
// owner는 super_admin으로 매핑
function toPermissionLevel(member: WIOMember | null): PermissionLevel {
  if (!member) return 'guest';
  switch (member.role) {
    case 'owner':   return 'super_admin';
    case 'admin':   return 'admin';
    case 'manager': return 'manager';
    case 'member':  return 'member';
    case 'guest':   return 'guest';
    default:        return 'guest';
  }
}

/* ── 공통 카테고리 (Track 6) + 개인(MY) 모듈 키 목록 ── */
const COMMON_CATEGORY = 'track6-common';
const MY_CATEGORY = 'my';

const COMMON_MODULE_KEYS = MODULE_CATALOG
  .filter(m => m.category === COMMON_CATEGORY)
  .map(m => m.key);

const MY_MODULE_KEYS = MODULE_CATALOG
  .filter(m => m.category === MY_CATEGORY)
  .map(m => m.key);

/* ── guest가 접근 가능한 Track 6 일부 모듈 ── */
const GUEST_ALLOWED_KEYS = ['home', 'talk', 'wiki', 'calendar'];

/* ── 모듈의 카테고리 조회 ── */
function getModuleCategory(moduleKey: string): string | null {
  const mod = MODULE_CATALOG.find(m => m.key === moduleKey);
  return mod?.category ?? null;
}

/**
 * 모듈 접근 체크
 *
 * - super_admin / admin → 전체 접근
 * - manager → 자기 카테고리(트랙) + 공통(Track 6) + 개인(MY)
 * - member → 배정된 모듈(moduleAccess) + 공통(Track 6) + 개인(MY)
 * - viewer → 읽기 전용이지만 모듈 목록 자체는 member와 동일
 * - guest → Track 6 일부만
 *
 * @param member  현재 사용자 (null이면 게스트)
 * @param moduleKey  체크할 모듈 키
 * @param isDemo  데모 모드 여부 — true면 전체 접근
 */
export function checkModuleAccess(
  member: WIOMember | null,
  moduleKey: string,
  isDemo = false,
): boolean {
  // 데모 모드 → 전체 모듈 열람
  if (isDemo) return true;

  const level = toPermissionLevel(member);

  switch (level) {
    // 최고 관리자 / 관리자: 전체 접근
    case 'super_admin':
    case 'admin':
      return true;

    // 매니저: 공통 + MY + 소속 부서 카테고리 전체
    case 'manager': {
      if (COMMON_MODULE_KEYS.includes(moduleKey)) return true;
      if (MY_MODULE_KEYS.includes(moduleKey)) return true;
      // moduleAccess에 명시된 모듈
      if (member?.moduleAccess?.includes(moduleKey)) return true;
      // 매니저는 자신의 department 기반 카테고리도 접근 가능
      // (department 필드가 카테고리 id와 매핑되는 경우)
      if (member?.department) {
        const cat = getModuleCategory(moduleKey);
        if (cat && cat === member.department) return true;
      }
      return false;
    }

    // 일반 멤버 / 뷰어: 공통 + MY + 배정된 모듈만
    case 'member':
    case 'viewer': {
      if (COMMON_MODULE_KEYS.includes(moduleKey)) return true;
      if (MY_MODULE_KEYS.includes(moduleKey)) return true;
      if (member?.moduleAccess?.includes(moduleKey)) return true;
      return false;
    }

    // 게스트: Track 6 일부만
    case 'guest':
      return GUEST_ALLOWED_KEYS.includes(moduleKey);

    default:
      return false;
  }
}

/**
 * 데이터 범위 체크
 *
 * - super_admin / admin → all (전사)
 * - manager → division (부서/본부)
 * - member → team (팀)
 * - viewer / guest → self (본인만)
 */
export function getDataScope(member: WIOMember | null): DataScope {
  const level = toPermissionLevel(member);
  switch (level) {
    case 'super_admin':
    case 'admin':
      return 'all';
    case 'manager':
      return 'division';
    case 'member':
      return 'team';
    case 'viewer':
    case 'guest':
    default:
      return 'self';
  }
}

/**
 * 기능 권한 체크
 *
 * | 레벨          | create | read | update | delete | approve | export |
 * |---------------|--------|------|--------|--------|---------|--------|
 * | super_admin   |   O    |  O   |   O    |   O    |    O    |   O    |
 * | admin         |   O    |  O   |   O    |   O    |    O    |   O    |
 * | manager       |   O    |  O   |   O    |   X    |    O    |   O    |
 * | member        |   O    |  O   |   O    |   X    |    X    |   X    |
 * | viewer        |   X    |  O   |   X    |   X    |    X    |   X    |
 * | guest         |   X    |  O   |   X    |   X    |    X    |   X    |
 */
export function canPerformAction(
  member: WIOMember | null,
  action: ActionType,
): boolean {
  const level = toPermissionLevel(member);

  // 읽기는 모두 허용
  if (action === 'read') return true;

  switch (level) {
    case 'super_admin':
    case 'admin':
      // 전체 액션 허용
      return true;

    case 'manager':
      // delete 불가, 나머지 허용
      return action !== 'delete';

    case 'member':
      // create, update만 허용
      return action === 'create' || action === 'update';

    case 'viewer':
    case 'guest':
      // 읽기만 (위에서 이미 처리)
      return false;

    default:
      return false;
  }
}

/**
 * 권한 레벨 조회 유틸
 */
export function getPermissionLevel(member: WIOMember | null): PermissionLevel {
  return toPermissionLevel(member);
}

/**
 * 관리자 여부 (super_admin 또는 admin)
 */
export function isAdmin(member: WIOMember | null): boolean {
  const level = toPermissionLevel(member);
  return level === 'super_admin' || level === 'admin';
}

/**
 * 매니저 이상 여부
 */
export function isManagerOrAbove(member: WIOMember | null): boolean {
  const level = toPermissionLevel(member);
  return level === 'super_admin' || level === 'admin' || level === 'manager';
}
