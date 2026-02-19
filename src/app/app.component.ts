import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './shared/components/toast/toast.component';
import { HeaderComponent } from './layout/header/header.component';
import { PwaInstallPromptComponent } from './shared/components/pwa-install-prompt/pwa-install-prompt.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastComponent,
    HeaderComponent,
    PwaInstallPromptComponent
  ],
  template: `
    <app-header></app-header>
    <app-toast></app-toast>
    <app-pwa-install-prompt></app-pwa-install-prompt>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      padding-top: 1rem;
    }
  `]
})
export class AppComponent {
  title = 'Expense Tracker';
}
