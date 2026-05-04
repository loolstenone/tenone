-- ============================================================
-- 대학생 시간표 템플릿 (세션 105 — 누락 보완)
-- ============================================================

INSERT INTO myverse_templates (key, category, subcategory, label, description, body_md, role_tags) VALUES
('class_timetable', 'note', '학습', '학기 시간표', '월~금 × 1~9교시 — 과목·강의실·교수',
'## 학기 정보
- 학기:
- 시작일 / 종료일:
- 총 학점:

## 시간표
| 교시 | 시간 | 월 | 화 | 수 | 목 | 금 |
|---|---|---|---|---|---|---|
| 1 | 09:00–09:50 | | | | | |
| 2 | 10:00–10:50 | | | | | |
| 3 | 11:00–11:50 | | | | | |
| 4 | 12:00–12:50 | | | | | |
| — | 점심 | — | — | — | — | — |
| 5 | 13:00–13:50 | | | | | |
| 6 | 14:00–14:50 | | | | | |
| 7 | 15:00–15:50 | | | | | |
| 8 | 16:00–16:50 | | | | | |
| 9 | 17:00–17:50 | | | | | |

> 셀 형식 예: "**자료구조** 304 / 김교수"

## 과목 상세
| 과목명 | 학점 | 교수 | 강의실 | 평가 |
|---|---|---|---|---|
| | | | | |

## 공강·이동 메모
- 월요일 공강:
- 점심 시간:
- 도서관·스터디 가능 슬롯:

## 비대면·실험·실습 일정
- ',
ARRAY['student'])

ON CONFLICT (key) DO UPDATE SET
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    body_md = EXCLUDED.body_md,
    role_tags = EXCLUDED.role_tags;
