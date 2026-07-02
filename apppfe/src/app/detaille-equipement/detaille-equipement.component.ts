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
// 🌟 NOUVELLE MÉTHODE : Déclenchée au clic sur le bouton

  
  constructor(
    private equipementService: EquipementService,
    private route: ActivatedRoute
  ) { }


  equipement: Equipement | null = null; 
  localisations: Localisation[] = [];
  
  // 🌟 Nouvelle variable pour stocker la liste complète du tableau
  listeEquipements: Equipement[] = []; 
  
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  codeBarresRecherche: string = '';

  
  // Variables pour le formulaire de modification
  statutSelectionne!: StatutArticle;
  localisationSelectionneeId!: number;
 
 
 


  afficherTousLesEquipements(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.equipement = null; // On cache la vue "fiche unique"

    this.equipementService.getTousLesEquipements().subscribe({
      next: (data) => {
        this.listeEquipements = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = "Impossible de récupérer la liste complète des équipements.";
        this.loading = false;
      }
    });
  }

  selectionnerEquipement(eq: Equipement): void {
    this.equipement = eq;
    this.statutSelectionne = eq.statut.toString() as StatutArticle;
    this.localisationSelectionneeId = eq.localisationId || 0;
  }


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
    this.statutSelectionne = this.equipement?.statut.toString() as StatutArticle;
    this.localisationSelectionneeId = this.equipement?.localisationId || 0;
  }

  chargerLocalisations(): void {
    this.equipementService.getLocalisations().subscribe({
      next: (data) => this.localisations = data,
      error: (err) => console.error("Erreur lors du chargement des localisations", err)
    });
  }

  imprimerQRCode(equipement: any): void {
  // 1. Création d'une fenêtre temporaire
  const fenetreImpression = window.open('', '_blank', 'width=400,height=400');
  
  if (fenetreImpression) {
    fenetreImpression.document.write(`
      <html>
        <head>
          <title>Impression Étiquette Matériel - ${equipement.codeBarres}</title>
          <style>
            body { 
              font-family: 'Courier New', Courier, monospace; 
              text-align: center; 
              padding: 20px; 
            }
            .ticket-box {
              border: 2px dashed #000;
              padding: 15px;
              display: inline-block;
            }
            .title { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
            .model { font-size: 11px; color: #555; margin-bottom: 15px; }
            .barcode-placeholder { 
              font-size: 32px; 
              letter-spacing: 4px; 
              margin: 10px 0;
            }
            .code-text { font-weight: bold; font-size: 16px; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="ticket-box">
            <div class="title">SAGEMCOM - EQUIPEMENT</div>
            <div class="model">${equipement.designation || 'N/A'}</div>
            
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${equipement.codeBarres}" 
                 alt="QR Code" 
                 onload="window.print(); window.close();" />
                 
            <div class="code-text">${equipement.codeBarres}</div>
          </div>
        </body>
      </html>
    `);
    fenetreImpression.document.close();
  }
}
  enregistrerModifications(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.equipementService.modifierStatutEtLocalisation(
      this.equipement?.id || 0,
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
