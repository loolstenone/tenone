-- Jakka 마켓 더미 상품 20개
-- 날짜: 2026-04-20

INSERT INTO jakka_products (
    creator_id, title, description, category, price, currency,
    thumb_url, is_limited, stock, sold_count, status,
    dimensions, material, production_year, edition_number, edition_total,
    is_signed, has_certificate
) VALUES
-- 1. 하린 - 원화
('dd000001-0000-0000-0000-000000000001', '새벽 3시의 창문',
 '푸른빛이 번지는 새벽, 혼자 깨어 창밖을 바라보던 순간을 담았습니다. 고요함 속의 작은 떨림.',
 '원화', 1800000, 'KRW',
 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800',
 true, 1, 0, 'active',
 '60 × 80 cm', '캔버스에 유채', 2024, 1, 1, true, true),

-- 2. 유나 - 일러스트/프린트
('dd000003-0000-0000-0000-000000000003', '고양이와 달',
 '달빛 아래 졸고 있는 고양이. 디지털 일러스트 파인아트 프린트.',
 '프린트', 75000, 'KRW',
 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
 true, 30, 4, 'active',
 'A3 (297 × 420 mm)', '헴프 아카이벌 페이퍼 310gsm', 2025, NULL, 50, true, false),

-- 3. 민서 - 사진
('dd000004-0000-0000-0000-000000000004', '제주, 바람의 결',
 '제주 동쪽 해안의 바람과 빛. 실버 젤라틴 프린트 한정 에디션.',
 '사진', 320000, 'KRW',
 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800',
 true, 10, 2, 'active',
 '40 × 60 cm', '실버 젤라틴 프린트, 아카이벌 마운트', 2023, 3, 15, true, true),

-- 4. 지우 - 굿즈
('dd000005-0000-0000-0000-000000000005', '일상 스티커팩 Vol.2',
 '매일 쓰는 작은 표정들. 다이컷 스티커 24장 세트.',
 '굿즈', 12000, 'KRW',
 'https://images.unsplash.com/photo-1611048268330-53de574cae3b?w=800',
 false, 200, 47, 'active',
 '150 × 210 mm (세트)', '방수 PVC 스티커', 2025, NULL, NULL, false, false),

-- 5. 태호 - 포스터
('dd000007-0000-0000-0000-000000000007', 'Night Drive',
 '90년대 시티팝 무드의 그래픽 포스터. 네온과 크롬.',
 '포스터', 45000, 'KRW',
 'https://images.unsplash.com/photo-1544928931-45857b7e2dca?w=800',
 true, 50, 12, 'active',
 'B2 (500 × 707 mm)', '무광 아트지 250gsm', 2024, NULL, 100, true, false),

-- 6. 오브라 - NFT
('dd000006-0000-0000-0000-000000000006', 'Genesis #001',
 '온체인 제너러티브 아트. Ethereum 메인넷.',
 'NFT', 0.45, 'ETH',
 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800',
 true, 1, 0, 'active',
 '4000 × 4000 px', 'On-chain SVG', 2025, 1, 1, false, true),

-- 7. 서준 - 피규어
('dd000002-0000-0000-0000-000000000002', 'Astronaut Mini',
 '1/12 스케일 아트토이. 레진 수작업 채색.',
 '피규어', 180000, 'KRW',
 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800',
 true, 20, 5, 'active',
 '높이 150 mm', '폴리레진, 수작업 채색', 2024, NULL, 30, true, true),

-- 8. 소미 - 프린트 (타이포)
('dd000008-0000-0000-0000-000000000008', 'Type as Landscape',
 '한글 타이포그래피 시리즈. "산이 되는 글자".',
 '프린트', 88000, 'KRW',
 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800',
 false, 80, 9, 'active',
 'A2 (420 × 594 mm)', '코튼 레그 페이퍼', 2025, NULL, NULL, true, false),

-- 9. 나무 - 원화
('dd000009-0000-0000-0000-000000000009', '숲의 기억',
 '수채와 목탄으로 기록한 숲. 여름에서 가을로 넘어가는 공기.',
 '원화', 950000, 'KRW',
 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800',
 true, 1, 0, 'active',
 '45 × 60 cm', '캔버스에 수채, 목탄', 2024, 1, 1, true, true),

-- 10. 류다은 - 굿즈
('dd000010-0000-0000-0000-000000000010', '드로잉 엽서 세트',
 '여행지에서 그린 드로잉 10장. 봉투 포함.',
 '굿즈', 18000, 'KRW',
 'https://images.unsplash.com/photo-1558882224-dda166733046?w=800',
 false, 150, 33, 'active',
 '100 × 148 mm × 10장', '매트 카드지 300gsm', 2024, NULL, NULL, true, false),

-- 11. 최현우 - 포스터
('dd000011-0000-0000-0000-000000000011', 'Brand is a Feeling',
 '브랜드와 감정에 관한 타이포 포스터.',
 '포스터', 35000, 'KRW',
 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
 false, 100, 22, 'active',
 'A2 (420 × 594 mm)', '매트지 200gsm', 2025, NULL, NULL, false, false),

-- 12. 강지현 - 피규어 (3D)
('dd000012-0000-0000-0000-000000000012', 'Low Poly Bear',
 '로우폴리 곰 피규어. 3D 프린트 + 수작업 샌딩/도장.',
 '피규어', 95000, 'KRW',
 'https://images.unsplash.com/photo-1530653333484-8fc63dea73a4?w=800',
 true, 15, 6, 'active',
 '높이 110 mm', 'PLA 3D 프린트, 아크릴 채색', 2024, NULL, 25, true, false),

-- 13. 도치 - 프린트 (만화풍)
('dd000013-0000-0000-0000-000000000013', '오늘의 기분',
 '매일 그린 한 컷. 만화풍 일상 드로잉 프린트.',
 '프린트', 28000, 'KRW',
 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
 false, 120, 18, 'active',
 'A4 (210 × 297 mm)', '반광 아트지', 2025, NULL, NULL, false, false),

-- 14. 원호 - 사진
('dd000014-0000-0000-0000-000000000014', 'Tokyo, 3 AM',
 '도쿄 신주쿠 뒷골목. 새벽의 네온과 비.',
 '사진', 280000, 'KRW',
 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800',
 true, 8, 1, 'active',
 '50 × 75 cm', 'C-프린트, 알루미늄 마운트', 2023, 2, 12, true, true),

-- 15. 선연 - 원화
('dd000015-0000-0000-0000-000000000015', '정물, 오후 4시',
 '테이블 위에 놓인 사과와 레몬. 빛이 길어지는 오후.',
 '원화', 1200000, 'KRW',
 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
 true, 1, 0, 'active',
 '50 × 60 cm', '캔버스에 유채', 2024, 1, 1, true, true),

-- 16. 주주 - 굿즈
('aaaaaaaa-0001-0001-0001-000000000001', '주주 마스킹 테이프',
 '주주 캐릭터 마스킹 테이프 3종 세트.',
 '굿즈', 9500, 'KRW',
 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800',
 false, 300, 88, 'active',
 '15 mm × 10 m × 3롤', '일본산 와시지', 2025, NULL, NULL, false, false),

-- 17. 유나 - NFT
('dd000003-0000-0000-0000-000000000003', 'Moon Cat Collection #12',
 '달 고양이 NFT 컬렉션 중 12번. Polygon 네트워크.',
 'NFT', 0.08, 'ETH',
 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
 true, 1, 0, 'active',
 '2048 × 2048 px', 'PNG, IPFS 저장', 2025, 12, 100, false, true),

-- 18. 소미 - 포스터
('dd000008-0000-0000-0000-000000000008', '한글 실험 시리즈 01',
 '자음의 해체와 재조립. 실크스크린 수작업.',
 '포스터', 150000, 'KRW',
 'https://images.unsplash.com/photo-1569096651661-820d0de8b4ab?w=800',
 true, 20, 3, 'active',
 'B2 (500 × 707 mm)', '실크스크린 2도, 아르쉬 페이퍼', 2024, 5, 30, true, true),

-- 19. 하린 - 프린트
('dd000001-0000-0000-0000-000000000001', '창문 시리즈 프린트',
 '원화 "새벽 3시의 창문"의 공인 아카이벌 프린트.',
 '프린트', 180000, 'KRW',
 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800',
 true, 25, 7, 'active',
 '40 × 54 cm', '하네뮬레 아카이벌 페이퍼', 2024, NULL, 30, true, true),

-- 20. 나무 - 굿즈 (sold out)
('dd000009-0000-0000-0000-000000000009', '숲 노트북',
 '숲 드로잉이 커버에 인쇄된 하드커버 노트. 160p.',
 '굿즈', 24000, 'KRW',
 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800',
 false, 0, 100, 'sold_out',
 'A5 (148 × 210 mm)', '하드커버, 크림지 160p', 2024, NULL, NULL, false, false);
