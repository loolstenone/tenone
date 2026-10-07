import { permanentRedirect } from 'next/navigation';

// 옛 주소 — 메뉴 이름 '아레나' → '매드리거' 변경 (2026-10-08). 북마크·옛 링크 보존용 308
export default function ArenaRedirect() {
    permanentRedirect('/madleague/madleaguer');
}
