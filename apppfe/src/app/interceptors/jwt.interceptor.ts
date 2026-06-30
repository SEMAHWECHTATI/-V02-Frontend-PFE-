import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // 1. Liste des URLs dont la lecture seule (GET) ou l'accès global est entièrement public
  const publicUrls = [
    '/authentification/',
    '/api/demandes/envoyer',
    '/api/enumerations/',
    '/api/groupes',
    '/api/inventory/demandes-materiel', 
    '/api/consommations-pieces/'
  ];

  // 2. Cas spécifique de l'inventaire : Seule la lecture (GET) est publique !
  const isPublicInventoryGet = req.url.includes('/api/inventory/articles') && req.method === 'GET';

  // 3. Vérification globale de la route publique
  const isPublicRoute = publicUrls.some(url => req.url.includes(url)) || isPublicInventoryGet;

  if (isPublicRoute) {
    console.log('🔓 Route publique ou lecture anonyme, pas de token envoyé:', req.url);
    return next(req);
  }

  // 4. Gestion du Token pour les routes protégées (POST, PUT, DELETE d'articles inclus !)
  let token: string | null = null;
  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('token');
  }

  if (token) {
    console.log(`🔐 Token JWT [${req.method}] ajouté à la requête:`, req.url);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.warn(`⚠️ Pas de token trouvé pour la route protégée [${req.method}]:`, req.url);
  }

  return next(req);
};