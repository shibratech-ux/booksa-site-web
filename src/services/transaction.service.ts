import type { TransactionRecord } from '@/types/transaction.types';
import { api } from './api';

const mockTransactions: TransactionRecord[] = [
  {
    id: 'tx_001',
    reference: 'TRX-9081',
    customer: 'Acme Corporation',
    amount: 24800,
    currency: 'USD',
    status: 'completed',
    type: 'credit',
    date: '2026-06-01T10:12:00.000Z',
    category: 'Abonnement'
  },
  {
    id: 'tx_002',
    reference: 'TRX-9082',
    customer: 'Northwind Labs',
    amount: 7600,
    currency: 'USD',
    status: 'pending',
    type: 'debit',
    date: '2026-06-01T12:44:00.000Z',
    category: 'Remboursement'
  },
  {
    id: 'tx_003',
    reference: 'TRX-9083',
    customer: 'Global Dynamics',
    amount: 16400,
    currency: 'USD',
    status: 'completed',
    type: 'credit',
    date: '2026-06-01T15:31:00.000Z',
    category: 'Frais de service'
  }
];

export async function listRecentTransactions(): Promise<TransactionRecord[]> {
  if (import.meta.env.VITE_API_BASE_URL) {
    const response = await api.get<TransactionRecord[]>('/transactions');
    return response.data;
  }

  return mockTransactions;
}
