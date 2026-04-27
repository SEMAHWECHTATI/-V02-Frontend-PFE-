import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';

export const demandeurGuard: CanActivateFn = (route, state) => {
 // On injecte les services
   const authService = inject(AuthServiceService);
   const router = inject(Router);
 
   // On lance la vérification avec une méthode dédiée au technicien
   return authService.verifierSiDemandeur().pipe(
     map(estDemandeur => {
       if (estDemandeur) {
         return true; // ✅ Autorisé : c'est bien un demandeur
       } else {
         return router.createUrlTree(['/login']); // ❌ Refusé -> redirection
       }
     })
   );};
 
