import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/FIREBASE-api.service';
import { ExpenseGroup, CreateExpenseGroupDto, UpdateExpenseGroupDto } from '../../../core/models/expense-group.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseGroupService {
  private readonly collectionName = 'expense_groups';
  
  // Mock data
  private mockGroups: ExpenseGroup[] = [
    {
      _id: '1',
      name: 'Moradia',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTQwYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtMyA5IDktNyA5IDd2MTFhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJ6Ii8+PHBvbHlsaW5lIHBvaW50cz0iOSAyMiA5IDEyIDE1IDEyIDE1IDIyIi8+PC9zdmc+',
      iconType: 'image/svg+xml',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: '2',
      name: 'Transporte',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTQwYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSI1IiB5PSIxMSIgd2lkdGg9IjE0IiBoZWlnaHQ9IjEwIiByeD0iMiIvPjxjaXJjbGUgY3g9IjgiIGN5PSIxOCIgcj0iMiIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTgiIHI9IjIiLz48cGF0aCBkPSJNNSAxMVY2YTEgMSAwIDAgMSAxLTFoNGEzIDMgMCAwIDEgMyAzdjQiLz48L3N2Zz4=',
      iconType: 'image/svg+xml',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: '3',
      name: 'Alimentação',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTQwYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMyAydjdjMCA1LjU1IDQuNTggMTAgMTAgMTBzMTAtNC40NSAxMC0xMFYyIi8+PHBhdGggZD0iTTMgMmg2djdjMCAxLjY2LTEuMzQgMy0zIDNzLTMtMS4zNC0zLTNWMnoiLz48L3N2Zz4=',
      iconType: 'image/svg+xml',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: '4',
      name: 'Seguros',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTQwYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgMjJzOC01IDgtMTJWNWwtOC0yLTggMnY1YzAgNyA4IDEyIDggMTJ6Ii8+PC9zdmc+',
      iconType: 'image/svg+xml',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  constructor(private apiService: ApiService) {}

  getAll(): Observable<ExpenseGroup[]> {
    if (this.apiService.isUsingMockData()) {
      return of([...this.mockGroups]).pipe(delay(300));
    }
    return this.apiService.getAll<ExpenseGroup>(this.collectionName).pipe(
      catchError(this.handleError)
    );
    /*return this.apiService.get<ExpenseGroup[]>(this.endpoint).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );*/
  }

  getById(id: string): Observable<ExpenseGroup> {
    if (this.apiService.isUsingMockData()) {
      const group = this.mockGroups.find(g => g._id === id);
      if (!group) {
        return throwError(() => new Error('Grupo não encontrado'));
      }
      return of({ ...group }).pipe(delay(200));
    }

    return this.apiService.getById<ExpenseGroup>(this.collectionName, id).pipe(
      catchError(this.handleError)
    );
    /*return this.apiService.get<ExpenseGroup>(`${this.endpoint}/${id}`).pipe(
      map(response => response.data!),
      catchError(this.handleError)
    );*/
  }
  create(dto: CreateExpenseGroupDto): Observable<ExpenseGroup> {
    if (this.apiService.isUsingMockData()) {
      const newGroup: ExpenseGroup = {
        _id: this.generateId(),
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.mockGroups.push(newGroup);
      return of({ ...newGroup }).pipe(delay(500));
    }

    return this.apiService.create<ExpenseGroup>(this.collectionName, dto).pipe(
      catchError(this.handleError)
    );
    /*return this.apiService.post<ExpenseGroup>(this.endpoint, dto).pipe(
      map(response => response.data!),
      catchError(this.handleError)
    );*/
  }

  update(id: string, dto: UpdateExpenseGroupDto): Observable<ExpenseGroup> {
    if (this.apiService.isUsingMockData()) {
      const index = this.mockGroups.findIndex(g => g._id === id);
      if (index === -1) {
        return throwError(() => new Error('Grupo não encontrado'));
      }
      this.mockGroups[index] = {
        ...this.mockGroups[index],
        ...dto,
        updatedAt: new Date()
      };
      return of({ ...this.mockGroups[index] }).pipe(delay(300));
    }

    return this.apiService.update<ExpenseGroup>(this.collectionName, id, dto).pipe(
      catchError(this.handleError)
    );
    /*return this.apiService.put<ExpenseGroup>(`${this.endpoint}/${id}`, dto).pipe(
      map(response => response.data!),
      catchError(this.handleError)
    );*/
  }

  delete(id: string): Observable<void> {
    if (this.apiService.isUsingMockData()) {
      const index = this.mockGroups.findIndex(g => g._id === id);
      if (index === -1) {
        return throwError(() => new Error('Grupo não encontrado'));
      }

      // Verificar se há despesas vinculadas
      // (simulação - em produção seria verificado no backend)
      if (this.mockGroups[index]) {
        this.mockGroups.splice(index, 1);
      }
      
      return of(undefined).pipe(delay(300));
    }

    return this.apiService.delete(this.collectionName, id).pipe(
      catchError(this.handleError)
    );
    /*return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );*/
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private handleError(error: any): Observable<never> {
    console.error('ExpenseGroupService Error:', error);
    return throwError(() => error);
  }
}
