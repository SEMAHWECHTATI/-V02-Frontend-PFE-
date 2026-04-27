import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../services/inventory.service';
import { Alerte, Severite } from '../Model/alerte';


@Component({
  selector: 'app-alertes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertes.component.html',
  styleUrl: './alertes.component.css'
})
export class AlertesComponent implements OnInit {

  private inventoryService = inject(InventoryService);

  alertesNonTraitees: Alerte[] = [];
  alertesCritiques: Alerte[] = [];
  chargement: boolean = false;
  filtreActif: string = 'toutes';

  ngOnInit(): void {
    this.chargerAlertes();
  }

  /**
   * ⚠️ Charger alertes
   */
  chargerAlertes(): void {
    console.log('⚠️ Chargement alertes');
    this.chargement = true;

    this.inventoryService.getAlerteNonTraitees().subscribe({
      next: (res) => {
        this.alertesNonTraitees = res.alertes || [];
        this.chargement = false;
        console.log('✅ Alertes chargées:', this.alertesNonTraitees.length);
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.chargement = false;
      }
    });

    this.inventoryService.getAlerteCritique().subscribe({
      next: (res) => {
        this.alertesCritiques = res.alertes || [];
      },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }

  /**
   * 👁️ Marquer comme lue
   */
  marquerCommeLue(alerteId: number | undefined): void {
    if (!alerteId) return;

    this.inventoryService.marquerCommeLue(alerteId).subscribe({
      next: () => {
        console.log('✅ Alerte marquée comme lue');
        this.chargerAlertes();
      },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }

  /**
   * ✅ Marquer comme traitée
   */
  marquerCommeTraitee(alerteId: number | undefined): void {
    if (!alerteId) return;

    this.inventoryService.marquerCommeTraitee(alerteId).subscribe({
      next: () => {
        console.log('✅ Alerte marquée comme traitée');
        this.chargerAlertes();
      },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }

  /**
   * 🎨 Obtenir couleur severité
   */
  getSeveriteColor(severite: Severite): string {
    const colors: { [key in Severite]: string } = {
      [Severite.BASSE]: '#10b981',
      [Severite.MOYENNE]: '#f59e0b',
      [Severite.HAUTE]: '#ef4444',
      [Severite.CRITIQUE]: '#dc2626'
    };
    return colors[severite];
  }

  /**
   * 🎨 Obtenir icône severité
   */
  getSeveriteIcon(severite: Severite): string {
    const icons: { [key in Severite]: string } = {
      [Severite.BASSE]: 'bi-circle-fill',
      [Severite.MOYENNE]: 'bi-exclamation-circle-fill',
      [Severite.HAUTE]: 'bi-exclamation-triangle-fill',
      [Severite.CRITIQUE]: 'bi-fire'
    };
    return icons[severite];
  }

  /**
   * 📋 Obtenir alertes filtrées
   */
  getAlertesFiltrees(): Alerte[] {
    if (this.filtreActif === 'critiques') {
      return this.alertesCritiques;
    }
    return this.alertesNonTraitees;
  }
}