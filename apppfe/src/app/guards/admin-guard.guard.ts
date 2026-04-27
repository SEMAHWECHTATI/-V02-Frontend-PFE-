import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthServiceService } from '../services/auth-service.service';

export const adminGuardGuard: CanActivateFn = (route, state) => {
  // On injecte vos services
  const authService = inject(AuthServiceService); // 👈 Votre service exact
  const router = inject(Router);

  // On lance la vérification
  return authService.verifierSiAdmin().pipe(
    map(estAdmin => {
      if (estAdmin) {
        return true; // Autorisé
      } else {
        return router.createUrlTree(['/login']); // Refusé -> redirection vers Login
      }
    })
  );
};