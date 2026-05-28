import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketService } from '../services/ticket.service';
import { Article } from '../Model/article';
import { InventoryService } from '../services/inventory.service';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css'
})
export class TicketDetailComponent implements OnInit, OnChanges {

  @Input() ticketId?: number;

  // ===== TICKET =====
  ticket: any = null;
  currentUser: any;
  userRole: string = '';
  isLoading: boolean = true;
  successMessage: string = '';
  errorMessage: string = '';

  // ===== NOTES =====
  notes: any[] = [];
  nouvelleNote: string = '';
  notesLoading: boolean = false;

  // ===== RÉSOLUTION =====
  showResolveModal: boolean = false;
  noteResolution: string = '';
  actionInProgress: boolean = false;
  tempsIntervention: number = 0;
  tempsCalculeAuto: boolean = false;

  // ===== FICHIERS =====
  selectedFile: File | null = null;
  fileUploadInProgress: boolean = false;
  piecesJointes: any[] = [];

  // ===== PIÈCES CONSOMMÉES =====
  piecesConsommees: Array<{ categorieId?: number, articleId?: number, quantite: number }> = [];
  listeCategoriesPieces: Article[] = []; 
  listeArticlesGlobal: Article[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketservice: TicketService,
    private articleservice: InventoryService
  ) {}

  ngOnInit(): void {
    console.log('🎫 Initialisation TicketDetailComponent');
    this.chargerUtilisateur();
    this.chargerCatalogueStock(); // Charge les catégories et les articles pour le modal
    
    if (this.ticketId) {
      this.chargerTicketDetails(this.ticketId);
    } else {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.chargerTicketDetails(Number(id));
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticketId'] && changes['ticketId'].currentValue) {
      console.log('🔄 Changement ticketId:', changes['ticketId'].currentValue);
      this.chargerTicketDetails(changes['ticketId'].currentValue);
    }
  }

  /**
   * 📦 Charger les catégories et articles disponibles depuis l'API
   */
  private chargerCatalogueStock(): void {
    this.articleservice.getAllArticles().subscribe(
      res => {
        // Extraire les articles - la réponse peut être wrappée dans un objet
        let articles: any[] = [];
        
        if (Array.isArray(res)) {
          articles = res;
        } else if (res && typeof res === 'object') {
          // Chercher un tableau dans les propriétés communes
          if (Array.isArray(res.data)) {
            articles = res.data;
          } else if (Array.isArray(res.articles)) {
            articles = res.articles;
          } else if (Array.isArray(res.result)) {
            articles = res.result;
          } else {
            articles = [];
          }
        }
        
        if (!articles || articles.length === 0) {
          this.listeArticlesGlobal = [];
          this.listeCategoriesPieces = [];
          return;
        }
        
        this.listeArticlesGlobal = articles;
        
        // Extraire les catégories uniques des articles
        const categoriesMap = new Map();
        
        articles.forEach((article: any) => {
          if (!article) return;
          
          const categorie = article.categorie;
          let categorieId = null;
          let categorieName = null;
          let reference = article.reference || '';
          
          if (typeof categorie === 'object' && categorie !== null) {
            categorieId = categorie.id;
            categorieName = categorie.nomCategorie || categorie.label || categorie.categorie;
          } else if (typeof categorie === 'string' && categorie.trim()) {
            categorieId = categorie.trim();
            categorieName = categorie.trim();
          }
          
          if (categorieId) {
            const key = `${categorieId}`;
            if (!categoriesMap.has(key)) {
              categoriesMap.set(key, {
                id: categorieId,
                categorie: categorieName,
                reference: reference
              });
            }
          }
        });
        
        this.listeCategoriesPieces = Array.from(categoriesMap.values());
      },
      error => {
        console.error('❌ Erreur chargement articles:', error);
        this.listeArticlesGlobal = [];
        this.listeCategoriesPieces = [];
      }
    );
  }

  /**
   * 👤 Charger l'utilisateur connecté
   */
  private chargerUtilisateur(): void {
    const userStr = sessionStorage.getItem('currentUser') || localStorage.getItem('utilisateurConnecte');
    
    if (userStr) {
      try {
        let user = JSON.parse(userStr);
        if (typeof user === 'string') {
          user = JSON.parse(user);
        }
        this.currentUser = user;
        this.userRole = this.currentUser.role?.toLowerCase() || '';
        console.log('👤 Utilisateur chargé:', this.currentUser.prenom, this.currentUser.nom);
      } catch (error) {
        console.error('❌ Erreur parsing utilisateur:', error);
      }
    }
  }

  /**
   * 📋 Charger les détails du ticket
   */
  private chargerTicketDetails(idTicket: number): void {
    console.log('📋 Chargement détails ticket:', idTicket);
    this.isLoading = true;
    this.errorMessage = '';

    this.ticketservice.getTicketById(idTicket).subscribe({
      next: (res) => {
        // Extraire le ticket - la réponse peut être wrappée dans un objet
        let ticket: any = null;
        const response = res as any;
        
        if (response && typeof response === 'object') {
          // Vérifier si les données sont wrappées dans une propriété
          if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            ticket = response.data;
          } else if (response.ticket && typeof response.ticket === 'object') {
            ticket = response.ticket;
          } else {
            // Sinon, utiliser directement la réponse
            ticket = response;
          }
        }
        
        if (ticket && ticket.idTicket) {
          this.ticket = ticket;
          console.log('✅ Ticket chargé:', ticket.reference, 'ID:', ticket.idTicket);
          this.isLoading = false;
          this.chargerNotes(idTicket);
          this.chargerPiecesJointes(idTicket);
        } else {
          console.error('❌ Structure ticket invalide:', res);
          this.errorMessage = 'Structure de données ticket invalide';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('❌ Erreur chargement ticket:', err);
        this.errorMessage = 'Erreur lors du chargement du ticket';
        this.isLoading = false;
      }
    });
  }

  /**
   * 📝 Charger les notes du ticket
   */
  private chargerNotes(idTicket: number): void {
    console.log('📝 Chargement des notes du ticket:', idTicket);
    this.notesLoading = true;

    this.ticketservice.getNotesByTicket(idTicket).subscribe({
      next: (res) => {
        this.notes = res;
        console.log('✅ Notes chargées:', res.length);
        this.notesLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement notes:', err);
        this.notes = [];
        this.notesLoading = false;
      }
    });
  }

  /**
   * 📎 Charger les pièces jointes du ticket
   */
  private chargerPiecesJointes(idTicket: number): void {
    console.log('📎 Chargement des pièces jointes du ticket:', idTicket);

    this.ticketservice.getPiecesByTicket(idTicket).subscribe({
      next: (res: any) => {
        this.piecesJointes = res.pieces || res || [];
        console.log('✅ Pièces jointes chargées:', this.piecesJointes.length);
      },
      error: (err) => {
        console.error('❌ Erreur chargement pièces jointes:', err);
        this.piecesJointes = [];
      }
    });
  }

  // ===== PERMISSIONS =====

  isTechnicienOrAdmin(): boolean {
    return ['technicien', 'administrateur', 'admin'].includes(this.userRole);
  }

  isDemandeurOrAdmin(): boolean {
    const isOwner = this.ticket?.demandeur?.id === this.currentUser?.id;
    return isOwner || ['administrateur', 'admin'].includes(this.userRole);
  }

  isAdmin(): boolean {
    return ['administrateur', 'admin'].includes(this.userRole);
  }

  // ===== ACTIONS SUR LE TICKET =====

  /**
   * ▶️ DÉMARRER LE TICKET
   */
  demarrerTicket(): void {
    console.log('▶️ Démarrage du ticket:', this.ticket.idTicket);
    this.actionInProgress = true;
    this.errorMessage = '';

    this.ticketservice.demarrerTicket(this.ticket.idTicket, this.currentUser.id).subscribe({
      next: (res) => {
        console.log('✅ Ticket démarré');
        this.ticket = res;
        this.ticket.statut = 'En_Cours';
        this.successMessage = '✅ Ticket en cours de traitement';
        localStorage.setItem(`ticket_start_${this.ticket.idTicket}`, Date.now().toString());
        this.actionInProgress = false;
      },
      error: (err) => {
        console.error('❌ Erreur démarrage:', err);
        this.errorMessage = 'Erreur lors du démarrage du ticket';
        this.actionInProgress = false;
      }
    });
  }

/**
   * 🔍 OUVRIR LA MODAL DE RÉSOLUTION
   */
  ouvrirModalResolution(): void {
    console.log('🔍 Ouverture modal résolution');
    this.tempsIntervention = 0;
    this.tempsCalculeAuto = false;
    this.noteResolution = '';
    
    // ✅ Initialise le tableau avec une ligne vide par défaut au lieu d'un tableau vide
    this.piecesConsommees = [
      { categorieId: undefined, articleId: undefined, quantite: 1 }
    ]; 
    
    this.showResolveModal = true;
    this.errorMessage = '';
  }

  /**
   * ✅ RÉSOUDRE LE TICKET
   */
  /**
   * ✅ RÉSOUDRE LE TICKET + ENREGISTRER LES PIÈCES
   */
  resoudreTicket(): void {
    console.log('✅ Tentative de résolution du ticket');

    // 0. Validation du ticket
    if (!this.ticket || !this.ticket.idTicket) {
      this.errorMessage = '⚠️ Erreur: Ticket non chargé correctement. Veuillez rafraîchir la page.';
      console.error('❌ Ticket non valide:', this.ticket);
      return;
    }

    // 1. Validations de base
    if (!this.noteResolution.trim()) {
      this.errorMessage = '⚠️ Veuillez ajouter une note de résolution';
      return;
    }

    if (this.tempsIntervention <= 0) {
      this.errorMessage = '⚠️ Veuillez saisir un temps d\'intervention valide';
      return;
    }

    // 2. Validation des pièces consommées (si le technicien en a ajouté)
    if (this.piecesConsommees.length > 0 && !this.validerPieces()) {
      this.errorMessage = '⚠️ Veuillez vérifier les pièces saisies (article sélectionné et quantité > 0)';
      return;
    }

    this.actionInProgress = true;
    this.errorMessage = '';

    const noteFinale = `${this.noteResolution}\n\n⏱️ Temps d'intervention : ${this.tempsIntervention} minute(s).`;

    // 3. Appel API pour passer le ticket à l'état Résolu
    this.ticketservice.resoudreTicket(
      this.ticket.idTicket,
      this.currentUser.id,
      noteFinale,
      this.tempsIntervention
    ).subscribe({
      next: (res) => {
        console.log('✅ Ticket marqué comme résolu sur le serveur');
        
        // Mettre à jour l'état local du ticket - extraire de la réponse wrappée
        const response = res as any;
        if (response.ticket) {
          this.ticket = response.ticket;
        } else {
          this.ticket = res;
        }
        
        this.ticket.statut = 'Resolu';
        this.ticket.noteResolution = noteFinale;
        
        console.log('✅ Ticket mis à jour localement - ID:', this.ticket.idTicket);

        // 4. Enregistrement des pièces consommées en base de données
        this.enregistrerLesPiecesDuTicket();

        // Nettoyage et fermeture du modal
        this.showResolveModal = false;
        this.actionInProgress = false;
        this.successMessage = '✅ Ticket résolu et pièces de rechange décomptées !';
        localStorage.removeItem(`ticket_start_${this.ticket.idTicket}`);
      },
      error: (err) => {
        console.error('❌ Erreur résolution ticket:', err);
        this.errorMessage = 'Erreur lors de la résolution du ticket';
        this.actionInProgress = false;
      }
    });
  }

  /**
   * 🛠️ Envoie chaque pièce enregistrée dans le tableau vers le Backend
   * ET réduit la quantité de stock correspondante
   */
  private enregistrerLesPiecesDuTicket(): void {
    if (this.piecesConsommees.length === 0) return;

    // Utiliser la référence ou l'ID du ticket pour le commentaire
    const ticketIdentifiant = this.ticket.reference || `Ticket #${this.ticket.idTicket}`;

    // Préparer les appels API en parallèle
    const observables: any[] = [];

    this.piecesConsommees.forEach(piece => {
      // Vérifier que articleId est valide
      if (!piece.articleId || piece.quantite <= 0) {
        return;
      }

      // Construction du JSON pour ConsommationPiece
      const consommationPayload = {
        quantite: piece.quantite,
        commentaire: `Utilisé lors de la résolution du ${ticketIdentifiant}`,
        referenceTicket: this.ticket.reference || this.ticket.idTicket,
        article: { id: piece.articleId },
        responsable: { id: this.currentUser.id }
      };

      // 1️⃣ Ajouter la consommation
      const ajouterConsommation$ = this.ticketservice.ajouterConsommationPiece(consommationPayload);
      
      // 2️⃣ Réduire le stock (appel parallèle)
      const diminuerStock$ = this.articleservice.getStockByArticleId(piece.articleId).pipe(
        switchMap(stockData => {
          const stockId = stockData.id || stockData.stockId;
          return this.articleservice.diminuerQuantite(stockId, piece.quantite);
        })
      );

      // Ajouter les deux appels à la liste
      observables.push(
        forkJoin([
          ajouterConsommation$,
          diminuerStock$
        ])
      );
    });

    // Exécuter tous les appels en parallèle
    if (observables.length > 0) {
      forkJoin(observables).subscribe({
        next: (results) => {
          this.successMessage = '✅ Ticket résolu et pièces de rechange décomptées !';
        },
        error: (err) => {
          console.error('❌ Erreur gestion pièces:', err.status, err.statusText);
          
          if (err.status === 403) {
            this.errorMessage = '❌ Accès refusé : Vérifiez vos permissions pour gérer le stock';
          } else if (err.status === 404) {
            this.errorMessage = '❌ Ressource non trouvée : Vérifiez l\'ID de l\'article';
          } else {
            this.errorMessage = '❌ Erreur lors de la mise à jour du stock';
          }
        }
      });
    }

    // Vider le tableau après traitement
    this.piecesConsommees = [];
  }

  /**
   * 🔒 CLÔTURER LE TICKET
   */
  cloturerTicket(): void {
    console.log('🔒 Clôture du ticket');

    if (!confirm('Êtes-vous sûr de vouloir clôturer définitivement ce ticket ? (Statut final = CLOTURE)')) {
      return;
    }

    this.actionInProgress = true;
    this.errorMessage = '';

    this.ticketservice.cloturerTicket(this.ticket.idTicket, this.currentUser.id, this.userRole).subscribe({
      next: (res) => {
        console.log('✅ Ticket clôturé');
        this.ticket = res;
        this.ticket.statut = 'Cloture';
        this.actionInProgress = false;
        this.successMessage = '✅ Ticket clôturé avec succès !';
      },
      error: (err) => {
        console.error('❌ Erreur clôture:', err);
        this.errorMessage = 'Erreur lors de la clôture du ticket';
        this.actionInProgress = false;
      }
    });
  }

  /**
   * ⚠️ RÉOUVRIR LE TICKET
   */
  reouvrirTicket(): void {
    console.log('⚠️ Réouverture du ticket');

    const raison = prompt('Pourquoi la solution ne convient-elle pas ?');
    if (!raison) return;

    this.actionInProgress = true;
    this.errorMessage = '';

    this.ticketservice.demarrerTicket(this.ticket.idTicket, this.currentUser.id).subscribe({
      next: (res) => {
        console.log('✅ Ticket réouvert');
        this.ticket = res;
        this.ticket.statut = 'En_Cours';
        this.actionInProgress = false;
        this.successMessage = '⚠️ Le ticket est revenu à l\'état EN_COURS.';
      },
      error: (err) => {
        console.error('❌ Erreur réouverture:', err);
        this.errorMessage = 'Erreur lors de la réouverture du ticket';
        this.actionInProgress = false;
      }
    });
  }

  // ===== NOTES ET COMMENTAIRES =====

  envoyerNote(): void {
    console.log('📝 Envoi d\'une note');

    if (!this.nouvelleNote.trim()) {
      this.errorMessage = '⚠️ La note ne peut pas être vide';
      return;
    }

    this.notesLoading = true;
    this.errorMessage = '';

    const noteData = {
      contenu: this.nouvelleNote,
      type: 'COMMENTAIRE',
      idTicket: this.ticket.idTicket,
      idUtilisateur: this.currentUser.id
    };

    this.ticketservice.ajouterNote(noteData).subscribe({
      next: (res) => {
        console.log('✅ Note ajoutée');
        this.notes.push(res);
        this.nouvelleNote = '';
        this.notesLoading = false;
        this.successMessage = '✅ Commentaire ajouté';
      },
      error: (err) => {
        console.error('❌ Erreur ajout note:', err);
        this.errorMessage = 'Erreur lors de l\'ajout du commentaire';
        this.notesLoading = false;
      }
    });
  }

  supprimerNote(idNote: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }

    this.ticketservice.supprimerNote(idNote).subscribe({
      next: () => {
        console.log('✅ Note supprimée');
        this.notes = this.notes.filter(n => n.idNote !== idNote);
        this.successMessage = '✅ Note supprimée';
      },
      error: (err) => {
        console.error('❌ Erreur suppression note:', err);
        this.errorMessage = 'Erreur lors de la suppression de la note';
      }
    });
  }

  // ===== GESTION DES FICHIERS =====

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('📎 Fichier sélectionné:', file.name);
      
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = '❌ Le fichier dépasse 5MB';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';
    }
  }

  uploadFichier(): void {
    if (!this.selectedFile) {
      this.errorMessage = '⚠️ Veuillez sélectionner un fichier';
      return;
    }

    if (!this.ticket?.idTicket) {
      this.errorMessage = '⚠️ ID ticket invalide';
      return;
    }

    console.log('📤 Upload fichier:', this.selectedFile.name);
    this.fileUploadInProgress = true;
    this.errorMessage = '';

    this.ticketservice.uploadPieceJointe(
      this.ticket.idTicket,
      this.selectedFile,
      this.currentUser.id
    ).subscribe({
      next: (res) => {
        console.log('✅ Fichier uploadé');
        this.fileUploadInProgress = false;
        this.selectedFile = null;

        if (!this.piecesJointes) {
          this.piecesJointes = [];
        }
        this.piecesJointes.push(res.data || res);
        this.successMessage = '✅ Fichier uploadé avec succès';

        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (err) => {
        console.error('❌ Erreur upload:', err);
        this.fileUploadInProgress = false;
        this.errorMessage = err.error?.error || 'Erreur lors de l\'upload du fichier';
      }
    });
  }

  supprimerPieceJointe(idPieceJointe: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return;
    }

    console.log('🗑️ Suppression pièce jointe:', idPieceJointe);

    this.ticketservice.deletePieceJointe(idPieceJointe).subscribe({
      next: () => {
        console.log('✅ Pièce jointe supprimée');
        this.piecesJointes = this.piecesJointes.filter(p => p.idJointe !== idPieceJointe);
        this.successMessage = '✅ Fichier supprimé';
      },
      error: (err) => {
        console.error('❌ Erreur suppression pièce:', err);
        this.errorMessage = 'Erreur lors de la suppression du fichier';
      }
    });
  }

  telechargerPieceJointe(piece: any): void {
    if (!piece?.idJointe) {
      this.errorMessage = '❌ ID de la pièce jointe invalide';
      return;
    }

    this.fileUploadInProgress = true;

    this.ticketservice.downloadPieceJointe(piece.idJointe).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = piece.nomJointe || 'fichier-telechargé';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.fileUploadInProgress = false;
        this.successMessage = `✅ ${piece.nomJointe} téléchargé`;
      },
      error: (err) => {
        console.error('❌ Erreur téléchargement:', err);
        this.fileUploadInProgress = false;
        this.errorMessage = `❌ Erreur téléchargement: ${err.error?.error || err.message}`;
      }
    });
  }

  // ===== COMPLÉMENTS PIÈCES CONSOMMÉES =====

  /**
   * ➕ Ajouter une nouvelle ligne vide dans le tableau des pièces consommées
   */
  ajouterPieceConsommee(): void {
    this.piecesConsommees.push({
      categorieId: undefined,
      articleId: undefined,
      quantite: 1
    });
  }

  /**
   * 🗑️ Supprimer une ligne spécifique
   */
  supprimerPieceConsommee(index: number): void {
    this.piecesConsommees.splice(index, 1);
  }

  /**
   * 🔄 Réinitialiser la sélection de l'article si la catégorie de la ligne change
   */
  onCategorieChange(item: any): void {
    item.articleId = undefined;
  }

  /**
   * 🔍 Filtrer dynamiquement la liste globale des articles selon l'id de la catégorie sélectionnée
   */
  getArticlesParCategorie(categorieId?: number | string): Article[] {
    if (!categorieId) return [];
    
    return this.listeArticlesGlobal.filter(art => {
      const categorie = (art as any).categorie;
      
      // Cas 1: categorie est un objet avec id
      if (typeof categorie === 'object' && categorie !== null && categorie.id) {
        return Number(categorie.id) === Number(categorieId);
      }
      
      // Cas 2: categorie est une string
      if (typeof categorie === 'string' && categorie.trim()) {
        return categorie.trim() === String(categorieId).trim();
      }
      
      return false;
    });
  }

  /**
   * ⚙️ Validation: S'assure que chaque ligne ajoutée dispose d'un article valide et d'une quantité > 0
   */
  validerPieces(): boolean {
    for (const piece of this.piecesConsommees) {
      if (!piece.articleId || !piece.quantite || piece.quantite <= 0) {
        return false;
      }
    }
    return true;
  }

  // ===== AUTRES FONCTIONS DE GESTION =====

  supprimerTicket(): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce ticket ?')) {
      return;
    }

    this.actionInProgress = true;
    this.errorMessage = '';

    this.ticketservice.supprimerTicket(this.ticket.idTicket).subscribe({
      next: () => {
        this.successMessage = '✅ Ticket supprimé avec succès';
        setTimeout(() => {
          this.router.navigate(['/technicien/liste-tickets']);
        }, 1500);
      },
      error: (err) => {
        console.error('❌ Erreur suppression:', err);
        this.errorMessage = 'Erreur lors de la suppression du ticket';
        this.actionInProgress = false;
      }
    });
  }

  getStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'Nouveau': 'bg-danger',
      'En_Cours': 'bg-warning text-dark',
      'En_Attente': 'bg-info',
      'Resolu': 'bg-success',
      'Cloture': 'bg-secondary'
    };
    return statusMap[statut] || 'bg-light text-dark';
  }

  getPrioriteColor(priorite: string): string {
    const colorMap: { [key: string]: string } = {
      'Basse': '#28a745',
      'Moyenne': '#ffc107',
      'Haute': '#fd7e14',
      'Critique': '#dc3545'
    };
    return colorMap[priorite] || '#6c757d';
  }

  rafraichirTicket(): void {
    if (this.ticket?.idTicket) {
      this.chargerTicketDetails(this.ticket.idTicket);
    }
  }
}