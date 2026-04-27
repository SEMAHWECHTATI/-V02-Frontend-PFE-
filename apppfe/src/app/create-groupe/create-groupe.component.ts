import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GroupeService } from '../services/groupe.service';

interface GroupeType {
  code: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-create-groupe',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './create-groupe.component.html',
  styleUrl: './create-groupe.component.css'
})
export class CreateGroupeComponent implements OnInit {
  groupeForm!: FormGroup;
  isSubmitting = false;
  isDeleting = false;
  successMessage = '';
  errorMessage = '';
  isLoading = true;
  showDeleteModal = false;
  selectedGroupeToDelete: any = null;

  typeGroupes: GroupeType[] = [
    {
      code: 'IT_Reseaux_Informatique',
      label: 'IT Réseaux Informatique',
      icon: 'bi-wifi',
      description: 'Gestion du réseau, wifi, routeurs, switches, connectivité'
    },
    {
      code: 'IT_Maintenance_Informatique',
      label: 'IT Maintenance Informatique',
      icon: 'bi-tools',
      description: 'Maintenance préventive, réparation, mise à jour du matériel'
    },
    {
      code: 'IT_Tracabilite_Produit',
      label: 'IT Traçabilité Produit',
      icon: 'bi-diagram-2',
      description: 'Gestion de la traçabilité, droits d\'accès, services IT'
    },
    {
      code: 'IT_Gestionnaire_Stock',
      label: 'IT Gestionnaire Stock',
      icon: 'bi-box-seam',
      description: 'Gestion du stock matériel, commandes, inventaire'
    },
    {
      code: 'Demandeur',
      label: 'Demandeur',
      icon: 'bi-person-check',
      description: 'Utilisateurs qui demandent des services/matériel'
    }
  ];

  currentUser: any = null;
  groupes: any[] = [];
  selectedTypeIndex = -1;

  constructor(
    private fb: FormBuilder,
    private groupeservice: GroupeService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object  // ✅ Injection requise
  ) {}

  ngOnInit(): void {
    console.log('🚀 Initialisation du composant CreateGroupe');
    this.chargerUtilisateur();
    this.creerFormulaire();
    this.chargerGroupesExistants();
  }

  /**
   * ✅ Charge l'utilisateur depuis localStorage (browser uniquement)
   */
  private chargerUtilisateur(): void {
    // ✅ Vérifier si on est en mode browser AVANT d'accéder à localStorage
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('⚠️ SSR détecté - localStorage indisponible');
      this.isLoading = false;
      return;
    }

    try {
      const userStr = localStorage.getItem('utilisateurConnecte');
      
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
        console.log('👤 Utilisateur:', this.currentUser.prenom, this.currentUser.nom);
        
        // Vérifier les droits d'accès
        if (this.currentUser.role.toLowerCase() !== 'administrateur' && 
            this.currentUser.role.toLowerCase() !== 'admin') {
          this.errorMessage = '❌ Vous n\'avez pas la permission de gérer les groupes (Admin requis)';
        }
      } else {
        this.errorMessage = '⚠️ Veuillez vous connecter';
      }
    } catch (error) {
      console.error('❌ Erreur parsing utilisateur:', error);
      this.errorMessage = '❌ Erreur chargement profil utilisateur';
    } finally {
      this.isLoading = false;
    }
  }

  private creerFormulaire(): void {
    this.groupeForm = this.fb.group({
      nomGroupes: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  private chargerGroupesExistants(): void {
    this.groupeservice.getGroupes().subscribe({
      next: (res: any[]) => {
        this.groupes = res;
        console.log('📚 Groupes existants:', res.length);
      },
      error: (err) => {
        console.error('❌ Erreur chargement groupes:', err);
        this.errorMessage = 'Erreur lors du chargement des groupes';
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.groupeForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.groupeForm.get(fieldName);
    if (!control || !control.errors) return '';
    if (control.errors['required']) return 'Ce champ est requis';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} caractères`;
    return 'Valeur invalide';
  }

  selecterType(index: number): void {
    this.selectedTypeIndex = index;
    this.groupeForm.patchValue({ nomGroupes: this.typeGroupes[index].code });
    console.log('📌 Type sélectionné:', this.typeGroupes[index].label);
  }

  getTypeSelected(): GroupeType | null {
    return this.selectedTypeIndex >= 0 ? this.typeGroupes[this.selectedTypeIndex] : null;
  }

  getTypeColor(index: number): string {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    return colors[index % colors.length];
  }

  isTypeAlreadyCreated(code: string): boolean {
    return this.groupes.some(g => g.nomGroupes === code);
  }

  onSubmit(): void {
    if (!this.groupeForm.valid) {
      Object.keys(this.groupeForm.controls).forEach(key => {
        this.groupeForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isSubmitting = true;
    const selectedType = this.getTypeSelected();

    if (!selectedType) {
      this.errorMessage = 'Sélectionnez un type';
      this.isSubmitting = false;
      return;
    }

    const groupeData = {
      nomGroupes: selectedType.code,
      description: this.groupeForm.value.description.trim()
    };

    console.log('📤 Création:', groupeData);

    this.groupeservice.creerGroupe(groupeData).subscribe({
      next: (res: any) => {
        this.successMessage = `✅ Groupe créé : ${selectedType.label}`;
        this.groupeForm.reset();
        this.selectedTypeIndex = -1;
        this.isSubmitting = false;
        this.chargerGroupesExistants();

        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = `❌ Erreur: ${err.error?.erreur || 'Erreur serveur'}`;
        this.isSubmitting = false;
      }
    });
  }

  openDeleteModal(groupe: any): void {
    this.selectedGroupeToDelete = groupe;
    this.showDeleteModal = true;
    console.log('🗑️ Modal suppression:', groupe.nomGroupes);
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedGroupeToDelete = null;
  }

  supprimerGroupe(): void {
    if (!this.selectedGroupeToDelete?.id) {
      this.errorMessage = 'Groupe invalide';
      return;
    }

    this.isDeleting = true;
    const groupeId = this.selectedGroupeToDelete.id;
    const groupeName = this.selectedGroupeToDelete.nomGroupes;

    console.log('🗑️ Suppression:', groupeId);

    this.groupeservice.supprimerGroupe(groupeId).subscribe({
      next: (res: any) => {
        this.successMessage = `✅ Groupe "${groupeName}" supprimé !`;
        this.isDeleting = false;
        this.closeDeleteModal();
        this.chargerGroupesExistants();

        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = `❌ ${err.error?.erreur || 'Erreur suppression'}`;
        this.isDeleting = false;
      }
    });
  }

  resetForm(): void {
    this.groupeForm.reset();
    this.selectedTypeIndex = -1;
    this.successMessage = '';
    this.errorMessage = '';
  }
}