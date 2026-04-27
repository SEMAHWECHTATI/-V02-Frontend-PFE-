import { Routes } from '@angular/router';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { AuthentificationComponent } from './authentification/authentification.component';
import { ChangerMdpComponent } from './changer-mdp/changer-mdp.component';
import { DemandeInscriptionComponent } from './demande-inscription/demande-inscription.component';
import { InterfaceAdministrateurComponent } from './interface-administrateur/interface-administrateur.component';
import { GererDemandeInscriComponent } from './gerer-demande-inscri/gerer-demande-inscri.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CreateCategorieComponent } from './create-categorie/create-categorie.component';
import { EnumerationComponent } from './enumeration/enumeration.component';
import { ListeTicketsComponent } from './liste-tickets/liste-tickets.component';
import { EspaceDemandeurComponent } from './espace-demandeur/espace-demandeur.component';
import { CreateGroupeComponent } from './create-groupe/create-groupe.component';
import { CreateTicketPageComponent } from './create-ticket-page/create-ticket-page.component';
import { adminGuardGuard } from './guards/admin-guard.guard';
import { InterfaceTechniceienComponent } from './interface-techniceien/interface-techniceien.component';
import { technicienGuard } from './guards/technicien.guard';
import { demandeurGuard } from './guards/demandeur.guard';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { roleGuard } from './guards/role-guard.guard';
import { authGuardGuard } from './guards/auth-guard.guard';
import { GestionnaireStockComponent } from './gestionnaire-stock/gestionnaire-stock.component';

export const routes: Routes = [
{ path: '', redirectTo: 'login', pathMatch: 'full' }, 
  
  // 🟢 ROUTES PUBLIQUES (Pas besoin d'être connecté/admin)
  { path: 'login', component: AuthentificationComponent ,},
  { path: 'demandeInscription', component: DemandeInscriptionComponent },
  { path: 'mot-de-passe-oublie', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'changer-mdp', component: ChangerMdpComponent },

  // 🔵 ROUTES UTILISATEUR NORMAL (Demandeur)
  // (Vous pourriez créer un 'userGuard' plus tard pour vérifier qu'ils sont juste connectés)
  { path: 'espace-demandeur', component: EspaceDemandeurComponent },
  { path: 'creerTicket', component: CreateTicketPageComponent},

  // 🔴 ROUTES ADMINISTRATEUR (Sécurisées par adminGuardGuard)
  { path: 'index', component: InterfaceAdministrateurComponent, canActivate: [authGuardGuard, roleGuard(['Administrateur'])]},
  { path: 'utilisateurs', component: UtilisateurComponent , canActivate: [authGuardGuard, roleGuard(['Administrateur'])] },
  { path: 'tab_Inscrip', component: GererDemandeInscriComponent , canActivate: [authGuardGuard, roleGuard(['Administrateur'])] },
  { path: 'create-categorie', component: CreateCategorieComponent , canActivate: [authGuardGuard, roleGuard(['Administrateur'])] },
  { path: 'create-groupe', component: CreateGroupeComponent , canActivate: [authGuardGuard, roleGuard(['Administrateur'])] },
  { path: 'enumeration', component: EnumerationComponent  , canActivate: [authGuardGuard, roleGuard(['Administrateur'])]},
  { path: 'liste-tickets', component: ListeTicketsComponent , canActivate: [authGuardGuard, roleGuard(['Administrateur'])] }, // À voir si les demandeurs voient aussi cette liste ou que les admins
  { path: 'technicien', component: InterfaceTechniceienComponent , canActivate: [authGuardGuard, roleGuard(['Administrateur','Technicien'])]},
  { path: 'ticket-detail/:id', component: TicketDetailComponent , canActivate: [authGuardGuard, roleGuard(['Administrateur'])] },
  { path: 'gestionnaire-stock', component: GestionnaireStockComponent, canActivate: [authGuardGuard, roleGuard(['Administrateur','Gestionnaire_Stock'])] },

  // page 404 → redirection
  { path: '**', redirectTo: 'login' }
];
