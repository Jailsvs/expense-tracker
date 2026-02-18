import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/FIREBASE-api.service';
import { Expense, CreateExpenseDto, UpdateExpenseDto } from '../../../core/models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly collectionName = 'expenses';
  
  // Mock data
  private mockExpenses: Expense[] = [
    {
      _id: '1',
      description: 'Aluguel',
      amount: 1500.00,
      paymentDay: 10,
      groupId: '1',
      isDirectDebit: false,
      additionalInfo: '',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: '2',
      description: 'Condomínio',
      amount: 450.00,
      paymentDay: 15,
      groupId: '1',
      isDirectDebit: true,
      additionalInfo: '',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: '3',
      description: 'Energia Elétrica',
      amount: 180.00,
      paymentDay: 20,
      groupId: '1',
      isDirectDebit: true,
      additionalInfo: 'Matrícula: 123456789',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: '4',
      description: 'Água',
      amount: 90.00,
      paymentDay: 25,
      groupId: '1',
      isDirectDebit: true,
      additionalInfo: 'Matrícula: 987654321',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: '5',
      description: 'Combustível',
      amount: 400.00,
      paymentDay: 5,
      groupId: '2',
      isDirectDebit: false,
      additionalInfo: '',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: '6',
      description: 'Seguro Auto',
      amount: 250.00,
      paymentDay: 12,
      groupId: '4',
      isDirectDebit: true,
      additionalInfo: 'Apólice: 789456123',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: '7',
      description: 'Supermercado',
      amount: 800.00,
      paymentDay: 1,
      groupId: '3',
      isDirectDebit: false,
      additionalInfo: '',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  constructor(private apiService: ApiService) {}

  getAll(groupId?: string): Observable<Expense[]> {
    if (this.apiService.isUsingMockData()) {
      let expenses = [...this.mockExpenses];
      if (groupId) {
        expenses = expenses.filter(e => e.groupId === groupId);
      }
      return of(expenses).pipe(delay(300));
    }

    const params = groupId ? { groupId } : undefined;
    return this.apiService.getAll<Expense>(this.collectionName).pipe(
      catchError(this.handleError)
    );
    /*return this.apiService.get<Expense[]>(this.endpoint, params).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );*/
  }

  getById(id: string): Observable<Expense> {
    if (this.apiService.isUsingMockData()) {
      const expense = this.mockExpenses.find(e => e._id === id);
      if (!expense) {
        return throwError(() => new Error('Despesa não encontrada'));
      }
      return of({ ...expense }).pipe(delay(200));
    }
    return this.apiService.getById<Expense>(this.collectionName, id).pipe(
      catchError(this.handleError)
    );
    /*return this.apiService.get<Expense>(`${this.endpoint}/${id}`).pipe(
      map(response => response.data!),
      catchError(this.handleError)
    );*/
  }

  create(dto: CreateExpenseDto): Observable<Expense> {
    if (this.apiService.isUsingMockData()) {
      const newExpense: Expense = {
        _id: this.generateId(),
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.mockExpenses.push(newExpense);
      return of({ ...newExpense }).pipe(delay(500));
    }
    return this.apiService.create<Expense>(this.collectionName, dto).pipe(
      catchError(this.handleError)
    );
    /*return this.apiService.post<Expense>(this.endpoint, dto).pipe(
      map(response => response.data!),
      catchError(this.handleError)
    );*/
  }

  update(id: string, dto: UpdateExpenseDto): Observable<Expense> {
    if (this.apiService.isUsingMockData()) {
      const index = this.mockExpenses.findIndex(e => e._id === id);
      if (index === -1) {
        return throwError(() => new Error('Despesa não encontrada'));
      }

      this.mockExpenses[index] = {
        ...this.mockExpenses[index],
        ...dto,
        updatedAt: new Date()
      };
      
      return of({ ...this.mockExpenses[index] }).pipe(delay(500));
    }
    return this.apiService.update<Expense>(this.collectionName, id, dto).pipe(
      catchError(this.handleError)
    );
    /*return this.apiService.put<Expense>(`${this.endpoint}/${id}`, dto).pipe(
      map(response => response.data!),
      catchError(this.handleError)
    );*/
  }

  delete(id: string): Observable<void> {
    if (this.apiService.isUsingMockData()) {
      // Verificar se há despesas mensais vinculadas (mock)
      const hasLinkedMonthlyExpenses = false; // Implementar verificação real
      
      if (hasLinkedMonthlyExpenses) {
        return throwError(() => new Error('Não é possível excluir despesa vinculada a despesas mensais'));
      }

      const index = this.mockExpenses.findIndex(e => e._id === id);
      if (index === -1) {
        return throwError(() => new Error('Despesa não encontrada'));
      }

      this.mockExpenses.splice(index, 1);
      return of(void 0).pipe(delay(300));
    }
    return this.apiService.delete(this.collectionName, id).pipe(
      catchError(this.handleError)
    );
    /*return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );*/
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private handleError(error: any): Observable<never> {
    console.error('ExpenseService Error:', error);
    return throwError(() => error);
  }
}
