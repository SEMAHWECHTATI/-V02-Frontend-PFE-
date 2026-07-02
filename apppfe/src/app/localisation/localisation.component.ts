import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms'; // 👈 Ajout de FormsModule
import { Localisation } from '../Model/Entity';
import { LocalisationService } from '../services/localisation.service';

@Component({
  selector: 'app-localisation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule], // 👈 Ajout de FormsModule ici
  templateUrl: './localisation.component.html',
  styleUrl: './localisation.component.css'
})
export class LocalisationComponent implements OnInit {
  localisations: Localisation[] = [];
  localisationsFilter: Localisation[] = []; // 👈 Liste dédiée à l'affichage filtré du tableau
  locForm!: FormGroup;
  
  // États de l'interface
  chargement = false;
  modeEdition = false;
  idEnEdition?: number;
  vueActive: 'AJOUTER' | 'AFFICHER' = 'AFFICHER'; // 👈 Gestion de la bascule d'onglets
  texteRechercheLocalisation = '';                 // 👈 Stocke le mot-clé tapé

  // Messages utilisateur
  messageSucces = '';
  messageErreur = '';

  constructor(
    private fb: FormBuilder,
    private localisationService: LocalisationService
  ) {}

  ngOnInit(): void {
    this.initialiserFormulaire();
    this.chargerLocalisations();
  }

  initialiserFormulaire(): void {
    this.locForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      batiment: [''],
      etage: [''],
      bureau: [''],
      armoire: [''],
      active: [true]
    });
  }

  chargerLocalisations(): void {
    this.localisationService.getAllLocalisations().subscribe({
      next: (data) => {
        this.localisations = data;
        this.filtrerLocalisations(); // 👈 Initialise et synchronise la vue filtrée
      },
      error: (err) => {
        console.error('Erreur chargement localisations', err);
        this.afficherErreur('Impossible de charger les localisations.');
      }
    });
  }

  /**
   * 🔍 Logique de filtrage instantané multi-critère
   */
  filtrerLocalisations(): void {
    if (!this.texteRechercheLocalisation || !this.texteRechercheLocalisation.trim()) {
      this.localisationsFilter = [...this.localisations];
      return;
    }

    const motCle = this.texteRechercheLocalisation.toLowerCase().trim();

    this.localisationsFilter = this.localisations.filter(l => 
      (l.nom && l.nom.toLowerCase().includes(motCle)) ||
      (l.batiment && l.batiment.toLowerCase().includes(motCle)) ||
      (l.armoire && l.armoire.toLowerCase().includes(motCle)) ||
      (l.bureau && l.bureau.toLowerCase().includes(motCle))
    );
  }

  soumettreFormulaire(): void {
    if (this.locForm.invalid) {
      this.locForm.markAllAsTouched();
      return;
    }

    this.chargement = true;
    const locData: Localisation = this.locForm.value;

    if (this.modeEdition && this.idEnEdition) {
      this.localisationService.modifierLocalisation(this.idEnEdition, locData).subscribe({
        next: (locModifiee) => {
          const index = this.localisations.findIndex(l => l.id === this.idEnEdition);
          if (index !== -1) this.localisations[index] = locModifiee;
          
          this.afficherSucces('✅ Localisation modifiée avec succès !');
          this.annulerEdition();
          this.vueActive = 'AFFICHER'; // 👈 Retourne automatiquement sur le tableau
        },
        error: (err) => this.gererErreur(err, 'modification')
      });
    } else {
      this.localisationService.creerLocalisation(locData).subscribe({
        next: (locCree) => {
          this.localisations.push(locCree);
          this.afficherSucces('✅ Localisation ajoutée avec succès !');
          this.locForm.reset({ active: true });
          this.filtrerLocalisations(); // Refraichit le tableau
          this.chargement = false;
          this.vueActive = 'AFFICHER'; // 👈 Redirige vers le tableau pour voir la ligne créée
        },
        error: (err) => this.gererErreur(err, 'création')
      });
    }
  }

  editerLocalisation(loc: Localisation): void {
    this.modeEdition = true;
    this.idEnEdition = loc.id;
    this.locForm.patchValue({
      nom: loc.nom,
      description: loc.description,
      batiment: loc.batiment,
      etage: loc.etage,
      bureau: loc.bureau,
      armoire: loc.armoire,
      active: loc.active
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  annulerEdition(): void {
    this.modeEdition = false;
    this.idEnEdition = undefined;
    this.locForm.reset({ active: true });
    this.chargement = false;
  }

  supprimerLocalisation(id: number | undefined): void {
    if (!id) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette localisation ?')) {
      this.localisationService.supprimerLocalisation(id).subscribe({
        next: () => {
          this.localisations = this.localisations.filter(l => l.id !== id);
          this.filtrerLocalisations(); // Met à jour le visuel immédiatement
          this.afficherSucces('✅ Localisation supprimée.');
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          this.afficherErreur('Erreur lors de la suppression.');
        }
      });
    }
  }

  private gererErreur(err: any, action: string): void {
    console.error(`Erreur ${action}`, err);
    const msg = err.error?.message || err.error || `Erreur lors de la ${action}.`;
    this.afficherErreur(typeof msg === 'string' ? msg : `Échec de la ${action}.`);
    this.chargement = false;
  }

  private afficherSucces(msg: string): void {
    this.messageSucces = msg;
    setTimeout(() => this.messageSucces = '', 5000);
  }

  private afficherErreur(msg: string): void {
    this.messageErreur = msg;
    setTimeout(() => this.messageErreur = '', 5000);
  }
}