import { ExpenseGroup } from './expense-group.model';

export interface Expense {
  _id?: string;
  description: string;
  amount: number;
  paymentDay: number;     // 1-31
  groupId: string;
  group?: ExpenseGroup;   // Populated
  isDirectDebit: boolean;
  additionalInfo: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  paymentDay: number;
  groupId: string;
  isDirectDebit: boolean;
  additionalInfo: string;
}

export interface UpdateExpenseDto {
  description?: string;
  amount?: number;
  paymentDay?: number;
  groupId?: string;
  isDirectDebit?: boolean;
  additionalInfo?: string;
}
