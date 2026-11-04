# Rafael Brothers — M4.7.7-S2 Enemy Prefab Standardization

נקודת מוצא: GitHub `twitodor6-wq/Rephael-Bros`, commit `497b4a8`, ענף `dev/m477-s2-enemy-prefabs`, מסירת M477-S1.

- `npm run build` — בונה `dist/Rafael_Brothers_M477_S2_ENEMY_PREFABS.html`, HTML עצמאי להפעלה מקומית.
- `npm test` — בדיקות Node; אין שלב TypeScript בפרויקט המקור הנוכחי.
- `npm run qa:s2` — smoke של Phaser/Chromium. נדרש `npm install` ו־`npx playwright install chromium`; אפשר להגדיר `CHROMIUM_PATH`.
- בדיקות S1 שב־`tests/m477-*.cjs` משתמשות כעת ב־HTML של S2 דרך ה־harness. `RB_HTML` מאפשר לבחור קובץ אחר במפורש.

קרא `M477_S2_HANDOFF.md`, `M477_S2_QA_REPORT.md`, `M477_S2_KNOWN_ISSUES.md` ו־`docs/ENEMY_PREFAB_CONTRACT.md`.

סטטוס: הבנייה ובדיקות Node עברו. בדיקות דפדפן חדשות חסומות בסביבת המסירה; אין כאן אישור משחקיות מלא. אין למזג אוטומטית.
