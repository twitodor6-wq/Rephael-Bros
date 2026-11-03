# האחים רפאל — M4.7.0: Managed Encounters & Isolated World Fixture

**מצב:** מיילסטון תשתיתי שנבדק בחלקים הרלוונטיים; כשל Hybrid היסטורי ברינדור רגיל נשאר פתוח ולא סווג כתיקון. פתיחת file:// נחסמה במדיניות בדיקות ולכן NOT TESTED בסביבה הנוכחית.

שחקו בקובץ `dist/Rafael_Brothers_M470_MANAGED_ENCOUNTERS.html` (Enter להתחלה, Tab להחלפת דמות, E לחבל, חצים לגלגול, R להפעלה מחדש ו־F3 לטלמטריה). זהו תוצר HTML עצמאי; ההרצה בפועל אומתה ב־Chromium באמצעות תוכן HTML, לא בפתיחת `file://`.

קודם קראו `HANDOFF.md`, `QA_REPORT.md`, `KNOWN_ISSUES.md`, `M470_ARCHITECTURE_DELTA.md` ו־`RELEASE_MANIFEST.json`.

## בנייה ובדיקות

```bash
npm run build
npm test
python3 tests/m470-schema-check.py
python3 tests/m470-browser-qa.py
python3 tests/m470-lifecycle-qa.py
python3 tests/m470-interactions-qa.py
python3 tests/m470-managed-encounters-qa.py
python3 tests/m470-creation-failure-qa.py
python3 tests/m470-world-fixture-qa.py
python3 tests/m470-transition-browser-qa.py
python3 tests/m470-user-flow-qa.py
RB_QA_RENDER_ISOLATION=0 python3 tests/m470-rope-crossing.py
RB_QA_RENDER_ISOLATION=1 python3 tests/m470-rope-crossing.py
python3 tests/m470-hybrid-diagnostics.py
```

בדיקות דפדפן מחייבות Playwright, Python, Chromium ו־jsonschema. `CHROMIUM_PATH` אפשרי. `RB_QA_WALL_SCALE=8` מאריך timeout בלבד. בנייה/Node אינן מחייבות חבילות npm. יש להריץ בדיקות עם תוצאות PASS/FAIL/NOT TESTED נפרדות.

**אין Stage02 בייצור; אין החלפת Registry חיה; אין שינוי פיזיקה.**
