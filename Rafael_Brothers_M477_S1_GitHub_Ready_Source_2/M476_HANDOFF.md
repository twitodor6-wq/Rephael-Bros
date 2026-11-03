# M4.7.6 — HANDOFF

קרא את README_START_HERE_M476.md, M476_QA_REPORT.md, M476_KNOWN_ISSUES.md ו־docs/m476/REVIEW_AND_FIXES.md. מקור ההמשך הוא המילסטון הזה; M475 נשמר לשחזור.

## מה הושלם

שש ריצות Canvas רציפות מה־Spawn המקורי ועד סיום אמיתי, ללא חיבור מקטעים/Teleport/מהירות מוזרקת. driver: tests/m476-fullrun.cjs. הוא בוחר מצב דרך הממשק, משתמש ב־Tab לפי הצורך ואז מפעיל מקשי משחק בלבד. צופה פריימים/DOM לקריאה בלבד; scripts/m476-audit-fullruns.cjs מאמת נתיב, רציפות, שחקן/מצב, כלים, עוגנים וסיום. סרטונים/JSON תחת evidence/m476; גלריה עצמאית כוללת שש ריצות.

שני תיקוני הכוונה בלבד: שם/הודעות היער מחליפים את Sandbox; הודעה מסבירה שהמקדחה מתחת למדף. Stage.guidance הוא המקור. stage-loader מאמת ומעתיק; forest-extension מזין את מערכת hints/areas הקיימת ומשחזר את הטקסט המקורי בפירוק. אין רכיב חדש או העברת בעלות לפיזיקה. המקור המינימלי של Game Core לא נערך; רק כיתוב המיילסטון בבנייה שונה.

הוראות Build: npm run build. בדיקות Node: npm test. qa:full מפעיל שש ריצות עם הקלטות (Playwright/Chromium/ffmpeg נדרשים). qa:acceptance מפעיל את המטריצה הנוספת. qa:release מאמת ראיות קיימות כנגד התוצר/המקור ומסרב לראיות ישנות; אינו מחליף ריצה של הבדיקות. CHROMIUM_PATH מפנה לדפדפן; אפשר PLAYWRIGHT_MODULE או התקנת devDependencies רגילה. הקלטת Playwright דורשת ffmpeg שהותקן עם סביבת הדפדפן.

בדיקות partial/fixtures מוצהרות ונשמרו בנפרד: stability, switch-swing, local-web, visual-controls, hazards/lifecycle. הימנע משימוש ב־setup של ה־harness בתוך ריצה מלאה: הוא מכיל מיקום התחלה לצורך בדיקות חלקיות בלבד. אין להמיר הצלחת fixtures להוכחת משחקיות.

## מגבלות

WebGL type2 smoke עבר. שני ניסיונות full-file WebGL נכשלו ב־timeout בנדנוד הראשון; לא אושר רינדור זה לריצה מלאה. שמור אותם בנפרד מ־full-<actor>-<mode>. Human/Safari NOT TESTED. אין להציג ריצות אוטומטיות כהנאה או קריאות מאושרות.

## Rollback

scripts/rollback-to-m475.py NEW_DESTINATION משחזר את חבילת M475 שסופקה לתיקייה חדשה בלבד, עם inventory ו־delta bytes וחתימות SHA-256. אינו דורס את המיילסטון הנוכחי. אין להפעיל builder היסטורי כדרך לשחזור: הוא יערבב מקורות חדשים עם גרסה ישנה.

## המלצה לאחר שער QA

מיילסטון התוכן הממוקד הבא: מטרה אחת ברורה למקדחה בתוך היער הקיים, באמצעות מנגנון הקליפה הקיים, לאחר משוב משחק אנושי. אין צורך בעוד סבב תשתיות/Forge או שלב שני כדי להתקדם בהבנת הכלים.
