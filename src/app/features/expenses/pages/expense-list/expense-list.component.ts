import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseGroupService } from '../../../expense-groups/services/expense-group.service';
import { Expense } from '../../../../core/models/expense.model';
import { ExpenseGroup } from '../../../../core/models/expense-group.model';
import { ToastService } from '../../../../core/services/toast.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { CurrencyBrPipe } from '../../../../shared/pipes/currency-br.pipe';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, CurrencyBrPipe],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  groups: ExpenseGroup[] = [];
  loading = false;

  constructor(
    private expenseService: ExpenseService,
    private expenseGroupService: ExpenseGroupService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.loadExpenses();
  }

  loadGroups(): void {
    this.expenseGroupService.getAll().subscribe({
      next: (groups) => {
        this.groups = groups;
      }
    });
  }

  loadExpenses(): void {
    this.loading = true;
    this.expenseService.getAll().subscribe({
      next: (expenses) => {
        this.expenses = expenses.map(exp => ({
          ...exp,
          group: this.groups.find(g => g._id === exp.groupId)
        }));
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Erro ao carregar despesas');
        this.loading = false;
      }
    });
  }

  getGroupName(groupId: string): string {
    return this.groups.find(g => g._id === groupId)?.name || 'Sem grupo';
  }

  deleteExpense(expense: Expense): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Excluir Despesa',
      message: `Tem certeza que deseja excluir "${expense.description}"?`,
      confirmText: 'Excluir',
      type: 'danger'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.expenseService.delete(expense._id!).subscribe({
          next: () => {
            this.toastService.success('Despesa excluída');
            this.loadExpenses();
          },
          error: (error) => {
            this.toastService.error(error.message || 'Erro ao excluir');
          }
        });
      }
    });
  }

  getDirectDebitCount(): number {
    return this.expenses.filter(e => e.isDirectDebit).length;
  }

  getTotalAmount(): number {
    return this.expenses.reduce((sum, e) => sum + e.amount, 0);
  }
}
