import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaInstallService } from '../../../core/services/pwa-install.service';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pwa-install-prompt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pwa-install-prompt.component.html',
  styleUrl: './pwa-install-prompt.component.scss'
})
export class PwaInstallPromptComponent implements OnInit, OnDestroy {
  shouldShow$!: Observable<boolean>;
  isVisible = false;
  private destroy$ = new Subject<void>();
  private readonly DISMISS_KEY = 'pwa-prompt-dismissed';
  private readonly DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

  constructor(private pwaService: PwaInstallService) {}

  ngOnInit(): void {
    // Verifica se foi dismissed recentemente
    if (this.wasDismissedRecently()) {
      return;
    }

    // Combina: canInstall + NOT isInstalled + isMobile
    this.shouldShow$ = combineLatest([
      this.pwaService.canInstall,
      this.pwaService.isInstalled,
      this.pwaService.isMobile
    ]).pipe(
      map(([canInstall, isInstalled, isMobile]) => 
        canInstall && !isInstalled && isMobile
      ),
      takeUntil(this.destroy$)
    );

    // Mostra banner após 3s (para não ser intrusivo)
    this.shouldShow$.subscribe(shouldShow => {
      if (shouldShow && !this.isVisible) {
        setTimeout(() => {
          this.isVisible = true;
        }, 3000);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onInstall(): Promise<void> {
    const installed = await this.pwaService.install();
    if (installed) {
      this.isVisible = false;
    }
  }

  onDismiss(): void {
    this.isVisible = false;
    
    // Salva timestamp do dismiss
    const dismissedAt = Date.now();
    localStorage.setItem(this.DISMISS_KEY, dismissedAt.toString());
  }

  private wasDismissedRecently(): boolean {
    const dismissedAt = localStorage.getItem(this.DISMISS_KEY);
    
    if (!dismissedAt) {
      return false;
    }

    const timeSinceDismiss = Date.now() - parseInt(dismissedAt, 10);
    return timeSinceDismiss < this.DISMISS_DURATION;
  }
}
