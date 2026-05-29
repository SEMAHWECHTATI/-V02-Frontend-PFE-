import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Localisation } from '../Model/Entity';
import { LocalisationService } from '../services/localisation.service';


@Component({
  selector: 'app-localisation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './localisation.component.html',
  styleUrl: './localisation.component.css'
})
export class LocalisationComponent implements OnInit {
  localisations: Localisation[] = [];
  locForm!: FormGroup;
  
  // États de l'interface
  chargement = false;
  modeEdition = false;
  idEnEdition?: number;
  
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

  /**
   * 🏗️ Initialisation du formulaire réactif (basé sur LocalisationDTO)
   */
  initialiserFormulaire(): void {
    this.locForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      batiment: [''],
      etage: [''],
      bureau: [''],
      armoire: [''],
      active: [true] // Par défaut, une nouvelle localisation est active
    });
  }

  /**
   * 📥 Charger la liste depuis le backend
   */
  chargerLocalisations(): void {
    this.localisationService.getAllLocalisations().subscribe({
      next: (data) => {
        this.localisations = data;
      },
      error: (err) => {
        console.error('Erreur chargement localisations', err);
        this.afficherErreur('Impossible de charger les localisations.');
      }
    });
  }

  /**
   * 💾 Créer ou Modifier une localisation
   */
  soumettreFormulaire(): void {
    if (this.locForm.invalid) {
      this.locForm.markAllAsTouched();
      return;
    }

    this.chargement = true;
    const locData: Localisation = this.locForm.value;

    if (this.modeEdition && this.idEnEdition) {
      // 🔄 MODE MODIFICATION (PUT)
      this.localisationService.modifierLocalisation(this.idEnEdition, locData).subscribe({
        next: (locModifiee) => {
          const index = this.localisations.findIndex(l => l.id === this.idEnEdition);
          if (index !== -1) this.localisations[index] = locModifiee;
          
          this.afficherSucces('✅ Localisation modifiée avec succès !');
          this.annulerEdition();
        },
        error: (err) => this.gererErreur(err, 'modification')
      });
    } else {
      // ➕ MODE CRÉATION (POST)
      this.localisationService.creerLocalisation(locData).subscribe({
        next: (locCree) => {
          this.localisations.push(locCree);
          this.afficherSucces('✅ Localisation ajoutée avec succès !');
          this.locForm.reset({ active: true });
          this.chargement = false;
        },
        error: (err) => this.gererErreur(err, 'création')
      });
    }
  }

  /**
   * ✏️ Préparer le formulaire pour la modification
   */
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

  /**
   * ❌ Annuler le mode édition
   */
  annulerEdition(): void {
    this.modeEdition = false;
    this.idEnEdition = undefined;
    this.locForm.reset({ active: true });
    this.chargement = false;
  }

  /**
   * 🗑️ Supprimer une localisation
   */
  supprimerLocalisation(id: number | undefined): void {
    if (!id) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette localisation ?')) {
      this.localisationService.supprimerLocalisation(id).subscribe({
        next: () => {
          this.localisations = this.localisations.filter(l => l.id !== id);
          this.afficherSucces('✅ Localisation supprimée.');
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          this.afficherErreur('Erreur lors de la suppression.');
        }
      });
    }
  }

  // --- Fonctions utilitaires pour les messages ---

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