# חוזה מעבר ניסויי — M4.6.9

הבקר מבודד מ־Game. שתי הגדרות transition-experiment הן סצנות ניסוי בלבד, לא Stage02. המימוש אינו מספק מעבר ייצור, ממשק משתמש, ביטול פעולה, timeout או שמירה לדיסק.

## API
`createRBTransitionController({adapter, availablePrefabs, availableAssets})` מחזיר `prepare`, `transition`, `snapshot`.

- `await prepare(data, session)`: מאמת צורה, מזהים, רכיבים/נכסים וגבולות; מעתיק ומקפיא JSON, מכין נכסים לפני כל שינוי בסצנה פעילה ומחזיר token חד־פעמי של הבקר. שינוי בקלט המקורי לא משנה את המידע המוכן.
- `await transition(token)`: צורך token, משחרר סרט, פורק ומנקה את המופע הקודם, טוען מופע חדש ומחזיר snapshot עם busy=false רק לאחר סיום העבודה. אין מיחזור handle שכבר הצליח בעבר.
- בעת כשל בטעינה, כל handle חלקי שנרשם נמסר לניקוי, והסצנה הקודמת נבנית מחדש מהעותק הקפוא המקורי של data/session. הפעולה דוחה גם כשהשחזור הצליח; snapshot מציין את הסצנה המשוחזרת כ־ready. כשל שחזור משאיר failed ללא stageId פעיל ומדווח על שני הכשלים.
- כשל releaseTape לפני תחילת פריקה משאיר את הסצנה הקודמת נבחרת; Adapter חייב לשמור עליה כשירה. מרגע תחילת unload לא נעשה שימוש חוזר ב־handle הקודם.
- `snapshot()`: status/busy/stageId/epoch ואירועים קצובים ל־64. epoch עולה בכל מעבר שהתקבל; הכנת נתונים לבדה אינה מעלה epoch. אין החזרת Phaser objects או Session חי.

prepare ו־transition משתמשים ב־busy gate משותף, מסרבים לפעולה מתחרה ללא תור ומסרבים ל־token זר/משומש. אפשר להכין מועמדים חלופיים בזה אחר זה. ביקור חוזר באותו stageId חוקי; קטלוג ייצור עתידי יצטרך להבטיח שמזהים שונים אינם מצביעים בטעות על תוכן מתחרה.

## חובות Adapter

| Hook | חוזה |
| --- | --- |
| `prepareAssets(ids,data,session)` | מאמת זמינות ומכין נכסים לפני כל release/unload; כשל משאיר סצנה פעילה ללא שינוי. בעלות cache וניקוי כשל הכנה באחריות Adapter. |
| `releaseTape(handle)` | מנתק סרט לפני פירוק, או נכשל תוך שמירת מצב סצנה שניתן להמשיך ממנו. |
| `unload(handle)` | עוצר/מנתק סצנה. אין למחזר handle גם אם הפעולה זרקה שגיאה. |
| `load(data,session,registerPartial)` | יוצר handle חדש. חייב לרשום כל הקצאה חלקית מיד ולפני פעולה שעלולה לזרוק. ה־handle המוחזר מחזיק במשאבים הנותרים. |
| `dispose(handle)` | מנקה גם מצב חלקי וגם מצב שכבר נפרק. יכול להיקרא אחרי unload שהצליח או נכשל; נקרא לכל היותר פעם אחת לכל handle בניסיון מעבר. |

כל hook יכול להיות אסינכרוני. אם נרשמו handles שאינם ה־handle המוחזר, הם מנוקים לפני ready. אם load זורק בלי לרשום הקצאה, הבקר הכללי אינו יכול לגלות אותה. כשל dispose מצורף לשגיאה ולדיאגנוסטיקה; אין הבטחה לניקוי ואין ניסיון אוטומטי נוסף באותו מעבר. Adapter חייב לבדוק דליפה שדווחה.

## גבול הנתונים
סכמת הניסוי: schemaVersion 1.0.0, stageId, world מלבני, spawn/exit, objects/assets ומצלמה אופציונלית. JS מוסיף בדיקות ייחוד מזהים, זמינות Prefabs/Assets, הכרזת נכס לכל אובייקט ותחימת נקודות/מצלמה בעולם. ממדי Sprite אינם נבדקים; הנתונים מגדירים נקודות בלבד.

Session הוא בדיוק `{schemaVersion:'1.0.0', characterId:'rafi'|'shaul', gear:string[], progress:object}`. ציוד ללא כפילויות. מפתחות progress המותרים: visited, checkpoints, flags, counters, completedStageIds, collectibles; ערכיהם יכולים להיות JSON מקונן. זהו חוזה הובלה לניסוי ולא מיגרציית שמירה למשחק.

העתקה מסרבת למחזורים, instances של מחלקות/runtime, פונקציות, symbols, undefined, מספרים לא סופיים, getters/setters, תכונות נסתרות, sparse arrays ומפתחות prototype מסוכנים. אובייקטים פשוטים, null-prototype ומערכים רגילים מתקבלים ונקפאים רקורסיבית. Adapters אינם רשאים לשנות את העותקים.

## ראיות
בדיקות Node כוללות >=15 מחזורים וכשלי הכנה/פריקה/ניקוי/טעינה/שחזור, tokens זרים ופעולות מתחרות. בדיקת Chromium מפעילה 16 מעברים בין שתי הגדרות Phaser זעירות, עם timers/colliders/anchors והזרקת כשלי נכסים וטעינה. אין בכך הוכחת ניקוי ייצור של העולם, אויבים, אודיו וקלט ב־Game.

## M4.7.0 constraint

The world fixture and managed encounters are *not* a full Game transition adapter. The M469 tiny-scene test controller still operates only on isolated experimental scenes; no Game/Stage01 unload+asset ownership+Session migration readiness has been established. Production transitions remain NOT IMPLEMENTED.
