import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  
  private router = inject(Router);
  private authService = inject(AuthServiceService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    // ✅ 1. Ajouter le token à chaque requête
    const token = this.authService.getToken();
    
    if (token && !request.url.includes('/login')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log(`📡 ${request.method} ${request.url}`);

    return next.handle(request).pipe(
      // ✅ 2. Retry automatique en cas d'erreur réseau (max 1 fois)
      retry(1),
      
      // ✅ 3. Gestion des erreurs
      catchError((error: HttpErrorResponse) => {
        
        // ❌ 401 - Token invalide ou expiré
        if (error.status === 401) {
          console.error('❌ [401] Token invalide ou expiré');
          localStorage.removeItem('token');
          localStorage.removeItem('utilisateurConnecte');
          this.router.navigate(['/authentification']);
          return throwError(() => new Error('Session expirée'));
        }

        // ❌ 403 - Accès refusé
        if (error.status === 403) {
          console.error('❌ [403] Accès refusé - Permissions insuffisantes');
          this.router.navigate(['/']);
          return throwError(() => new Error('Accès refusé'));
        }

        // ❌ 404 - Non trouvé
        if (error.status === 404) {
          console.error('❌ [404] Ressource non trouvée');
          return throwError(() => new Error('Ressource non trouvée'));
        }

        // ❌ 500 - Erreur serveur
        if (error.status === 500) {
          console.error('❌ [500] Erreur serveur');
          return throwError(() => new Error('Erreur serveur'));
        }

        // ❌ Autres erreurs
        console.error('❌ Erreur HTTP:', error.status, error.message);
        return throwError(() => error);
      })
    );
  }
}