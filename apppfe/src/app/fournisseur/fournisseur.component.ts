import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FournisseurService } from '../services/fournisseur.service';
import { Fournisseur } from '../Model/Entity';

@Component({
  selector: 'app-fournisseur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fournisseur.component.html',
  styleUrl: './fournisseur.component.css'
})
export class FournisseurComponent implements OnInit {
  // 💉 Injections des dépendances (Angular moderne)
  private fournisseurService = inject(FournisseurService);
  private fb = inject(FormBuilder);

  // 📦 Variables d'état
  fournisseurs: Fournisseur[] = [];
  fournisseurForm!: FormGroup;
  
  chargement = false;
  messageSucces = '';
  messageErreur = '';
    // 📦 Nouvelles variables d'état pour la modification
  modeEdition = false;
  fournisseurIdEnEdition: number | undefined;

  ngOnInit(): void {
    this.initialiserFormulaire();
    this.chargerFournisseurs();
  }


  // ... (Garde ngOnInit, initialiserFormulaire, chargerFournisseurs et supprimerFournisseur) ...

  /**
   * ✏️ Déclenchée au clic sur "Modifier" dans le tableau
   */
  editerFournisseur(fournisseur: Fournisseur): void {
    this.modeEdition = true;
    this.fournisseurIdEnEdition = fournisseur.id;
    
    // Remplit automatiquement le formulaire avec les données du fournisseur
    this.fournisseurForm.patchValue({
      nom: fournisseur.nom,
      email: fournisseur.email,
      contact: fournisseur.contact,
      telephone: fournisseur.telephone,
      adresse: fournisseur.adresse
    });

    // Optionnel : remonter en haut de la page pour voir le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * ❌ Annuler la modification en cours
   */
  annulerEdition(): void {
    this.modeEdition = false;
    this.fournisseurIdEnEdition = undefined;
    this.fournisseurForm.reset();
  }

  /**
   * 💾 Gère à la fois la création et la modification (Remplace ajouterFournisseur)
   */
soumettreFormulaire(): void {
  if (this.fournisseurForm.invalid) {
    this.fournisseurForm.markAllAsTouched();
    return;
  }

  this.chargement = true;
  const fournisseurData: Fournisseur = this.fournisseurForm.value;

  // 👇 C'est ici que le choix se fait entre PUT (modification) et POST (création)
  if (this.modeEdition && this.fournisseurIdEnEdition) {
    
    // 🔄 MODE ÉDITION : Appelle le service avec l'ID et fait un PUT
    this.fournisseurService.updateFournisseur(this.fournisseurIdEnEdition, fournisseurData).subscribe({
      next: (fournisseurMisAJour) => {
        // Met à jour la liste localement
        const index = this.fournisseurs.findIndex(f => f.id === this.fournisseurIdEnEdition);
        if (index !== -1) {
          this.fournisseurs[index] = fournisseurMisAJour;
        }
        this.messageSucces = '✅ Fournisseur modifié avec succès !';
        this.annulerEdition();
        this.chargement = false;
      },
      error: (err) => {
        console.error('❌ Erreur lors de la modification', err);
        this.messageErreur = 'Erreur lors de la modification.';
        this.chargement = false;
      }
    });

  } else {
    
    // ➕ MODE CRÉATION : Fait un POST (ton ancien code)
    this.fournisseurService.createFournisseur(fournisseurData).subscribe({
      next: (fournisseurCree) => {
        this.fournisseurs.push(fournisseurCree);
        this.messageSucces = '✅ Fournisseur ajouté avec succès !';
        this.fournisseurForm.reset();
        this.chargement = false;
      },
      error: (err) => {
        console.error('❌ Erreur lors de la création', err);
        this.messageErreur = 'Erreur lors de l\'ajout.';
        this.chargement = false;
      }
    });

  }
}

  /**
   * 🛠️ Initialise le formulaire d'ajout d'un fournisseur
   */
  private initialiserFormulaire(): void {
    this.fournisseurForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9+ ]+$')]],
      adresse: ['']
    });
  }

  /**
   * 📥 Récupère la liste des fournisseurs depuis le backend
   */
  chargerFournisseurs(): void {
    this.chargement = true;
    this.fournisseurService.getAllFournisseurs().subscribe({
      next: (data) => {
        this.fournisseurs = data;
        this.chargement = false;
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des fournisseurs', err);
        this.messageErreur = 'Impossible de charger la liste des fournisseurs.';
        this.chargement = false;
      }
    });
  }

  /**
   * ➕ Ajoute un nouveau fournisseur
   */
  ajouterFournisseur(): void {
    if (this.fournisseurForm.invalid) {
      this.fournisseurForm.markAllAsTouched();
      return;
    }

    this.chargement = true;
    const nouveauFournisseur: Fournisseur = this.fournisseurForm.value;

    // Assure-toi d'avoir une méthode createFournisseur() dans ton FournisseurService
    this.fournisseurService.createFournisseur(nouveauFournisseur).subscribe({
      next: (fournisseurCree) => {
        this.fournisseurs.push(fournisseurCree); // Ajout direct à la liste affichée
        this.messageSucces = '✅ Fournisseur ajouté avec succès !';
        this.fournisseurForm.reset();
        this.chargement = false;
        this.effacerMessagesApresDelai();
      },
      error: (err) => {
        console.error('❌ Erreur lors de la création', err);
        this.messageErreur = 'Erreur lors de l\'ajout du fournisseur.';
        this.chargement = false;
        this.effacerMessagesApresDelai();
      }
    });
  }

  /**
   * 🗑️ Supprime un fournisseur (Optionnel)
   */
  supprimerFournisseur(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      this.fournisseurService.deleteFournisseur(id).subscribe({
        next: () => {
          this.fournisseurs = this.fournisseurs.filter(f => f.id !== id);
          this.messageSucces = '🗑️ Fournisseur supprimé.';
          this.effacerMessagesApresDelai();
        },
        error: (err) => {
          console.error('❌ Erreur suppression', err);
          this.messageErreur = 'Impossible de supprimer ce fournisseur.';
          this.effacerMessagesApresDelai();
        }
      });
    }
  }

  /**
   * ⏱️ Efface les messages de notification après 3 secondes
   */
  private effacerMessagesApresDelai(): void {
    setTimeout(() => {
      this.messageSucces = '';
      this.messageErreur = '';
    }, 3000);
  }

  /**
   * 🔍 Aide à la validation dans le HTML
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.fournisseurForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}