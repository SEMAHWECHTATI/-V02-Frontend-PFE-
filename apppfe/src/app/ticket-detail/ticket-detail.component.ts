import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketService } from '../services/ticket.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketservice: TicketService
  ) {}

  ngOnInit(): void {
    console.log('🎫 Initialisation TicketDetailComponent');
    this.chargerUtilisateur();
    
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
        this.ticket = res;
        console.log('✅ Ticket chargé:', res.reference);
        this.isLoading = false;
        this.chargerNotes(idTicket);
        this.chargerPiecesJointes(idTicket);
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

  /**
   * ✅ Vérifier si c'est un technicien ou admin
   */
  isTechnicienOrAdmin(): boolean {
    return ['technicien', 'administrateur', 'admin'].includes(this.userRole);
  }

  /**
   * ✅ Vérifier si c'est le demandeur ou admin
   */
  isDemandeurOrAdmin(): boolean {
    const isOwner = this.ticket?.demandeur?.id === this.currentUser?.id;
    return isOwner || ['administrateur', 'admin'].includes(this.userRole);
  }

  /**
   * ✅ Vérifier si c'est un admin
   */
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
    this.showResolveModal = true;
    this.errorMessage = '';
  }

  /**
   * ✅ RÉSOUDRE LE TICKET
   */
  resoudreTicket(): void {
    console.log('✅ Résolution du ticket');

    // Validations
    if (!this.noteResolution.trim()) {
      this.errorMessage = '⚠️ Veuillez ajouter une note de résolution';
      return;
    }

    if (this.tempsIntervention <= 0) {
      this.errorMessage = '⚠️ Veuillez saisir un temps d\'intervention valide';
      return;
    }

    this.actionInProgress = true;
    this.errorMessage = '';

    const noteFinale = `${this.noteResolution}\n\n⏱️ Temps d'intervention : ${this.tempsIntervention} minute(s).`;

    this.ticketservice.resoudreTicket(
      this.ticket.idTicket,
      this.currentUser.id,
      noteFinale,
      this.tempsIntervention
    ).subscribe({
      next: (res) => {
        console.log('✅ Ticket résolu');
        this.ticket = res;
        this.ticket.statut = 'Resolu';
        this.ticket.noteResolution = noteFinale;
        this.ticket.delaiResolution = this.tempsIntervention;
        this.ticket.dateResolution = new Date().toISOString().split('T')[0];

        this.showResolveModal = false;
        this.actionInProgress = false;
        this.successMessage = '✅ Ticket résolu ! Vous pouvez maintenant le clôturer.';
        localStorage.removeItem(`ticket_start_${this.ticket.idTicket}`);
      },
      error: (err) => {
        console.error('❌ Erreur résolution:', err);
        this.errorMessage = 'Erreur lors de la résolution du ticket';
        this.actionInProgress = false;
      }
    });
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

  /**
   * 📝 Envoyer une note/commentaire
   */
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

  /**
   * 🗑️ Supprimer une note
   */
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

  /**
   * 📎 Sélectionner un fichier
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('📎 Fichier sélectionné:', file.name);
      
      // Vérifier la taille
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = '❌ Le fichier dépasse 5MB';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';
    }
  }

  /**
   * 📤 Uploader un fichier
   */
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

    // ✅ PASSER L'ID UTILISATEUR
    this.ticketservice.uploadPieceJointe(
      this.ticket.idTicket,
      this.selectedFile,
      this.currentUser.id
    ).subscribe({
      next: (res) => {
        console.log('✅ Fichier uploadé');
        this.fileUploadInProgress = false;
        this.selectedFile = null;

        // Ajouter à la liste des pièces jointes
        if (!this.piecesJointes) {
          this.piecesJointes = [];
        }
        this.piecesJointes.push(res.data || res);
        this.successMessage = '✅ Fichier uploadé avec succès';

        // Réinitialiser l'input fichier
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

  /**
   * 🗑️ Supprimer une pièce jointe
   */
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

  /**
 * 📥 Télécharger une pièce jointe
 */
telechargerPieceJointe(piece: any): void {
  if (!piece?.idJointe) {
    this.errorMessage = '❌ ID de la pièce jointe invalide';
    console.error('❌ ID invalide:', piece);
    return;
  }

  console.log('📥 Téléchargement:', piece.nomJointe, '- ID:', piece.idJointe);
  this.fileUploadInProgress = true;

  // ✅ Appeler le service pour télécharger
  this.ticketservice.downloadPieceJointe(piece.idJointe).subscribe({
    next: (blob: Blob) => {
      console.log('✅ Fichier téléchargé, taille:', blob.size, 'bytes');
      
      // ✅ Créer une URL blob
      const url = window.URL.createObjectURL(blob);
      console.log('✅ URL blob créée:', url);
      
      // ✅ Créer un lien temporaire
      const link = document.createElement('a');
      link.href = url;
      link.download = piece.nomJointe || 'fichier-telechargé';
      link.style.display = 'none';
      
      // ✅ Ajouter au DOM et cliquer
      document.body.appendChild(link);
      console.log('✅ Lien créé, lancement du téléchargement...');
      link.click();
      
      // ✅ Nettoyer
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

  // ===== AUTRES FONCTIONS =====

  /**
   * 🗑️ Supprimer le ticket
   */
  supprimerTicket(): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce ticket ?')) {
      return;
    }

    console.log('🗑️ Suppression du ticket:', this.ticket.idTicket);
    this.actionInProgress = true;
    this.errorMessage = '';

    this.ticketservice.supprimerTicket(this.ticket.idTicket).subscribe({
      next: () => {
        console.log('✅ Ticket supprimé');
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

  /**
   * 🎨 Obtenir la classe CSS pour le statut
   */
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

  /**
   * 📊 Obtenir la couleur de priorité
   */
  getPrioriteColor(priorite: string): string {
    const colorMap: { [key: string]: string } = {
      'Basse': '#28a745',
      'Moyenne': '#ffc107',
      'Haute': '#fd7e14',
      'Critique': '#dc3545'
    };
    return colorMap[priorite] || '#6c757d';
  }

  /**
   * 🔄 Rafraîchir le ticket
   */
  rafraichirTicket(): void {
    console.log('🔄 Rafraîchissement du ticket');
    if (this.ticket?.idTicket) {
      this.chargerTicketDetails(this.ticket.idTicket);
    }
  }
}