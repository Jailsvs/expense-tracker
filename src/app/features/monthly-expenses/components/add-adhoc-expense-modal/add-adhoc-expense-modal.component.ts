import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { format } from 'date-fns';
import { ExpenseGroup } from '../../../../core/models/expense-group.model';
import { CreateAdHocExpenseDto } from '../../../../core/models/monthly-expense.model';

export interface AddAdHocExpenseDialogData {
  month: number;
  year: number;
  groups: ExpenseGroup[];
}

@Component({
  selector: 'app-add-adhoc-expense-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './add-adhoc-expense-modal.component.html',
  styleUrl: './add-adhoc-expense-modal.component.scss'
})
export class AddAdHocExpenseModalComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddAdHocExpenseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddAdHocExpenseDialogData
  ) {}

  ngOnInit(): void {
    // Vencimento padrão: dia 10 do mês selecionado
    const defaultDueDate = format(
      new Date(this.data.year, this.data.month - 1, 10),
      'yyyy-MM-dd'
    );

    // Primeiro grupo disponível como padrão
    const defaultGroupId = this.data.groups.length > 0
      ? this.data.groups[0]._id ?? ''
      : '';

    this.form = this.fb.group({
      description:    ['', [Validators.required, Validators.minLength(3)]],
      amount:         [null, [Validators.required, Validators.min(0.01)]],
      dueDate:        [defaultDueDate, Validators.required],
      groupId:        [defaultGroupId, Validators.required],
      additionalInfo: ['']
    });
  }

  // ── helpers de validação ─────────────────────────────────────────────────────
  fieldInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  getMonthName(): string {
    const names = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return names[this.data.month] ?? '';
  }

  // ── ações ────────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CreateAdHocExpenseDto = {
      description:    this.form.value.description.trim(),
      amount:         parseFloat(this.form.value.amount),
      // Força meia-noite local para evitar deslocamento de fuso
      dueDate:        new Date(this.form.value.dueDate + 'T00:00:00'),
      groupId:        this.form.value.groupId,
      additionalInfo: (this.form.value.additionalInfo ?? '').trim()
    };

    this.dialogRef.close(dto);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
