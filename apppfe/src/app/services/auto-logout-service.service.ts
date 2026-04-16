import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutServiceService {

 private timeoutId: any;
  // Temps d'inactivité avant déconnexion (30 secondes pour le test)
  private readonly IDLE_TIME = 0.1 * 60 * 1000; 

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Injection pour détecter l'environnement
  ) {
    // On ne démarre le chrono QUE si on est dans le navigateur web
    if (isPlatformBrowser(this.platformId)) {
      this.startWatching();
    }
  }

  startWatching() {
    // Double sécurité
    if (isPlatformBrowser(this.platformId)) {
      // window.addEventListener('mousemove', () => this.resetTimer());
      // window.addEventListener('click', () => this.resetTimer());
      window.addEventListener('keypress', () => this.resetTimer());
      this.resetTimer();
    }
  }

  resetTimer() {
    if (isPlatformBrowser(this.platformId)) {
      clearTimeout(this.timeoutId);
      // On ne vérifie le localStorage que si on est dans le navigateur
      if (localStorage.getItem('token')) {
        this.timeoutId = setTimeout(() => this.logoutUser(), this.IDLE_TIME);
      }
    }
  }

  logoutUser() {
    if (isPlatformBrowser(this.platformId)) {
      // 1. Supprimer le token
      localStorage.removeItem('token');
      
      // 2. Rediriger vers la page de login
      this.router.navigate(['/login']);
      
      // 3. Afficher une alerte
      alert('Vous avez été déconnecté suite à une période d\'inactivité.');
    }
  }
}
