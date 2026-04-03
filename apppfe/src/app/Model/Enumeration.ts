// Enumerations
export enum TypeAlerte {
  INSCRIPTION = 'INSCRIPTION',
  Stock_faible = 'Stock_faible',
  Rupture_stock = 'Rupture_stock',
  validation_compte = 'validation_compte',
  nouvelle_assignation = 'nouvelle_assignation',
  refus_compte = 'refus_compte',
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',

}
export enum statutDemandeInscription {
  En_Attente = 'En_Attente',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
 }
export enum GroupeTechnicien {
  IT_Reseaux_Informatique = 'IT_Reseaux_Informatique',
  IT_Maintenance_Informatique = 'IT_Maintenance_Informatique',
  IT_Tracabilite_Produit = 'IT_Tracabilite_Produit',
  Demandeur = 'Demandeur'
 }
export enum departementService {
  Production_NRJ = 'Production_NRJ',
  Systeme_Information_IT = 'Systeme_Information_IT',
  Achats = 'Achats',
  Qualite_BLE = 'Qualite_BLE',
  Maintenance_BLE = 'Maintenance_BLE',
  RH = 'RH',

}
export enum ActionAudit {
  CONNEXION = 'CONNEXION',
  DECONNEXION = 'DECONNEXION',
  CHANGEMENT_MDP = 'CHANGEMENT_MDP',
  ECHEC_CONNEXION = 'ECHEC_CONNEXION',
  DEBLOCAGE = 'DEBLOCAGE',
  RESET_MDP = 'RESET_MDP',
  APPROBATION_DEMANDE = 'APPROBATION_DEMANDE',

}
export enum RoleUtilisateur {
  Administrateur= 'Administrateur',
  Technicien = 'Technicien',
  Gestionnaire_Stock = 'Gestionnaire_Stock',
  Demandeur = 'Demandeur'
}

export enum StatutUtilisateur {
  En_Attente = 'En_Attente',
  Bloque = 'Bloque',
  Actif = 'Actif',
}
