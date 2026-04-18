UPDATE badak_fee_configs SET note = 'S등급 바닥장 — 바닥장 수령 85%' WHERE scope = 'level' AND level_code = 'S';
UPDATE badak_fee_configs SET note = 'A등급 바닥장 — 바닥장 수령 80%' WHERE scope = 'level' AND level_code = 'A';
UPDATE badak_fee_configs SET note = 'B등급 바닥장 — 바닥장 수령 75%' WHERE scope = 'level' AND level_code = 'B';
UPDATE badak_fee_configs SET note = 'C등급 바닥장 — 바닥장 수령 70%' WHERE scope = 'level' AND level_code = 'C';
UPDATE badak_fee_configs SET note = '기본 수수료 25%' WHERE scope = 'default';
