import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConfigurationGlobale {
  id: number;
  indiceFaisabiliteEquipe: number;
  alertesEmailActives: boolean;
  autoAssignationActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private apiUrl = 'http://localhost:8070/api/configuration'; // Ajustez le port si nécessaire

  constructor(private http: HttpClient) {}

  getConfig(): Observable<ConfigurationGlobale> {
    return this.http.get<ConfigurationGlobale>(this.apiUrl);
  }

  updateConfig(config: ConfigurationGlobale): Observable<ConfigurationGlobale> {
    return this.http.put<ConfigurationGlobale>(this.apiUrl, config);
  }
}