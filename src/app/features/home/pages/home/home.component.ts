import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly currentYear = new Date().getFullYear();

  readonly links = [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/jailsvs/',
      icon: 'bi-linkedin',
      color: 'link-linkedin'
    },
    {
      label: 'j*****@gmail.com',
      href: 'mailto:j*****@gmail.com',
      icon: 'bi-envelope-fill',
      color: 'link-gmail'
    },
    {
      label: '+55 47 99*7*-9*7*',
      href: 'https://wa.me/554799*7*9*7*',
      icon: 'bi-whatsapp',
      color: 'link-whatsapp'
    }
  ];
}
