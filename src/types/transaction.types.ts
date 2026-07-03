export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type TransactionType = 'credit' | 'debit';

export interface TransactionRecord {
  id: string;
  reference: string;
  customer: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  date: string;
  category: string;
}
