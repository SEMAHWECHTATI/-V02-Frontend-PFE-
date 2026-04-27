import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';

/**
 * ✅ GUARD - Empêcher l'accès à /login si connecté
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthServiceService);

  // ✅ Vérifier si l'utilisateur est connecté
  if (authService.isAuthenticated()) {
    console.log('ℹ️ Utilisateur déjà connecté, redirection vers dashboard');
    
    // 🔀 Rediriger vers le tableau de bord selon le rôle
    const user = authService.getUser();
    const role = user?.role?.toLowerCase() || '';

    if (role === 'demandeur') {
      router.navigate(['/espace-demandeur']);
    } else if (role === 'administrateur' || role === 'admin') {
      router.navigate(['/index']);
    } else if (role === 'technicien') {
      router.navigate(['/technicien']);
    } else {
      router.navigate(['/']);
    }

    return false;
  }

  // ✅ Sinon, laisser accéder à la page de login
  console.log('✅ Accès à /login autorisé');
  return true;
};