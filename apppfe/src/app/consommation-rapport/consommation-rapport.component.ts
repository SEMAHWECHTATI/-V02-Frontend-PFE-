import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-consommation-rapport',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consommation-rapport.component.html',
  styleUrls: ['./consommation-rapport.component.css']
})
export class ConsommationRapportComponent implements OnInit {
  // Listes de données
  listeConsommations: any[] = [];
  consommationsFiltrees: any[] = [];
  
  // États de l'interface
  isLoading: boolean = true;
  errorMessage: string = '';
  searchTerm: string = '';

  // Indicateurs Statistiques (KPI)
  totalPiecesConsommees: number = 0;
  totalDepenses: number = 0;
  nombreInterventions: number = 0;

  constructor(private consommationService: InventoryService) {}

  ngOnInit(): void {
    this.chargerRapportConsommations();
  }

  /**
   * 🔄 Charge les données depuis l'API globale
   */
  chargerRapportConsommations(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.consommationService.getToutesLesConsommations().subscribe({
      next: (data: any[]) => {
        console.log('📊 Données consommations reçues :', data);
        this.listeConsommations = data || [];
        this.consommationsFiltrees = [...this.listeConsommations];
        this.calculerIndicateurs();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur récupération historique pièces :', err);
        this.errorMessage = 'Impossible de charger le journal des consommations. Veuillez vérifier la connexion au serveur.';
        this.isLoading = false;
      }
    });
  }

  /**
   * 🧮 Calcule les indicateurs financiers et volumétriques pour le tableau de bord
   */
  calculerIndicateurs(): void {
    this.nombreInterventions = this.consommationsFiltrees.length;
    
    this.totalPiecesConsommees = this.consommationsFiltrees.reduce(
      (sum, item) => sum + (item.quantite || 0), 0
    );
    
    this.totalDepenses = this.consommationsFiltrees.reduce(
      (sum, item) => sum + ((item.quantite || 0) * (item.article?.prixUnitaire || 0)), 0
    );
  }

  /**
   * 🔍 Applique un filtre de recherche dynamique multi-critères
   */
  appliquerFiltre(): void {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.consommationsFiltrees = [...this.listeConsommations];
      this.calculerIndicateurs();
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();

    this.consommationsFiltrees = this.listeConsommations.filter(conso => {
      const matchTicket = conso.referenceTicket && conso.referenceTicket.toLowerCase().includes(term);
      
      const matchArticle = conso.article && (
        (conso.article.designation && conso.article.designation.toLowerCase().includes(term)) ||
        (conso.article.reference && conso.article.reference.toLowerCase().includes(term))
      );
      
      const matchResponsable = conso.responsable && (
        (conso.responsable.nom && conso.responsable.nom.toLowerCase().includes(term)) ||
        (conso.responsable.prenom && conso.responsable.prenom.toLowerCase().includes(term))
      );

      const matchCommentaire = conso.commentaire && conso.commentaire.toLowerCase().includes(term);

      return matchTicket || matchArticle || matchResponsable || matchCommentaire;
    });

    // Recalculer les KPIs uniquement sur les lignes visibles filtrées
    this.calculerIndicateurs();
  }
}