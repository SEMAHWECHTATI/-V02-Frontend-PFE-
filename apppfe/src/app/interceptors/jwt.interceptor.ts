import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // 1. Liste des segments d'URL qui ne nécessitent PAS de token (routes publiques)
  const publicUrls = [
    '/authentification/',
    '/api/demandes/envoyer',
    '/api/enumerations/',
    '/api/groupes',
    '/api/inventory/articles', // Articles publics
    '/api/inventory/demandes-materiel', // ✅ Demandes de matériel - publique
    '/api/consommations-pieces/'
  ];

  // 2. Vérifier si la requête actuelle correspond à une route publique
  const isPublicRoute = publicUrls.some(url => req.url.includes(url));

  if (isPublicRoute) {
    console.log('🔓 Route publique, pas de token envoyé:', req.url);
    return next(req);
  }

  // 3. Gestion du Token pour les routes protégées
  let token: string | null = null;
  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('token');
  }

  if (token) {
    console.log('🔐 Token JWT ajouté à la requête:', req.url);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.warn('⚠️ Pas de token trouvé pour la route protégée:', req.url);
  }

  return next(req);
};
