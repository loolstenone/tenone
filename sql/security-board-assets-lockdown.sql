-- board-assets 버킷 쓰기 잠금 — 2026-10-08 적용 (MCP apply_migration: security_board_assets_lockdown)
-- 감사 docs/audit/2026-10/axis-3-security.md C-3:
--   board_assets_insert/update/delete 정책이 roles=public + bucket 조건뿐 → 비로그인도 업로드·덮어쓰기·삭제 가능했다.
-- 실제 쓰기 경로는 전부 서버:
--   /api/board/upload (requireMember + service_role) · lib/supabase/board.ts (service_role)
--   /api/intra/programs/rounds/[id] 클라이언트 로고 (createSignedUploadUrl — 서명 업로드는 정책과 무관)
--   Scripts/*-import.mjs (service_role)
-- → 쓰기 정책 삭제. service_role은 RLS를 우회하므로 영향 없음. 읽기(board_assets_read)·public 버킷은 유지 (공개 이미지).
-- 재실행 가능.

DROP POLICY IF EXISTS board_assets_insert ON storage.objects;
DROP POLICY IF EXISTS board_assets_update ON storage.objects;
DROP POLICY IF EXISTS board_assets_delete ON storage.objects;
