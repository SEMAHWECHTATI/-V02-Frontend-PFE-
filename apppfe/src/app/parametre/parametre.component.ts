import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from "../dashboard/dashboard.component";
import { AlertesComponent } from "../alertes/alertes.component";
import { StatistiquesComponent } from "../statistiques/statistiques.component";
import { SLA } from '../Model/sla';
import { SLAService } from '../services/sla.service';
import { SlaGestionComponent } from "../sla-gestion/sla-gestion.component";

@Component({
  selector: 'app-parametre',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, DashboardComponent, AlertesComponent, StatistiquesComponent, SlaGestionComponent],
  templateUrl: './parametre.component.html',
  styleUrl: './parametre.component.css'
})
export class ParametreComponent implements OnInit {

  // ==========================================
  // 🔘 1. OPTIONS DE CONFIGURATION (Basculeurs)
  // ==========================================
  configOptions = {
    notificationsEmail: true,
    notificationsPush: false,
    autoAssignation: true,
    activationSLA: true,
    modeMaintenance: false
  };

  // ==========================================
  // 🧮 2. "CALCULATRICE" DE SEUILS SLA (Variables)
  // ==========================================
  delaiPriseEnChargeHaute: number = 15;  // min
  delaiResolutionHaute: number = 4;      // heures
  
  delaiPriseEnChargeMoyenne: number = 60; // min
  delaiResolutionMoyenne: number = 24;    // heures

  scorePerformanceEstime: number = 100;

  // Stockage de la liste complète des SLAs récupérés de la base de données
  listeSLAs: SLA[] = [];

  // ==========================================
  // 📋 3. ROULEMENT DES VUES & CONTEXTE
  // ==========================================
  vueActuelle: string = 'parametres';
  menuConfigurationOuvert: boolean = true;
  currentUser = { role: 'Administrateur', nom: 'Admin' };

  // 👈 2. Injection de SLAService dans le constructeur
  constructor(private slaService: SLAService) { }

  ngOnInit(): void {
    this.chargerConfigurationsSLA(); // 👈 3. Chargement initial depuis la BDD
  }

  changerVue(vue: string): void {
    this.vueActuelle = vue;
  }

  // ==========================================
  // ⚡ 4. MÉTHODES ET ACTIONS DU COMPOSANT
  // ==========================================

  /**
   * 📥 Charge les configurations SLA existantes depuis Spring Boot 
   * et met à jour les variables de la calculatrice
   */
  chargerConfigurationsSLA(): void {
    this.slaService.getTousLesSLA().subscribe({
      next: (slas: SLA[]) => {
        this.listeSLAs = slas;
        
        // Extraction et mise à jour des délais selon la priorité détectée
        const slaHaute = slas.find(s => s.priorite?.toLowerCase() === 'haute');
        if (slaHaute) {
          this.delaiPriseEnChargeHaute = slaHaute.delaiPriseEnChargeHeure;
          this.delaiResolutionHaute = slaHaute.delaiResolutionHeure;
        }

        const slaMoyenne = slas.find(s => s.priorite?.toLowerCase() === 'moyenne');
        if (slaMoyenne) {
          this.delaiPriseEnChargeMoyenne = slaMoyenne.delaiPriseEnChargeHeure;
          this.delaiResolutionMoyenne = slaMoyenne.delaiResolutionHeure;
        }

        // Relancer le calcul de l'indice de performance avec les vraies valeurs
        this.recalculerScoreSimule();
        console.log('Données SLA initialisées avec succès depuis le serveur.');
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des configurations SLA :', err);
        // En cas d'échec, le composant garde ses valeurs par défaut (fallback)
        this.recalculerScoreSimule();
      }
    });
  }

  toggleOption(key: keyof typeof this.configOptions): void {
    this.configOptions[key] = !this.configOptions[key];
    this.recalculerScoreSimule();
  }

  recalculerScoreSimule(): void {
    if (!this.configOptions.activationSLA) {
      this.scorePerformanceEstime = 0;
      return;
    }
    const baseSLA = (this.delaiPriseEnChargeHaute * 2) + (this.delaiPriseEnChargeMoyenne);
    const baseResolution = (this.delaiResolutionHaute * 10) + this.delaiResolutionMoyenne;
    let calcul = 100 - (baseSLA / 10) - (baseResolution / 5);
    if(this.configOptions.autoAssignation) calcul += 10; 
    this.scorePerformanceEstime = Math.min(Math.max(Math.round(calcul), 10), 100);
  }

  /**
   * 💾 Sauvegarde les modifications apportées aux délais directement en BDD via l'API
   */
  enregistrerConfiguration(): void {
    // Étape A : On prépare les objets de mise à jour en cherchant les IDs existants
    const slaHauteId = this.listeSLAs.find(s => s.priorite?.toLowerCase() === 'haute')?.idSLA;
    const slaMoyenneId = this.listeSLAs.find(s => s.priorite?.toLowerCase() === 'moyenne')?.idSLA;

    const configHaute: SLA = {
      idSLA: slaHauteId,
      nomSLA: 'SLA Priorité Haute',
      priorite: 'Haute',
      delaiPriseEnChargeHeure: this.delaiPriseEnChargeHaute,
      delaiResolutionHeure: this.delaiResolutionHaute
    };

    const configMoyenne: SLA = {
      idSLA: slaMoyenneId,
      nomSLA: 'SLA Priorité Moyenne',
      priorite: 'Moyenne',
      delaiPriseEnChargeHeure: this.delaiPriseEnChargeMoyenne,
      delaiResolutionHeure: this.delaiResolutionMoyenne
    };

    // Étape B : Envoi des mises à jour au serveur Spring Boot
    if (slaHauteId && slaMoyenneId) {
      // Cas classique : Mise à jour (PUT)
      this.slaService.modifierSLA(slaHauteId, configHaute).subscribe({
        next: () => {
          this.slaService.modifierSLA(slaMoyenneId, configMoyenne).subscribe({
            next: () => alert('Délais SLA synchronisés et sauvegardés avec succès !'),
            error: () => alert('Erreur lors de la mise à jour des délais Moyenne.')
          });
        },
        error: () => alert('Erreur lors de la mise à jour des délais Haute.')
      });
    } else {
      // Cas de repli : Si aucun SLA n'existe, on les crée (POST)
      this.slaService.creerSLA(configHaute).subscribe(() => {
        this.slaService.creerSLA(configMoyenne).subscribe(() => {
          alert('Configurations SLA créées sur le serveur !');
          this.chargerConfigurationsSLA(); // Recharger la structure propre avec les nouveaux IDs
        });
      });
    }
  }
}