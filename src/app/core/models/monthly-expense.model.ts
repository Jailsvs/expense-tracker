import { ExpenseGroup } from './expense-group.model';

export interface MonthlyExpense {
  _id?: string;
  expenseId?: string | null;  // null for ad-hoc expenses
  month: number;              // 1-12
  year: number;
  description: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
  paidDate?: Date | null;
  groupId: string;
  group?: ExpenseGroup;       // Populated
  isDirectDebit: boolean;
  additionalInfo: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateMonthlyExpenseDto {
  expenseId?: string | null;
  month: number;
  year: number;
  description: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
  paidDate?: Date | null;
  groupId: string;
  isDirectDebit: boolean;
  additionalInfo: string;
}

export interface CreateAdHocExpenseDto {
  description: string;    
  amount: number;         
  dueDate: Date;          
  groupId: string;        
  additionalInfo: string; 

}

export interface UpdateMonthlyExpenseDto {
  description?: string;
  amount?: number;
  dueDate: Date;
  isPaid?: boolean;
  paidDate?: Date | null;
  additionalInfo?: string;
}

export interface LoadFixedExpensesDto {
  month: number;
  year: number;
}

export interface DashboardData {
  totalExpenses: number;
  totalPaid: number;
  totalPending: number;
  byGroup: DashboardGroupData[];
}

export interface DashboardGroupData {
  groupId: string;
  groupName: string;
  groupIcon: string;
  totalAmount: number;
  pendingAmount: number;
  percentage: number;
}
