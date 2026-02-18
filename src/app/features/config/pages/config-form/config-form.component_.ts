/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigService } from '../../../../core/services/config.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-config-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './config-form.component.html',
  styleUrl: './config-form.component.scss'
})
export class ConfigFormComponent implements OnInit {
  configForm!: FormGroup;
  useMockData = true;

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.configForm = this.fb.group({
      host: ['', Validators.required],
      database: ['expense_tracker', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    const mongoConfig = this.configService.getMongoConfig();
    if (mongoConfig) {
      this.configForm.patchValue(mongoConfig);
      this.useMockData = false;
    } else {
      this.useMockData = true;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.configForm.valid) {
      try {
        await this.configService.saveMongoConfig(this.configForm.value);
        this.toastService.success('Configuração salva com sucesso!');
        this.useMockData = false;
        setTimeout(() => this.router.navigate(['/monthly-expenses']), 1500);
      } catch (error) {
        this.toastService.error('Erro ao salvar configuração');
      }
    }
  }

  async clearConfig(): Promise<void> {
    if (confirm('Tem certeza que deseja limpar a configuração e usar dados mockados?')) {
      await this.configService.clearMongoConfig();
      this.configForm.reset({ database: 'expense_tracker' });
      this.toastService.info('Configuração limpa. Usando dados mockados.');
      this.useMockData = true;
    }
  }
}
*/