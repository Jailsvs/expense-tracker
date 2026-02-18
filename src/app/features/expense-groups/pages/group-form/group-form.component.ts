import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseGroupService } from '../../services/expense-group.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ExpenseGroup } from '../../../../core/models/expense-group.model';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './group-form.component.html',
  styleUrl: './group-form.component.scss'
})
export class GroupFormComponent implements OnInit {
  groupForm!: FormGroup;
  isEditMode = false;
  groupId: string | null = null;
  iconPreview: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private expenseGroupService: ExpenseGroupService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.groupId;

    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      icon: ['', Validators.required],
      iconType: ['']
    });

    if (this.isEditMode && this.groupId) {
      this.loadGroup();
    }
  }

  loadGroup(): void {
    this.loading = true;
    this.expenseGroupService.getById(this.groupId!).subscribe({
      next: (group) => {
        this.groupForm.patchValue({
          name: group.name,
          icon: group.icon,
          iconType: group.iconType
        });
        this.iconPreview = group.icon;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Erro ao carregar grupo');
        this.router.navigate(['/expense-groups']);
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    // Validar tipo
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      this.toastService.error('Tipo de arquivo inválido. Use PNG, JPEG ou SVG.');
      return;
    }

    // Validar tamanho (50KB)
    if (file.size > 50 * 1024) {
      this.toastService.error('Arquivo muito grande. Tamanho máximo: 50KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.iconPreview = base64;
      this.groupForm.patchValue({
        icon: base64,
        iconType: file.type
      });
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.groupForm.invalid) {
      this.toastService.warning('Preencha todos os campos obrigatórios');
      return;
    }

    const confirmMsg = this.isEditMode 
      ? 'Deseja salvar as alterações?' 
      : 'Deseja criar este grupo?';
      
    if (!confirm(confirmMsg)) return;

    this.loading = true;
    const formData = this.groupForm.value;

    const operation = this.isEditMode
      ? this.expenseGroupService.update(this.groupId!, formData)
      : this.expenseGroupService.create(formData);

    operation.subscribe({
      next: () => {
        this.toastService.success(
          this.isEditMode ? 'Grupo atualizado com sucesso' : 'Grupo criado com sucesso'
        );
        this.router.navigate(['/expense-groups']);
      },
      error: () => {
        this.toastService.error('Erro ao salvar grupo');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    if (confirm('Deseja cancelar? As alterações não serão salvas.')) {
      this.router.navigate(['/expense-groups']);
    }
  }
}
