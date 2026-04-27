import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Utilisateur } from '../Model/Entity';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators'; // ✅ Nécessaire pour traiter la réponse


@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
    private apiUrl = 'http://localhost:8070/user'; 


constructor(private http: HttpClient) {
    console.log('✅ ApiService initialisé');
  }

     /**
   * 👥 Lister tous les utilisateurs
   * GET /user
   */
  getUtilisateurs(): Observable<Utilisateur[]> {
    console.log('👥 Récupération de tous les utilisateurs');
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  /**
   * ✏️ Modifier un utilisateur
   * PUT /user/{id}
   */
  updateUtilisateur(id: number, utilisateur: Utilisateur): Observable<Utilisateur> {
    console.log('✏️ Modification utilisateur ID:', id);
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, utilisateur);
  }

  /**
   * 🗑️ Supprimer un utilisateur
   * DELETE /user/{id}
   */
  deleteUtilisateur(id: number): Observable<void> {
    console.log('🗑️ Suppression utilisateur ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
    // NOUVEAU : Méthode pour le Guard
    // ==========================================
    verifierSiAdmin(): Observable<boolean> {
      // 1. On récupère le token sauvegardé lors du login
      const token = localStorage.getItem('token'); 
      
      // S'il n'y a pas de token, on bloque directement
      if (!token) {
        return of(false); 
      }
  
      // 2. On prépare le header avec le token
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
      // 3. On interroge Spring Boot
      return this.http.get<any>(`${this.apiUrl}/verifyuser`, { headers }).pipe(
        map(utilisateur => {
          // ⚠️ TRÈS IMPORTANT : Vérifiez le nom exact de la propriété dans votre backend 
          // (est-ce "role", "profil", "type" ?)
          if (utilisateur && utilisateur.role === 'Administrateur') {
            return true; // C'est bien un Admin, on laisse passer !
          }
          return false; // Token valide, mais ce n'est pas un Admin
        }),
        catchError((erreur) => {
          // 4. Si le backend renvoie une erreur (ex: Token expiré)
          console.error("Token invalide ou expiré", erreur);
          localStorage.removeItem('token'); // On supprime le mauvais token
          return of(false); // On bloque l'accès
        })
      );
    }
}
