import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GroupeService } from '../services/groupe.service';

interface GroupeType {
  code: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-create-groupe',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './create-groupe.component.html',
  styleUrl: './create-groupe.component.css'
})
export class CreateGroupeComponent implements OnInit {
  groupeForm!: FormGroup;
  isSubmitting = false;
  isDeleting = false;
  successMessage = '';
  errorMessage = '';
  isLoading = true;
  showDeleteModal = false;
  selectedGroupeToDelete: any = null;
  selectedIcon = '';

  iconsDisponibles: string[] = [
    'bi-wifi',
    'bi-tools',
    'bi-diagram-2',
    'bi-box-seam',
    'bi-person-check',
    'bi-shield-lock',
    'bi-hdd-network',
    'bi-pc-display',
    'bi-server',
    'bi-database',
    'bi-gear',
    'bi-cloud',
    'bi-laptop',
    'bi-cpu',
    'bi-router'
  ];

  newType: GroupeType = {
    code: '',
    label: '',
    icon: '',
    description: ''
  };

  typeGroupes: GroupeType[] = [
    {
      code: 'IT_Reseaux_Informatique',
      label: 'IT Réseaux Informatique',
      icon: 'bi-wifi',
      description: 'Gestion du réseau, wifi, routeurs, switches, connectivité'
    },
    {
      code: 'IT_Maintenance_Informatique',
      label: 'IT Maintenance Informatique',
      icon: 'bi-tools',
      description: 'Maintenance préventive, réparation, mise à jour du matériel'
    },
    {
      code: 'IT_Tracabilite_Produit',
      label: 'IT Traçabilité Produit',
      icon: 'bi-diagram-2',
      description: 'Gestion de la traçabilité, droits d\'accès, services IT'
    },
    {
      code: 'IT_Gestionnaire_Stock',
      label: 'IT Gestionnaire Stock',
      icon: 'bi-box-seam',
      description: 'Gestion du stock matériel, commandes, inventaire'
    },
    {
      code: 'IT_Management',
      label: 'IT Management',
      icon: 'bi-briefcase',
      description: 'Gestion de projets IT, management d\'équipe, stratégie'
    },
    {
      code: 'Demandeur',
      label: 'Demandeur',
      icon: 'bi-person-check',
      description: 'Utilisateurs qui demandent des services/matériel'
    },
    {
      code: 'IT_Devlopper',
      label: 'IT Devlopper',
      icon: 'bi-code-slash',
      description: 'Développement logiciel, programmation, conception d\'applications'
    },
    {
      code: 'IT_Devops',
      label: 'IT Devops',
      icon: 'bi-infinity',
      description: 'Déploiement, infrastructure cloud, intégration et livraison continues (CI/CD)'
    },
    {
      code: 'Autre',
      label: 'Autre',
      icon: 'bi-three-dots',
      description: 'Autres profils et fonctions non spécifiés'
    },
    {
      code: 'IT_Cybersecurite',
      label: 'IT Cybersécurité',
      icon: 'bi-shield-lock',
      description: 'Gestion de la sécurité, audits, pare-feu, gestion des incidents de sécurité'
    },
    {
      code: 'IT_Helpdesk',
      label: 'IT Support & Helpdesk',
      icon: 'bi-headset',
      description: 'Support de premier niveau, assistance aux utilisateurs au quotidien'
    },
    {
      code: 'IT_DBA',
      label: 'IT Administrateur de Bases de Données',
      icon: 'bi-database',
      description: 'Maintenance, optimisation et sécurisation des bases de données'
    },
    {
      code: 'IT_Cloud',
      label: 'IT Infrastructure & Cloud',
      icon: 'bi-cloud-arrow-up',
      description: 'Gestion des serveurs cloud (AWS, Azure), virtualisation et stockage'
    },
    {
      code: 'IT_Business_Analyst',
      label: 'IT Business Analyst',
      icon: 'bi-clipboard-data',
      description: 'Analyse des besoins métiers et traduction en spécifications techniques'
    },
    {
      code: 'IT_QA_Testing',
      label: 'IT Assurance Qualité & Tests',
      icon: 'bi-check2-square',
      description: 'Tests d’applications, automatisation des tests, validation des livraisons'
    },
    {
      code: 'IT_ERP_Systems',
      label: 'IT Intégration ERP & SAP',
      icon: 'bi-gear-wide-connected',
      description: 'Gestion, configuration et support autour des systèmes ERP d\'entreprise'
    },
    {
      code: 'IT_Telecom',
      label: 'IT Téléphonie & Télécom',
      icon: 'bi-telephone-outbound',
      description: 'Gestion de la téléphonie IP, des abonnements mobiles et des communications'
    },
    {
      code: 'IT_Data_BI',
      label: 'IT Data & Business Intelligence',
      icon: 'bi-bar-chart-line',
      description: 'Création de dashboards, analyse de données, rapports d’activité'
    },
    {
      code: 'IT_Formation',
      label: 'IT Formation & Support Utilisateurs',
      icon: 'bi-journal-bookmark',
      description: 'Conduite du changement, rédaction des documentations et formation des équipes'
    }
];
  currentUser: any = null;
  groupes: any[] = [];
  selectedTypeIndex = -1;

  constructor(
    private fb: FormBuilder,
    private groupeservice: GroupeService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    console.log('🚀 Initialisation du composant CreateGroupe');
    this.creerFormulaire();
    this.chargerUtilisateur();
    this.chargerGroupesExistants();
  }

  /**
   * ✅ Charge l'utilisateur depuis localStorage (browser uniquement)
   */
  private chargerUtilisateur(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('⚠️ SSR détecté - localStorage indisponible');
      this.isLoading = false;
      return;
    }

    try {
      const userStr = localStorage.getItem('utilisateurConnecte');

      if (userStr) {
        this.currentUser = JSON.parse(userStr);
        console.log('👤 Utilisateur:', this.currentUser.prenom, this.currentUser.nom);

        const roleNormalize = this.currentUser.role?.toLowerCase() || '';
        if (roleNormalize !== 'administrateur' && roleNormalize !== 'admin') {
          this.errorMessage = '❌ Vous n\'avez pas la permission de gérer les groupes (Admin requis)';
          console.warn('⚠️ Accès refusé - rôle:', this.currentUser.role);
        }
      } else {
        this.errorMessage = '⚠️ Veuillez vous connecter';
        console.warn('⚠️ Aucun utilisateur trouvé en localStorage');
      }
    } catch (error) {
      console.error('❌ Erreur parsing utilisateur:', error);
      this.errorMessage = '❌ Erreur chargement profil utilisateur';
    } finally {
      this.isLoading = false;
    }
  }

  private creerFormulaire(): void {
    this.groupeForm = this.fb.group({
      nomGroupes: ['', Validators.required],
      description: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(500)]
      ]
    });
  }

  private chargerGroupesExistants(): void {
    this.groupeservice.getGroupes().subscribe({
      next: (res: any[] | any) => {
        this.groupes = Array.isArray(res) ? res : res.data || [];
        console.log('📚 Groupes existants:', this.groupes.length);
      },
      error: (err) => {
        console.error('❌ Erreur chargement groupes:', err);
        this.errorMessage = 'Erreur lors du chargement des groupes';
        this.groupes = [];
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.groupeForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.groupeForm.get(fieldName);
    if (!control || !control.errors) return '';
    if (control.errors['required']) return 'Ce champ est requis';
    if (control.errors['minlength'])
      return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    if (control.errors['maxlength'])
      return `Maximum ${control.errors['maxlength'].requiredLength} caractères`;
    return 'Valeur invalide';
  }

  selecterType(index: number): void {
    if (index < 0 || index >= this.typeGroupes.length) {
      console.warn('⚠️ Index invalide:', index);
      return;
    }
    
    this.selectedTypeIndex = index;
    this.groupeForm.patchValue({
      nomGroupes: this.typeGroupes[index].code
    });
    this.groupeForm.get('description')?.reset();
    this.groupeForm.get('description')?.markAsUntouched();
    console.log('📌 Type sélectionné:', this.typeGroupes[index].label);
  }

  getTypeSelected(): GroupeType | null {
    return this.selectedTypeIndex >= 0 && this.selectedTypeIndex < this.typeGroupes.length
      ? this.typeGroupes[this.selectedTypeIndex]
      : null;
  }

  getTypeColor(index: number): string {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    return colors[index % colors.length];
  }

  isTypeAlreadyCreated(code: string): boolean {
    return this.groupes.some(g => g.nomGroupes === code);
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
    this.newType.icon = icon;
  }

  onSubmit(): void {
    if (!this.groupeForm.valid) {
      Object.keys(this.groupeForm.controls).forEach(key => {
        this.groupeForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    this.isSubmitting = true;
    const selectedType = this.getTypeSelected();

    if (!selectedType) {
      this.errorMessage = 'Sélectionnez un type';
      this.isSubmitting = false;
      return;
    }

    if (this.isTypeAlreadyCreated(selectedType.code)) {
      this.errorMessage = `Ce groupe (${selectedType.label}) existe déjà`;
      this.isSubmitting = false;
      return;
    }

    const groupeData = {
      nomGroupes: selectedType.code,
      description: this.groupeForm.value.description?.trim() || ''
    };

    console.log('📤 Création:', groupeData);

    this.groupeservice.creerGroupe(groupeData).subscribe({
      next: (res: any) => {
        this.successMessage = `✅ Groupe créé : ${selectedType.label}`;
        this.groupeForm.reset();
        this.selectedTypeIndex = -1;
        this.isSubmitting = false;
        this.chargerGroupesExistants();

        setTimeout(() => {
          this.successMessage = '';
        }, 4000);
      },
      error: (err) => {
        const errorMsg = err.error?.erreur || err.error?.message || 'Erreur serveur';
        this.errorMessage = `❌ Erreur: ${errorMsg}`;
        this.isSubmitting = false;
        console.error('Détail erreur:', err);
      }
    });
  }

  ajouterTypeGroupe(): void {
    const trimmedCode = this.newType.code?.trim() || '';
    const trimmedLabel = this.newType.label?.trim() || '';
    const trimmedDescription = this.newType.description?.trim() || '';

    if (!trimmedCode || !trimmedLabel || !this.newType.icon || !trimmedDescription) {
      this.errorMessage = 'Veuillez remplir tous les champs du nouveau type';
      return;
    }

    if (trimmedDescription.length < 10) {
      this.errorMessage = 'La description doit contenir au minimum 10 caractères';
      return;
    }

    const existe = this.typeGroupes.some(
      t => t.code.toUpperCase() === trimmedCode.toUpperCase()
    );

    if (existe) {
      this.errorMessage = 'Ce code existe déjà';
      return;
    }

    this.typeGroupes.push({
      code: trimmedCode,
      label: trimmedLabel,
      icon: this.newType.icon,
      description: trimmedDescription
    });

    this.successMessage = `✅ Nouveau type "${trimmedLabel}" ajouté`;

    this.newType = {
      code: '',
      label: '',
      icon: '',
      description: ''
    };
    this.selectedIcon = '';

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  openDeleteModal(groupe: any): void {
    if (!groupe || !groupe.id) {
      console.warn('⚠️ Groupe invalide:', groupe);
      return;
    }
    this.selectedGroupeToDelete = groupe;
    this.showDeleteModal = true;
    console.log('🗑️ Modal suppression:', groupe.nomGroupes);
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedGroupeToDelete = null;
  }

  supprimerGroupe(): void {
  // 1. On force le log AVANT toute vérification 👇
  console.log('👆 Bouton cliqué ! Objet reçu complet :', this.selectedGroupeToDelete);

  if (!this.selectedGroupeToDelete?.id) {
    // On affiche l'erreur dans la console pour voir les clés disponibles
    console.error('❌ L\'ID est indéfinie ! Regardez l\'objet imprimé au-dessus pour trouver le bon nom de clé.');
    
    // Astuce : utilisez une alerte native ou mettez temporairement un alert() pour le voir par-dessus la modale
    alert('Erreur : l\'objet ne contient pas de propriété "id" !');
    return;
  }

  this.isDeleting = true;
  const groupeId = this.selectedGroupeToDelete.id;
  const groupeName = this.selectedGroupeToDelete.nomGroupes;

  console.log('🗑️ Suppression groupe ID:', groupeId);

  this.groupeservice.supprimerGroupe(groupeId).subscribe({
    next: (res: any) => {
      this.successMessage = `✅ Groupe "${groupeName}" supprimé !`;
      this.isDeleting = false;
      this.closeDeleteModal();
      this.chargerGroupesExistants();

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    },
    error: (err) => {
      const errorMsg = err.error?.erreur || err.error?.message || 'Erreur suppression';
      this.errorMessage = `❌ ${errorMsg}`;
      this.isDeleting = false;
      console.error('Détail erreur suppression:', err);
    }
  });
}
  resetForm(): void {
    this.groupeForm.reset();
    this.selectedTypeIndex = -1;
    this.successMessage = '';
    this.errorMessage = '';
    
    Object.keys(this.groupeForm.controls).forEach(key => {
      this.groupeForm.get(key)?.markAsUntouched();
    });
  }
}