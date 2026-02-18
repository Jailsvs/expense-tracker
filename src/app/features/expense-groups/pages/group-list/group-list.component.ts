import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpenseGroupService } from '../../services/expense-group.service';
import { ExpenseGroup } from '../../../../core/models/expense-group.model';
import { ToastService } from '../../../../core/services/toast.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, MatDialogModule],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss'
})
export class GroupListComponent implements OnInit {
  groups: ExpenseGroup[] = [];
  loading = false;

  constructor(
    private expenseGroupService: ExpenseGroupService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.expenseGroupService.getAll().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.loading = false;
      },
      error: (error) => {
        this.toastService.error('Erro ao carregar grupos');
        this.loading = false;
      }
    });
  }

  deleteGroup(group: ExpenseGroup): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Excluir Grupo',
      message: `Tem certeza que deseja excluir o grupo "${group.name}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.expenseGroupService.delete(group._id!).subscribe({
          next: () => {
            this.toastService.success('Grupo excluído com sucesso');
            this.loadGroups();
          },
          error: (error) => {
            this.toastService.error(error.message || 'Erro ao excluir grupo');
          }
        });
      }
    });
  }
}
