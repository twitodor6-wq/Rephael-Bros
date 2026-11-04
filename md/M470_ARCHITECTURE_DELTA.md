# M4.7.0 — Architecture Delta

## 1. Managed Encounter lifecycle

- `rotten-root` ו־`falling-bridge-tree` מחזירים כעת `createRBManagedActor`, עם `scope` בעל אחריות על graphics, zones, Phaser bodies/colliders, scene update/shutdown listeners, runtime references, StageV1 runtime bindings ועוגן מנוהל כ־lease בלבד. העוגן עצמו והסדר נשארים בבעלות `environmental-anchors`.
- `state` של rotten-root נשאר מצב משחק (`idle/warning/collapsed`). `lifecycleState` מייצג מצב מנוהל (`created/disabled/destroyed`), בלי שבירת snapshot/טריגרים קיימים. במקרה falling-tree יש `snapshot().state` ו־`lifecycleState`.
- `createRBManagedActor` הורחב ב־hooks אופציונליים `onReset/onDisable/onDestroy/stateProperty`; ההגדרות הישנות נשמרו כברירת מחדל. `scope.destroy()` מנקה הקצאות בסדר הפוך, וגם כשל יצירה מסיר הקצאות שכבר נרשמו.
- אין יצירת Registry חדש ואין שינוי בחוזה העוגנים. `SceneComposer` מנהל חמישה Actors (שלושת ה־M469 + שני האתגרים), 7 Stage bindings. במעבר Game מלא הכיבוי נעשה לפני Registry destruction; לא הוספנו Stage02.
- ניתן לבצע recreate לאתגרים במסגרת QA רק כשה־Registry חי. כשל recreate מנקה משאבים חלקיים אך לא משחזר אוטומטית את האתגר הישן. בייצור מסלול התאוששות בטוח הוא Restart של Game, ולא swap חי של Registry.

## 2. Isolated Stage v1 world fixture

- התחום היחיד שנוסף לסכמת v1 הוא `world.terrain` עם `surfaces` מלבניים בעלי ID יציב ו־`pits` כאינטרוולים בעלי ID יציב. בדיקות מבניות ובדיקות צולבות מזהות IDs כפולים, חריגה מגבולות, חפיפה בין בור לקרקע ובורות חופפים.
- `world.spawn` / `world.finish` קיימים בחוזה v1; `camera.bounds` ממומש עוד מ־M469. ה־fixture משתמש בהם בלי להוסיף תחומים חדשים לסכמת Production.
- `schemas/m470-world-fixture.schema.json` הוא חוזה מבודד הנגזר ממבנה Stage v1, אך מאפשר רשימות `objects/modules` ריקות ודורש start/finish/terrain. **הוא אינו תחליף ל־Stage01 inventory validation.**
- `compileRBWorldFixture(data)` מחזיר נתוני עולם מאומתים; `mountRBWorldFixture(scene,data)` יוצר גוף פיזיקה ו־Collider ממשיים לכל משטח, גוף overlap ליציאה, גבולות מצלמה, ו־Scope מנקה. `disable/reset/destroy` מנקים/משחזרים. המצלמה הקודמת משוחזרת בניקוי.
- הוכח בדפדפן ש־JSON mutation מזיז את גוף הקרקע, אזור היציאה וגבולות המצלמה; 16 הרכבות ופריקות אינן מגדילות Collider/StaticBody/DisplayObject לאחר frame cleanup.
- אין טעינה אוטומטית של fixture לתוך Stage01. אין שלב חדש או מעבר ייצור.

## 3. Untouched boundaries

`baseline/M46_RELEASE.html`, הנתונים `stages/s01.stage.json`, `src/transition-controller.mjs`, מודולי אויב/חבל, וה־Core המקורי נשארו זהים לפי hash מול M469. המנגנון החדש אינו משנה נוסחאות Phaser Arcade/Ninja Tape או הגדרות הישגים/אויבים.

## 4. Migration next

לאחר QA יעד: הרחבת יער השורשים, העברת מיקום העץ המתפורר מעל התהום דרך JSON בלי לשנות את מכניקת החבל, ויצירת רצף אתגרים מבוסס JSON. מעבר Stage ייצור נדחה עד לניקוי Game מלא, יכולת rollback של Session ו־assets.
