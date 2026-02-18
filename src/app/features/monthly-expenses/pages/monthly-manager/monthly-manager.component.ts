import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MonthlyExpenseService } from '../../services/monthly-expense.service';
import { ExpenseGroupService } from '../../../expense-groups/services/expense-group.service';
import { MonthlyExpense } from '../../../../core/models/monthly-expense.model';
import { ExpenseGroup } from '../../../../core/models/expense-group.model';
import { ToastService } from '../../../../core/services/toast.service';
import { CurrencyBrPipe } from '../../../../shared/pipes/currency-br.pipe';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { DashboardChartComponent } from '../../components/dashboard-chart/dashboard-chart.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  AddAdHocExpenseModalComponent,
  AddAdHocExpenseDialogData
} from '../../components/add-adhoc-expense-modal/add-adhoc-expense-modal.component';
import { CreateAdHocExpenseDto } from '../../../../core/models/monthly-expense.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-monthly-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyBrPipe,
    LoadingComponent,
    DashboardChartComponent
  ],
  templateUrl: './monthly-manager.component.html',
  styleUrl: './monthly-manager.component.scss'
})
export class MonthlyManagerComponent implements OnInit {
  monthlyExpenses: MonthlyExpense[] = [];
  groups: ExpenseGroup[] = [];
  selectedMonth: number;
  selectedYear: number;
  totalExpenses = 0;
  totalPaid = 0;
  totalPending = 0;
  loading = false;
  dashboardKey = true;
  isDropdownOpen = false;

  months = [
    { value: 1,  label: 'Janeiro'   },
    { value: 2,  label: 'Fevereiro' },
    { value: 3,  label: 'Março'     },
    { value: 4,  label: 'Abril'     },
    { value: 5,  label: 'Maio'      },
    { value: 6,  label: 'Junho'     },
    { value: 7,  label: 'Julho'     },
    { value: 8,  label: 'Agosto'    },
    { value: 9,  label: 'Setembro'  },
    { value: 10, label: 'Outubro'   },
    { value: 11, label: 'Novembro'  },
    { value: 12, label: 'Dezembro'  }
  ];

  constructor(
    private monthlyExpenseService: MonthlyExpenseService,
    private expenseGroupService: ExpenseGroupService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {
    const now = new Date();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear  = now.getFullYear();
  }

  ngOnInit(): void {
    this.loadGroups();
    this.loadExpenses();
  }

  // ── carregamento de dados ────────────────────────────────────────────────────

  loadGroups(): void {
    this.expenseGroupService.getAll().subscribe({
      next: (groups) => { this.groups = groups; }
    });
  }

  loadExpenses(): void {
    this.loading = true;
    this.monthlyExpenseService
      .getByMonthYear(this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (expenses) => {
          this.monthlyExpenses = expenses.map(exp => ({
            ...exp,
            group: this.groups.find(g => g._id === exp.groupId)
          }));
          this.calculateTotals();
          this.refreshDashboard();
          this.loading = false;

          // FIX: só pergunta se o mês realmente não tem nenhum lançamento.
          // Evita o modal ao trocar mês/ano quando já existem despesas salvas.
          if (expenses.length === 0) {
            this.showLoadExpensesModal();
          }
        },
        error: () => {
          this.toastService.error('Erro ao carregar despesas');
          this.loading = false;
        }
      });
  }

  // ── modal: carregar despesas (fixas / mês anterior) ──────────────────────────

  showLoadExpensesModal(): void {
    const dialogData: ConfirmationDialogData = {
      title:       'Carregar Despesas',
      message:     `Nenhuma despesa encontrada para ${this.getMonthName(this.selectedMonth)}/${this.selectedYear}. Deseja carregar?`,
      confirmText: '',
      type:        'info'
    };

    const ref = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data:  dialogData
    });

    ref.afterClosed().subscribe(result => {
      if      (result === 'fixed')    { this.loadFixedExpenses(); }
      else if (result === 'previous') { this.loadPreviousMonthExpenses(); }
    });
  }

  loadFixedExpenses(): void {
    this.loading = true;
    this.monthlyExpenseService
      .loadFixedExpenses({ month: this.selectedMonth, year: this.selectedYear })
      .subscribe({
        next: (newExpenses) => {
          if (newExpenses.length > 0) {
            this.toastService.success(`${newExpenses.length} despesas fixas carregadas`);
            this.loadExpenses();
          } else {
            this.toastService.info('Todas as despesas fixas já foram carregadas');
            this.loading = false;
          }
        },
        error: () => {
          this.toastService.error('Erro ao carregar despesas fixas');
          this.loading = false;
        }
      });
  }

  loadPreviousMonthExpenses(): void {
    this.loading = true;
    this.monthlyExpenseService
      .loadPreviousMonthExpenses({ month: this.selectedMonth, year: this.selectedYear })
      .subscribe({
        next: (newExpenses) => {
          if (newExpenses.length > 0) {
            this.toastService.success(`${newExpenses.length} despesas copiadas do mês anterior`);
            this.loadExpenses();
          } else {
            this.toastService.info('Não há despesas no mês anterior ou todas já foram carregadas');
            this.loading = false;
          }
        },
        error: () => {
          this.toastService.error('Erro ao carregar despesas do mês anterior');
          this.loading = false;
        }
      });
  }

  // ── adicionar despesa manual (ad-hoc) ────────────────────────────────────────

  openAddAdHocExpenseModal(): void {
    const dialogData: AddAdHocExpenseDialogData = {
      month:  this.selectedMonth,
      year:   this.selectedYear,
      groups: this.groups
    };

    const ref = this.dialog.open(AddAdHocExpenseModalComponent, {
      width:     '500px',
      maxWidth:  '95vw',
      data:      dialogData,
      autoFocus: true
    });

    ref.afterClosed().subscribe((dto: CreateAdHocExpenseDto | null) => {
      if (!dto) return;

      this.loading = true;
      this.monthlyExpenseService
        .createAdHocExpense(dto, this.selectedMonth, this.selectedYear)
        .subscribe({
          next: (created) => {
            const withGroup: MonthlyExpense = {
              ...created,
              group: this.groups.find(g => g._id === created.groupId)
            };
            this.monthlyExpenses.push(withGroup);
            this.calculateTotals();
            this.refreshDashboard();
            this.loading = false;
            this.toastService.success('Despesa adicionada com sucesso');
          },
          error: () => {
            this.toastService.error('Erro ao adicionar despesa');
            this.loading = false;
          }
        });
    });
  }

  // ── dropdown ─────────────────────────────────────────────────────────────────

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  // ── edição inline no grid ────────────────────────────────────────────────────

  onPaidChange(expense: MonthlyExpense): void {
    if (expense.isPaid && !expense.paidDate) {
      expense.paidDate = new Date();
    } else if (!expense.isPaid) {
      expense.paidDate = null;
    }
    this.updateExpense(expense);
  }

  updateExpense(expense: MonthlyExpense): void {
    this.monthlyExpenseService.update(expense._id!, {
      description:    expense.description,
      amount:         expense.amount,
      dueDate:        expense.dueDate,
      isPaid:         expense.isPaid,
      paidDate:       expense.isPaid ? (expense.paidDate || new Date()) : null,
      additionalInfo: expense.additionalInfo
    }).subscribe({
      next: () => {
        this.calculateTotals();
        this.refreshDashboard();
      },
      error: () => {
        this.toastService.error('Erro ao atualizar despesa');
        this.loadExpenses();
      }
    });
  }

  deleteExpense(expense: MonthlyExpense): void {
    const dialogData: ConfirmationDialogData = {
      title:       'Excluir Despesa',
      message:     `Tem certeza que deseja excluir "${expense.description}"?`,
      confirmText: 'Excluir',
      type:        'danger'
    };

    const ref = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data:  dialogData
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;

      this.monthlyExpenseService.delete(expense._id!).subscribe({
        next: () => {
          const index = this.monthlyExpenses.findIndex(e => e._id === expense._id);
          if (index > -1) {
            this.monthlyExpenses.splice(index, 1);
            this.calculateTotals();
            this.refreshDashboard();
          }
          this.toastService.success('Despesa excluída');
        },
        error: () => {
          this.toastService.error('Erro ao excluir despesa');
        }
      });
    });
  }

  updateDueDate(expense: MonthlyExpense, event: any): void {
    expense.dueDate = new Date(event.target.value + 'T00:00:00');
    this.updateExpense(expense);
  }

  updatePaidDate(expense: MonthlyExpense, event: any): void {
    expense.paidDate = new Date(event.target.value + 'T00:00:00');
    this.updateExpense(expense);
  }

  updateAmount(expense: MonthlyExpense, event: any): void {
    expense.amount = parseFloat(event.target.value) || 0;
    this.updateExpense(expense);
  }

  updateDescription(expense: MonthlyExpense, event: any): void {
    expense.description = event.target.value;
    this.updateExpense(expense);
  }

  // ── helpers ──────────────────────────────────────────────────────────────────

  isAdHoc(expense: MonthlyExpense): boolean {
    return !expense.expenseId;
  }

  private calculateTotals(): void {
    this.totalExpenses = this.monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    this.totalPaid     = this.monthlyExpenses.filter(exp => exp.isPaid).reduce((sum, exp) => sum + exp.amount, 0);
    this.totalPending  = this.totalExpenses - this.totalPaid;
  }

  private refreshDashboard(): void {
    this.dashboardKey = false;
    setTimeout(() => { this.dashboardKey = true; }, 0);
  }

  getMonthName(month: number): string {
    return this.months.find(m => m.value === month)?.label || '';
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    return format(new Date(date), 'yyyy-MM-dd');
  }

  getGroupName(groupId: string): string {
    return this.groups.find(g => g._id === groupId)?.name || '';
  }
}
