import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigService } from '../../../../core/services/FIREBASE-config.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ApiService } from '../../../../core/services/FIREBASE-api.service';

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
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService,
    private apiService: ApiService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.configForm = this.fb.group({
      apiKey: ['', Validators.required],
      authDomain: ['', Validators.required],
      projectId: ['', Validators.required],
      storageBucket: ['', Validators.required],
      messagingSenderId: ['', Validators.required],
      appId: ['', Validators.required],
      measurementId: [''] // Opcional
    });

    // Carregar configuração existente
    const firebaseConfig = this.configService.getFirebaseConfig();
    if (firebaseConfig) {
      this.configForm.patchValue(firebaseConfig);
      this.useMockData = false;
    } else {
      this.useMockData = true;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.configForm.valid) {
      try {
        await this.configService.saveFirebaseConfig(this.configForm.value);
        
        // Reinicializar Firebase no ApiService
        this.apiService.reinitializeFirebase();
        
        this.toastService.success('Configuração Firebase salva com sucesso!');
        this.useMockData = false;
        
        setTimeout(() => this.router.navigate(['/monthly-expenses']), 1500);
      } catch (error) {
        this.toastService.error('Erro ao salvar configuração');
        console.error(error);
      }
    } else {
      this.toastService.warning('Preencha todos os campos obrigatórios');
    }
  }

  async clearConfig(): Promise<void> {
    if (confirm('Tem certeza que deseja limpar a configuração e usar dados mockados?')) {
      await this.configService.clearFirebaseConfig();
      this.configForm.reset();
      this.toastService.info('Configuração limpa. Usando dados mockados.');
      this.useMockData = true;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Método auxiliar para copiar JSON de exemplo
  copyExampleJson(): void {
    const example = {
      apiKey: "AIzaSy...",
      authDomain: "seu-projeto.firebaseapp.com",
      projectId: "seu-projeto",
      storageBucket: "seu-projeto.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abc123",
      measurementId: "G-XXXXXXXXXX"
    };
    
    navigator.clipboard.writeText(JSON.stringify(example, null, 2));
    this.toastService.success('Exemplo copiado para área de transferência!');
  }
}
