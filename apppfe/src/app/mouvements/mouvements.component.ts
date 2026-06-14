import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../services/inventory.service';
import { LocalisationService } from '../services/localisation.service';

@Component({
  selector: 'app-mouvements',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './mouvements.component.html',
  styleUrl: './mouvements.component.css'
})
export class MouvementsComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private localisationService = inject(LocalisationService);
  private fb = inject(FormBuilder);

  localisations: any[] = [];

  // Formulaires
  form!: FormGroup;
  periodeForm!: FormGroup;

  // Données
  stocks: any[] = [];
  historiqueMouvements: any[] = [];
  mouvementsPeriode: any[] = [];

  // États UI
  chargement: boolean = false;
  chargementHistorique: boolean = false;
  chargementPeriode: boolean = false;
  messageSucces: string = '';
  messageErreur: string = '';
  
  typeSelectionne: string = 'ENTREE';
  stockSelectionnePourHistorique: number | null = null;

  // Utilisateur simulé pour la traçabilité
  utilisateurConnecte = { id: 1, nom: 'Equipe Logistique' };

  referenceSelectionnee: string | null = null;
  stocksUniques: any[] = [];
  stockSelectionne: any = null;
  // Définissez l'onglet actif par défaut (ex: 'ENREGISTREMENT')
vueActive: 'ENREGISTREMENT' | 'SUIVI' | 'AUDIT' = 'ENREGISTREMENT';

/**
 * Permet de changer la section active à l'écran
 */
changerVue(nouvelleVue: 'ENREGISTREMENT' | 'SUIVI' | 'AUDIT'): void {
  this.vueActive = nouvelleVue;
}

  ngOnInit(): void {
    this.initFormulaireMouvement();
    this.initFormulairePeriode();
    this.chargerStocks();
    this.chargerLocalisations(); // 👈 Appel de la méthode au chargement
  }


  
  

  /**
 * 📍 Charger les localisations depuis le backend
 */
chargerLocalisations(): void {
  this.localisationService.getAllLocalisations().subscribe({
    next: (data) => {
      this.localisations = data;
      console.log('✅ Localisations chargées:', this.localisations.length);
    },
    error: (err) => console.error('❌ Erreur chargement localisations', err)
  });
}
  initFormulaireMouvement(): void {
    this.form = this.fb.group({
      stockId: ['', Validators.required],
      quantite: ['', [Validators.required, Validators.min(1)]],
      justification: ['', Validators.required],
      locSource: [''],
      locDest: [''],
      referenceTicket: ['']
    });
  }

  initFormulairePeriode(): void {
    // Par défaut : du début du mois à aujourd'hui
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    
    this.periodeForm = this.fb.group({
      debut: [debutMois.toISOString().slice(0, 16), Validators.required],
      fin: [maintenant.toISOString().slice(0, 16), Validators.required]
    });
  }

  changerType(type: string): void {
    this.typeSelectionne = type;
    const locSource = this.form.get('locSource');
    const locDest = this.form.get('locDest');

    if (type === 'TRANSFERT') {
      locSource?.setValidators([Validators.required]);
      locDest?.setValidators([Validators.required]);
    } else {
      locSource?.clearValidators();
      locDest?.clearValidators();
    }
    locSource?.updateValueAndValidity();
    locDest?.updateValueAndValidity();
  }


  chargerHistoriqueParReference(event: any): void {
  const ref = event.target.value;
  
  if (!ref) {
    this.historiqueMouvements = [];
    this.referenceSelectionnee = null;
    return;
  }

  this.referenceSelectionnee = ref;
  this.chargementHistorique = true;
  this.historiqueMouvements = []; 

  // Option A : Filtrer côté Front-end si vous avez déjà tous les mouvements
  // Option B (Recommandée) : Si votre service ou backend le permet :
  // Ici on va chercher tous les stocks qui partagent cette même référence
  const idsAssocies = this.stocks
    .filter(s => s.articleReference === ref)
    .map(s => s.id);

  // Appel au service pour charger et combiner les historiques de ces IDs
  // (Ou idéalement, adaptez votre backend pour accepter une référence textuelle directement)
  this.inventoryService.getHistoriqueMouvements(idsAssocies[0]).subscribe({
    next: (data) => {
      this.historiqueMouvements = data;
      this.chargementHistorique = false;
    },
    error: () => this.chargementHistorique = false
  });
}
  // Dans votre méthode chargerStocks() existante, filtrez les doublons pour l'affichage :
chargerStocks(): void {
  this.inventoryService.getAllStocks().subscribe({
    next: (data) => {
      this.stocks = data;
      
      // 💡 Filtrer pour n'avoir qu'un seul exemplaire par référence d'article
      const mapUnique = new Map();
      data.forEach((s: any) => {
        if (!mapUnique.has(s.articleReference)) {
          mapUnique.set(s.articleReference, s);
        }
      });
      this.stocksUniques = Array.from(mapUnique.values());
    },
    error: (err) => console.error('Erreur chargement stocks', err)
  });
}

  onSubmit(): void {
    if (this.form.invalid) {
      this.messageErreur = '⚠️ Veuillez remplir correctement tous les champs obligatoires (*)';
      return;
    }

    this.chargement = true;
    this.messageSucces = '';
    this.messageErreur = '';

    const valeurs = this.form.value;
    const basePayload = {
      stockId: +valeurs.stockId,
      quantite: +valeurs.quantite,
      justification: valeurs.justification,
      responsableId: this.utilisateurConnecte.id,
      referenceTicket: valeurs.referenceTicket || undefined
    };

    let RequeteObservable;

    if (this.typeSelectionne === 'ENTREE') {
      RequeteObservable = this.inventoryService.enregistrerEntree(basePayload);
    } else if (this.typeSelectionne === 'SORTIE') {
      RequeteObservable = this.inventoryService.enregistrerSortie(basePayload);
    } else {
      const transfertPayload = {
        ...basePayload,
        locSource: valeurs.locSource,
        locDest: valeurs.locDest
      };
      RequeteObservable = this.inventoryService.enregistrerTransfert(transfertPayload);
    }

    RequeteObservable.subscribe({
      next: (res) => {
        this.chargement = false;
        this.messageSucces = res.message || '✅ Opération enregistrée !';
        this.form.reset();
        this.chargerStocks();
        if (this.stockSelectionnePourHistorique === basePayload.stockId) {
          this.chargerHistorique(this.stockSelectionnePourHistorique);
        }
      },
      error: (err) => {
        this.chargement = false;
        this.messageErreur = err.error?.error || 'Une erreur est survenue côté serveur.';
      }
    });
  }

  chargerHistorique(stockIdEvent: any): void {
    const id = +stockIdEvent.target?.value || +stockIdEvent;
    if (!id) {
      this.historiqueMouvements = [];
      return;
    }
    this.stockSelectionnePourHistorique = id;
    this.chargementHistorique = true;
    this.inventoryService.getHistoriqueMouvements(id).subscribe({
      next: (data) => {
        this.historiqueMouvements = data;
        this.chargementHistorique = false;
      },
      error: () => this.chargementHistorique = false
    });
  }

  chargerMouvementsParPeriode(): void {
    if (this.periodeForm.invalid) return;
    this.chargementPeriode = true;
    const { debut, fin } = this.periodeForm.value;

    // Format attendu par l'ISO LocalDateTime de Spring Boot : yyyy-MM-ddTHH:mm:ss
    const debutFormate = new Date(debut).toISOString().split('.')[0];
    const finFormate = new Date(fin).toISOString().split('.')[0];

    this.inventoryService.getMouvementsPeriod(debutFormate, finFormate).subscribe({
      next: (data) => {
        this.mouvementsPeriode = data;
        this.chargementPeriode = false;
      },
      error: () => this.chargementPeriode = false
    });
  }

  lierTicket(mouvementId: number): void {
    const ref = prompt('Veuillez saisir la référence du ticket (ex: TICKET-2026-X) :');
    if (!ref) return;

    this.inventoryService.lierMouvementATicket(mouvementId, ref).subscribe({
      next: () => {
        alert('✅ Ticket relié avec succès !');
        if (this.stockSelectionnePourHistorique) this.chargerHistorique(this.stockSelectionnePourHistorique);
        this.chargerMouvementsParPeriode();
      },
      error: (err) => alert(err.error?.error || 'Erreur lors de la liaison.')
    });
  }

  isFieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}