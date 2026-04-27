import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutServiceService {

  private timeoutId: any;
  private readonly IDLE_TIME = 15 * 60 * 1000; // 15 minutes
  private readonly WARNING_TIME = 13 * 60 * 1000; // 13 minutes (avertissement à 2 min)
  private warningShown = false;

  constructor(
    private router: Router,
    private authService: AuthServiceService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.startWatching();
    }
  }

  /**
   * 🔍 Démarrer la surveillance
   */
  startWatching() {
    if (isPlatformBrowser(this.platformId)) {
      console.log('👁️ Surveillance de l\'inactivité activée');
      
      window.addEventListener('mousemove', () => this.resetTimer());
      window.addEventListener('click', () => this.resetTimer());
      window.addEventListener('keypress', () => this.resetTimer());
      window.addEventListener('scroll', () => this.resetTimer());
      
      this.resetTimer();
    }
  }

  /**
   * 🔄 Réinitialiser le timer
   */
  resetTimer() {
    if (isPlatformBrowser(this.platformId)) {
      clearTimeout(this.timeoutId);
      
      if (this.authService.isAuthenticated()) {
        this.warningShown = false;
        
        // ✅ Avertissement à 2 minutes
        setTimeout(() => {
          if (!this.warningShown && this.authService.isAuthenticated()) {
            this.showWarning();
            this.warningShown = true;
          }
        }, this.WARNING_TIME);

        // ✅ Logout automatique après 15 minutes
        this.timeoutId = setTimeout(() => {
          this.logoutUser();
        }, this.IDLE_TIME);
      }
    }
  }

  /**
   * ⚠️ Afficher un avertissement
   */
  private showWarning() {
    const confirmDialog = confirm(
      '⚠️ Vous êtes inactif depuis 13 minutes.\n\n' +
      'Vous serez déconnecté dans 2 minutes.\n\n' +
      'Cliquez OK pour rester connecté.'
    );

    if (confirmDialog) {
      this.resetTimer();
    }
  }

  /**
   * 🚪 Déconnexion automatique
   */
  private logoutUser() {
    if (isPlatformBrowser(this.platformId)) {
      console.log('⏰ Déconnexion automatique - Inactivité détectée');
      this.authService.logout();
      alert('Vous avez été déconnecté suite à une période d\'inactivité de 15 minutes.');
    }
  }

  /**
   * 🛑 Arrêter la surveillance
   */
  stopWatching() {
    clearTimeout(this.timeoutId);
    console.log('👁️ Surveillance de l\'inactivité arrêtée');
  }
}