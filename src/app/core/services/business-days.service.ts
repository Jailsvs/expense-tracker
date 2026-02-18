import { Injectable } from '@angular/core';
import { addDays, getDay, getDaysInMonth, isWeekend, setDate } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class BusinessDaysService {

  /**
   * Ajusta uma data para o próximo dia útil (Segunda a Sexta)
   * Se for Sábado ou Domingo, avança para a próxima Segunda-feira
   */
  adjustToBusinessDay(date: Date): Date {
    let adjustedDate = new Date(date);
    
    while (isWeekend(adjustedDate)) {
      adjustedDate = addDays(adjustedDate, 1);
    }
    
    return adjustedDate;
  }

  /**
   * Calcula a data de vencimento baseado no dia de pagamento
   * Considera:
   * 1. Se o dia é maior que os dias do mês, usa o último dia do mês
   * 2. Ajusta para dia útil se cair em final de semana
   */
  calculateDueDate(year: number, month: number, paymentDay: number): Date {
    // Obter número de dias no mês
    const daysInMonth = getDaysInMonth(new Date(year, month - 1));
    
    // Ajustar paymentDay se for maior que os dias do mês
    const adjustedDay = Math.min(paymentDay, daysInMonth);
    
    // Criar data inicial
    let dueDate = new Date(year, month - 1, adjustedDay);
    
    // Ajustar para dia útil
    dueDate = this.adjustToBusinessDay(dueDate);
    
    return dueDate;
  }

  /**
   * Verifica se uma data é dia útil
   */
  isBusinessDay(date: Date): boolean {
    return !isWeekend(date);
  }

  /**
   * Retorna o nome do dia da semana em português
   */
  getDayName(date: Date): string {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[getDay(date)];
  }
}
