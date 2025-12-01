
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum PaymentMethod {
  CASH = 'Efectivo',
  CREDIT_CARD = 'Tarjeta Crédito',
  DEBIT_CARD = 'Tarjeta Débito',
  TRANSFER_PESOS = 'Transferencia PESOS',
  TRANSFER_USD = 'Transferencia USD',
  TRANSFER_USDT = 'Transferencia USDT',
  CRYPTO_WALLET = 'Wallet Cripto',
}

export type CurrencyCode = 'ARS' | 'USD' | 'EUR' | 'USDT';

export interface Category {
  id: string;
  name: string;
  type: 'fixed' | 'variable';
  budget: number;
  color: string;
}

export interface TransactionItem {
  description: string;
  amount: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string; // ISO date string
  note: string;
  merchant?: string;
  paymentMethod: PaymentMethod;
  receiptUrl?: string; // base64 or url
  isRecurring?: boolean;
  items?: TransactionItem[];
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyContribution: number;
}

export interface Investment {
  id: string;
  assetName: string;
  amount: number;
  type: 'Stock' | 'Crypto' | 'Cash' | 'RealEstate';
  date: string;
  expectedReturnRate: number; // percentage
}

export interface UserSettings {
  currency: string;
  userName: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
