import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // 1. Liste des segments d'URL qui ne nécessitent PAS de token
  const publicUrls = [
    '/authentification/',
    '/api/demandes/envoyer', // Décommenté et ajouté ici
    '/api/enumerations/roles',
    '/api/enumerations/departements',
    '/api/groupes' // Optionnel : selon votre SecurityConfig Java
  ];

  // 2. Vérifier si la requête actuelle correspond à une route publique
  const isPublicRoute = publicUrls.some(url => req.url.includes(url));

  if (isPublicRoute) {
    return next(req);
  }

  // 3. Gestion du Token
  let token: string | null = null;
  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('token');
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
