-- MADLeague 7개 동아리 로고 URL 업데이트
-- 실행 위치: Supabase Dashboard > SQL Editor
UPDATE mad_clubs SET logo_url = '/logos/madleague/madleap.png' WHERE slug = 'madleap';
UPDATE mad_clubs SET logo_url = '/logos/madleague/pam.png'     WHERE slug = 'pam';
UPDATE mad_clubs SET logo_url = '/logos/madleague/adlle.jpg'   WHERE slug = 'adlle';
UPDATE mad_clubs SET logo_url = '/logos/madleague/abc.png'     WHERE slug = 'abc';
UPDATE mad_clubs SET logo_url = '/logos/madleague/suzak.png'   WHERE slug = 'suzak';
UPDATE mad_clubs SET logo_url = '/logos/madleague/pad.png'     WHERE slug = 'pad';
UPDATE mad_clubs SET logo_url = '/logos/madleague/adzone.png' WHERE slug = 'adzone';
