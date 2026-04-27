import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import { inject } from '@angular/core';

/**
 * ✅ GUARD - Vérifier le rôle
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthServiceService);
    const router = inject(Router);

    const userRole = authService.getUserRole();

    if (allowedRoles.includes(userRole)) {
      console.log('✅ Rôle autorisé:', userRole);
      return true;
    }

    console.warn('❌ Rôle non autorisé:', userRole);
    authService.logout();
    return false;
  };
};
