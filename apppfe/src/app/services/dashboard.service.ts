import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:8070/api/dashboard/kpi';

  constructor(private http: HttpClient) {}

  getInterventions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/interventions`);
  }

  getInventory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory`);
  }

  getPerformance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/performance`);
  }

  // Permet de charger toutes les données en même temps pour un rendu en temps réel
  getDashboardData(): Observable<any[]> {
    return forkJoin([this.getInterventions(), this.getInventory(), this.getPerformance()]);
  }
}