import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseGroupService } from '../../../expense-groups/services/expense-group.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ExpenseGroup } from '../../../../core/models/expense-group.model';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss'
})
export class ExpenseFormComponent implements OnInit {
  expenseForm!: FormGroup;
  groups: ExpenseGroup[] = [];
  isEditMode = false;
  expenseId: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private expenseGroupService: ExpenseGroupService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.expenseId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.expenseId;

    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paymentDay: [null, [Validators.required, Validators.min(1), Validators.max(31)]],
      groupId: ['', Validators.required],
      isDirectDebit: [false],
      additionalInfo: ['']
    });

    this.loadGroups();

    if (this.isEditMode && this.expenseId) {
      this.loadExpense();
    }
  }

  loadGroups(): void {
    this.expenseGroupService.getAll().subscribe({
      next: (groups) => {
        this.groups = groups;
      },
      error: () => {
        this.toastService.error('Erro ao carregar grupos');
      }
    });
  }

  loadExpense(): void {
    this.loading = true;
    this.expenseService.getById(this.expenseId!).subscribe({
      next: (expense) => {
        this.expenseForm.patchValue({
          description: expense.description,
          amount: expense.amount,
          paymentDay: expense.paymentDay,
          groupId: expense.groupId,
          isDirectDebit: expense.isDirectDebit,
          additionalInfo: expense.additionalInfo
        });
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Erro ao carregar despesa');
        this.router.navigate(['/expenses']);
      }
    });
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.toastService.warning('Preencha todos os campos obrigatórios');
      Object.keys(this.expenseForm.controls).forEach(key => {
        const control = this.expenseForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    const confirmMsg = this.isEditMode 
      ? 'Deseja salvar as alterações?' 
      : 'Deseja criar esta despesa?';

    const dialogData: ConfirmationDialogData = {
      title: this.isEditMode ? 'Salvar Alterações' : 'Criar Despesa',
      message: confirmMsg,
      confirmText: 'Confirmar',
      type: 'info'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveExpense();
      }
    });
  }

  private saveExpense(): void {
    this.loading = true;
    const formData = this.expenseForm.value;

    const operation = this.isEditMode
      ? this.expenseService.update(this.expenseId!, formData)
      : this.expenseService.create(formData);

    operation.subscribe({
      next: () => {
        this.toastService.success(
          this.isEditMode ? 'Despesa atualizada com sucesso' : 'Despesa criada com sucesso'
        );
        this.router.navigate(['/expenses']);
      },
      error: () => {
        this.toastService.error('Erro ao salvar despesa');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Cancelar',
      message: 'Deseja cancelar? As alterações não serão salvas.',
      confirmText: 'Sim, cancelar',
      cancelText: 'Continuar editando',
      type: 'warning'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/expenses']);
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.expenseForm.get(field);
    if (!control?.touched || !control?.errors) return '';

    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['min']) return `Valor mínimo: ${control.errors['min'].min}`;
    if (control.errors['max']) return `Valor máximo: ${control.errors['max'].max}`;
    
    return 'Campo inválido';
  }
}
