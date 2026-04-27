import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../services/inventory.service';
import { Mouvement, TypeMouvement, TypeMouvementLabels } from '../Model/mouvement';
import { Article } from '../Model/article';


@Component({
  selector: 'app-mouvements',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './mouvements.component.html',
  styleUrl: './mouvements.component.css'
})
export class MouvementsComponent implements OnInit {

  private inventoryService = inject(InventoryService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  typesMovement = Object.values(TypeMouvement);
  typeLabels = TypeMouvementLabels;
  
  articles: Article[] = [];
  mouvements: Mouvement[] = [];
  
  chargement: boolean = false;
  messageSucces: string = '';
  messageErreur: string = '';
  
  selectedMovementType: TypeMouvement = TypeMouvement.ENTREE;

  ngOnInit(): void {
    this.initializeForm();
    this.chargerArticles();
  }

  /**
   * 🔧 Initialiser formulaire
   */
  initializeForm(): void {
    this.form = this.fb.group({
      typeMovement: [TypeMouvement.ENTREE, Validators.required],
      articleId: ['', Validators.required],
      quantite: [0, [Validators.required, Validators.min(1)]],
      justification: ['', Validators.required],
      localisationSource: [''],
      localisationDestination: [''],
      referenceTicket: ['']
    });
  }

  /**
   * 📋 Charger articles
   */
  chargerArticles(): void {
    this.inventoryService.getAllArticles().subscribe({
      next: (res) => {
        this.articles = res.articles || [];
        console.log('✅ Articles chargés');
      },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }

  /**
   * ✅ Soumettre mouvement
   */
  onSubmit(): void {
    console.log('📝 Enregistrement mouvement');

    if (this.form.invalid) {
      this.messageErreur = '⚠️ Veuillez remplir tous les champs obligatoires';
      return;
    }

    const formData = this.form.value;
    const typeMovement: TypeMouvement = formData.typeMovement;
    const stockId = formData.articleId;
    const quantite = formData.quantite;
    const justification = formData.justification;

    this.chargement = true;
    this.messageSucces = '';
    this.messageErreur = '';

    switch (typeMovement) {
      case TypeMouvement.ENTREE:
        this.inventoryService.enregistrerEntree(stockId, quantite, justification).subscribe({
          next: (res) => this.onSuccess(res),
          error: (err) => this.onError(err)
        });
        break;

      case TypeMouvement.SORTIE:
        this.inventoryService.enregistrerSortie(stockId, quantite, justification).subscribe({
          next: (res) => this.onSuccess(res),
          error: (err) => this.onError(err)
        });
        break;

      case TypeMouvement.TRANSFERT:
        const locSource = formData.localisationSource;
        const locDest = formData.localisationDestination;
        this.inventoryService.enregistrerTransfert(stockId, quantite, locSource, locDest, justification).subscribe({
          next: (res) => this.onSuccess(res),
          error: (err) => this.onError(err)
        });
        break;

      default:
        this.messageErreur = '❌ Type de mouvement non supporté';
    }
  }

  /**
   * ✅ Succès
   */
  private onSuccess(res: any): void {
    this.chargement = false;
    this.messageSucces = '✅ Mouvement enregistré avec succès!';
    this.form.reset({ typeMovement: TypeMouvement.ENTREE });

    setTimeout(() => {
      this.messageSucces = '';
    }, 3000);
  }

  /**
   * ❌ Erreur
   */
  private onError(err: any): void {
    this.chargement = false;
    this.messageErreur = err.error?.error || 'Erreur lors de l\'enregistrement';
  }

  /**
   * 🎨 Obtenir couleur du type
   */
  getTypeColor(type: TypeMouvement): string {
    const colors: { [key in TypeMouvement]: string } = {
      [TypeMouvement.ENTREE]: '#10b981',
      [TypeMouvement.SORTIE]: '#ef4444',
      [TypeMouvement.TRANSFERT]: '#0891b2',
      [TypeMouvement.PRET]: '#f59e0b',
      [TypeMouvement.RETOUR]: '#8b5cf6',
      [TypeMouvement.CONSOMMATION]: '#ec4899',
      [TypeMouvement.AJUSTEMENT]: '#6b7280'
    };
    return colors[type];
  }

  /**
   * ❌ Vérifier champ invalide
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}