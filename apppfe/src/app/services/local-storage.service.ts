import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  /**
   * ✅ Récupère une valeur avec sécurité
   */
  getItem(key: string): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Erreur localStorage.getItem('${key}'):`, error);
      return null;
    }
  }

  /**
   * ✅ Sauvegarde une valeur avec sécurité
   */
  setItem(key: string, value: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Erreur localStorage.setItem('${key}'):`, error);
    }
  }

  /**
   * ✅ Supprime une valeur
   */
  removeItem(key: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur localStorage.removeItem('${key}'):`, error);
    }
  }

  /**
   * ✅ Parse et retourne un objet JSON
   */
  getObject<T>(key: string): T | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Erreur parsing localStorage('${key}'):`, error);
      return null;
    }
  }

  /**
   * ✅ Sauvegarde un objet JSON
   */
  setObject<T>(key: string, value: T): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erreur setObject localStorage('${key}'):`, error);
    }
  }

  /**
   * ✅ Vérifie si on est en mode browser
   */
  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}