# 🧮 מחשבון שותפים - מערכת Multi-Tenant

אפליקציית React מתקדמת לניהול וחישוב חלוקת רווחים בין שותפים עסקיים עם תמיכה במשתמשים מרובים.

## ✨ תכונות

### 🔐 מערכת משתמשים ואבטחה
- 👥 **רב-משתמשים** - כל שותף עם חשבון אישי
- 🔒 **אימות מאובטח** - Firebase Authentication (Email/Password + Google Sign-In)
- 🛡️ **הפרדת נתונים** - כל שותף רואה רק את העסקאות שלו
- 👑 **תפקיד בוס** - רואה את כל העסקאות + יכולות סינון מתקדמות
- 🔍 **Google Sign-In** - התחברות מהירה עם חשבון Google

### 💼 ניהול עסקאות
- 💰 **חישוב רווחים** - חישוב אוטומטי של חלוקת רווחים לפי אחוזים
- 📊 **ניהול הוצאות** - הוספה ומעקב אחרי הוצאות עסקיות
- 📜 **היסטוריית עסקאות** - שמירה וצפייה בעסקאות (מסוננות לפי משתמש)
- 🔍 **סינון מתקדם** - בוסים יכולים לסנן לפי שותף ספציפי

### 🎨 חוויית משתמש
- 🎨 **עיצוב מודרני** - ממשק משתמש מעוצב ומרשים עם Glass Morphism
- 📱 **Responsive** - עובד מצוין על כל המכשירים
- 🔥 **Firebase Realtime** - סנכרון בזמן אמת עם Firebase Firestore
- ⚡ **ביצועים גבוהים** - טעינה מהירה ותגובתיות מיידית

## 🚀 התחלה מהירה

### דרישות מקדימות

- Node.js (גרסה 16 ומעלה)
- חשבון Firebase (חינם)

### התקנה

1. **שכפל את הפרויקט:**
   ```bash
   git clone <repository-url>
   cd partner-calculator
   ```

2. **התקן תלויות:**
   ```bash
   npm install
   ```

3. **הגדר Firebase:**
   - עקוב אחרי ההוראות המפורטות ב-[FIREBASE_SETUP.md](FIREBASE_SETUP.md)
   - עדכן את הפרטים בקובץ `firebase.ts`

4. **🔒 העלה חוקי אבטחה (קריטי!):**
   - קרא את [SECURITY_RULES_SETUP.md](SECURITY_RULES_SETUP.md)
   - העלה את `firestore.rules` ל-Firebase Console
   - צור Index ב-Firestore (הוראות במדריך)

5. **הפעל את השרת:**
   ```bash
   npm run dev
   ```

6. **פתח בדפדפן והירשם:**
   - היכנס לכתובת: http://localhost:5173/
   - צור משתמש ראשון (מומלץ כ-"בוס")
   
📖 **מדריך התחלה מהיר**: [QUICK_START.md](QUICK_START.md)  
📚 **מדריך מפורט**: [MULTI_TENANT_GUIDE.md](MULTI_TENANT_GUIDE.md)

## 📁 מבנה הפרויקט

```
partner-calculator/
├── components/              # קומפוננטות React
│   ├── Calculator.tsx      # מחשבון ראשי
│   ├── Header.tsx          # כותרת עליונה + מידע משתמש 🆕
│   ├── HistoryView.tsx     # תצוגת היסטוריה + סינון 🆕
│   ├── Login.tsx           # מסך התחברות/הרשמה 🆕
│   └── Tabs.tsx            # טאבים לניווט
├── contexts/               # React Contexts 🆕
│   └── AuthContext.tsx     # ניהול Authentication 🆕
├── App.tsx                 # קומפוננטה ראשית + Auth Logic 🆕
├── firebase.ts             # הגדרות Firebase + Auth 🆕
├── types.ts                # הגדרות TypeScript + User 🆕
├── index.tsx               # נקודת כניסה + AuthProvider 🆕
├── firestore.rules         # חוקי אבטחה Firestore 🆕
└── מדריכים:
    ├── QUICK_START.md           # התחלה מהירה 🆕
    ├── MULTI_TENANT_GUIDE.md    # מדריך מפורט 🆕
    ├── SECURITY_RULES_SETUP.md  # הגדרת אבטחה 🆕
    └── CHANGES_SUMMARY.md       # סיכום שינויים 🆕
```

## 🛠️ טכנולוגיות

- **React 19** - ספריית UI
- **TypeScript** - שפת תכנות
- **Firebase Authentication** 🆕 - ניהול משתמשים ואימות
- **Firebase Firestore** - מסד נתונים בזמן אמת
- **Firestore Security Rules** 🆕 - אבטחת נתונים
- **Vite** - Build Tool מהיר
- **Tailwind CSS** - עיצוב מודרני
- **Lucide React** - אייקונים יפים

## 🔧 סקריפטים זמינים

```bash
npm run dev      # הפעלת שרת פיתוח
npm run build    # בניית הפרויקט לייצור
npm run preview  # תצוגה מקדימה של הבילד
```

## 📦 פריסה (Deployment)

עקוב אחרי ההוראות בקובץ [DEPLOYMENT.md](DEPLOYMENT.md) לפריסה ל-GitHub Pages.

## 🔐 אבטחה

### מערכת אבטחה מלאה ✅

המערכת כוללת אבטחה מקיפה בשלוש שכבות:

1. **Frontend Authentication**
   - ✅ Firebase Authentication מלא
   - ✅ Email/Password authentication
   - ✅ הצפנת סיסמאות
   - ✅ JWT Tokens

2. **Firestore Security Rules**
   - ✅ כל שותף רואה רק את העסקאות שלו
   - ✅ בוס רואה את כל העסקאות
   - ✅ אי אפשר לזייף partnerId
   - ✅ חוקים נאכפים ברמת השרת

3. **Query Filtering**
   - ✅ סינון עסקאות בצד הלקוח
   - ✅ where clauses לפי partnerId
   - ✅ אופטימיזציה עם Indexes

📖 **קרא עוד**: [SECURITY_RULES_SETUP.md](SECURITY_RULES_SETUP.md)

## 🎯 תפקידים במערכת

### 👑 בוס (Boss)
- רואה את **כל** העסקאות של **כל** השותפים
- יכול לסנן עסקאות לפי שותף ספציפי
- רואה עמודת "שותף" בטבלת היסטוריה
- יכול למחוק את כל ההיסטוריה

### 🤝 שותף (Partner)
- רואה **רק** את העסקאות שהוא יצר
- יוצר עסקאות חדשות
- יכול למחוק את ההיסטוריה שלו בלבד
- לא רואה עסקאות של שותפים אחרים

## 📚 מדריכים

- 📖 [מדריך התחלה מהיר](QUICK_START.md) - 3 צעדים פשוטים
- 📘 [מדריך Multi-Tenant מלא](MULTI_TENANT_GUIDE.md) - הסבר מפורט
- 🔒 [הגדרת אבטחה](SECURITY_RULES_SETUP.md) - חובה לקרוא!
- 📋 [סיכום שינויים](CHANGES_SUMMARY.md) - מה השתנה?

## 🐛 פתרון בעיות

### "Missing or insufficient permissions"
→ העלה את `firestore.rules` ל-Firebase Console

### "The query requires an index"
→ לחץ על הלינק שFirebase שולח או צור Index ידנית

### לא רואה עסקאות
→ וודא שיצרת Index ל-`partnerId` + `createdAt`

📖 **עוד פתרונות**: [MULTI_TENANT_GUIDE.md](MULTI_TENANT_GUIDE.md#-פתרון-בעיות-נפוצות)

## 👥 תרומה

רעיונות ותיקוני באגים תמיד מתקבלים בברכה!

## 📄 רישיון

© 2025 Premium Partner Calc - All rights reserved

---

**נוצר עבור ניהול שותפויות עסקיות 🤝**  
**גרסה 2.0 - Multi-Tenant System** 🚀
