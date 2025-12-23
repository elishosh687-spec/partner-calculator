# הוראות הגדרת Firebase 🔥

## שלב 1: יצירת פרויקט Firebase

1. **גש ל-Firebase Console:**
   - פתח: https://console.firebase.google.com/
   - התחבר עם חשבון Google שלך

2. **צור פרויקט חדש:**
   - לחץ על "Add project" / "הוסף פרויקט"
   - תן שם לפרויקט (לדוגמה: "partner-calculator")
   - בחר אם אתה רוצה Google Analytics (אופציונלי)
   - לחץ "Create project" / "צור פרויקט"

## שלב 2: הוספת אפליקציית Web

1. **הוסף אפליקציה:**
   - בדף הבית של הפרויקט, לחץ על האייקון `</>` (Web)
   - תן כינוי לאפליקציה (לדוגמה: "partner-calculator-web")
   - **לא צריך** לבחר Firebase Hosting כרגע
   - לחץ "Register app" / "רשום אפליקציה"

2. **העתק את הפרטים:**
   - תקבל אובייקט `firebaseConfig` עם כל הפרטים
   - שמור אותו בצד - תצטרך אותו בהמשך

## שלב 3: הגדרת Firestore Database

1. **צור מסד נתונים:**
   - בתפריט הצד, לחץ על "Firestore Database"
   - לחץ "Create database" / "צור מסד נתונים"

2. **בחר מצב אבטחה:**
   - בחר **"Start in test mode"** (למטרות פיתוח)
   - ⚠️ **חשוב:** מצב זה מאפשר גישה לכולם למשך 30 יום
   - מומלץ להגדיר חוקי אבטחה מתאימים אחר כך

3. **בחר מיקום:**
   - בחר מיקום קרוב אליך (לדוגמה: `europe-west1` לאירופה)
   - לחץ "Enable" / "הפעל"

## שלב 4: עדכון הקוד

1. **פתח את הקובץ `firebase.ts`**

2. **החלף את הערכים הבאים עם הפרטים שלך:**

```typescript
const firebaseConfig = {
  apiKey: "AIza...",           // ← העתק מ-Firebase Console
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456:web:abc123"
};
```

3. **שמור את הקובץ**

## שלב 5: בדיקה

1. **הפעל את האפליקציה:**
   ```bash
   npm run dev
   ```

2. **פתח את הקונסול של הדפדפן (F12)**
   - אמור לראות הודעות: "📥 מתחבר ל-Firebase..."
   - אם אין שגיאות - הכל עובד! ✅

3. **נסה להוסיף עסקה:**
   - מלא את הפרטים ותלחץ "בצע חישוב"
   - לחץ "שמור לעסקאות"
   - עבור ל-"היסטוריה" - אמור לראות את העסקה

4. **בדוק ב-Firebase Console:**
   - חזור ל-Firestore Database ב-Console
   - אמור לראות אוסף (collection) בשם `transactions`
   - בתוכו תראה את העסקאות ששמרת

## תכונות שעובדות:

✅ **שמירת עסקאות** - כל עסקה נשמרת ב-Firestore  
✅ **סנכרון בזמן אמת** - אם מישהו אחר יוסיף עסקה, תראה אותה מיד  
✅ **מחיקת היסטוריה** - מחיקה של כל העסקאות  
✅ **גיבוי ענן** - הנתונים שמורים ב-Cloud ולא רק בדפדפן

## חוקי אבטחה מומלצים (אחרי הפיתוח):

כשאתה מוכן לפרוס לייצור, עדכן את חוקי האבטחה ב-Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

זה ידרוש אימות משתמשים (Authentication) לפני גישה לנתונים.

## בעיות נפוצות:

### ❌ "Firebase: Error (auth/configuration-not-found)"
- בדוק שהעתקת את כל הפרטים נכון מ-Console
- ודא ש-`apiKey` ו-`projectId` נכונים

### ❌ "Missing or insufficient permissions"
- בדוק שהפעלת Firestore ב-Test Mode
- אם עברו 30 יום, עדכן את חוקי האבטחה

### ❌ אין חיבור
- בדוק את הקונסול בדפדפן לשגיאות
- ודא שיש לך חיבור לאינטרנט
- נסה לרענן את הדף

---

**זהו! האפליקציה שלך עכשיו מחוברת ל-Firebase! 🎉**

