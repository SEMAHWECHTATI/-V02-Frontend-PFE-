import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FournisseurService } from '../services/fournisseur.service';
import { Fournisseur } from '../Model/Entity';

@Component({
  selector: 'app-fournisseur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './fournisseur.component.html',
  styleUrl: './fournisseur.component.css'
})
export class FournisseurComponent implements OnInit {
  // 💉 Injections des dépendances (Angular moderne)
  private fournisseurService = inject(FournisseurService);
  private fb = inject(FormBuilder);

  // 📦 Variables d'état
  fournisseurs: Fournisseur[] = [];
  fournisseursFilter: Fournisseur[] = []; // 👈 Parfaitement typé
  fournisseurForm!: FormGroup;
  
  vueActive: 'AJOUTER' | 'AFFICHER' = 'AFFICHER';
  texteRechercheFournisseur: string = '';
  
  chargement = false;
  messageSucces = '';
  messageErreur = '';
  
  modeEdition = false;
  fournisseurIdEnEdition: number | undefined;

  ngOnInit(): void {
    this.initialiserFormulaire();
    this.chargerFournisseurs();
  }

  /**
   * 🔍 Logique de filtrage instantané multi-critère
   */
  filtrerFournisseurs(): void {
    if (!this.texteRechercheFournisseur || !this.texteRechercheFournisseur.trim()) {
      this.fournisseursFilter = [...this.fournisseurs];
      return;
    }

    const motCle = this.texteRechercheFournisseur.toLowerCase().trim();

    this.fournisseursFilter = this.fournisseurs.filter(f => 
      (f.nom && f.nom.toLowerCase().includes(motCle)) ||
      (f.contact && f.contact.toLowerCase().includes(motCle)) ||
      (f.email && f.email.toLowerCase().includes(motCle))
    );
  }

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
   * 💾 Gère à la fois la création (POST) et la modification (PUT)
   */
  soumettreFormulaire(): void {
    if (this.fournisseurForm.invalid) {
      this.fournisseurForm.markAllAsTouched();
      return;
    }

    this.chargement = true;
    const fournisseurData: Fournisseur = this.fournisseurForm.value;

    if (this.modeEdition && this.fournisseurIdEnEdition) {
      
      // 🔄 MODE ÉDITION (PUT)
      this.fournisseurService.updateFournisseur(this.fournisseurIdEnEdition, fournisseurData).subscribe({
        next: (fournisseurMisAJour) => {
          const index = this.fournisseurs.findIndex(f => f.id === this.fournisseurIdEnEdition);
          if (index !== -1) {
            this.fournisseurs[index] = fournisseurMisAJour;
          }
          this.messageSucces = '✅ Fournisseur modifié avec succès !';
          this.annulerEdition();
          this.filtrerFournisseurs();   // 👈 Met à jour le tableau instantanément
          this.chargement = false;
          this.vueActive = 'AFFICHER';  // 👈 Renvoie l'utilisateur vers la liste
          this.effacerMessagesApresDelai();
        },
        error: (err) => {
          console.error('❌ Erreur lors de la modification', err);
          this.messageErreur = 'Erreur lors de la modification.';
          this.chargement = false;
          this.effacerMessagesApresDelai();
        }
      });

    } else {
      
      // ➕ MODE CRÉATION (POST)
      this.fournisseurService.createFournisseur(fournisseurData).subscribe({
        next: (fournisseurCree) => {
          this.fournisseurs.push(fournisseurCree);
          this.messageSucces = '✅ Fournisseur ajouté avec succès !';
          this.fournisseurForm.reset();
          this.filtrerFournisseurs();   // 👈 Ajoute la nouvelle ligne au tableau
          this.chargement = false;
          this.vueActive = 'AFFICHER';  // 👈 Renvoie l'utilisateur vers la liste
          this.effacerMessagesApresDelai();
        },
        error: (err) => {
          console.error('❌ Erreur lors de la création', err);
          this.messageErreur = 'Erreur lors de l\'ajout.';
          this.chargement = false;
          this.effacerMessagesApresDelai();
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
        this.fournisseursFilter = data; // 👈 Synchro indispensable pour le premier affichage
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
   * 🗑️ Supprime un fournisseur
   */
  supprimerFournisseur(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      this.fournisseurService.deleteFournisseur(id).subscribe({
        next: () => {
          this.fournisseurs = this.fournisseurs.filter(f => f.id !== id);
          this.filtrerFournisseurs(); // 👈 Recalcule l'affichage après suppression
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