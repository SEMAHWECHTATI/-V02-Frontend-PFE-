import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../services/inventory.service';
import { Article, StatutArticle, StatutArticleLabels, TypeArticle, TypeArticleLabels } from '../Model/article';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, QRCodeModule],
  templateUrl: './article-form.component.html',
  styleUrl: './article-form.component.css'
})
export class ArticleFormComponent implements OnInit {

  @Output() creationReussie = new EventEmitter<void>();
  @Output() annulerAction = new EventEmitter<void>();

  private inventoryService = inject(InventoryService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  chargement: boolean = false;
  messageSucces: string = '';
  messageErreur: string = '';
  
  // 👇 NOUVEAU : On déclare la variable pour stocker l'article créé
  articleCree: Article | null = null; 
  
  typeArticles = Object.values(TypeArticle);
  typeArticleLabels = TypeArticleLabels;
  statutArticles = Object.values(StatutArticle);
  statutArticleLabels = StatutArticleLabels;

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      reference: ['', [Validators.required, Validators.minLength(3)]],
      designation: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      codeBarres: [''],
      typeArticle: ['EQUIPEMENT', Validators.required],
      statut: ['ACTIF', Validators.required],
      quantiteEnStock: [0, [Validators.required, Validators.min(0)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      fournisseur: [''],
      dateAchat: [''],
      dateGarantie: [''],
      seuilMinimum: [5, [Validators.required, Validators.min(1)]],
      seuilCritique: [2, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    console.log('📝 Soumission formulaire');

    if (this.form.invalid) {
      this.messageErreur = '⚠️ Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.chargement = true;
    this.messageSucces = '';
    this.messageErreur = '';
    // On cache l'ancien QR code s'il y en avait un
    this.articleCree = null; 

    const article: Article = this.form.value;

    this.inventoryService.creerArticle(article).subscribe({
      next: (res) => {
        console.log('✅ Article créé avec succès');
        this.chargement = false;
        this.messageSucces = '✅ Article créé avec succès!';
        
        // 👇 NOUVEAU : On sauvegarde l'article pour afficher le QR Code
        // (On utilise 'res' si votre backend renvoie l'article créé, sinon 'article' du formulaire)
        this.articleCree = res || article; 

        // On vide le formulaire pour le prochain article, 
        // mais le QR Code restera affiché jusqu'à ce qu'on clique sur "Réinitialiser"
        this.form.reset({ typeArticle: 'EQUIPEMENT', statut: 'ACTIF', quantiteEnStock: 0, prixUnitaire: 0, seuilMinimum: 5, seuilCritique: 2 });

        setTimeout(() => {
          this.messageSucces = '';
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Erreur création article:', err);
        this.chargement = false;
        this.messageErreur = err.error?.error || 'Erreur lors de la création';
      }
    });
  }

  resetForm(): void {
    this.form.reset({ typeArticle: 'EQUIPEMENT', statut: 'ACTIF', quantiteEnStock: 0, prixUnitaire: 0, seuilMinimum: 5, seuilCritique: 2 });
    this.messageSucces = '';
    this.messageErreur = '';
    
    // 👇 NOUVEAU : On cache le QR code quand on réinitialise le formulaire
    this.articleCree = null; 
  }

  // 👇 NOUVEAU : La méthode pour imprimer uniquement l'étiquette
 imprimerEtiquette(): void {
    if (!this.articleCree) return;

    // On utilise un petit délai (setTimeout) pour laisser le temps à Angular 
    // et à la bibliothèque qrcode de dessiner l'image dans le DOM.
    setTimeout(() => {
      // On cherche l'élément image ou canvas généré par qrcode
      const imgElement = document.querySelector('.qr-code-container qrcode img') as HTMLImageElement;
      const canvasElement = document.querySelector('.qr-code-container qrcode canvas') as HTMLCanvasElement;
      
      let qrCodeDataUrl = '';

      // On extrait les données selon le format trouvé
      if (imgElement) {
        qrCodeDataUrl = imgElement.src;
      } else if (canvasElement) {
        qrCodeDataUrl = canvasElement.toDataURL("image/png");
      }

      if (qrCodeDataUrl) {
        const printWindow = window.open('', '_blank');
        
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Impression Étiquette</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                  .etiquette { border: 2px dashed black; padding: 20px; display: inline-block; border-radius: 10px; }
                  img { width: 150px; height: 150px; margin-bottom: 10px; }
                  h3 { margin: 0; font-size: 22px; font-weight: bold; font-family: monospace; }
                  p { margin: 5px 0 0 0; font-size: 12px; color: #555; }
                </style>
              </head>
              <body>
                <div class="etiquette">
                  <img src="${qrCodeDataUrl}" alt="QR Code" />
                  <h3>${this.articleCree?.reference}</h3>
                  <p>Gestion Inventaire IT</p>
                </div>
                <script>
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 250);
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      } else {
        console.error("❌ Le sélecteur n'a rien trouvé. Le HTML contient-il bien la balise <qrcode [elementType]=\"'img'\"> ?");
        alert("L'image du QR code n'est pas encore prête. Réessayez dans une seconde.");
      }
    }, 150); // Le délai de 150ms fait toute la différence ici
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.hasError('required')) return 'Ce champ est obligatoire';
    if (field?.hasError('minlength')) return `Minimum ${field.getError('minlength').requiredLength} caractères`;
    if (field?.hasError('min')) return 'La valeur doit être supérieure à 0';
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}