import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as localforage from 'localforage';
import { AppConfig, FirebaseConfig } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly STORAGE_KEY = 'expense_tracker_config';
  private configSubject = new BehaviorSubject<AppConfig>({
    useMockData: true,
    theme: 'light'
  });

  public config$ = this.configSubject.asObservable();

  constructor() {
    this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    try {
      const storedConfig = await localforage.getItem<AppConfig>(this.STORAGE_KEY);
      if (storedConfig) {
        this.configSubject.next(storedConfig);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  }

  async saveFirebaseConfig(config: FirebaseConfig): Promise<void> {
    try {
      const currentConfig = this.configSubject.value;
      const newConfig: AppConfig = {
        ...currentConfig,
        firebaseConfig: config,
        useMockData: false // Desabilita mock ao configurar Firebase
      };
      
      await localforage.setItem(this.STORAGE_KEY, newConfig);
      this.configSubject.next(newConfig);
    } catch (error) {
      console.error('Erro ao salvar configuração Firebase:', error);
      throw error;
    }
  }

  getFirebaseConfig(): FirebaseConfig | null {
    return this.configSubject.value.firebaseConfig || null;
  }

  isFirebaseConfigured(): boolean {
    const config = this.getFirebaseConfig();
    return !!(config && config.apiKey && config.projectId);
  }

  // Limpar configuração (volta para mock)
  async clearFirebaseConfig(): Promise<void> {
    try {
      const currentConfig = this.configSubject.value;
      const newConfig: AppConfig = {
        ...currentConfig,
        firebaseConfig: undefined,
        useMockData: true
      };
      
      await localforage.setItem(this.STORAGE_KEY, newConfig);
      this.configSubject.next(newConfig);
    } catch (error) {
      console.error('Erro ao limpar configuração:', error);
      throw error;
    }
  }

  // Verificar se está usando dados mockados
  useMockData(): boolean {
    return this.configSubject.value.useMockData;
  }

  // Tema
  setTheme(theme: 'light' | 'dark'): void {
    const currentConfig = this.configSubject.value;
    const newConfig: AppConfig = { ...currentConfig, theme };
    
    localforage.setItem(this.STORAGE_KEY, newConfig);
    this.configSubject.next(newConfig);
    
    // Aplicar tema no body
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  getTheme(): 'light' | 'dark' {
    return this.configSubject.value.theme;
  }
}
