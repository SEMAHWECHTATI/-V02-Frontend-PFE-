import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import { map } from 'rxjs/operators';

export const technicienGuard: CanActivateFn = (route, state) => {
// On injecte les services
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  // On lance la vérification avec une méthode dédiée au technicien
  return authService.verifierSiTechnicien().pipe(
    map(estTechnicien => {
      if (estTechnicien) {
        return true; // ✅ Autorisé : c'est bien un technicien
      } else {
        return router.createUrlTree(['/login']); // ❌ Refusé -> redirection
      }
    })
  );};
