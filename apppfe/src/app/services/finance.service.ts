import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DashboardFinance } from '../Model/alerte';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {

private apiUrl = 'http://localhost:8070/api/stocks/dashboard-finance';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardFinance> {
    return this.http.get<DashboardFinance>(`${this.apiUrl}/dashboard`);
  }}
