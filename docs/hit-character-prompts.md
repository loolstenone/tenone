# HIT 64유형 캐릭터 일러스트 — AI 이미지 생성 프롬프트

> Midjourney / DALL-E / Stable Diffusion 용
> 스타일: 도형 기반 미니멀 일러스트, 투명 배경, 젊은 느낌

## 공통 프롬프트 베이스

```
Minimal geometric character illustration, full body, transparent background,
young professional style, clean lines, flat design, no text,
personality-reflecting color palette, friendly and approachable,
Korean marketing talent concept --ar 3:4 --style raw
```

## DISC 색상 매핑
- D (주도성): Red accent (#E53935)
- I (사교성): Amber accent (#FFB300)
- S (안정성): Green accent (#43A047)
- C (신중성): Blue accent (#1E88E5)

## 64유형 개별 프롬프트

### D 기반 (16유형)

**D-ISTJ · Duty Knight**
Geometric character, disciplined knight silhouette, sharp triangular shapes,
red and gray palette, holding a shield with checklist icon,
structured and reliable appearance --ar 3:4

**D-ISFJ · Guardian Nanny**
Geometric character, warm guardian figure, pentagon body shape,
red and soft pink palette, nurturing posture with protective arms,
gentle but determined expression --ar 3:4

**D-INFJ · Vision Mentor**
Geometric character, wise mentor figure, elongated diamond shape,
red and deep purple palette, third eye symbol, glowing aura,
spiritual leader vibe --ar 3:4

**D-INTJ · Iron Innovator**
Geometric character, armored inventor figure, angular hexagonal shapes,
red and dark steel palette, visor helmet, blueprint scroll,
strategic and powerful stance --ar 3:4

**D-ISTP · Shadow Operative**
Geometric character, stealth agent figure, sharp angular body,
red and black palette, tactical gear silhouette,
cool and calculated presence --ar 3:4

**D-ISFP · Wild Pathfinder**
Geometric character, nature explorer, organic curved shapes,
red and earth tone palette, compass and trail markers,
free-spirited adventurer --ar 3:4

**D-INFP · Hopebringer Pilot**
Geometric character, dreamy pilot figure, star and cloud shapes,
red and sky blue palette, paper airplane in hand,
hopeful and idealistic expression --ar 3:4

**D-INTP · Aether Arcanist**
Geometric character, mystical scholar, circular and spiral shapes,
red and indigo palette, floating geometric formulas,
deep thinker appearance --ar 3:4

**D-ESTP · Maverick Raid-Captain**
Geometric character, bold captain figure, dynamic angular pose,
red and orange palette, action-ready stance,
energetic and daring --ar 3:4

**D-ESFP · Wave-Runner**
Geometric character, surfer/performer figure, wave-like curves,
red and tropical palette, dynamic movement pose,
joyful and spontaneous --ar 3:4

**D-ENFP · Kung-Fu Dreamer**
Geometric character, martial artist dreamer, circular motion lines,
red and golden palette, creative fighting stance,
passionate and imaginative --ar 3:4

**D-ENTP · Trickster Tactician**
Geometric character, clever strategist, puzzle piece shapes,
red and electric blue palette, mischievous smirk,
quick-witted inventor --ar 3:4

**D-ESTJ · Academy Marshal**
Geometric character, military academy leader, rectangular structured shapes,
red and navy palette, medals and order symbols,
disciplined commander --ar 3:4

**D-ESFJ · Elastic Protector**
Geometric character, stretching hero figure, flexible oval shapes,
red and warm yellow palette, arms reaching to help,
caring and responsive --ar 3:4

**D-ENFJ · Starlight Commander**
Geometric character, charismatic leader, star-burst shapes,
red and golden light palette, inspiring pose with raised hand,
magnetic personality --ar 3:4

**D-ENTJ · Global Architect**
Geometric character, world-builder figure, globe and blueprint shapes,
red and dark blue palette, commanding stance over city skyline,
visionary leader --ar 3:4

### I 기반 (16유형) — Amber 팔레트
(같은 패턴으로 amber/#FFB300 기반)

### S 기반 (16유형) — Green 팔레트
(같은 패턴으로 green/#43A047 기반)

### C 기반 (16유형) — Blue 팔레트
(같은 패턴으로 blue/#1E88E5 기반)

## 사용 방법

1. Midjourney에서 각 프롬프트 실행
2. --ar 3:4 비율로 생성
3. 투명 배경 버전 추출
4. 400x533px로 리사이즈
5. `/public/characters/{type_code}.png`에 저장
6. `hit_hero_types` 테이블의 `illustration_url` 업데이트

## 파일명 규칙
```
D-ISTJ.png, D-ISFJ.png, ... D-ENTJ.png
I-ISTJ.png, I-ISFJ.png, ... I-ENTJ.png
S-ISTJ.png, S-ISFJ.png, ... S-ENTJ.png
C-ISTJ.png, C-ISFJ.png, ... C-ENTJ.png
```
