export interface Expense {
  id: string;
  name: string;
  amount: number;
}

export interface TransactionResult {
  id?: string; // Firebase document ID
  partnerId: string; // 🆕 ID של השותף שיצר את העסקה
  partnerName?: string; // 🆕 שם השותף (לתצוגה)
  bossId?: string; // 🆕 ID של הבוס בעסקה
  bossName?: string; // 🆕 שם הבוס (לתצוגה)
  customerName: string;
  date: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  eliShare: number;
  shimonShare: number;
  eliPercentage: number;
  shimonPercentage: number;
  expenses?: Expense[]; // רשימת הוצאות מפורטת
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'partner' | 'boss';
  createdAt: Date;
}

export type Tab = 'calculator' | 'history';