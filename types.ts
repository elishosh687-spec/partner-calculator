export interface Expense {
  id: string;
  name: string;
  amount: number;
}

export interface TransactionResult {
  customerName: string;
  date: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  eliShare: number;
  shimonShare: number;
  eliPercentage: number;
  shimonPercentage: number;
}

export type Tab = 'calculator' | 'history';