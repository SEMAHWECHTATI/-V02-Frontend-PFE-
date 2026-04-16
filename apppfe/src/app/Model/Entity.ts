import { ActionAudit, departementService, GroupeTechnicien, Priorite, RoleUtilisateur, StatutUtilisateur, TypeAlerte, TypeTicket } from "./Enumeration";

// Models


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
  nomGroupe?: string; 
  motifDemande?: string;     // Ajouté avec un "?" (optionnel) car il peut être null si le demandeur n'a pas de groupe
}

// DTO pour l'approbation par l'Admin
export interface ApprobationDTO {
  roleAccorde: string;
  groupeId: number | null; // Peut être null si le rôle n'exige pas de groupe
}





/**
 * 🎫 MODÈLES DE TICKETS - Module 2 G2II
 */

export interface Categorie {
  idCategorie: number;
  nomCategorie: string;
  descriptionCategorie: string;
  type: string;
  actif: boolean;
  groupeResponsable?: Groupe;
  slas?: SLA[];
}

export interface SLA {
  idSLA: number;
  nomSLA: string;
  delaiResolutionHeure: number;
  delaiPriseEnchargeHeur: number;
  priorite: string;
}

export enum StatutTicket {
  Nouveau = 'Nouveau',
  En_Cours = 'En_Cours',
  En_Attente = 'En_Attente',
  Resolu = 'Resolu',
  Cloture = 'Cloture'
}





export interface Groupe {
  id: number;
  nomGroupes: string;
  description?: string;
}

export interface Ticket {
  idTicket?: number;
  reference?: string;
  titre: string;
  description: string;
  priorite: Priorite;
  statut?: StatutTicket;
  date?: string;
  datePriseEncharge?: string;
  dateResolution?: string;
  dateCloture?: string;
  delaiResolution?: number;
  slaRespecte?: boolean;
  noteResolution?: string;
  categorie?: Categorie;
  demandeur?: Utilisateur;
  technicienAssigne?: Utilisateur;
  groupeAssigne?: Groupe;
  notes?: NoteTicket[];
  historiqueTickets?: HistoriqueTicket[];
}

export interface TicketCreateDTO {
  titre: string;
  description: string;
  priorite: Priorite;
  demandeurId: number;
  groupeId: number;
}

export interface NoteTicket {
  idNoteTicket?: number;
  contenu: string;
  type: 'COMMENTAIRE' | 'TECHNIQUE' | 'RESOLUTION';
  date?: string;
  utilisateur?: Utilisateur;
}

export interface NoteTicketDTO {
  contenu: string;
  type: string;
  idTicket: number;
  idUtilisateur: number;
}

export interface HistoriqueTicket {
  idHistoriqueTicket: number;
  champModifie: string;
  ancienneValeur: string;
  nouvelleValeur: string;
  date: string;
  utilisateur: Utilisateur;
}

export { Priorite };
