import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import { inject } from '@angular/core';

export const authGuardGuard: CanActivateFn = (route, state) => {


  const router = inject(Router);
  const authService = inject(AuthServiceService);

  if (authService.isAuthenticated()) {
    console.log('✅ Accès autorisé');
    return true;
  }

  console.warn('❌ Non authentifié');
  router.navigate(['/authentification']);
  return false;
};
