import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class PwaInstallService {
  private promptEvent: BeforeInstallPromptEvent | null = null;
  private canInstall$ = new BehaviorSubject<boolean>(false);
  private isInstalled$ = new BehaviorSubject<boolean>(false);
  private isMobile$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.checkIfInstalled();
    this.detectMobile();
    this.listenForInstallPrompt();
    this.listenForAppInstalled();
  }

  /**
   * Observable que indica se o app pode ser instalado
   */
  get canInstall(): Observable<boolean> {
    return this.canInstall$.asObservable();
  }

  /**
   * Observable que indica se o app já está instalado
   */
  get isInstalled(): Observable<boolean> {
    return this.isInstalled$.asObservable();
  }

  /**
   * Observable que indica se é dispositivo mobile
   */
  get isMobile(): Observable<boolean> {
    return this.isMobile$.asObservable();
  }

  /**
   * Dispara o prompt de instalação nativo do browser
   */
  async install(): Promise<boolean> {
    if (!this.promptEvent) {
      console.warn('PWA: Prompt de instalação não disponível');
      return false;
    }

    try {
      await this.promptEvent.prompt();
      const { outcome } = await this.promptEvent.userChoice;
      
      console.log(`PWA: Usuário ${outcome === 'accepted' ? 'aceitou' : 'rejeitou'} a instalação`);
      
      this.promptEvent = null;
      this.canInstall$.next(false);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA: Erro ao instalar:', error);
      return false;
    }
  }

  /**
   * Detecta se é dispositivo mobile
   */
  private detectMobile(): void {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     (window.innerWidth <= 768);
    
    this.isMobile$.next(isMobile);
    
    // Atualiza ao redimensionar
    window.addEventListener('resize', () => {
      const nowMobile = window.innerWidth <= 768;
      if (nowMobile !== this.isMobile$.value) {
        this.isMobile$.next(nowMobile);
      }
    });
  }

  /**
   * Verifica se o app já está instalado
   */
  private checkIfInstalled(): void {
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    this.isInstalled$.next(isStandalone);
    
    if (isStandalone) {
      console.log('PWA: App já está instalado');
    }
  }

  /**
   * Escuta o evento beforeinstallprompt (Chrome/Edge)
   */
  private listenForInstallPrompt(): void {
    fromEvent<BeforeInstallPromptEvent>(window, 'beforeinstallprompt')
      .pipe(take(1))
      .subscribe((event) => {
        event.preventDefault();
        this.promptEvent = event;
        this.canInstall$.next(true);
        
        console.log('PWA: Prompt de instalação disponível');
      });
  }

  /**
   * Escuta quando o app é instalado
   */
  private listenForAppInstalled(): void {
    fromEvent(window, 'appinstalled')
      .pipe(take(1))
      .subscribe(() => {
        console.log('PWA: App instalado com sucesso!');
        this.isInstalled$.next(true);
        this.canInstall$.next(false);
        this.promptEvent = null;
      });
  }
}
