import { ActionAudit, departementService, GroupeTechnicien, RoleUtilisateur, StatutUtilisateur, TypeAlerte } from "./Enumeration";

// Models
export interface Groupe {
  id: number;
  nomGroupes: GroupeTechnicien;
  description: string;
  actif?: Boolean ;
  dateCreation?: Date;
}

export interface DemandeInscription {
  id: number;
  nom: string;
  prenom: string;
  email: string ;
  matricule: string;
  telephone: string;
  departement: departementService;
  motifDemande: string ;
  roleDemande: RoleUtilisateur;
}

export interface PreferenceNotification {
  id: number;
  typeAlerte: TypeAlerte;
  canalEmail: boolean;
  canalInApp: boolean;
  actif: boolean;
}
export interface JournalAudit {
  id: number;
  action: ActionAudit;
  description: string;
  adresseIp: string;
  dateAction: Date;
}

// Main Utilisateur Entity
export interface Utilisateur {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;
  motDePasse: string;
  telephone?: string;
  departement?: departementService;
  role?: RoleUtilisateur;
  motDepassetemporaire?: boolean;
  tentative_login?: number;
  date_Creation_Compte?: Date;
  dateExpmdpTemp?: Date;
  date_dernier_Connex?: Date;
  statut?: StatutUtilisateur;
  groupes?: Groupe[];
  preferences?: PreferenceNotification;
}

export interface LoginRequest {
   email: string;
  motDePasse: string;
  
}

export interface DemandeCreationDTO {
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  telephone: string;
  departement: string; // Ou vous pouvez créer un enum TypeScript correspondant
  motifDemande: string;
  roleDemande: string; // Ou enum
groupeId?: number | null;}

export interface DemandeReponseDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  departement: string;     // Ajouté pour correspondre à 'departementService'
  roleDemande: string;     // Ajouté pour correspondre à 'roleUtilisateur'
  statut: string;          // Corrigé : 'statut' au lieu de 'statutDemande'
  dateDemande: string;     // Les LocalDateTime arrivent sous forme de chaîne de caractères (ex: "2024-10-12T10:15:30")
  nomGroupe?: string;      // Ajouté avec un "?" (optionnel) car il peut être null si le demandeur n'a pas de groupe
}

// DTO pour l'approbation par l'Admin
export interface ApprobationDTO {
  roleAccorde: string;
  groupeId: number | null; // Peut être null si le rôle n'exige pas de groupe
}

// Class implementation (optional, for methods if needed)
// export class UtilisateurImpl implements Utilisateur {
//   id?: number;
//   nom: string;
//   prenom: string;
//   email: string;
//   matricule?: string;
//   motDePasse: string;
//   telephone?: string;
//   departement?: departementService;
//   role?: RoleUtilisateur;
//   motDepassetemporaire: boolean = false;
//   tentative_login: number = 0;
//   date_Creation_Compte: Date;
//   dateExpmdpTemp: Date;
//   date_dernier_Connex?: Date;
//   statut?: StatutUtilisateur;
//   groupes?: Groupe[];
//   preferences?: PreferenceNotification;

//   constructor(utilisateur: Utilisateur) {
//     this.id = utilisateur.id;
//     this.nom = utilisateur.nom;
//     this.prenom = utilisateur.prenom;
//     this.email = utilisateur.email;
//     this.matricule = utilisateur.matricule;
//     this.motDePasse = utilisateur.motDePasse;
//     this.telephone = utilisateur.telephone;
//     this.departement = utilisateur.departement;
//     this.role = utilisateur.role;
//     this.motDepassetemporaire = utilisateur.motDepassetemporaire ?? false;
//     this.tentative_login = utilisateur.tentative_login ?? 0;
//     this.date_Creation_Compte = utilisateur.date_Creation_Compte ?? new Date();
//     this.dateExpmdpTemp = utilisateur.dateExpmdpTemp ?? new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
//     this.date_dernier_Connex = utilisateur.date_dernier_Connex;
//     this.statut = utilisateur.statut;
//     this.groupes = utilisateur.groupes;
//     this.preferences = utilisateur.preferences;
//   }

//   getFullName(): string {
//     return `${this.prenom} ${this.nom}`;
//   }

//   isActive(): boolean {
//     return this.statut === StatutUtilisateur.Actif;
//   }
//}
