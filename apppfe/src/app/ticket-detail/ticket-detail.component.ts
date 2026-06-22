import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketService } from '../services/ticket.service';
import { Article } from '../Model/article';
import { InventoryService } from '../services/inventory.service';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Stock, StockDTO } from '../Model/stock';
import { StockService } from '../services/stock.service';

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
  showUploadZone: boolean = false;

  // ===== PIÈCES CONSOMMÉES =====
  // piecesConsommees: Array<{ categorieId?: number, articleId?: number, quantite: number }> = [];
  listeCategoriesPieces: Stock[] = []; 
  listeArticlesGlobal: Article[] = [];
  piecesConsommees: any[] = [];      // Votre tableau de lignes dynamiques

  


  listeStocksDisponibles: StockDTO[] = []; // Stock global pour vérifier les quantités disponibles lors de la résolution

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketservice: TicketService,
    private articleservice: InventoryService,
    private stockService: StockService
  
  ) {}


  // // ===== FICHIERS =====
  // fileUploadInProgress: boolean = false;
  // piecesJointes: any[] = [];
  // showUploadZone: boolean = false;
  
  // 🎯 Nouvelles variables requises pour le multi-drop
  selectedFiles: File[] = [];
  draggedOver: boolean = false;


  

  // 🎯 Gestion du Drag & Drop mécanique Angular
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.draggedOver = true;
  }

  // Déclenche l'explorateur de fichiers natif lors du clic sur le conteneur principal
// 🎯 Déclenche automatiquement l'explorateur de fichiers au clic sur la boîte
// 🎯 Simule le clic sur l'input invisible au clic sur le bouton ou sur la zone
triggerFileInput(): void {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.click();
  }
}

// ===== GESTION DRAG & DROP =====


onDragLeave(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  this.draggedOver = false;
}

onDrop(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  this.draggedOver = false;

  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    console.log('📎 Fichier déposé:', file.name);

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = '❌ Le fichier dépasse 5MB';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
  }
}


chargerStocks(): void {
  this.articleservice.getAllStocks().subscribe({ // Ajustez le nom de votre service et de la méthode qui appelle l'API /api/inventory/stocks
    next: (data: any[]) => {
      this.listeStocksDisponibles = data;
      console.log('📦 Stocks chargés avec succès :', this.listeStocksDisponibles);
    },
    error: (err) => {
      console.error('❌ Erreur lors du chargement des stocks :', err);
    }
  });
}

// Déclenche une action ou une vérification si nécessaire lors du changement de sélection
onStockChange(item: any): void {
  // Optionnel : on initialise la quantité à 1 par défaut dès qu'un matériel est choisi
  if (!item.quantite) {
    item.quantite = 1;
  }
}

// Permet de bloquer dynamiquement la quantité maximum saisissable dans le HTML
getMaxQuantite(articleId: number): number {
  const stockCorrespondant = this.listeStocksDisponibles.find(s => s.articleId === articleId);
  return stockCorrespondant ? stockCorrespondant.quantiteEnStock : 999;
}
 


  // 🎯 Sécuriser et filtrer la liste de fichiers (taille max 5 Mo)
  private ajouterFichiersDansLaListe(fileList: FileList): void {
    const maxBytes = 5 * 1024 * 1024; // 5MB
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > maxBytes) {
        alert(`❌ Le fichier "${file.name}" dépasse la limite autorisée de 5 Mo.`);
        continue;
      }
      // Éviter les doublons exacts dans la sélection locale
      if (!this.selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        this.selectedFiles.push(file);
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  getTotalFileSize(): number {
    return this.selectedFiles.reduce((total, file) => total + file.size, 0);
  }

  formatFileSize(sizeInBytes: number): string {
    if (sizeInBytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));
    return parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 🎯 UPLOAD MULTIPLE SÉCURISÉ (Asynchrone avec forkJoin)
   * Envoie chaque fichier individuellement au backend puis rafraîchit la vue
   */
  uploadFichiersMultiples(): void {
    if (this.selectedFiles.length === 0) return;
    this.fileUploadInProgress = true;
    this.errorMessage = '';

    // Préparer les requêtes HTTP individuelles pour chaque fichier
    const requetesUpload = this.selectedFiles.map(file => 
      this.ticketservice.uploadPieceJointe(this.ticket.idTicket, file, this.currentUser.id)
    );

    // forkJoin attend la réponse réussie de TOUS les fichiers
    forkJoin(requetesUpload).subscribe({
      next: (responses: any[]) => {
        console.log('✅ Tous les fichiers ont été téléchargés avec succès');
        
        // Ajouter les nouvelles pièces jointes retournées par l'API à la liste locale
        responses.forEach(res => {
          const piece = res.data || res;
          if (piece) this.piecesJointes.push(piece);
        });

        this.selectedFiles = []; // Vider la sélection
        this.fileUploadInProgress = false;
        this.showUploadZone = false; // Fermer la boîte
        this.successMessage = '✅ Fichier(s) ajouté(s) avec succès !';
      },
      error: (err) => {
        console.error('❌ Erreur lors de l\'envoi global:', err);
        this.fileUploadInProgress = false;
        this.errorMessage = 'Une erreur est survenue lors du téléversement de certains fichiers.';
      }
    });
  }

  // ===== EXPORT TICKET =====

/**
 * 📄 EXPORTER EN PDF
 */
exporterEnPDF(): void {
  console.log('📄 Export PDF du ticket:', this.ticket.reference);
  
  if (!this.ticket || !this.ticket.idTicket) {
    this.errorMessage = '❌ Ticket non chargé. Impossible d\'exporter.';
    return;
  }

  this.actionInProgress = true;
  this.errorMessage = '';

  this.ticketservice.exportTicketPDF(this.ticket.idTicket).subscribe({
    next: (blob: Blob) => {
      // Créer un URL temporaire pour le blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ticket_${this.ticket.reference}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.actionInProgress = false;
      this.successMessage = `✅ Ticket ${this.ticket.reference} exporté en PDF`;
      console.log('✅ PDF exporté avec succès');
    },
    error: (err) => {
      console.error('❌ Erreur export PDF:', err);
      this.actionInProgress = false;
      this.errorMessage = 'Erreur lors de l\'export PDF du ticket';
    }
  });
}

/**
 * 📊 EXPORTER EN EXCEL
 */
exporterEnExcel(): void {
  console.log('📊 Export Excel du ticket:', this.ticket.reference);

  if (!this.ticket || !this.ticket.idTicket) {
    this.errorMessage = '❌ Ticket non chargé. Impossible d\'exporter.';
    return;
  }

  this.actionInProgress = true;
  this.errorMessage = '';

  this.ticketservice.exportTicketExcel(this.ticket.idTicket).subscribe({
    next: (blob: Blob) => {
      // Créer un URL temporaire pour le blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ticket_${this.ticket.reference}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.actionInProgress = false;
      this.successMessage = `✅ Ticket ${this.ticket.reference} exporté en Excel`;
      console.log('✅ Excel exporté avec succès');
    },
    error: (err) => {
      console.error('❌ Erreur export Excel:', err);
      this.actionInProgress = false;
      this.errorMessage = 'Erreur lors de l\'export Excel du ticket';
    }
  });
}
  ngOnInit(): void {
    console.log('🎫 Initialisation TicketDetailComponent');
    this.chargerUtilisateur();
    // 2. Dans votre ngOnInit() ou votre méthode de chargement initiale, appelez cette fonction :
    this.chargerStocks();
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
  
  // ✅ On initialise le tableau complètement vide au départ
  // Si le technicien a besoin d'une pièce, il cliquera sur "Ajouter une pièce"
  this.piecesConsommees = []; 
  
  this.showResolveModal = true;
  this.errorMessage = '';
}

/**
 * ✅ RÉSOUDRE LE TICKET + ENREGISTRER LES PIÈCES
 */
/**
 * ✅ RÉSOUDRE LE TICKET + ENREGISTRER LES PIÈCES (Version sécurisée globale)
 */
resoudreTicket(): void {
  console.log('✅ Tentative de résolution du ticket');

  // 0. Validation du ticket
  if (!this.ticket || !this.ticket.idTicket) {
    this.errorMessage = '⚠️ Erreur: Ticket non chargé correctement. Veuillez rafraîchir la page.';
    return;
  }

  // 1. Validations de base
  if (!this.noteResolution || !this.noteResolution.trim()) {
    this.errorMessage = '⚠️ Veuillez ajouter une note de résolution';
    return;
  }

  if (this.tempsIntervention <= 0) {
    this.errorMessage = '⚠️ Veuillez saisir un temps d\'intervention valide';
    return;
  }

  // 2. Validation des pièces consommées
  if (this.piecesConsommees.length > 0 && !this.validerPieces()) {
    this.errorMessage = '⚠️ Veuillez vérifier les pièces saisies (article sélectionné et quantité > 0)';
    return;
  }

  this.actionInProgress = true;
  this.errorMessage = '';

  const noteFinale = `${this.noteResolution}\n\n⏱️ Temps d'intervention : ${this.tempsIntervention} minute(s).`;

  // 🎯 ÉTAPE A : S'il y a des pièces, traitement séquentiel sécurisé
  if (this.piecesConsommees.length > 0) {
    const ticketIdentifiant = this.ticket.reference || `Ticket #${this.ticket.idTicket}`;
    const observablesPieces: Observable<any>[] = [];
    const listeErreursEncountered: string[] = [];

    this.piecesConsommees.forEach(piece => {
      if (!piece.articleId || piece.quantite <= 0) return;

      // Construction du payload pour correspondre exactement à votre entité Spring Boot
     const consommationPayload = {
  quantite: piece.quantite,
  commentaire: `Utilisé lors de la résolution du ${ticketIdentifiant}`,
  referenceTicket: String(this.ticket.reference || this.ticket.idTicket),
  articleId: piece.articleId,        // 💡 Option A (ID Direct)
  article: { id: piece.articleId },  // 💡 Option B (Objet imbriqué)
  responsableId: this.currentUser?.id, 
  responsable: { id: this.currentUser?.id }
};
      // ⛓️ Chaînage logique : POST d'abord, puis PUT uniquement si succès
      const traitementPiece$ = this.ticketservice.ajouterConsommationPiece(consommationPayload).pipe(
        switchMap((resConsommation) => {
          // Si le POST réussit, on passe à l'étape de diminution du stock
          if (!resConsommation) return of(null);
          
          return this.articleservice.getStockByArticleId(piece.articleId).pipe(
            switchMap(stockData => {
              if (stockData && (stockData.id || stockData.stockId)) {
                const stockId = stockData.id || stockData.stockId;
                return this.articleservice.diminuerQuantite(stockId, piece.quantite);
              }
              return of(null);
            }),
            catchError((err) => {
              const msgErreur = err.error?.error || err.error?.message || 'Stock introuvable (404)';
              listeErreursEncountered.push(`• Problème Stock (ID Article: ${piece.articleId}) : ${msgErreur}`);
              return of(null);
            })
          );
        }),
        catchError((err) => {
          // Si le POST échoue (Erreur 500), on intercepte l'erreur ici et on bloque le chaînage
          const msgErreur = err.error?.error || err.error?.message || 'Erreur Interne Serveur (500)';
          listeErreursEncountered.push(`• Pièce consommée (ID Article: ${piece.articleId}) : ${msgErreur}`);
          return of(null); // Permet à forkJoin de continuer sans tout faire cracher
        })
      );

      observablesPieces.push(traitementPiece$);
    });

    // Éxécution synchronisée de toutes les pièces
    forkJoin(observablesPieces).subscribe({
      next: () => {
        // ❌ S'il y a eu la moindre erreur (POST ou PUT), on stoppe
        if (listeErreursEncountered.length > 0) {
          this.actionInProgress = false;
          alert(
            `❌ Le ticket n'a PAS été résolu car des erreurs de stock/pièces sont survenues :\n\n` + 
            listeErreursEncountered.join('\n') + 
            `\n\nVeuillez vérifier le format des données et réessayer.`
          );
          return;
        }

        // 🚀 Tout est OK, on finalise sur le serveur
        this.finaliserResolutionTicketServeur(noteFinale);
      },
      error: (err) => {
        console.error('❌ Erreur critique pièces:', err);
        this.errorMessage = 'Erreur lors de la vérification des pièces.';
        this.actionInProgress = false;
      }
    });

  } else {
    // 🎯 CAS 2 : Pas de pièces consommées
    this.finaliserResolutionTicketServeur(noteFinale);
  }
}

/**
 * ÉTAPE B : Appel API final pour passer le ticket à Résolu (Uniquement si tout le reste est OK)
 */
private finaliserResolutionTicketServeur(noteFinale: string): void {
  this.ticketservice.resoudreTicket(
    this.ticket.idTicket,
    this.currentUser.id,
    noteFinale,
    this.tempsIntervention
  ).subscribe({
    next: (res) => {
      console.log('✅ Ticket marqué comme résolu avec succès !');
      const response = res as any;
      if (response && response.ticket) {
        this.ticket = response.ticket;
      } else {
        this.ticket = res;
      }
      
      this.ticket.statut = 'Resolu';
      this.ticket.noteResolution = noteFinale;
      localStorage.removeItem(`ticket_start_${this.ticket.idTicket}`);

      this.showResolveModal = false;
      this.actionInProgress = false;
      this.piecesConsommees = [];
      
      alert('🎉 Ticket résolu et pièces enregistrées avec succès !');
      this.router.navigate(['/index']);
    },
    error: (err) => {
      console.error('❌ Erreur finale résolution ticket:', err);
      this.errorMessage = 'Erreur lors du passage du ticket à l\'état Résolu sur le serveur.';
      this.actionInProgress = false;
    }
  });
}


/**
 * ⚙️ Validation: S'assure que chaque ligne ajoutée dispose d'un article valide et d'une quantité > 0
 */
// validerPieces(): boolean {
//   // Si le tableau est vide, c'est valide (les pièces sont optionnelles)
//   if (this.piecesConsommees.length === 0) return true;

//   return this.piecesConsommees.every(piece => 
//     piece.categorieId !== undefined && 
//     piece.articleId !== undefined && 
//     piece.quantite && 
//     piece.quantite > 0
//   );
// }

  /**
   * 🛠️ Envoie chaque pièce enregistrée dans le tableau vers le Backend
   * ET réduit la quantité de stock correspondante
   */
private enregistrerLesPiecesDuTicket(): void {
  const observables: any[] = [];
  // Tableau pour collecter toutes les erreurs rencontrées durant le traitement
  const listeErreursEncountered: string[] = [];
  
  this.piecesConsommees.forEach(piece => {
    if (!piece.articleId || piece.quantite <= 0) return;
    
    const payload = {
      quantite: piece.quantite,
      commentaire: `Utilisé pour le ticket ${this.ticket.reference}`,
      referenceTicket: this.ticket.reference,
      article: { id: piece.articleId },
      responsable: { id: this.currentUser.id }
    };

    const chaineStockEtConsommation = forkJoin([
      
      // 1. Enregistrement de la consommation
      this.ticketservice.ajouterConsommationPiece(payload).pipe(
        catchError((err) => {
          console.error(`❌ Erreur consommation (Article ID: ${piece.articleId}):`, err);
          const msgErreur = err.error?.error || err.error?.message || 'Erreur interne (500)';
          listeErreursEncountered.push(`• Pièce consommée (ID: ${piece.articleId}) : ${msgErreur}`);
          return of(null); // On retourne null pour que le forkJoin continue mais l'erreur est enregistrée
        })
      ),
      
      // 2. Mise à jour du stock
      this.articleservice.getStockByArticleId(piece.articleId).pipe(
        switchMap((stock: any) => {
          if (stock && (stock.id || stock.stockId)) {
            return this.articleservice.diminuerQuantite(stock.id || stock.stockId, piece.quantite);
          }
          return of(null);
        }),
        catchError((err) => {
          console.warn(`⚠️ Erreur stock (Article ID: ${piece.articleId}):`, err);
          const msgErreur = err.error?.error || err.error?.message || 'Stock introuvable (404)';
          listeErreursEncountered.push(`• Problème Stock (ID: ${piece.articleId}) : ${msgErreur}`);
          return of(null);
        })
      )

    ]);

    observables.push(chaineStockEtConsommation);
  });

  // Déclenchement de l'exécution globale
  if (observables.length > 0) {
    forkJoin(observables).subscribe({
      next: () => {
        // 🎯 AJOUT DE LA VÉRIFICATION : S'il y a eu des erreurs, on bloque tout !
        if (listeErreursEncountered.length > 0) {
          this.actionInProgress = false; // Permet de recliquer sur le bouton
          
          // On affiche toutes les erreurs d'un coup à l'utilisateur
          alert(
            `❌ Le ticket n'a PAS été résolu car des erreurs sont survenues :\n\n` + 
            listeErreursEncountered.join('\n') + 
            `\n\nVeuillez corriger ces problèmes avant de valider à nouveau.`
          );
          // On s'arrête ici, la modale reste ouverte, le ticket n'est pas validé.
          return; 
        }

        // Si AUCUNE erreur n'est survenue, on finalise normalement
        this.showResolveModal = false;
        this.actionInProgress = false;
        alert('🎉 Toutes les pièces et stocks ont été mis à jour. Ticket résolu avec succès !');
        this.router.navigate(['/index']);
      },
      error: (err) => {
        console.error('❌ Erreur critique globale:', err);
        alert('❌ Une erreur bloquante empêche la finalisation de la demande.');
        this.actionInProgress = false;
      }
    });
  } else {
    // Si aucune pièce n'était à enregistrer, l'action est finie (cas optionnel selon votre besoin)
    this.showResolveModal = false;
    this.actionInProgress = false;
    this.router.navigate(['/index']);
  }
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
  if (!raison || raison.trim() === '') {
    alert('❌ Vous devez obligatoirement fournir une raison pour réouvrir le ticket.');
    return;
  }

  this.actionInProgress = true;
  this.errorMessage = '';
  this.successMessage = '';

  // 🎯 Appel de la nouvelle méthode dédiée à la réouverture
  this.ticketservice.reouvrirTicket(this.ticket.idTicket, this.currentUser.id).subscribe({
    next: (res: any) => {
      console.log('✅ Ticket réouvert avec succès !', res);
      
      this.ticket = res.ticket; // On récupère l'objet ticket mis à jour depuis le Map du backend
      this.actionInProgress = false;
      this.successMessage = `⚠️ Le ticket est revenu à l'état EN_COURS. Raison : "${raison}"`;
    },
    error: (err) => {
      console.error('❌ Erreur réouverture:', err);
      // On extrait le message d'erreur précis renvoyé par le backend
      this.errorMessage = err.error?.error || 'Erreur lors de la réouverture du ticket';
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
   * 🔍 Filtrer dynamiquement la liste globale des articles selon l'id de la catégorie sélectionnée
   */
// getArticlesParCategorie(categorieId?: number | string): any[] {
//   if (!categorieId || !this.listeStocksDisponibles) return [];
  
//   return this.listeStocksDisponibles.filter(stock => {
//     // Récupération de la catégorie de l'article lié à ce stock
//     const categorie = stock.articleDesignation || stock.articleReference;
    
//     // Cas 1 : La catégorie est imbriquée sous forme d'objet { id: X, ... }
//     if (typeof categorie === 'object' && categorie !== null && categorie) {
//       return Number(categorie) === Number(categorieId);
//     }
    
//     // Cas 2 : La catégorie est portée par un ID direct au premier niveau du DTO
//     if (stock.articleId) {
//       return Number(stock.articleId) === Number(categorieId);
//     }
    
//     // Cas 3 : La catégorie est une chaîne de caractères
//     if (typeof categorie === 'string' && categorie.trim()) {
//       return categorie.trim() === String(categorieId).trim();
//     }
    
//     return false;
//   });
// }

/**
 * 🔄 Réinitialise les sélections de la ligne si la catégorie change
 */
onCategorieChange(item: any): void {
  item.articleId = undefined; // 🌟 TRÈS IMPORTANT : vide le second menu lors d'un changement
  item.quantite = 1;
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

  showExportModal: boolean = false; // Ajouter cette ligne

  // ... autres méthodes ...

  /**
   * 🔓 OUVRIR LA MODAL D'EXPORT
   */
  ouvrirModalExport(): void {
    console.log('🔓 Ouverture modal export');
    this.showExportModal = true;
  }

  /**
   * 📄 EXPORTER EN PDF
   */
 

  /**
   * 🔄 Récupère l'intégralité de la table Stock depuis le Backend
   */
  chargerTousLesStocks(): void {
    this.stockService.getAllStocks().subscribe({
      next: (data: StockDTO[]) => {
        this.listeStocksDisponibles = data;
        console.log('📦 Stocks récupérés avec succès:', this.listeStocksDisponibles);
      },
      error: (err) => {
        console.error('❌ Erreur lors de la récupération des tables de stock:', err);
      }
    });
  }

  /**
   * 🎯 Filtre les éléments de la table stock par la catégorie sélectionnée
   */
getArticlesParCategorie(categorieSelectionnee: any): any[] {
  if (!categorieSelectionnee || !this.listeStocksDisponibles) {
    return [];
  }
  
  // On compare en forçant le format texte pour être 100% sûr du ciblage
  return this.listeStocksDisponibles.filter(stock => 
    String(stock.articleCategorie).trim() === String(categorieSelectionnee).trim()
  );
}

getCategoriesUniques(): any[] {
  if (!this.listeStocksDisponibles) return [];
  
  // Map pour isoler les chaînes, puis Set pour éliminer les doublons
  const categoriesBrutes = this.listeStocksDisponibles
    .map(stock => stock.articleCategorie)
    .filter(cat => cat !== undefined && cat !== null && cat.trim() !== '');
    
  return Array.from(new Set(categoriesBrutes));
}

 
 

}