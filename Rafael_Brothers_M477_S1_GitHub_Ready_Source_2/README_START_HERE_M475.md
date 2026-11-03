# האחים רפאל — M4.7.5

פתח `dist/Rafael_Brothers_M475_CAMERA_STABILITY.html` בדפדפן. HTML עצמאי, ללא שרת.

Enter מתחיל; חצים/A,D תנועה; Space קפיצה; J פטיש; K מקדחה לאחר איסוף; E חיבור/שחרור סרט; למעלה/למטה כוונון הסרט; Tab החלפת דמות; R אתחול; F3 טלמטריה. Stage Modules כולל Depth ו־Web Response. Manual / Classic / Hybrid נשמרו.

הרקע מגיב כעת רק למצלמה, עם מקדמי עומק מתונים מתוך Stage JSON. תגובת הקורים המקומית הופרדה ממיקום שכבות היער. אין שינוי לפיזיקת השחקן/הסרט או למצלמה. M475_VIDEO_COMPARISON.html כולל סרטונים לפני/אחרי ובמצב Depth OFF; קרא את מגבלות התיעוד בדוח QA.

`npm run build`, `npm test`, `npm run qa:all`. הדוח מפריד בין בדיקות קוד, בדיקות דפדפן אוטומטיות ואישור אנושי שלא בוצע. עיין ב־M475_HANDOFF.md וב־M475_KNOWN_ISSUES.md לפני המשך עבודה. שחזור M474: `python3 scripts/rollback-to-m474.py /new/destination`.
