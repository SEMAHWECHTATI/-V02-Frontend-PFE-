# 📋 Login Test Prompt - GITI-KPI
## Scénarios de test complets pour le module d'authentification

**Projet :** Gestion Intégrée des Interventions Techniques et Inventaire IT (GITI-KPI)  
**Module testé :** Authentification & Gestion des utilisateurs (Sprint 1)  
**Date :** 18/02/2026  
**Testeur :** Sameh Sameh  
**Outil :** Antigravity MCP

---

## 🎯 OBJECTIFS DE TEST

Valider que le système d'authentification fonctionne correctement :
- ✅ Création de compte sécurisée
- ✅ Validation par administrateur
- ✅ Authentification JWT + BCrypt
- ✅ Gestion des rôles (RBAC)
- ✅ Gestion des sessions
- ✅ Audit logs complets
- ✅ Récupération de mot de passe
- ✅ Sécurité et protection

---

## 📊 ENVIRONNEMENT DE TEST

**Frontend :** Angular 15+  
**Backend :** Spring Boot 3.0+  
**Database :** PostgreSQL 14+  
**URL Frontend :** http://localhost:4200/login

---

## 🧪 TEST 1 : INSCRIPTION UTILISATEUR (Happy Path)

### @test inscription-utilisateur-happy-path
**Description :** Un visiteur crée un compte et le système l'enregistre en attente de validation.

**Étapes :**

```gherkin
Scénario: Inscription réussie avec données valides
Soit un visiteur non authentifié
Et l'utilisateur accède à http://localhost:4200/demandeInscription
Alors le formulaire d'inscription s'affiche

Quand l'utilisateur remplit le formulaire avec :


| Champ | Valeur |
| --- | --- |
| Prénom | Jean |
| Nom | Dupont |
| Email | jaun@gmail.com |
| Rôle demandé * | Technicien |
| Groupe | IT_Reseaux_Informatique |
| Département | Production_NRJ |
| Téléphone | 123456789 |
| Matricule | 123456789 |
| Motif de la demande * | Demande d'accès |

Et l'utilisateur accepte les conditions
Et l'utilisateur clique sur "Soumettre la demande"
Alors une requête POST /api/demandes/envoyer est envoyée
Et le code HTTP est 201 Created
Et le message "Demande d'accès soumise avec succès" s'affiche
Et un email de confirmation est envoyé à jean.dupont@sagemcom.com
Et l'utilisateur est redirigé vers la page de confirmation
```
