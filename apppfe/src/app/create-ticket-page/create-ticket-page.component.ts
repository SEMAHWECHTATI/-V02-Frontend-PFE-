import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { Categorie, Priorite, TicketCreateDTO } from '../Model/Entity';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-ticket-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-ticket-page.component.html',
  styleUrl: './create-ticket-page.component.css'
})
export class CreateTicketPageComponent implements OnInit {

  form!: FormGroup;
  categories: Categorie[] = [];
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  currentUser: any = null;

  // ✅ Stocker la catégorie sélectionnée
  selectedCategorie: Categorie | null = null;

  prioriteOptions = [
    { label: '🟢 Basse', value: Priorite.Basse },
    { label: '🟡 Moyenne', value: Priorite.Moyenne },
    { label: '🔴 Haute', value: Priorite.Haute },
    { label: '⚫ Critique', value: Priorite.Critique }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 Initialisation CreateTicketPageComponent');
    this.loadUser();
    this.loadCategories();
    this.createForm();
  }

  /**
   * 👤 Charger l'utilisateur connecté
   */
  private loadUser(): void {
    console.log('👤 Chargement utilisateur');
    
    const userStr = sessionStorage.getItem('currentUser') || localStorage.getItem('utilisateurConnecte');
    
    if (userStr) {
      try {
        let user = JSON.parse(userStr);
        
        // ✅ Vérifier si c'est un double parsing
        if (typeof user === 'string') {
          user = JSON.parse(user);
        }
        
        this.currentUser = user;
        console.log('✅ Utilisateur chargé:', {
          id: this.currentUser.id,
          nom: `${this.currentUser.prenom} ${this.currentUser.nom}`
        });
      } catch (error) {
        console.error('❌ Erreur parsing utilisateur:', error);
        this.errorMessage = 'Erreur lors du chargement de vos informations. Veuillez vous reconnecter.';
      }
    } else {
      console.warn('⚠️ Utilisateur non trouvé');
      this.errorMessage = 'Veuillez vous connecter d\'abord';
    }
  }

  /**
   * 📋 Charger les catégories
   */
  private loadCategories(): void {
    console.log('📋 Chargement des catégories');

    this.apiService.getCategories().subscribe({
      next: (res: any) => {
        console.log('📊 Réponse API categories:', res);

        // ✅ CORRECTION: Gérer différentes structures de réponse
        if (Array.isArray(res)) {
          // Si c'est un tableau directement
          this.categories = res;
        } else if (res && res.categories && Array.isArray(res.categories)) {
          // Si c'est { total, categories }
          this.categories = res.categories;
        } else if (res && res.data && Array.isArray(res.data)) {
          // Si c'est { data }
          this.categories = res.data;
        } else {
          this.categories = [];
          console.warn('⚠️ Structure inattendue:', res);
        }

        console.log('✅ Catégories chargées:', {
          count: this.categories.length,
          categories: this.categories.map((c: any) => ({
            id: c.idCategorie,
            nom: c.nomCategorie
          }))
        });
      },
      error: (err) => {
        console.error('❌ Erreur catégories:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        
        this.errorMessage = 'Erreur lors du chargement des catégories. Veuillez rafraîchir la page.';
      }
    });
  }

  /**
   * 📝 Créer le formulaire réactif
   */
  private createForm(): void {
    console.log('📝 Création du formulaire');

    this.form = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priorite: [Priorite.Moyenne, Validators.required],
      categorieId: ['', Validators.required]
    });

    // ✅ Écouter les changements de catégorie
    this.form.get('categorieId')?.valueChanges.subscribe((categorieId: any) => {
      this.onCategorieChange(categorieId);
    });

    console.log('✅ Formulaire créé');
  }

  /**
   * 🎯 Quand la catégorie change
   */
  onCategorieChange(categorieId: any): void {
    console.log('🎯 Changement de catégorie:', categorieId);
    
    if (!categorieId) {
      this.selectedCategorie = null;
      return;
    }

    const id = Number(categorieId);
    this.selectedCategorie = this.categories.find(c => c.idCategorie === id) || null;

    if (this.selectedCategorie) {
      console.log('📍 Catégorie sélectionnée:', {
        nom: this.selectedCategorie.nomCategorie,
        groupe: this.selectedCategorie.groupeResponsable?.nomGroupes
      });
    }
  }

  /**
   * 📤 Soumettre le formulaire
   */
  onSubmit(): void {
    console.log('📤 Soumission du formulaire');

    // ✅ Validations
    if (!this.form.valid) {
      console.warn('⚠️ Formulaire invalide');
      this.errorMessage = 'Veuillez remplir tous les champs requis correctement';
      this.form.markAllAsTouched();
      return;
    }

    if (!this.currentUser || !this.currentUser.id) {
      console.warn('⚠️ Utilisateur non connecté');
      this.errorMessage = 'Veuillez vous connecter d\'abord';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.form.value;
    const categorieId = Number(formValue.categorieId);
    const categorie = this.categories.find(c => c.idCategorie === categorieId);

    if (!categorie) {
      console.error('❌ Catégorie invalide:', categorieId);
      this.errorMessage = 'Catégorie invalide. Veuillez sélectionner une catégorie valide.';
      this.isLoading = false;
      return;
    }

    // ✅ Construire le DTO du ticket
    const ticketData: TicketCreateDTO = {
      titre: formValue.titre.trim(),
      description: formValue.description.trim(),
      priorite: formValue.priorite,
      demandeurId: Number(this.currentUser.id),
      groupeId: categorie.groupeResponsable?.id || 0
    };

    console.log('📝 Données du ticket:', {
      titre: ticketData.titre,
      priorite: ticketData.priorite,
      categorie: categorie.nomCategorie,
      groupe: categorie.groupeResponsable?.nomGroupes,
      demandeur: `${this.currentUser.prenom} ${this.currentUser.nom}`
    });

    // ✅ Appel API
    this.apiService.creerTicket(ticketData, categorieId).subscribe({
      next: (res: any) => {
        console.log('✅ Ticket créé avec succès:', {
          idTicket: res.idTicket,
          reference: res.reference,
          statut: res.statut
        });

                  this.successMessage = `✅ Ticket créé avec succès !
          Référence: ${res.reference}
          Catégorie: ${categorie.nomCategorie}
          Statut: ${res.statut}`;

        // ✅ Réinitialiser le formulaire
        this.form.reset();
        this.form.patchValue({ priorite: Priorite.Moyenne });
        this.selectedCategorie = null;
        this.isLoading = false;

        // ✅ Rediriger après 2 secondes
        console.log('🔄 Redirection vers le ticket créé...');
        setTimeout(() => {
          this.router.navigate(['/index']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Erreur lors de la création du ticket:', {
          status: err.status,
          statusText: err.statusText,
          message: err.error?.message || err.message,
          error: err.error?.error
        });

        this.errorMessage = err.error?.error || 
                           err.error?.message || 
                           'Erreur lors de la création du ticket. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  /**
   * ❌ Vérifier si un champ est invalide
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  /**
   * 📝 Obtenir le message d'erreur
   */
  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Ce champ est requis';
    }

    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }

    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `Maximum ${maxLength} caractères autorisés`;
    }

    return 'Valeur invalide';
  }

  /**
   * ✅ Obtenir le groupe de la catégorie sélectionnée
   */
  getSelectedCategorieGroupe(): string {
    return this.selectedCategorie?.groupeResponsable?.nomGroupes || 'Non défini';
  }

  /**
   * 🔄 Réinitialiser le formulaire
   */
  resetForm(): void {
    console.log('🔄 Réinitialisation du formulaire');
    this.form.reset();
    this.form.patchValue({ priorite: Priorite.Moyenne });
    this.selectedCategorie = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * ✅ Vérifier si on peut soumettre
   */
  canSubmit(): boolean {
    return this.form.valid && this.currentUser && !this.isLoading;
  }
}