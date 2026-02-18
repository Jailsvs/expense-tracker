import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyExpenseService } from '../../services/monthly-expense.service';
import { DashboardData } from '../../../../core/models/monthly-expense.model';
import { CurrencyBrPipe } from '../../../../shared/pipes/currency-br.pipe';

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  imports: [CommonModule, CurrencyBrPipe],
  templateUrl: './dashboard-chart.component.html',
  styleUrl: './dashboard-chart.component.scss'
})
export class DashboardChartComponent implements OnChanges {
  @Input() month!: number;
  @Input() year!: number;
  
  dashboardData: DashboardData | null = null;
  loading = false;

  constructor(private monthlyExpenseService: MonthlyExpenseService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['month'] || changes['year']) {
      this.loadDashboard();
    }
  }

  loadDashboard(): void {
    this.loading = true;
    this.monthlyExpenseService.getDashboardData(this.month, this.year)
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  getColorByIndex(index: number): string {
    const colors = [
      '#1e40af', // Azul Royal
      '#10b981', // Verde
      '#f59e0b', // Amarelo
      '#ef4444', // Vermelho
      '#8b5cf6', // Roxo
      '#ec4899', // Rosa
      '#06b6d4', // Cyan
      '#84cc16', // Lima
      '#f97316', // Laranja
      '#6366f1'  // Indigo
    ];
    return colors[index % colors.length];
  }
}
