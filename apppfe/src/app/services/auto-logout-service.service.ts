import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutServiceService {

  private timeoutId: any;
  private warningTimeoutId: any; // 🎯 Ajout pour nettoyer proprement le timer d'avertissement
  private readonly IDLE_TIME = 15 * 60 * 1000; // 15 minutes
  private readonly WARNING_TIME = 13 * 60 * 1000; // 13 minutes (avertissement à 2 min)
  private warningShown = false;

  private ngZone = inject(NgZone); // 🎯 Injection moderne de NgZone

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
   * 🔍 Démarrer la surveillance (Hors de la zone Angular pour ne pas bloquer l'hydratation)
   */
  startWatching() {
    if (isPlatformBrowser(this.platformId)) {
      // 🎯 On s'isole d'Angular pour l'écoute des événements du DOM lourds (mousemove, scroll)
      this.ngZone.runOutsideAngular(() => {
        console.log('👁️ Surveillance de l\'inactivité activée (Hors Zone)');
        
        window.addEventListener('mousemove', () => this.resetTimer());
        window.addEventListener('click', () => this.resetTimer());
        window.addEventListener('keypress', () => this.resetTimer());
        window.addEventListener('scroll', () => this.resetTimer());
        
        this.resetTimer();
      });
    }
  }

  /**
   * 🔄 Réinitialiser les timers
   */
  resetTimer() {
    if (isPlatformBrowser(this.platformId)) {
      // Nettoyage impératif des DEUX anciens timeouts
      clearTimeout(this.timeoutId);
      clearTimeout(this.warningTimeoutId);
      
      if (this.authService.isAuthenticated()) {
        this.warningShown = false;
        
        // ✅ Avertissement à 13 minutes
        this.warningTimeoutId = setTimeout(() => {
          if (!this.warningShown && this.authService.isAuthenticated()) {
            // 🎯 On retourne dans la zone d'Angular uniquement pour interagir avec l'utilisateur (Modale/Confirm)
            this.ngZone.run(() => {
              this.showWarning();
            });
            this.warningShown = true;
          }
        }, this.WARNING_TIME);

        // ✅ Logout automatique après 15 minutes
        this.timeoutId = setTimeout(() => {
          this.ngZone.run(() => {
            this.logoutUser();
          });
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
      // On se replace hors zone pour relancer la surveillance discrètement
      this.ngZone.runOutsideAngular(() => {
        this.resetTimer();
      });
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
    clearTimeout(this.warningTimeoutId);
    console.log('👁️ Surveillance de l\'inactivité arrêtée');
  }
}