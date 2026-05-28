# 📋 Composant Demande de Matériel - Documentation

## 🎯 Vue d'ensemble

Ce composant Angular implémente un système complet de gestion des demandes de matériel avec validation multi-niveaux.

## ✨ Fonctionnalités principales

### 1. **Création de Demande** ➕
- Formulaire réactif avec validation
- Sélection d'article depuis l'inventaire
- Saisie de la quantité avec minimum 1
- Justification obligatoire
- Référence ticket optionnelle
- Messages de succès/erreur

### 2. **Mes Demandes** 📋
- Affichage de toutes les demandes créées par l'utilisateur
- Statut en temps réel
- Affichage du motif de rejet si rejetée
- Interface responsive avec grille de cartes

### 3. **Demandes en Attente** ⏳
- Visible pour les gestionnaires
- Liste des demandes attendant validation
- Boutons d'action: **Valider** ou **Rejeter**
- Informations du demandeur visibles

### 4. **Demandes Validées Gestionnaire** ✅
- Visible pour les administrateurs
- Liste des demandes validées par le gestionnaire
- Actions disponibles:
  - **Valider et Consommer Stock**: valide la demande et consomme le stock
  - **Rejeter**: rejette la demande avec motif

## 🏗️ Structure du composant

```
DemandematrielComponent
├── Properties
│   ├── form: FormGroup
│   ├── articles: Article[]
│   ├── mesDemandes: any[]
│   ├── demandesEnAttente: any[]
│   ├── demandesValideeGestionnaire: any[]
│   └── Modales (showValidationModal, showRejectionModal)
│
├── Methods
│   ├── ngOnInit(): void
│   ├── chargerArticles(): void
│   ├── chargerMesDemandes(): void
│   ├── chargerDemandesEnAttente(): void
│   ├── chargerDemandesValideeGestionnaire(): void
│   ├── onSubmit(): void
│   ├── validerParGestionnaire(): void
│   ├── validerParAdmin(): void
│   ├── rejeterDemande(): void
│   └── switchTab(tab: string): void
```

## 🔌 Intégration avec le backend

### Endpoints utilisés

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/demandes-materiel` | POST | Créer une demande |
| `/api/demandes-materiel/{id}/valider-gestionnaire` | PUT | Valider par gestionnaire |
| `/api/demandes-materiel/{id}/valider-admin` | PUT | Valider par admin + consommer stock |
| `/api/demandes-materiel/{id}/rejeter` | PUT | Rejeter une demande |
| `/api/demandes-materiel/en-attente` | GET | Récupérer demandes en attente |
| `/api/demandes-materiel/validee-gestionnaire` | GET | Récupérer demandes validées gestionnaire |
| `/api/demandes-materiel/mes-demandes` | GET | Récupérer les demandes de l'utilisateur |

## 🔐 Paramètres requis

**Utilisateur connecté** (stocké dans localStorage):
```typescript
{
  id: number,
  nom: string,
  prenom: string,
  role: string
}
```

Clé localStorage: `utilisateurConnecte`

## 📱 Interfaces

### Demande
```typescript
{
  id: number,
  articleId: number,
  article: {
    id: number,
    designation: string
  },
  quantiteDemandee: number,
  type: string,
  justification: string,
  referenceTicket?: string,
  statut: 'EN_ATTENTE' | 'VALIDEE_GESTIONNAIRE' | 'VALIDEE_ADMIN' | 'REJETEE',
  dateCreation: Date,
  demandeur?: {
    nom: string,
    prenom: string
  },
  motifRejet?: string,
  gestionnaireValidation?: {
    nom: string,
    prenom: string
  },
  dateValidationGestionnaire?: Date
}
```

## 🎨 Styles et UX

### Onglets
- **Créer une Demande**: Formulaire de création
- **Mes Demandes**: Historique personnel
- **En Attente**: Pour les gestionnaires
- **Validées Gestionnaire**: Pour les administrateurs

### Statuts et couleurs
- 🟡 **EN_ATTENTE**: Orange/Jaune
- 🔵 **VALIDEE_GESTIONNAIRE**: Bleu
- 🟢 **VALIDEE_ADMIN**: Vert
- 🔴 **REJETEE**: Rouge

## 🧪 Instructions de test

### Test 1: Créer une demande
1. Naviguer vers l'onglet "Créer une Demande"
2. Sélectionner un article
3. Entrer une quantité
4. Entrer une justification
5. Cliquer sur "Envoyer la Demande"
6. Vérifier le message de succès

### Test 2: Consulter mes demandes
1. Cliquer sur l'onglet "Mes Demandes"
2. Vérifier que la demande créée apparaît
3. Vérifier le statut

### Test 3: Valider par gestionnaire (avec rôle GESTIONNAIRE)
1. Cliquer sur "En Attente"
2. Voir les demandes en attente
3. Cliquer sur "Valider"
4. Confirmer dans la modale
5. Vérifier le message de succès

### Test 4: Rejeter une demande
1. Cliquer sur "En Attente" ou "Validées Gestionnaire"
2. Cliquer sur "Rejeter"
3. Entrer un motif de rejet
4. Cliquer sur "Rejeter"
5. Vérifier le message de succès

### Test 5: Valider et consommer stock (avec rôle ADMIN)
1. Cliquer sur "Validées Gestionnaire"
2. Voir les demandes validées par gestionnaire
3. Cliquer sur "Valider et Consommer Stock"
4. Confirmer dans la modale
5. Vérifier le message de succès
6. Vérifier que le stock a été consommé

## 🐛 Dépannage

### Erreur: "Erreur lors de la création"
- Vérifier que l'utilisateur est connecté
- Vérifier que `utilisateurConnecte` est dans localStorage
- Vérifier que le backend est disponible sur `http://localhost:8070`

### Onglet "En Attente" ou "Validées Gestionnaire" vide
- Vérifier le rôle de l'utilisateur (GESTIONNAIRE, ADMIN)
- Vérifier que des demandes existent avec ces statuts

### Les données ne se rafraîchissent pas
- Cliquer sur un autre onglet puis revenir
- Recharger la page

## 🔄 État de validation

Le processus de validation suit ce flux:

```
EN_ATTENTE 
    ↓
[Gestionnaire valide]
    ↓
VALIDEE_GESTIONNAIRE
    ↓
[Admin valide et consomme stock]
    ↓
VALIDEE_ADMIN ✓

Alternative à tout moment:
    ↓
[Rejet avec motif]
    ↓
REJETEE ❌
```

## 📦 Dépendances

- Angular Forms (ReactiveFormsModule, FormsModule)
- CommonModule
- DemandematrielServiceService
- InventoryService
- Bootstrap Icons (recommandé)

## 🚀 Points d'amélioration futurs

- [ ] Pagination des listes
- [ ] Filtrage avancé
- [ ] Export en PDF
- [ ] Notifications en temps réel
- [ ] Historique complet des actions
- [ ] Commentaires sur les demandes
- [ ] Autorisations granulaires par rôle

---

**Dernière mise à jour**: Mai 2026
