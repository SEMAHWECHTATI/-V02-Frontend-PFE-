import { Component, OnInit } from '@angular/core';
import { EquipementService } from '../services/equipement.service';
import { ActivatedRoute } from '@angular/router';
import { Equipement, Localisation, StatutArticle } from '../Model/article';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detaille-equipement',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './detaille-equipement.component.html',
  styleUrl: './detaille-equipement.component.css'
})
export class DetailleEquipementComponent implements OnInit {
  
  equipement!: Equipement;
  localisations: Localisation[] = [];
  
  // Variables pour le formulaire de modification
  statutSelectionne!: StatutArticle;
  localisationSelectionneeId!: number;
  
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  codeBarresRecherche: string = '';

  constructor(
    private equipementService: EquipementService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // 1. Charger la liste des localisations pour le formulaire
    this.chargerLocalisations();

    // 2. Si un ID est passé dans l'URL (ex: /equipement/1), on le charge directement
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chargerEquipement(+id);
    }
  }

  chargerEquipement(id: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.equipementService.getDetailsEquipement(id).subscribe({
      next: (data) => {
        this.equipement = data;
        this.initFormulaire();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = "Impossible de charger les détails de l'équipement.";
        this.loading = false;
      }
    });
  }

  rechercherParCodeBarres(): void {
    if (!this.codeBarresRecherche.trim()) return;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.equipementService.getParCodeBarres(this.codeBarresRecherche.trim()).subscribe({
      next: (data) => {
        this.equipement = data;
        this.initFormulaire();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = "Équipement introuvable avec ce code-barres.";
        this.loading = false;
      }
    });
  }

  initFormulaire(): void {
    this.statutSelectionne = this.equipement.statut;
    this.localisationSelectionneeId = this.equipement.localisation?.id || 0;
  }

  chargerLocalisations(): void {
    this.equipementService.getLocalisations().subscribe({
      next: (data) => this.localisations = data,
      error: (err) => console.error("Erreur lors du chargement des localisations", err)
    });
  }

  enregistrerModifications(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.equipementService.modifierStatutEtLocalisation(
      this.equipement.id, 
      this.statutSelectionne, 
      this.localisationSelectionneeId
    ).subscribe({
      next: (equipementMisAJour) => {
        this.equipement = equipementMisAJour;
        this.successMessage = "Statut et localisation mis à jour avec succès !";
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = "Erreur lors de la mise à jour.";
        this.loading = false;
      }
    });
  }
}
