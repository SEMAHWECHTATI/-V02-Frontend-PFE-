import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private apiUrl = 'http://localhost:8070/authentification'; 

  constructor(private http: HttpClient) { }

  // 1. Appel pour demander le lien de réinitialisation
  demanderReinitialisation(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mot-de-passe-oublie`, { email });
  }

  // 2. Appel pour envoyer le token et le nouveau mot de passe
  reinitialiserMotDePasse(token: string, nouveauMotDePasse: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, nouveauMotDePasse });
  }
}
