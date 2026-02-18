import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/FIREBASE-api.service';
import { BusinessDaysService } from '../../../core/services/business-days.service';
import { ExpenseService } from '../../expenses/services/expense.service';
import { ExpenseGroupService } from '../../expense-groups/services/expense-group.service';
import {
  MonthlyExpense,
  CreateMonthlyExpenseDto,
  CreateAdHocExpenseDto,
  UpdateMonthlyExpenseDto,
  LoadFixedExpensesDto,
  DashboardData,
  DashboardGroupData
} from '../../../core/models/monthly-expense.model';

@Injectable({
  providedIn: 'root'
})
export class MonthlyExpenseService {
  private readonly collectionName = 'monthly_expenses';
  
  // Mock data
  private mockMonthlyExpenses: MonthlyExpense[] = [];

  constructor(
    private apiService: ApiService,
    private businessDaysService: BusinessDaysService,
    private expenseService: ExpenseService,
    private expenseGroupService: ExpenseGroupService
  ) {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    this.mockMonthlyExpenses = [
      {
        _id: '1',
        expenseId: '1',
        month: currentMonth,
        year: currentYear,
        description: 'Aluguel',
        amount: 1500.00,
        dueDate: this.businessDaysService.calculateDueDate(currentYear, currentMonth, 10),
        isPaid: false,
        paidDate: null,
        groupId: '1',
        isDirectDebit: false,
        additionalInfo: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        expenseId: '2',
        month: currentMonth,
        year: currentYear,
        description: 'Condomínio',
        amount: 450.00,
        dueDate: this.businessDaysService.calculateDueDate(currentYear, currentMonth, 15),
        isPaid: true,
        paidDate: new Date(currentYear, currentMonth - 1, 14),
        groupId: '1',
        isDirectDebit: true,
        additionalInfo: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '3',
        expenseId: '3',
        month: currentMonth,
        year: currentYear,
        description: 'Energia Elétrica',
        amount: 180.00,
        dueDate: this.businessDaysService.calculateDueDate(currentYear, currentMonth, 20),
        isPaid: false,
        paidDate: null,
        groupId: '1',
        isDirectDebit: true,
        additionalInfo: 'Matrícula: 123456789',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '4',
        expenseId: '6',
        month: currentMonth,
        year: currentYear,
        description: 'Seguro Auto',
        amount: 250.00,
        dueDate: this.businessDaysService.calculateDueDate(currentYear, currentMonth, 12),
        isPaid: true,
        paidDate: new Date(currentYear, currentMonth - 1, 11),
        groupId: '4',
        isDirectDebit: true,
        additionalInfo: 'Apólice: 789456123',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  getByMonthYear(month: number, year: number): Observable<MonthlyExpense[]> {
    if (this.apiService.isUsingMockData()) {
      const expenses = this.mockMonthlyExpenses
        .filter(e => e.month === +month && e.year === year);
      return of(expenses).pipe(delay(300));
    }

    return this.apiService.getAll<MonthlyExpense>(this.collectionName).pipe(
      map(expenses => expenses.filter(e => e.month === month && e.year === year)),
      catchError(this.handleError)
    );
  }

  loadFixedExpenses(dto: LoadFixedExpensesDto): Observable<MonthlyExpense[]> {
    if (this.apiService.isUsingMockData()) {
      return this.expenseService.getAll().pipe(
        switchMap(expenses => {
          const existingExpenseIds = this.mockMonthlyExpenses
            .filter(me => me.month === dto.month && me.year === dto.year && me.expenseId)
            .map(me => me.expenseId);

          const newExpenses = expenses
            .filter(exp => !existingExpenseIds.includes(exp._id!))
            .map(exp => {
              const dueDate = this.businessDaysService.calculateDueDate(
                dto.year,
                dto.month,
                exp.paymentDay
              );

              const monthlyExpense: MonthlyExpense = {
                _id: this.generateId(),
                expenseId: exp._id,
                month: dto.month,
                year: dto.year,
                description: exp.description,
                amount: exp.amount,
                dueDate,
                isPaid: false,
                paidDate: null,
                groupId: exp.groupId,
                isDirectDebit: exp.isDirectDebit,
                additionalInfo: exp.additionalInfo,
                createdAt: new Date(),
                updatedAt: new Date()
              };

              this.mockMonthlyExpenses.push(monthlyExpense);
              return monthlyExpense;
            });

          return of(newExpenses).pipe(delay(500));
        })
      );
    }

    return forkJoin({
      expenses: this.expenseService.getAll(),
      monthlyExpenses: this.getByMonthYear(dto.month, dto.year)
    }).pipe(
      switchMap(({ expenses, monthlyExpenses }) => {
        const existingExpenseIds = monthlyExpenses
          .filter(me => me.expenseId)
          .map(me => me.expenseId);

        const newExpenses = expenses
          .filter(exp => !existingExpenseIds.includes(exp._id!))
          .map(exp => {
            const dueDate = this.businessDaysService.calculateDueDate(
              dto.year,
              dto.month,
              exp.paymentDay
            );

            const createDto: CreateMonthlyExpenseDto = {
              expenseId: exp._id || null,
              month: dto.month,
              year: dto.year,
              description: exp.description,
              amount: exp.amount,
              dueDate,
              isPaid: false,
              paidDate: null,
              groupId: exp.groupId,
              isDirectDebit: exp.isDirectDebit,
              additionalInfo: exp.additionalInfo
            };

            return this.apiService.create<MonthlyExpense>(this.collectionName, createDto);
          });

        if (newExpenses.length === 0) {
          return of([]);
        }

        return forkJoin(newExpenses);
      }),
      catchError(this.handleError)
    );
  }

  loadPreviousMonthExpenses(dto: LoadFixedExpensesDto): Observable<MonthlyExpense[]> {
    let previousMonth = dto.month - 1;
    let previousYear = dto.year;
    
    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear = previousYear - 1;
    }

    if (this.apiService.isUsingMockData()) {
      return forkJoin({
        previousExpenses: this.getByMonthYear(previousMonth, previousYear),
        fixedExpenses: this.expenseService.getAll()
      }).pipe(
        switchMap(({ previousExpenses, fixedExpenses }) => {
          const currentExpenses = this.mockMonthlyExpenses
            .filter(me => me.month === dto.month && me.year === dto.year);
          
          const existingExpenseIds = currentExpenses
            .filter(me => me.expenseId)
            .map(me => me.expenseId);

          // Apenas despesas vinculadas a fixas (expenseId != null) são copiadas
          const newExpenses = previousExpenses
            .filter(exp => exp.expenseId && !existingExpenseIds.includes(exp.expenseId))
            .map(exp => {
              const original = fixedExpenses.find(e => e._id === exp.expenseId);
              const dueDate = original
                ? this.businessDaysService.calculateDueDate(dto.year, dto.month, original.paymentDay)
                : new Date(dto.year, dto.month - 1, 1);

              const monthlyExpense: MonthlyExpense = {
                _id: this.generateId(),
                expenseId: exp.expenseId,
                month: dto.month,
                year: dto.year,
                description: exp.description,
                amount: exp.amount,
                dueDate,
                isPaid: false,
                paidDate: null,
                groupId: exp.groupId,
                isDirectDebit: exp.isDirectDebit,
                additionalInfo: exp.additionalInfo,
                createdAt: new Date(),
                updatedAt: new Date()
              };

              this.mockMonthlyExpenses.push(monthlyExpense);
              return monthlyExpense;
            });

          return of(newExpenses).pipe(delay(500));
        })
      );
    }

    return forkJoin({
      previousExpenses: this.getByMonthYear(previousMonth, previousYear),
      currentExpenses: this.getByMonthYear(dto.month, dto.year),
      fixedExpenses: this.expenseService.getAll()
    }).pipe(
      switchMap(({ previousExpenses, currentExpenses, fixedExpenses }) => {
        const existingExpenseIds = currentExpenses
          .filter(me => me.expenseId)
          .map(me => me.expenseId);

        // Apenas despesas vinculadas a fixas (expenseId != null) são copiadas
        const newExpenses = previousExpenses
          .filter(exp => exp.expenseId && !existingExpenseIds.includes(exp.expenseId))
          .map(exp => {
            const original = fixedExpenses.find(e => e._id === exp.expenseId);
            const dueDate = original
              ? this.businessDaysService.calculateDueDate(dto.year, dto.month, original.paymentDay)
              : new Date(dto.year, dto.month - 1, 1);

            const createDto: CreateMonthlyExpenseDto = {
              expenseId: exp.expenseId,
              month: dto.month,
              year: dto.year,
              description: exp.description,
              amount: exp.amount,
              dueDate,
              isPaid: false,
              paidDate: null,
              groupId: exp.groupId,
              isDirectDebit: exp.isDirectDebit,
              additionalInfo: exp.additionalInfo
            };

            return this.apiService.create<MonthlyExpense>(this.collectionName, createDto);
          });

        if (newExpenses.length === 0) {
          return of([]);
        }

        return forkJoin(newExpenses);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cria uma despesa manual (ad-hoc) no mês/ano indicado.
   * expenseId = null, isDirectDebit = false, isPaid = false são sempre fixos.
   */
  createAdHocExpense(dto: CreateAdHocExpenseDto, month: number, year: number): Observable<MonthlyExpense> {
    const fullDto: CreateMonthlyExpenseDto = {
      expenseId: null,          // Sem vínculo com despesa fixa
      month,
      year,
      description: dto.description,
      amount: dto.amount,
      dueDate: dto.dueDate,
      isPaid: false,            // Sempre não pago ao criar
      paidDate: null,
      groupId: dto.groupId,
      isDirectDebit: false,     // Despesa manual nunca é débito direto
      additionalInfo: dto.additionalInfo
    };

    if (this.apiService.isUsingMockData()) {
      const newExpense: MonthlyExpense = {
        _id: this.generateId(),
        ...fullDto,
        dueDate: new Date(dto.dueDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.mockMonthlyExpenses.push(newExpense);
      return of(newExpense).pipe(delay(400));
    }

    return this.apiService.create<MonthlyExpense>(this.collectionName, fullDto).pipe(
      catchError(this.handleError)
    );
  }

  create(dto: CreateMonthlyExpenseDto): Observable<MonthlyExpense> {
    if (this.apiService.isUsingMockData()) {
      const newExpense: MonthlyExpense = {
        _id: this.generateId(),
        expenseId: null,
        month: dto.month,
        year: dto.year,
        description: dto.description,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        isPaid: false,
        paidDate: null,
        groupId: dto.groupId,
        isDirectDebit: dto.isDirectDebit,
        additionalInfo: dto.additionalInfo,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.mockMonthlyExpenses.push(newExpense);
      return of(newExpense).pipe(delay(500));
    }
    return this.apiService.create<MonthlyExpense>(this.collectionName, dto).pipe(
      catchError(this.handleError)
    );
  }

  update(id: string, dto: UpdateMonthlyExpenseDto): Observable<MonthlyExpense> {
    if (this.apiService.isUsingMockData()) {
      const index = this.mockMonthlyExpenses.findIndex(e => e._id === id);
      if (index === -1) {
        return throwError(() => new Error('Despesa mensal não encontrada'));
      }

      let paidDate = this.mockMonthlyExpenses[index].paidDate;
      if (dto.isPaid !== undefined) {
        if (dto.isPaid && !dto.paidDate) {
          paidDate = new Date();
        } else if (!dto.isPaid) {
          paidDate = null;
        } else if (dto.paidDate) {
          paidDate = new Date(dto.paidDate);
        }
      }

      this.mockMonthlyExpenses[index] = {
        ...this.mockMonthlyExpenses[index],
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : this.mockMonthlyExpenses[index].dueDate,
        paidDate,
        updatedAt: new Date()
      };
      
      return of({ ...this.mockMonthlyExpenses[index] }).pipe(delay(300));
    }
    return this.apiService.update<MonthlyExpense>(this.collectionName, id, dto).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: string): Observable<void> {
    if (this.apiService.isUsingMockData()) {
      const index = this.mockMonthlyExpenses.findIndex(e => e._id === id);
      if (index === -1) {
        return throwError(() => new Error('Despesa mensal não encontrada'));
      }
      this.mockMonthlyExpenses.splice(index, 1);
      return of(void 0).pipe(delay(300));
    }
    return this.apiService.delete(this.collectionName, id).pipe(
      catchError(this.handleError)
    );
  }

  getDashboardData(month: number, year: number): Observable<DashboardData> {
    return forkJoin({
      monthlyExpenses: this.getByMonthYear(month, year),
      groups: this.expenseGroupService.getAll()
    }).pipe(
      map(({ monthlyExpenses, groups }) => {
        const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalPaid = monthlyExpenses
          .filter(exp => exp.isPaid)
          .reduce((sum, exp) => sum + exp.amount, 0);
        const totalPending = totalExpenses - totalPaid;

        const groupMap = new Map<string, DashboardGroupData>();

        monthlyExpenses.forEach(expense => {
          const group = groups.find(g => g._id === expense.groupId);
          if (!group) return;

          if (!groupMap.has(expense.groupId)) {
            groupMap.set(expense.groupId, {
              groupId: expense.groupId,
              groupName: group.name,
              groupIcon: group.icon,
              totalAmount: 0,
              pendingAmount: 0,
              percentage: 0
            });
          }

          const groupData = groupMap.get(expense.groupId)!;
          groupData.totalAmount += expense.amount;
          if (!expense.isPaid) {
            groupData.pendingAmount += expense.amount;
          }
        });

        const byGroup = Array.from(groupMap.values()).map(g => ({
          ...g,
          percentage: totalExpenses > 0 ? (g.totalAmount / totalExpenses) * 100 : 0
        }));

        return { totalExpenses, totalPaid, totalPending, byGroup };
      }),
      delay(300)
    );
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private handleError(error: any): Observable<never> {
    console.error('MonthlyExpenseService Error:', error);
    return throwError(() => error);
  }
}
