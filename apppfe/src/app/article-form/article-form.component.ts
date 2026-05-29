import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../services/inventory.service';
import { Article, StatutArticle, StatutArticleLabels, TypeArticle, TypeArticleLabels, Categorie, ApiResponse } from '../Model/article';
import { QRCodeModule } from 'angularx-qrcode';
import { FournisseurService } from '../services/fournisseur.service';
import { Fournisseur } from '../Model/Entity';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, QRCodeModule],
  templateUrl: './article-form.component.html',
  styleUrl: './article-form.component.css'
})
export class ArticleFormComponent implements OnInit {
  @Output() creationReussie = new EventEmitter<void>();

  private inventoryService = inject(InventoryService);
  private fournisseurService = inject(FournisseurService);
  private fb = inject(FormBuilder);

  readonly categoriesInformatiques: Categorie[] = [
    { code: 'ECRANS', label: 'Écrans & Affichage', icone: '🖥️', prefixe: 'ECR' },
    { code: 'PC_PORTABLES', label: 'Ordinateurs Portables', icone: '💻', prefixe: 'LAP' },
    { code: 'PC_BUREAU', label: 'Unités Centrales & Serveurs', icone: '🖳', prefixe: 'DES' },
    { code: 'COMPOSANTS', label: 'Composants Internes (RAM, CPU)', icone: '🔌', prefixe: 'CMP' },
    { code: 'STOCKAGE', label: 'Stockage (HDD, SSD, USB)', icone: '💾', prefixe: 'STO' },
    { code: 'PERIPHERIQUES', label: 'Périphériques (Claviers, Souris)', icone: '🖱️', prefixe: 'PER' },
    { code: 'RESEAUX', label: 'Matériel Réseau (Routeurs, Switchs)', icone: '🌐', prefixe: 'NET' },
    { code: 'IMPRESSION', label: 'Imprimantes & Scanners', icone: '🖨️', prefixe: 'PRN' },
    { code: 'ACCESSOIRES', label: 'Connectique & Adaptateurs', icone: '🔌', prefixe: 'ACC' }
  ];

  readonly designations: Record<string, string[]> = {
    'ECRANS': [
      'Écran Bureau 24" FHD',
      'Écran Pro 27" 2K',
      'Vidéoprojecteur Salle de Réunion'
    ],
    'PC_PORTABLES': [
      'PC Portable Standard (i5/8Go/256Go)',
      'PC Portable Performance (i7/16Go/512Go)'
    ],
    'PC_BUREAU': [
      'Unité Centrale Bureau (i3/8Go/256Go)',
      'Serveur Rack d\'infrastructure'
    ],
    'COMPOSANTS': [
      'Mémoire RAM 8Go DDR4',
      'Mémoire RAM 16Go DDR4'
    ],
    'STOCKAGE': [
      'Disque Interne SSD 512Go NVMe',
      'Disque Interne HDD 1To SATA'
    ],
    'PERIPHERIQUES': [
      'Pack Clavier + Souris Filaire',
      'Souris Optique Sans Fil'
    ],
    'RESEAUX': [
      'Switch Réseau 8 Ports Gigabit',
      'Câble Ethernet RJ45 Cat6 (2m)'
    ],
    'IMPRESSION': [
      'Imprimante Laser Noir & Blanc',
      'Imprimante Jet d\'encre Couleur',
      'Scanner de Bureau'
    ],
    'ACCESSOIRES': [
      'Câble USB Type-C',
      'Adaptateur HDMI',
      'Housse de Protection'
    ]
  };

  form!: FormGroup;
  chargement = false;
  messageSucces = '';
  messageErreur = '';
  articleCree: Article | null = null;
  fournisseurs: Fournisseur[] = [];
  fournisseurSelectionne: string = ''; // On stockera ici le nom sélectionné

  readonly typeArticles = Object.values(TypeArticle);
  readonly typeArticleLabels = TypeArticleLabels;
  readonly statutArticles = Object.values(StatutArticle);
  readonly statutArticleLabels = StatutArticleLabels;

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormListeners();
    this.chargerFournisseurs();
  }

  chargerFournisseurs(): void {
    this.fournisseurService.getAllFournisseurs().subscribe({
      next: (data) => {
        this.fournisseurs = data;
        console.log('✅ Fournisseurs chargés avec succès', this.fournisseurs);
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des fournisseurs', err);
      }
    });
  }

  /**
   * Initialise le formulaire réactif
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      categorie: ['', Validators.required],
      reference: [{ value: '', disabled: true }, Validators.required],
      codeBarres: [{ value: '', disabled: true }],
      designation: ['', Validators.required],
      designationPersonnalisee: [''],
      description: [''],
      typeArticle: [TypeArticle.EQUIPEMENT, Validators.required],
      statut: [StatutArticle.ACTIF, Validators.required],
      quantiteEnStock: [0, [Validators.required, Validators.min(0)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      fournisseur: [''],
      dateAchat: [''],
      dateGarantie: [''],
      seuilMinimum: [5, [Validators.required, Validators.min(1)]],
      seuilCritique: [2, [Validators.required, Validators.min(0)]]
    });
  }

  /**
   * Configure les écouteurs de changements
   */
  private setupFormListeners(): void {
    this.form.get('categorie')?.valueChanges.subscribe(codeCategorie => {
      this.updateReferenceAndBarcode(codeCategorie);
    });

    this.form.get('designation')?.valueChanges.subscribe(designation => {
      this.updateDesignationValidation(designation);
    });
  }

  /**
   * Génère et met à jour la référence ET le code-barres
   */
  private updateReferenceAndBarcode(codeCategorie: string): void {
    const referenceControl = this.form.get('reference');
    const codeBarresControl = this.form.get('codeBarres');

    if (!codeCategorie) {
      referenceControl?.setValue('');
      codeBarresControl?.setValue('');
      return;
    }

    const categorie = this.categoriesInformatiques.find(c => c.code === codeCategorie);
    const prefixe = categorie?.prefixe || 'ART';
    const annee = new Date().getFullYear();
    const numero = Math.floor(1000 + Math.random() * 9000);
    const reference = `${prefixe}-${annee}-${numero}`;
    
    referenceControl?.setValue(reference);

    // Générer le code-barres automatiquement
    const codeBarres = this.generateBarcode(reference);
    codeBarresControl?.setValue(codeBarres);
  }

  /**
   * 🔹 GÉNÈRE UN NOUVEAU CODE-BARRES MANUELLEMENT
   */
  genererCodeBarres(): void {
    const reference = this.form.get('reference')?.value;
    
    if (!reference) {
      this.messageErreur = '⚠️ Veuillez d\'abord sélectionner une catégorie';
      setTimeout(() => this.messageErreur = '', 3000);
      return;
    }

    // Générer un nouveau code-barres
    const nouveauCodeBarres = this.generateBarcode(reference);
    this.form.get('codeBarres')?.setValue(nouveauCodeBarres);
    
    // Feedback utilisateur
    this.messageSucces = '✅ Nouveau code-barres généré !';
    setTimeout(() => this.messageSucces = '', 2000);
    
    console.log('🔄 Code-barres généré:', nouveauCodeBarres);
  }

  /**
   * 🔹 COPIE LE CODE-BARRES DANS LE PRESSE-PAPIERS
   */
  copierCodeBarres(): void {
    const codeBarres = this.form.get('codeBarres')?.value;
    
    if (!codeBarres) {
      this.messageErreur = '❌ Aucun code-barres à copier';
      return;
    }

    navigator.clipboard.writeText(codeBarres).then(() => {
      this.messageSucces = `📋 Code-barres copié : ${codeBarres}`;
      setTimeout(() => this.messageSucces = '', 2000);
      console.log('📋 Copié:', codeBarres);
    }).catch(err => {
      console.error('❌ Erreur copie:', err);
      this.messageErreur = 'Erreur lors de la copie du code-barres';
    });
  }

  /**
   * Génère un code-barres EAN-13 basé sur la référence
   */
  private generateBarcode(reference: string): string {
    const cleanRef = reference.replace(/-/g, '').toUpperCase();
    
    const baseCode = cleanRef
      .split('')
      .map(char => char.charCodeAt(0))
      .join('')
      .substring(0, 12);

    const checksum = this.calculateEAN13Checksum(baseCode.padEnd(12, '0'));
    const barcode = baseCode.padEnd(12, '0') + checksum;

    return barcode;
  }

  /**
   * Calcule le checksum EAN-13
   */
  private calculateEAN13Checksum(code: string): string {
    let sum = 0;
    for (let i = 0; i < code.length; i++) {
      const digit = parseInt(code[i], 10);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return checksum.toString();
  }

  /**
   * Met à jour la validation de la désignation personnalisée
   */
  private updateDesignationValidation(designation: string): void {
    const persoControl = this.form.get('designationPersonnalisee');
    if (designation === 'AUTRE') {
      persoControl?.setValidators([Validators.required, Validators.minLength(5)]);
    } else {
      persoControl?.clearValidators();
    }
    persoControl?.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Obtient les désignations disponibles
   */
  getDesignations(): string[] {
    const categorie = this.form.get('categorie')?.value;
    return categorie ? (this.designations[categorie] || []) : [];
  }

  /**
   * Soumet le formulaire
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageErreur = '⚠️ Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.chargement = true;
    this.clearMessages();

    const articleData = this.prepareArticleData();

    this.inventoryService.creerArticle(articleData).subscribe({
      next: (response: ApiResponse<Article>) => {
        this.handleSuccess(response);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  /**
   * Prépare les données pour le backend
   */
  private prepareArticleData(): Article {
    const formValue = this.form.getRawValue();
    
    const article: Article = {
      ...formValue,
      designation: formValue.designation === 'AUTRE' 
        ? formValue.designationPersonnalisee 
        : formValue.designation,
      codeBarres: formValue.codeBarres || ''
    };

    delete (article as any).designationPersonnalisee;

    console.log('📦 Article à envoyer:', article);
    return article;
  }

  /**
   * Traite la réussite
   */
  private handleSuccess(response: ApiResponse<Article>): void {
    this.chargement = false;
    this.messageSucces = '✅ Article créé avec succès !';
    this.articleCree = response.article;
    this.creationReussie.emit();
    this.resetForm();
    this.clearMessageAfterDelay(3000);
  }

  /**
   * Traite les erreurs
   */
  private handleError(error: any): void {
    this.chargement = false;
    console.error('❌ Erreur:', error);
    
    let errorMessage = 'Erreur lors de la création de l\'article';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors && Array.isArray(error.error.errors)) {
      errorMessage = error.error.errors[0]?.message || errorMessage;
    }
    
    this.messageErreur = errorMessage;
  }

  /**
   * Réinitialise le formulaire
   */
  resetForm(): void {
    this.form.reset({
      typeArticle: TypeArticle.EQUIPEMENT,
      statut: StatutArticle.ACTIF,
      quantiteEnStock: 0,
      prixUnitaire: 0,
      seuilMinimum: 5,
      seuilCritique: 2
    });
    this.clearMessages();
    this.articleCree = null;
  }

  private clearMessages(): void {
    this.messageSucces = '';
    this.messageErreur = '';
  }

  private clearMessageAfterDelay(delay: number): void {
    setTimeout(() => {
      this.messageSucces = '';
    }, delay);
  }

  /**
   * Imprime l'étiquette
   */
  imprimerEtiquette(): void {
    if (!this.articleCree?.reference) return;

    setTimeout(() => {
      const qrCodeDataUrl = this.extractQRCodeImage();
      if (qrCodeDataUrl) {
        this.openPrintWindow(qrCodeDataUrl);
      } else {
        alert('L\'image du QR code n\'est pas encore prête. Réessayez.');
      }
    }, 150);
  }

  private extractQRCodeImage(): string {
    const imgElement = document.querySelector('.qr-code-container qrcode img') as HTMLImageElement;
    if (imgElement?.src) return imgElement.src;

    const canvasElement = document.querySelector('.qr-code-container qrcode canvas') as HTMLCanvasElement;
    if (canvasElement) return canvasElement.toDataURL('image/png');

    return '';
  }

  private openPrintWindow(qrCodeDataUrl: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Impossible d\'ouvrir la fenêtre d\'impression');
      return;
    }

    const html = this.generatePrintHTML(qrCodeDataUrl);
    printWindow.document.write(html);
    printWindow.document.close();
  }

  private generatePrintHTML(qrCodeDataUrl: string): string {
    const reference = this.articleCree?.reference || 'N/A';
    const codeBarres = this.articleCree?.codeBarres || 'N/A';
    const dateActuelle = new Date().toLocaleDateString('fr-FR');

    return `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Impression Étiquette</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              background: #f5f5f5;
              padding: 20px;
            }
            .etiquette { 
              border: 2px dashed #333; 
              padding: 30px; 
              background: white;
              border-radius: 8px;
              text-align: center;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 350px;
            }
            img { width: 150px; height: 150px; margin-bottom: 15px; }
            h3 { margin: 10px 0; font-size: 18px; font-weight: bold; font-family: monospace; }
            .barcode-label { font-size: 11px; color: #666; margin-top: 5px; }
            .barcode-value { 
              font-size: 16px; 
              font-weight: bold; 
              font-family: 'Code128', monospace;
              letter-spacing: 2px;
              margin: 8px 0;
            }
            p { margin: 5px 0; font-size: 12px; color: #666; }
            .date { margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #999; }
          </style>
        </head>
        <body>
          <div class="etiquette">
            <img src="${qrCodeDataUrl}" alt="QR Code" />
            <h3>${reference}</h3>
            <div class="barcode-label">📊 Code-barres :</div>
            <div class="barcode-value">${codeBarres}</div>
            <p>Gestion Inventaire IT</p>
            <div class="date">${dateActuelle}</div>
          </div>
          <script>
            setTimeout(() => { window.print(); window.close(); }, 250);
          </script>
        </body>
      </html>
    `;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) return 'Ce champ est obligatoire';
    if (field.hasError('minlength')) {
      const required = field.getError('minlength').requiredLength;
      return `Minimum ${required} caractères requis`;
    }
    if (field.hasError('min')) return 'La valeur doit être positive';

    return '';
  }
  genererCodeQR() {
    const referenceDuProduit = this.form.get('reference')?.value;

    if (referenceDuProduit) {
      this.chargement = true;

      // Simulation d'une génération (ex: REF-123456 + chaîne aléatoire)
      const chaineAleatoire = Math.random().toString(36).substring(2, 9).toUpperCase();
      const valeurQR = `${referenceDuProduit}-${chaineAleatoire}`;

      // On injecte la valeur dans le formulaire pour que le QR code se mette à jour
      this.form.get('codeBarres')?.setValue(valeurQR);
      
      this.chargement = false;
    }
  }

  // copierCodeBarres() {
  //   const valeur = this.form.get('codeBarres')?.value;
  //   if (valeur) {
  //     navigator.clipboard.writeText(valeur);
  //     alert('Valeur copiée dans le presse-papier !');
  //   }
  // }
}