import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Categorie, Priorite, TicketCreateDTO } from '../Model/Entity';
import { Router, RouterModule } from '@angular/router';
import { TicketService } from '../services/ticket.service';
import { CategorieService } from '../services/categorie.service';
import { ArticleFormComponent } from '../article-form/article-form.component';
import { isPlatformBrowser } from '@angular/common'; // 👈 L'importation corrigée

@Component({
  selector: 'app-create-ticket-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,ArticleFormComponent],
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

  // ✅ VARIABLES PIÈCES JOINTES
  selectedFiles: File[] = [];
  draggedOver = false;
  maxFileSize = 5 * 1024 * 1024; // 5MB
  allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'zip'];

  selectedCategorie: Categorie | null = null;
  etapeActive: number = 1;
  categorieChoisie: any = null;

  prioriteOptions = [
    { label: '🟢 Basse', value: Priorite.Basse },
    { label: '🟡 Moyenne', value: Priorite.Moyenne },
    { label: '🔴 Haute', value: Priorite.Haute },
    { label: '⚫ Critique', value: Priorite.Critique }
  ];

  constructor(
    private fb: FormBuilder,
    private ticketservice: TicketService,
    private categorieservice: CategorieService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
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
    // 👈 3. Vérifier si on est bien sur le navigateur avant de toucher au stockage
    if (isPlatformBrowser(this.platformId)) {
      console.log('👤 Chargement utilisateur (Navigateur)');
      
      const userStr = sessionStorage.getItem('currentUser') || localStorage.getItem('utilisateurConnecte');
      
      if (userStr) {
        try {
          let user = JSON.parse(userStr);
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
          this.errorMessage = 'Erreur lors du chargement de vos informations.';
        }
      }
    } else {
      console.log('🖥️ Compilation côté serveur : Évitement du sessionStorage');
    }
  }


  /**
   * 📋 Charger les catégories
   */
  private loadCategories(): void {
    console.log('📋 Chargement des catégories');

    this.categorieservice.getCategories().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.categories = res;
        } else if (res && res.categories && Array.isArray(res.categories)) {
          this.categories = res.categories;
        } else if (res && res.data && Array.isArray(res.data)) {
          this.categories = res.data;
        } else {
          this.categories = [];
        }

        console.log('✅ Catégories chargées:', this.categories.length);
      },
      error: (err) => {
        console.error('❌ Erreur catégories:', err);
        this.errorMessage = 'Erreur lors du chargement des catégories.';
      }
    });
  }

  /**
   * 📝 Créer le formulaire réactif
   */
  private createForm(): void {
    this.form = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priorite: [Priorite.Moyenne, Validators.required],
      categorieId: ['', Validators.required]
    });

    this.form.get('categorieId')?.valueChanges.subscribe((categorieId: any) => {
      this.onCategorieChange(categorieId);
    });
  }

  /**
   * 🎯 Quand la catégorie change
   */
  onCategorieChange(categorieId: any): void {
    if (!categorieId) {
      this.selectedCategorie = null;
      return;
    }

    const id = Number(categorieId);
    this.selectedCategorie = this.categories.find(c => c.idCategorie === id) || null;
  }

  // ==================== GESTION DES FICHIERS ====================

  /**
   * 📎 Sélectionner des fichiers via input
   */
  onFileSelected(event: any): void {
    const files = event.target.files;
    this.addFiles(files);
  }

  /**
   * 📎 Ajouter des fichiers
   */
  private addFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = this.validateFile(file);

      if (error) {
        this.errorMessage = error;
        return;
      }

      // ✅ Vérifier si le fichier n'est pas déjà ajouté
      if (!this.selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        this.selectedFiles.push(file);
        console.log('✅ Fichier ajouté:', file.name);
      }
    }

    this.errorMessage = '';
  }

  /**
   * ✅ Valider un fichier
   */
  private validateFile(file: File): string {
    // Vérifier la taille
    if (file.size > this.maxFileSize) {
      return `❌ Le fichier "${file.name}" dépasse 5MB`;
    }

    // Vérifier l'extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.allowedExtensions.includes(extension)) {
      return `❌ Type de fichier non autorisé: ${extension}`;
    }

    return '';
  }

  /**
   * 🗑️ Supprimer un fichier
   */
  removeFile(index: number): void {
    const fileName = this.selectedFiles[index].name;
    this.selectedFiles.splice(index, 1);
    console.log('🗑️ Fichier supprimé:', fileName);
  }

  /**
   * 📥 Drag and Drop - Fichier entrant
   */
  onDragOver(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.draggedOver = true;
  }

  /**
   * 📤 Drag and Drop - Fichier quittant
   */
  onDragLeave(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.draggedOver = false;
  }

  /**
   * 📥 Drag and Drop - Fichier déposé
   */
  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.draggedOver = false;

    const files = event.dataTransfer.files;
    this.addFiles(files);
  }

  /**
   * 📊 Obtenir la taille totale des fichiers
   */
  getTotalFileSize(): number {
    return this.selectedFiles.reduce((total, file) => total + file.size, 0);
  }

  /**
   * 📊 Formater la taille en MB
   */
  formatFileSize(bytes: number): string {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /**
   * 📤 Soumettre le formulaire
   */
  onSubmit(): void {
    console.log('📤 Soumission du formulaire');

    if (!this.form.valid) {
      this.errorMessage = 'Veuillez remplir tous les champs requis';
      this.form.markAllAsTouched();
      return;
    }

    if (!this.currentUser || !this.currentUser.id) {
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
      this.errorMessage = 'Catégorie invalide';
      this.isLoading = false;
      return;
    }

    const ticketData: TicketCreateDTO = {
      titre: formValue.titre.trim(),
      description: formValue.description.trim(),
      priorite: formValue.priorite,
      demandeurId: Number(this.currentUser.id),
      groupeId: categorie.groupeResponsable?.id || 0
    };

    // ✅ CRÉER LE TICKET D'ABORD
    this.ticketservice.creerTicket(ticketData, categorieId).subscribe({
      next: (res: any) => {
        console.log('✅ Ticket créé:', res.idTicket);

        // ✅ PUIS UPLOADER LES FICHIERS
        if (this.selectedFiles.length > 0) {
          this.uploadFiles(res.idTicket);
        } else {
          this.afficherSucces(res, categorie);
        }
      },
      error: (err) => {
        console.error('❌ Erreur création ticket:', err);
        this.errorMessage = err.error?.error || 'Erreur lors de la création du ticket';
        this.isLoading = false;
      }
    });
  }

 /**
 * 📎 Uploader les fichiers
 */
private uploadFiles(idTicket: number): void {
  console.log(`📎 Upload de ${this.selectedFiles.length} fichier(s)`);

  let uploadedCount = 0;
  let errorCount = 0;

  this.selectedFiles.forEach((file, index) => {
    // ✅ PASSER L'ID UTILISATEUR
    this.ticketservice.uploadPieceJointe(
      idTicket, 
      file, 
      this.currentUser.id  // ✅ AJOUTER L'ID UTILISATEUR
    ).subscribe({
      next: (res) => {
        uploadedCount++;
        console.log(`✅ Fichier ${index + 1}/${this.selectedFiles.length} uploadé:`, file.name);
        console.log('📎 Pièce jointe créée:', res.data);

        if (uploadedCount + errorCount === this.selectedFiles.length) {
          this.finalisationCreation(idTicket, uploadedCount, errorCount);
        }
      },
      error: (err) => {
        errorCount++;
        console.error(`❌ Erreur upload fichier ${index + 1}:`, file.name, err);

        if (uploadedCount + errorCount === this.selectedFiles.length) {
          this.finalisationCreation(idTicket, uploadedCount, errorCount);
        }
      }
    });
  });
}

  /**
   * ✅ Finalisation après création + upload
   */
  private finalisationCreation(idTicket: number, uploadedCount: number, errorCount: number): void {
    const categorie = this.categories.find(c => c.idCategorie === this.form.get('categorieId')?.value);

    let message = `✅ Ticket créé avec succès !
    Référence: TK-${idTicket}
    Catégorie: ${categorie?.nomCategorie}`;

    if (uploadedCount > 0) {
      message += `\n📎 ${uploadedCount} fichier(s) uploadé(s)`;
    }

    if (errorCount > 0) {
      message += `\n⚠️ ${errorCount} fichier(s) non uploadé(s)`;
    }

    this.successMessage = message;
    this.form.reset();
    this.selectedFiles = [];
    this.selectedCategorie = null;
    this.isLoading = false;

    setTimeout(() => {
      this.etapeActive = 1;
      this.categorieChoisie = null;
    }, 3000);
  }

  /**
   * ✅ Afficher le message de succès
   */
  private afficherSucces(res: any, categorie: any): void {
    this.successMessage = `✅ Ticket créé avec succès !
    Référence: ${res.reference}
    Catégorie: ${categorie.nomCategorie}`;

    this.form.reset();
    this.selectedFiles = [];
    this.selectedCategorie = null;
    this.isLoading = false;

    setTimeout(() => {
      this.etapeActive = 1;
      this.categorieChoisie = null;
    }, 3000);
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
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Ce champ est requis';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} caractères`;

    return 'Valeur invalide';
  }

  /**
   * ✅ Obtenir le groupe de la catégorie
   */
  getSelectedCategorieGroupe(): string {
    return this.selectedCategorie?.groupeResponsable?.nomGroupes || 'Non défini';
  }

  /**
   * 🔄 Réinitialiser
   */
  resetForm(): void {
    this.form.reset();
    this.selectedFiles = [];
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * ✅ Peut soumettre
   */
  canSubmit(): boolean {
    return this.form.valid && this.currentUser && !this.isLoading;
  }

  /**
   * 🎯 Sélectionner une catégorie
   */
  selectionnerCategorie(cat: any): void {
    this.categorieChoisie = cat;
    this.form.patchValue({ categorieId: cat.idCategorie });
    this.etapeActive = 2;
  }

  /**
   * 🛠️ Vérifie si la catégorie sélectionnée nécessite le formulaire de matériel
   */
isDemandeMateriel(): boolean {
    // On vérifie que la catégorie ET son type existent pour éviter une erreur
    if (!this.categorieChoisie || !this.categorieChoisie.typecategorie) {
        return false;
    }
    
    // Soit on met tout en majuscules pour comparer avec des majuscules :
    return this.categorieChoisie.typecategorie.toUpperCase().includes('DEMANDE_MATERIEL');
    
    // OU si c'est une valeur exacte (pas juste incluse dans une phrase), 
    // tu peux faire une égalité stricte :
    // return this.categorieChoisie.typecategorie === 'DEMANDE_MATERIEL';
  }

  /**
   * ← Retour aux catégories
   */
  retourChoixCategorie(): void {
    this.etapeActive = 1;
    this.categorieChoisie = null;
    this.form.reset();
    this.selectedFiles = [];
  }
}