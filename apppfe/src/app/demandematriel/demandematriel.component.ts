import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Article, TypeArticle } from '../Model/article';
import { DemandematrielServiceService } from '../services/demandematriel-service.service';
import { InventoryService } from '../services/inventory.service';
import { DemandesListComponent } from '../demandes-list/demandes-list.component';
import { DemandeDetailComponent } from '../demande-detail/demande-detail.component';

@Component({
  selector: 'app-demandematriel',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    DemandesListComponent,
    DemandeDetailComponent
  ],
  templateUrl: './demandematriel.component.html',
  styleUrl: './demandematriel.component.css'
})
export class DemandematrielComponent implements OnInit {

  // ============ SERVICES ============
  private demandeService = inject(DemandematrielServiceService);
  private inventoryService = inject(InventoryService);
  private fb = inject(FormBuilder);

  // ============ DATA ============
  form!: FormGroup;
  articles: Article[] = [];
  typeDemandes = Object.values(TypeArticle);
  currentUser: any;

  // ============ STATES ============
  chargement = false;
  messageSucces = '';
  messageErreur = '';

  // ============ DEMANDES ============
  mesDemandes: any[] = [];
  demandesEnAttente: any[] = [];
  demandesValideeGestionnaire: any[] = [];
  rechrchecodeabarre: any[] = [];
  role: string = '';

isGestionnaire = false;
isAdmin = false;

  // ============ MODALS ============
  showValidationModal = false;
  showRejectionModal = false;
  showDetailModal = false;

  selectedDemande: any = null;
  selectedDemandeDetail: any = null;

  motifRejet = '';
  chargementValidation = false;

  validationType: 'gestionnaire' | 'admin' = 'gestionnaire';

  // ============ TABS ============
  activeTab = 'creer';

  // ============ INIT ============
  ngOnInit(): void {
    this.initializeForm();
    this.chargerUtilisateur();
  }

  public rechercheQRCodeBarres(inputElement: HTMLInputElement): void {
    const qrcode = inputElement.value;
    
    if (!qrcode || !qrcode.trim()) return;

    console.log('📡 Scan détecté, recherche du code :', qrcode);

    this.inventoryService.getArticleByCodeBarres(qrcode).subscribe({
      next: (res) => {
        inputElement.value = ''; // On vide proprement l'élément HTML natif après lecture
        
        if (Array.isArray(res)) {
          this.rechrchecodeabarre = res;
        } else if (res?.articles) {
          this.rechrchecodeabarre = res.articles;
        } else if (res) {
          this.rechrchecodeabarre = [res];
        } else {
          this.rechrchecodeabarre = [];
        }
      },
      error: (err) => {
        console.error('❌ Impossible de trouver l\'article par QR code :', err);
        this.rechrchecodeabarre = [];
        inputElement.value = '';
      }
    });
  }

// ============ USER & INIT ROLE ============
  private chargerUtilisateur(): void {
    const userStr = localStorage.getItem('utilisateurConnecte');
    if (!userStr) return;

    this.currentUser = JSON.parse(userStr);
    
    // Normalisation du rôle
    this.role = this.currentUser?.roleDemande || this.currentUser?.role || 'Demandeur';
    
    this.isGestionnaire = this.role === 'Gestionnaire_Stock';
    this.isAdmin = this.role === 'Admin' || this.role === 'Administrateur';

    // On initialise la vue sur l'onglet par défaut autorisé
    this.activeTab = 'creer'; 

    this.chargerArticles();
    this.chargerMesDemandes();
  }

  // ============ NAVIGATION SÉCURISÉE ============
  switchTab(tab: string): void {
    // 🛡️ Garde-fou : On refuse le switch si l'utilisateur n'a pas le rôle requis
    if (tab === 'enAttente' && !this.isGestionnaire && !this.isAdmin) return;
    if (tab === 'valideeGestionnaire' && !this.isAdmin) return;
    if (tab === 'rechrchecodeabarre' && !this.isGestionnaire && !this.isAdmin) return;

    this.activeTab = tab;

    // Chargement paresseux de la donnée uniquement au clic de l'onglet concerné
    if (tab === 'mesDemandes') this.chargerMesDemandes();
    if (tab === 'enAttente') this.chargerDemandesEnAttente();
    if (tab === 'valideeGestionnaire') this.chargerDemandesValideeGestionnaire();
  }

  // ============ FORM ============
  private initializeForm(): void {
    this.form = this.fb.group({
      articleId: ['', Validators.required],
      quantiteDemandee: [1, [Validators.required, Validators.min(1)]],
      type: ['CONSOMMABLE', Validators.required],
      justification: ['', Validators.required],
      referenceTicket: ['']
    });
  }

  // ============ ARTICLES ============
  private chargerArticles(): void {

    this.inventoryService.getAllArticles().subscribe({
      next: (res) => {
        this.articles = res?.articles ?? [];
      },
      error: (err) => console.error(err)
    });

  }

  // ============ MES DEMANDES ============
  private chargerMesDemandes(): void {

    if (!this.currentUser?.id) return;

    this.demandeService.getMesDemandes(this.currentUser.id).subscribe({
      next: (res) => {

        this.mesDemandes = (res?.demandes ?? []).sort((a: any, b: any) =>
          new Date(b.dateCreation).getTime() -
          new Date(a.dateCreation).getTime()
        );

      },
      error: (err) => console.error(err)
    });

  }

  // ============ DEMANDES EN ATTENTE ============
  private chargerDemandesEnAttente(): void {

    this.demandeService.getDemandesEnAttente().subscribe({
      next: (res) => {
        this.demandesEnAttente = res?.demandes ?? [];
      },
      error: (err) => console.error(err)
    });

  }

  // ============ VALIDÉES GESTIONNAIRE ============
  private chargerDemandesValideeGestionnaire(): void {

    this.demandeService.getDemandesValideeGestionnaire().subscribe({
      next: (res) => {
        this.demandesValideeGestionnaire = res?.demandes ?? [];
      },
      error: (err) => console.error(err)
    });

  }

  // ============ CREATE DEMANDE ============
  onSubmit(): void {

    if (this.form.invalid || !this.currentUser?.id) {
      this.messageErreur = '⚠️ Formulaire invalide';
      return;
    }

    this.chargement = true;

    this.demandeService.creerDemande(this.form.value, this.currentUser.id).subscribe({
      next: () => {

        this.messageSucces = '✅ Demande créée';
        this.form.reset({ type: 'CONSOMMABLE', quantiteDemandee: 1 });

        this.chargerMesDemandes();
        this.chargement = false;

        setTimeout(() => this.messageSucces = '', 3000);
      },
      error: (err) => {
        this.messageErreur = err.error?.error || 'Erreur création';
        this.chargement = false;
      }
    });

  }

  // ============ VALIDATION GESTIONNAIRE ============
  openValidationGestionnaire(d: any): void {
    this.selectedDemande = d;
    this.validationType = 'gestionnaire';
    this.showValidationModal = true;
  }

  // ============ VALIDATION ADMIN ============
  openValidationAdmin(d: any): void {
    this.selectedDemande = d;
    this.validationType = 'admin';
    this.showValidationModal = true;
  }

  validerDemande(): void {

    if (!this.selectedDemande?.id || !this.currentUser?.id) return;

    this.chargementValidation = true;

    const request =
      this.validationType === 'gestionnaire'
        ? this.demandeService.validerParGestionnaire(this.selectedDemande.id, this.currentUser.id)
        : this.demandeService.validerParAdmin(this.selectedDemande.id, this.currentUser.id);

    request.subscribe({
      next: () => {

        this.messageSucces = '✅ Validation réussie';
        this.closeModal();

        this.validationType === 'gestionnaire'
          ? this.chargerDemandesEnAttente()
          : this.chargerDemandesValideeGestionnaire();

        this.chargementValidation = false;

        setTimeout(() => this.messageSucces = '', 3000);
      },
      error: (err) => {
        this.messageErreur = err.error?.error || 'Erreur validation';
        this.chargementValidation = false;
      }
    });

  }


  demandesValideeAdmin(){}

  // ============ REJET ============
  openRejectionModal(d: any): void {
    this.selectedDemande = d;
    this.motifRejet = '';
    this.showRejectionModal = true;
  }

  rejeterDemande(): void {

    if (!this.selectedDemande?.id || !this.currentUser?.id) return;

    this.chargementValidation = true;

    this.demandeService.rejeterDemande(
      this.selectedDemande.id,
      this.currentUser.id,
      this.motifRejet
    ).subscribe({
      next: () => {

        this.messageSucces = '❌ Demande rejetée';

        this.closeModal();

        this.chargerDemandesEnAttente();
        this.chargerDemandesValideeGestionnaire();

        this.chargementValidation = false;

        setTimeout(() => this.messageSucces = '', 3000);
      },
      error: (err) => {
        this.messageErreur = err.error?.error || 'Erreur rejet';
        this.chargementValidation = false;
      }
    });

  }

  // ============ DETAILS ============
  afficherDetails(d: any): void {
    // Charger les détails complets de la demande
    this.demandeService.getDemandeDetail(d.id).subscribe({
      next: (res) => {
        console.log('✅ Détails demande chargés:', res);
        this.selectedDemandeDetail = res.demande || res;
        this.showDetailModal = true;
      },
      error: (err) => {
        console.error('❌ Erreur chargement détails:', err);
        // Afficher avec les données partielles si erreur
        this.selectedDemandeDetail = d;
        this.showDetailModal = true;
      }
    });
  }

  fermerDetailModal(): void {
    this.showDetailModal = false;
    this.selectedDemandeDetail = null;
  }

  // ============ MODALS ============
  closeModal(): void {
    this.showValidationModal = false;
    this.showRejectionModal = false;
    this.selectedDemande = null;
    this.motifRejet = '';
  }

  // // ============ TABS ============
  // switchTab(tab: string): void {

  //   this.activeTab = tab;

  //   if (tab === 'mesDemandes') this.chargerMesDemandes();
  //   if (tab === 'enAttente') this.chargerDemandesEnAttente();
  //   if (tab === 'valideeGestionnaire') this.chargerDemandesValideeGestionnaire();
  //       if (tab === 'rechrchecodeabarre') this.rechercheQRCodeBarres('');


  // }
}