import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; 
import { catchError, map } from 'rxjs/operators'; 
import { LoginRequest } from '../Model/Entity';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private apiAuthUrl = 'http://localhost:8070/authentification'; 
  private apiUserUrl = 'http://localhost:8070/user'; 

  constructor(private http: HttpClient, private router: Router) { }

   login(data: LoginRequest): Observable<any> {
    console.log('🔐 Connexion utilisateur:', data.email);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiAuthUrl}/login`, data, { 
      headers, 
      responseType: 'text' as 'json' 
    });
  }

  getUtilisateurById(id: number): Observable<any> {
    console.log('👤 Récupération utilisateur ID:', id);
    return this.http.get<any>(`${this.apiAuthUrl}/user/${id}`);
  }
  
  changerMotDePasse(data: { email: string, motDePasse: string }): Observable<any> {
    console.log('🔑 Changement mot de passe:', data.email);
    return this.http.post(`${this.apiAuthUrl}/changer-mdp`, data, { 
      responseType: 'text'
    });
  }

  demanderReinitialisation(email: string): Observable<any> {
    return this.http.post(`${this.apiAuthUrl}/mot-de-passe-oublie`, { email });
  }

  reinitialiserMotDePasse(token: string, nouveauMotDePasse: string): Observable<any> {
    return this.http.post(`${this.apiAuthUrl}/reset-password`, { token, nouveauMotDePasse });
  }

  // ==========================================
  // 🔴 GUARD ADMINISTRATEUR
  // ==========================================
  verifierSiAdmin(): Observable<boolean> {
    // 🛡️ SÉCURITÉ SSR : On vérifie qu'on est bien dans le navigateur
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return of(false); 
    }

    const token = localStorage.getItem('token'); 
    
    if (!token) {
      console.warn("❌ Admin Guard: Aucun token trouvé dans le localStorage");
      return of(false); 
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(`${this.apiUserUrl}/verifyuser`, { headers }).pipe(
      map(utilisateur => {
        console.log("🔍 [Admin Guard] Réponse Spring Boot :", utilisateur);
        
        if (utilisateur && utilisateur.role === 'Administrateur') {
          return true; // ✅ C'est bien un Admin
        }
        
        console.warn("❌ [Admin Guard] Accès refusé : Le rôle n'est pas Administrateur.");
        return false; 
      }),
      catchError((erreur) => {
        console.error("❌ [Admin Guard] Token invalide ou expiré", erreur);
        localStorage.removeItem('token'); 
        return of(false); 
      })
    );
  }

  // ==========================================
  // 🔵 GUARD TECHNICIEN
  // ==========================================
  verifierSiTechnicien(): Observable<boolean> {
    // 🛡️ SÉCURITÉ SSR : On vérifie qu'on est bien dans le navigateur
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return of(false); 
    }

    const token = localStorage.getItem('token'); 
    
    if (!token) {
      console.warn("❌ Technicien Guard: Aucun token trouvé dans le localStorage");
      return of(false); 
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(`${this.apiUserUrl}/verifyuser`, { headers }).pipe(
      map(utilisateur => {
        console.log("🔍 [Technicien Guard] Réponse Spring Boot :", utilisateur);
        
        if (utilisateur && utilisateur.role === 'Technicien' || utilisateur.role === 'Administrateur') {
          return true; // ✅ C'est bien un Technicien
        }
        
        console.warn("❌ [Technicien Guard] Accès refusé : Le rôle n'est pas Technicien.");
        return false; 
      }),
      catchError((erreur) => {
        console.error("❌ [Technicien Guard] Token invalide ou expiré", erreur);
        localStorage.removeItem('token'); 
        return of(false); 
      })
    );
  }

  // ==========================================
  // 🔵 GUARD Demandeur
  // ==========================================
  verifierSiDemandeur(): Observable<boolean> {
    // 🛡️ SÉCURITÉ SSR : On vérifie qu'on est bien dans le navigateur
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return of(false); 
    }

    const token = localStorage.getItem('token'); 
    
    if (!token) {
      console.warn("❌ Demandeur Guard: Aucun token trouvé dans le localStorage");
      return of(false); 
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(`${this.apiUserUrl}/verifyuser`, { headers }).pipe(
      map(utilisateur => {
        console.log("🔍 [Demandeur Guard] Réponse Spring Boot :", utilisateur);
        
        if (utilisateur && utilisateur.role === 'Demandeur' || utilisateur.role === 'Administrateur') {
          return true; // ✅ C'est bien un Demandeur
        }
        
        console.warn("❌ [Demandeur Guard] Accès refusé : Le rôle n'est pas Demandeur.");
        return false; 
      }),
      catchError((erreur) => {
        console.error("❌ [Demandeur Guard] Token invalide ou expiré", erreur);
        localStorage.removeItem('token'); 
        return of(false); 
      })
    );
  }
  // ==========================================
  // 🔵 GUARD Gestionnaire stock
  // ==========================================
  verifierSiGestionnaireStock(): Observable<boolean> {
    // 🛡️ SÉCURITÉ SSR : On vérifie qu'on est bien dans le navigateur
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return of(false); 
    }

    const token = localStorage.getItem('token'); 
    
    if (!token) {
      console.warn("❌ Gestionnaire Stock Guard: Aucun token trouvé dans le localStorage");
      return of(false); 
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(`${this.apiUserUrl}/verifyuser`, { headers }).pipe(
      map(utilisateur => {
        console.log("🔍 [Gestionnaire Stock Guard] Réponse Spring Boot :", utilisateur);
        
        if (utilisateur && utilisateur.role === 'GestionnaireStock' || utilisateur.role === 'Administrateur') {
          return true; // ✅ C'est bien un Gestionnaire Stock
        }
        
        console.warn("❌ [Gestionnaire Stock Guard] Accès refusé : Le rôle n'est pas Gestionnaire Stock.");
        return false; 
      }),
      catchError((erreur) => {
        console.error("❌ [Gestionnaire Stock Guard] Token invalide ou expiré", erreur);
        localStorage.removeItem('token'); 
        return of(false); 
      })
    );
  }

   /**
   * 📝 Obtenir le token
   */
  getToken(): string | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem('token');
  }

    /**
   * 👤 Obtenir l'utilisateur
   */
  getUser(): any {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    
    const userStr = localStorage.getItem('utilisateurConnecte');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('❌ Erreur parsing utilisateur');
      return null;
    }
  }
  /**
   * 🎯 Obtenir le rôle
   */
  getUserRole(): string {
    const user = this.getUser();
    return user?.role || '';
  }

  /**
   * 🛡️ Vérifier le rôle
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole().toLowerCase();
    const checkRole = role.toLowerCase();
    
    return userRole === checkRole || userRole === 'administrateur' || userRole === 'administrator';
  }

  /**
   * 📌 Obtenir les headers d'authentification
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

   /**
   * ✅ Vérifier l'authentification
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // ✅ Vérifier aussi l'utilisateur
    const user = this.getUser();
    return !!user && !!token;
  }

     /* 🚪 LOGOUT - Déconnexion sécurisée
   */
  logout(): void {
    console.log('🚪 Déconnexion...');

    // ✅ 1. Appel API pour déconnexion backend (optionnel)
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(`${this.apiAuthUrl}/logout`, {}, { headers }).subscribe({
        next: () => console.log('✅ Logout API validé'),
        error: (err) => console.warn('⚠️ Logout API échoué:', err)
      });
    }

    // ✅ 2. Nettoyer le localStorage
    localStorage.clear();
    sessionStorage.clear();

    // ✅ 3. Nettoyer l'historique
    history.replaceState(null, '', '/authentification');

    // ✅ 4. Rediriger
    this.router.navigate(['/authentification']);
    console.log('✅ Déconnexion complète');
  }

  
}