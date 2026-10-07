import { permanentRedirect } from 'next/navigation';

// 프로젝트 화면은 경쟁 PT 워크스페이스와 같은 데이터(대회·팀)를 읽는 중복이라 통합 (2026-10-08 매드리거 구조 개편)
export default function ProjectsRedirect() {
  permanentRedirect('/madleague/pt');
}
