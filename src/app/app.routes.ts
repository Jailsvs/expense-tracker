import { Routes } from '@angular/router';

export const routes: Routes = [
  // Home page — rota padrão
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'config',
    loadComponent: () => import('./features/config/pages/config-form/config-form.component').then(m => m.ConfigFormComponent)
  },
  {
    path: 'expense-groups',
    loadComponent: () => import('./features/expense-groups/pages/group-list/group-list.component').then(m => m.GroupListComponent)
  },
  {
    path: 'expense-groups/new',
    loadComponent: () => import('./features/expense-groups/pages/group-form/group-form.component').then(m => m.GroupFormComponent)
  },
  {
    path: 'expense-groups/:id/edit',
    loadComponent: () => import('./features/expense-groups/pages/group-form/group-form.component').then(m => m.GroupFormComponent)
  },
  {
    path: 'expenses',
    loadComponent: () => import('./features/expenses/pages/expense-list/expense-list.component').then(m => m.ExpenseListComponent)
  },
  {
    path: 'expenses/new',
    loadComponent: () => import('./features/expenses/pages/expense-form/expense-form.component').then(m => m.ExpenseFormComponent)
  },
  {
    path: 'expenses/:id/edit',
    loadComponent: () => import('./features/expenses/pages/expense-form/expense-form.component').then(m => m.ExpenseFormComponent)
  },
  {
    path: 'monthly-expenses',
    loadComponent: () => import('./features/monthly-expenses/pages/monthly-manager/monthly-manager.component').then(m => m.MonthlyManagerComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
