-- ============================================================
-- 사용자 lools@tenone.biz (전천일) 이력서 데이터 prefill
-- 출처: 전천일 이력서 010-2795-1001 2024.pdf
-- ============================================================

DO $$
DECLARE
    v_member_id UUID;
BEGIN
    SELECT id INTO v_member_id FROM members WHERE email = 'lools@tenone.biz' LIMIT 1;
    IF v_member_id IS NULL THEN
        RAISE NOTICE 'member not found';
        RETURN;
    END IF;

    -- planners_identities row 보장
    INSERT INTO planners_identities (member_id) VALUES (v_member_id)
    ON CONFLICT (member_id) DO NOTHING;

    UPDATE planners_identities SET resume = jsonb_build_object(
        'personal', jsonb_build_object(
            'name_ko', '전천일',
            'name_en', 'Cheonil, Jeon',
            'name_hanja', '全天日',
            'birth', '1975-07-18',
            'address', '150-836 서울시 영등포구 문래로 84 102동 601호 (문래힐스테이트)',
            'phone', '010-2795-1001',
            'email', 'lools@tenone.biz',
            'homepage', 'http://www.tenone.biz'
        ),
        'education', jsonb_build_array(
            jsonb_build_object('id','edu_1','period','2022.08','school','경희대학교 경영대학원','major','경영컨설팅학과 (브랜드 관리 전공)','status','석사 졸업'),
            jsonb_build_object('id','edu_2','period','2002.02','school','한성대학교','major','산업공학과','status','학사 졸업'),
            jsonb_build_object('id','edu_3','period','1994.02','school','배문고등학교','status','졸업'),
            jsonb_build_object('id','edu_4','period','1990.02','school','용산중학교','status','졸업'),
            jsonb_build_object('id','edu_5','period','1988.02','school','용산초등학교','status','졸업')
        ),
        'military', jsonb_build_object(
            'period', '1997.07.01 ~ 1999.08.31',
            'status', '만기 제대'
        ),
        'career', jsonb_build_array(
            jsonb_build_object('id','car_1','period','2022.01 ~ 현재','company','HS Ad','role','사업 혁신팀 팀장','description',''),
            jsonb_build_object('id','car_2','period','2013.01 ~ 2021.12','company','HS Ad','role','디지털캠페인팀 팀장','description','LG 전자 (MC, HE, GSMC), LG생활건강, LG U+, LG화학, 대한항공, KTO, 용감한 형제, 보건복지부, 홈플러스, 페르노리카 발렌타인'),
            jsonb_build_object('id','car_3','period','2010.02 ~ 2012.12','company','DDB Korea','role','광고 기획팀 부장','description','KEB, 필립스 전자(+아벤트, 소닉케어), 한국존슨앤드존슨메디칼, 벨그룹, 캐나다 관광청, 레고, 맥도날드, 제스프리, 원자력 병원, Intel, 리바이스'),
            jsonb_build_object('id','car_4','period','2008.06 ~ 2010.02','company','웰콤 퍼블리시스 다이알로그','role','광고 기획팀 차장','description','씨티은행, 씨티카드, 씨티파이낸셜, 유한킴벌리'),
            jsonb_build_object('id','car_5','period','2006.05 ~ 2008.05','company','Lee&DDB · 디트라이브','role','광고 기획팀 차장','description','MSD 제약, LG CYON, 필립스, 한독약품, 원자력 병원'),
            jsonb_build_object('id','car_6','period','2004.02 ~ 2006.04','company','더브랜딩코리아 (branding Korea)','role','브랜딩 기획 팀장','description','보령메디앙스, 충주시, 엔텍, 중앙C&C'),
            jsonb_build_object('id','car_7','period','2003.01 ~ 2004.02','company','SBNC㈜','role','컨설팅 사업부 컨설턴트','description','의료마케팅 컨설팅 (A+치과 병원, 손기학 성형외과)'),
            jsonb_build_object('id','car_8','period','2001.12 ~ 2002.12','company','BrandFactory','role','컨설턴트','description','브랜드 네임 개발 (아모레퍼시픽 등)')
        ),
        'awards', jsonb_build_array(
            jsonb_build_object('id','aw_1','year','2022','title','국민이 선택한 좋은 광고상 대상 (디지털 부문)','project','나는 내가 노담이면 좋겠어','client','보건복지부'),
            jsonb_build_object('id','aw_2','year','2021','title','서울영상광고제 동상','project','담배는 노답, 나는 노담','client','보건복지부'),
            jsonb_build_object('id','aw_3','year','2021','title','한국광고대상 동상','project','노담 태그','client','보건복지부'),
            jsonb_build_object('id','aw_4','year','2021','title','부산국제광고제 은상','project','필더 리듬','client','한국관광공사'),
            jsonb_build_object('id','aw_5','year','2021','title','디지털애드어워즈 디지털영상 대상','project','문어지지지마','client','LG유플러스'),
            jsonb_build_object('id','aw_6','year','2021','title','에피어워드','project','필더리듬 / 담배는 노답, 나는 노담','client','한국관광공사 / 보건복지부'),
            jsonb_build_object('id','aw_7','year','2021','title','국민이 선택한 좋은 광고상 디지털 대상','project','필더 리듬','client','한국관광공사'),
            jsonb_build_object('id','aw_8','year','2016','title','대한민국 광고대상 대상 (IMC 부문)','project','프랑스 게스트 하우스','client','대한항공'),
            jsonb_build_object('id','aw_9','year','2015','title','대한민국 광고대상 은상 / NY Film Festival final / 부산국제광고제 final / 서울영상광고제 동상','project','Who ruined Jenny''s Wedding','client','LG 전자'),
            jsonb_build_object('id','aw_10','year','2014','title','Effie Awards Korea 전체 대상','project','내가 사랑한 유럽 Top 10','client','대한항공'),
            jsonb_build_object('id','aw_11','year','2009','title','대한민국 광고대상 우수상 (인쇄 잡지 부문)','project','그린핑거 마이키즈','client','유한킴벌리')
        ),
        'experience_areas', jsonb_build_array(
            jsonb_build_object('id','ex_1','area','ATL','description','TV·신문·잡지·라디오 등 4대 매체 광고'),
            jsonb_build_object('id','ex_2','area','BTL','description','프로모션·전시'),
            jsonb_build_object('id','ex_3','area','디지털','description','사이트 개발·모바일 연계 프로모션 (제스프리, 레고, 맥도날드, 리바이스)'),
            jsonb_build_object('id','ex_4','area','브랜드 컨설팅','description','소비자 조사 및 컨셉 개발 (먼디파마, 그로헤)'),
            jsonb_build_object('id','ex_5','area','기타','description','CRM·전시·Shopper 마케팅·브랜드 네임/BI/CI 개발')
        ),
        'brand_categories', jsonb_build_array(
            jsonb_build_object('id','bc_1','category','금융','brands','Citi 은행/카드/파이낸셜, KEB 외환은행 카드'),
            jsonb_build_object('id','bc_2','category','육아','brands','필립스 아벤트, 유한킴벌리 그린핑거'),
            jsonb_build_object('id','bc_3','category','헬스케어','brands','MSD 자궁경부암 캠페인, 존슨앤드존슨 메디칼 혈당측정기 원터치, 원자력병원, 먼디파마 살균소독제 포비돈, 한독제약 여드름 치료제 크레오신 티, 금연캠페인, 대한대장항문학회 대장암 캠페인, 국립암센터 유방암 캠페인'),
            jsonb_build_object('id','bc_4','category','전자','brands','필립스 전자, LG 전자 (스마트폰·TV 등), Intel'),
            jsonb_build_object('id','bc_5','category','식품','brands','제스프리, 맥도날드, 페르노리카 발렌타인'),
            jsonb_build_object('id','bc_6','category','유통','brands','배달의 민족, 홈플러스'),
            jsonb_build_object('id','bc_7','category','의류','brands','리바이스, 나이키 골프'),
            jsonb_build_object('id','bc_8','category','장난감','brands','레고')
        ),
        'lectures', jsonb_build_array(
            jsonb_build_object('id','lec_1','org','KT&G 상상 Univ 마케팅 스쿨','topic','전국 5개 대학 특강'),
            jsonb_build_object('id','lec_2','org','서울경제진흥원','topic','IP벤처 특강'),
            jsonb_build_object('id','lec_3','org','서울시설관리공단','topic','특강'),
            jsonb_build_object('id','lec_4','org','한국디지털광고협회','topic','온라인광고대상 특강'),
            jsonb_build_object('id','lec_5','org','보건복지인재원','topic','특강'),
            jsonb_build_object('id','lec_6','org','인천대·가천대·제주대·연합 동아리','topic','대상 특강'),
            jsonb_build_object('id','lec_7','org','(주)LG·대한항공','topic','대상 특강')
        ),
        'judging', jsonb_build_array(
            jsonb_build_object('id','jud_1','period','2009','org','국가 브랜드 위원회'),
            jsonb_build_object('id','jud_2','period','2020~2021','org','서울시설관리공단'),
            jsonb_build_object('id','jud_3','period','2020~2024','org','한국관광공사'),
            jsonb_build_object('id','jud_4','period','2020~2024','org','서울경제진흥원 (SBA)')
        ),
        'side_projects', jsonb_build_array(
            jsonb_build_object('id','sp_1','status','active','period','2022.08 ~','name','YouInOne (YouInOne.com)','description','프로젝트 그룹 운영'),
            jsonb_build_object('id','sp_2','status','active','period','2022.08 ~','name','MAD League (MADleague.net)','description','마케팅·광고·디지털 전국 대학생 역량 경쟁 플랫폼'),
            jsonb_build_object('id','sp_3','status','active','period','2022.02 ~','name','MADLeap (MAdLeap.co.kr)','description','마케팅·광고·디지털 대학생연합동아리 운영'),
            jsonb_build_object('id','sp_4','status','active','period','2020.06 ~','name','Badak (badak.biz)','description','마케팅&광고 업계 커뮤니티 운영'),
            jsonb_build_object('id','sp_5','status','ended','period','~ 2004.01','name','Trend Hunter (www.trendhunter.co.kr)','description','마케팅적 가치가 있는 트렌드 정보 제공 사이트, 마스터'),
            jsonb_build_object('id','sp_6','status','ended','period','~ 2004.01','name','오피니언스 (www.opinions.co.kr)','description','각 분야 매니아·전문가의 지식 공유 커뮤니티, 마스터'),
            jsonb_build_object('id','sp_7','status','ended','period','~ 2004.01','name','Brand DB (www.branddb.com)','description','Brand name·CI·BI 정보 포털, 마스터'),
            jsonb_build_object('id','sp_8','status','ended','period','~ 2002.04','name','Brand Times (www.brandtimes.co.kr)','description','BrandHaus.com journal 확대 개편 — 웹 기반 개인 웹진, 마스터'),
            jsonb_build_object('id','sp_9','status','ended','period','~ 2002.02','name','Econosports (www.econosports.net)','description','한성대 이영훈 교수와 2002 월드컵·아시안게임 대비 스포츠 경제 사이트'),
            jsonb_build_object('id','sp_10','status','ended','period','~ 2001.10','name','브랜드 공작소 (www.brandfactory.co.kr)','description','Daum 카페 최대 브랜드 커뮤니티 시삽 → 브랜드 캠퍼스로 변경')
        )
    )
    WHERE member_id = v_member_id;

    RAISE NOTICE 'resume prefilled for member %', v_member_id;
END $$;
