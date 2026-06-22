import { Component, OnInit } from '@angular/core';
import { SLA } from '../Model/sla';
import { SLAService } from '../services/sla.service';
import { CategorieService } from '../services/categorie.service'; // 👈 Importez votre service de Catégorie
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categorie } from '../Model/Entity';

@Component({
  selector: 'app-sla-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sla-gestion.component.html',
  styleUrl: './sla-gestion.component.css'
})
export class SlaGestionComponent implements OnInit {

  listeSLAs: SLA[] = [];
  listeCategories: Categorie[] = []; // 👈 Contiendra le menu déroulant des catégories

  vueActuelle: 'liste' | 'formulaire' = 'formulaire';
  
  // ID tampon pour lier facilement le <select> du formulaire HTML
  selectedCategorieId: number | null = null;

  // Objet lié au formulaire
  slaForm: SLA = {
    nomSLA: '',
    priorite: 'Moyenne',
    delaiPriseEnChargeHeure: 0.5,
    delaiResolutionHeure: 8,
    categorie: undefined // Sera assigné dynamiquement avant l'envoi
  };

  isModification: boolean = false;

  // 👈 Injectez le service des catégories
  constructor(
    private slaService: SLAService,
    private categorieService: CategorieService 
  ) {}

  ngOnInit(): void {
    this.chargerTousLesSLA();
    this.chargerToutesLesCategories(); // 👈 Chargez les catégories dès l'initialisation
  }

  chargerTousLesSLA(): void {
    this.slaService.getTousLesSLA().subscribe({
      next: (data) => this.listeSLAs = data,
      error: (err) => console.error('Erreur de chargement des SLAs', err)
    });
  }

  chargerToutesLesCategories(): void {
    this.categorieService.getCategories().subscribe({
      next: (data) => this.listeCategories = data,
      error: (err) => console.error('Erreur de chargement des catégories', err)
    });
  }

  soumettreFormulaire(): void {
    if (!this.selectedCategorieId) {
      alert('Veuillez sélectionner une catégorie obligatoire.');
      return;
    }

    // 🎯 On prépare la structure attendue par Spring Boot ({ idCategorie: X })
    this.slaForm.categorie = {
      idCategorie: this.selectedCategorieId
    } as Categorie;

    if (this.isModification && this.slaForm.idSLA) {
      // Mode Modification
      this.slaService.modifierSLA(this.slaForm.idSLA, this.slaForm).subscribe({
        next: () => {
          alert('SLA modifié avec succès !');
          this.reinitialiserFormulaire();
          this.chargerTousLesSLA();
        },
        error: (err) => console.error('Erreur lors de la modification', err)
      });
    } else {
      // Mode Création
      this.slaService.creerSLA(this.slaForm).subscribe({
        next: () => {
          alert('Nouveau SLA créé avec succès !');
          this.reinitialiserFormulaire();
          this.chargerTousLesSLA();
        },
        error: (err) => console.error('Erreur lors de la création', err)
      });
    }
  }

  remplirPourModification(sla: SLA): void {
    this.slaForm = { ...sla };
    // On extrait l'id pour pré-sélectionner la bonne catégorie dans le HTML
    this.selectedCategorieId = sla.categorie ? sla.categorie.idCategorie : null;
    this.isModification = true;
  }

  supprimerSLA(id: number | undefined): void {
    if (id && confirm('Êtes-vous sûr de vouloir supprimer cette règle de SLA ?')) {
      this.slaService.supprimerSLA(id).subscribe({
        next: () => {
          alert('SLA supprimé.');
          this.chargerTousLesSLA();
        },
        error: (err) => console.error('Erreur lors de la suppression', err)
      });
    }
  }

  reinitialiserFormulaire(): void {
    this.slaForm = { 
      nomSLA: '', 
      priorite: 'Moyenne', 
      delaiPriseEnChargeHeure: 0.5, 
      delaiResolutionHeure: 8,
      categorie: undefined
    };
    this.selectedCategorieId = null;
    this.isModification = false;
  }
}