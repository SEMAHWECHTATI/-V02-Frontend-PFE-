# 💼 Exemple Complet d'Utilisation - Composant Demande de Matériel

## 📌 Scénario réaliste

Voici un exemple complet montrant comment le système fonctionne en pratique.

## 👤 Acteur 1: Jean (Demandeur)

### Étape 1: Créer une demande
**Jean veut demander 2 unités de RAM DDR4**

1. **URL**: `http://localhost:4200/demandes-materiel`
2. **Statut**: Onglet "Créer une Demande" ✓
3. **Remplissage du formulaire**:
   - Article: RAM DDR4 8GB (Stock: 10)
   - Quantité: 2
   - Type: PIECE_RECHANGE
   - Justification: "Upgrade serveur de base de données"
   - Référence Ticket: (optionnel - laisser vide)

4. **Cliquer**: "Envoyer la Demande"
5. **Résultat**: Message "✅ Demande créée avec succès!"

**Données envoyées au serveur**:
```json
POST http://localhost:8070/api/demandes-materiel?utilisateurId=1

{
  "articleId": 5,
  "quantiteDemandee": 2,
  "type": "PIECE_RECHANGE",
  "justification": "Upgrade serveur de base de données",
  "referenceTicket": null
}
```

**Réponse du serveur**:
```json
{
  "message": "✅ Demande créée avec succès",
  "demande": {
    "id": 101,
    "articleId": 5,
    "article": {
      "id": 5,
      "designation": "RAM DDR4 8GB"
    },
    "quantiteDemandee": 2,
    "type": "PIECE_RECHANGE",
    "justification": "Upgrade serveur de base de données",
    "statut": "EN_ATTENTE",
    "dateCreation": "2026-05-21T10:30:00",
    "demandeur": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean"
    }
  }
}
```

### Étape 2: Consulter ses demandes

1. **Cliquer**: Onglet "Mes Demandes"
2. **Affichage**: Carte avec la demande créée
   - Titre: "RAM DDR4 8GB"
   - Badge: 🟡 EN_ATTENTE
   - Quantité: 2
   - Type: PIECE_RECHANGE
   - Justification: "Upgrade serveur de base de données"
   - Date: 21/05/2026 10:30

**Code exécuté**:
```typescript
chargerMesDemandes(): void {
  this.demandeService.getMesDemandes(1).subscribe({
    next: (res) => {
      this.mesDemandes = res.demandes; // Array avec la demande
    }
  });
}
```

---

## 🔍 Acteur 2: Marie (Gestionnaire)

### Étape 3: Valider la demande

**Le jour suivant, Marie (Gestionnaire) reçoit une notification**

1. **URL**: `http://localhost:4200/demandes-materiel`
2. **Cliquer**: Onglet "En Attente"
3. **Affichage**: Liste des demandes en attente
   - Titre: RAM DDR4 8GB
   - Badge: 🟡 EN_ATTENTE
   - Demandeur: Dupont Jean
   - Quantité: 2
   - Justification: "Upgrade serveur de base de données"
   - **Boutons**: "Valider" 🟢 | "Rejeter" 🔴

4. **Cliquer**: Bouton "Valider"
5. **Modale s'ouvre**:
   - Titre: "✅ Valider la Demande"
   - Articles: RAM DDR4 8GB, Quantité: 2
   - Message: "Êtes-vous sûr de vouloir valider cette demande?"
   - Boutons: "Annuler" | "Valider"

6. **Cliquer**: "Valider" dans la modale
7. **Résultat**: Message "✅ Demande validée par gestionnaire!"

**API appelé**:
```
PUT http://localhost:8070/api/demandes-materiel/101/valider-gestionnaire?gestionnaireId=2

Corps: {} (vide)
```

**Réponse du serveur**:
```json
{
  "message": "✅ Demande validée par gestionnaire",
  "demande": {
    "id": 101,
    "statut": "VALIDEE_GESTIONNAIRE",
    "gestionnaireValidation": {
      "id": 2,
      "nom": "Moreau",
      "prenom": "Marie"
    },
    "dateValidationGestionnaire": "2026-05-21T14:15:00"
  }
}
```

**État du composant après**:
- La demande disparaît de "En Attente"
- Onglet "En Attente" se rafraîchit automatiquement
- La modale se ferme

---

## 👨‍💼 Acteur 3: Pierre (Administrateur)

### Étape 4: Valider et consommer le stock

**Le jour suivant, Pierre (Admin) approuve et consomme le stock**

1. **URL**: `http://localhost:4200/demandes-materiel`
2. **Cliquer**: Onglet "Validées Gestionnaire"
3. **Affichage**: 
   - Titre: RAM DDR4 8GB
   - Badge: 🔵 VALIDEE_GESTIONNAIRE
   - Demandeur: Dupont Jean
   - Quantité: 2
   - Validé par: Moreau Marie
   - **Boutons**: "Valider et Consommer Stock" 🟢 | "Rejeter" 🔴

4. **Cliquer**: "Valider et Consommer Stock"
5. **Modale s'ouvre**:
   - Titre: "✅ Valider la Demande"
   - Articles: RAM DDR4 8GB, Quantité: 2
   - Message: "Êtes-vous sûr de vouloir valider cette demande? (Le stock sera consommé)"
   - Boutons: "Annuler" | "Valider"

6. **Cliquer**: "Valider" dans la modale
7. **Résultat**: Message "✅ Demande validée et stock consommé!"

**API appelé**:
```
PUT http://localhost:8070/api/demandes-materiel/101/valider-admin?adminId=3

Corps: {} (vide)
```

**Réponse du serveur**:
```json
{
  "message": "✅ Demande validée et stock consommé",
  "demande": {
    "id": 101,
    "statut": "VALIDEE_ADMIN",
    "adminValidation": {
      "id": 3,
      "nom": "Bernard",
      "prenom": "Pierre"
    },
    "dateValidationAdmin": "2026-05-22T09:00:00"
  }
}
```

**Stock consommé automatiquement**:
```
Avant: RAM DDR4 8GB = 10 unités
Après: RAM DDR4 8GB = 8 unités  ✓ (-2)
```

**État du composant après**:
- La demande disparaît de "Validées Gestionnaire"
- Onglet "Validées Gestionnaire" se rafraîchit automatiquement
- La modale se ferme

### Étape 5: Jean voit la demande approuvée

1. **Jean se connecte à nouveau**
2. **Clique**: Onglet "Mes Demandes"
3. **Voir**: La demande avec badge 🟢 VALIDEE_ADMIN
4. **Message**: "Votre demande a été approuvée et le matériel sera livré!"

---

## ❌ Scénario Alternatif: Rejet

### Marie rejette la demande

**Supposons que Marie refuse de valider**

1. **Onglet**: "En Attente"
2. **Cliquer**: "Rejeter" sur la demande
3. **Modale s'ouvre**:
   - Titre: "❌ Rejeter la Demande"
   - Articles: RAM DDR4 8GB, Quantité: 2
   - **Champ**: "Motif du rejet" (textarea)
   - Placeholder: "Expliquez pourquoi vous rejetez cette demande..."

4. **Entrer**: "Panne du serveur principal, reporte ta demande dans 2 semaines"
5. **Cliquer**: "Rejeter"
6. **Résultat**: Message "✅ Demande rejetée!"

**API appelé**:
```
PUT http://localhost:8070/api/demandes-materiel/101/rejeter?
  validateurId=2&
  motifRejet=Panne du serveur principal, reporte ta demande dans 2 semaines
```

**État final**:
- Statut: 🔴 REJETEE
- Motif: "Panne du serveur principal, reporte ta demande dans 2 semaines"

**Jean peut voir**:
- Onglet "Mes Demandes"
- Badge: 🔴 REJETEE
- Message d'erreur: "Panne du serveur principal, reporte ta demande dans 2 semaines"
- Il peut créer une nouvelle demande

---

## 📊 Statistiques après les opérations

### Tableau d'état global

| Demande | ID | Statut | Demandeur | Article | Quantité | Stock Initial | Stock Final |
|---------|----|---------|-----------|---------|-|---|---|
| 1 | 101 | ✅ VALIDEE_ADMIN | Jean Dupont | RAM DDR4 8GB | 2 | 10 | 8 |
| 2 | 102 | ❌ REJETEE | Marc Dupré | SSD 1TB | 3 | 15 | 15 |
| 3 | 103 | 🟡 EN_ATTENTE | Sophie Martin | Clavier | 1 | 20 | 20 |

---

## 🔄 Flux complet en diagramme

```
┌─────────────────────────────────────────────────────────────────┐
│  DEMANDEUR (Jean)                                               │
│  - Crée une demande (EN_ATTENTE)                               │
│  - Voit la demande en "Mes Demandes"                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  GESTIONNAIRE (Marie)                                           │
│  - Voit la demande en "En Attente"                             │
│  - Valide → (VALIDEE_GESTIONNAIRE)                             │
│    ou Rejette → (REJETEE)                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    ┌────┴─────┐
                    │ Validée? │
                    └──┬──┬─────┘
                  Oui│ │Non (Rejette)
                     │ │
        ┌────────────┘ └──────────────┐
        │                             │
        ▼                             │
┌──────────────────────────────┐    │
│  ADMIN (Pierre)              │    │
│  - Voit en "Validées"        │    │
│  - Valide + Consomme Stock   │    │
│  → (VALIDEE_ADMIN)           │    │
└──────────────────────────────┘    │
        │                           │
        ▼                           ▼
    Stock -2              Demande Rejetée
    ✅ Livraison      ❌ Nouvelle demande possible
```

---

## 🎯 Résumé

| Rôle | Onglets visibles | Actions possibles |
|------|-----------------|-------------------|
| **DEMANDEUR** | Créer une Demande, Mes Demandes | Créer, Consulter |
| **GESTIONNAIRE** | Créer une Demande, Mes Demandes, En Attente | Valider, Rejeter |
| **ADMIN** | Tous les onglets | Valider, Rejeter, Consommer Stock |

---

**Dernier test**: Mai 2026 ✓
