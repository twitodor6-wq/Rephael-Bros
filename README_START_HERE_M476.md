# האחים רפאל — M4.7.6

פתח `dist/Rafael_Brothers_M476_FULL_RUN_ACCEPTANCE.html` בדפדפן. קובץ עצמאי ושחיק. המיילסטון מאמת את Stage01 כרצף: שש ריצות מקלדת מלאות עברו ב־Chromium Canvas, רפי ושאול ×Manual/Classic/Hybrid. יש גלריית סרטונים עצמאית M476_GAMEPLAY_GALLERY.html.

Enter התחלה; חצים/A,D תנועה; Space קפיצה; Tab החלפת דמות; J פטיש/חיתוך רשת; E חיבור ושחרור הסרט; למעלה/למטה כוונון; K מקדחה לאחר איסוף; R אתחול; F3 טלמטריה. המקדחה מתחת למדף: יורדים מקצהו הימני וחוזרים תחתיו. לוח Stage Modules מפעיל/מכבה את הרכיבים הקיימים.

הכוונת היער עודכנה; פיזיקה, מצלמה ואתגרים נשמרו. נוחות/הנאה ואישור אנושי עדיין לא נבדקו. WebGL smoke עבר, אבל ריצה מלאה בו NOT PROVEN; Safari לא נבדק. קרא את QA/HANDOFF/KNOWN_ISSUES לפני המשך.

`npm run build`, `npm test`, `npm run qa:full`, `npm run qa:acceptance`, `npm run qa:release`. נדרשים Playwright ודפדפן/ffmpeg לבדיקות והקלטות. לשחזור המלא של M475: `python3 scripts/rollback-to-m475.py /new/destination`.
