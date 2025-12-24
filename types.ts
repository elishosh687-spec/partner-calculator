export interface Expense {
  id: string;
  name: string;
  amount: number;
}

export interface TransactionResult {
  id?: string; // Firebase document ID
  partnerId: string; // Partner ID who created the transaction
  partnerName?: string; // Partner name (for display)
  bossId?: string; // EcoBrothers ID in the transaction
  bossName?: string; // EcoBrothers name (for display)
  customerName: string;
  date: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  eliShare: number;
  ecobrothersShare: number;
  eliPercentage: number;
  ecobrothersPercentage: number;
  expenses?: Expense[]; // Detailed expenses list
  isPaidToPartner?: boolean; // Payment status to partner
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'partner' | 'boss';
  createdAt: Date;
}

export type Tab = 'calculator' | 'history';