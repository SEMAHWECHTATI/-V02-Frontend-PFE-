import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JournalAudit } from '../Model/Entity';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditService {

private apiUrl = 'http://localhost:8070/api/audit'; // Ajuste le port si nécessaire

  constructor(private http: HttpClient) {}

  getLogs(): Observable<JournalAudit[]> {
    return this.http.get<JournalAudit[]>(this.apiUrl + '/all');
  }
}