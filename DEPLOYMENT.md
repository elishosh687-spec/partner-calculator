# הוראות פריסה ל-GitHub Pages

## הבעיה
GitHub Pages לא יכול להריץ TypeScript ישירות. צריך לבנות את הפרויקט קודם.

## הפתרון
יש כבר GitHub Actions workflow שיבנה את הפרויקט אוטומטית.

## שלבים להפעלה:

1. **הפעל GitHub Pages עם GitHub Actions:**
   - לך ל-GitHub Repository
   - Settings → Pages
   - תחת "Source", בחר **"GitHub Actions"** (לא "Deploy from a branch")
   - שמור

2. **הפעל את ה-Workflow:**
   - לך ל-Actions
   - בחר את ה-workflow "Deploy to GitHub Pages"
   - לחץ על "Run workflow" → "Run workflow"
   - המתן לסיום ה-build

3. **בדוק את האתר:**
   - לאחר שהעבודה הושלמה, האתר יעלה אוטומטית
   - כתובת האתר: `https://[username].github.io/[repository-name]`

## הערות:
- ה-workflow יופעל אוטומטית בכל push ל-main
- אם יש שגיאות, בדוק ב-Actions → ה-workflow האחרון


