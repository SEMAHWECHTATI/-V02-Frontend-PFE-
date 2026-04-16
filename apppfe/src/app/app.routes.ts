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

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // page par défaut
  { path: 'login', component: AuthentificationComponent },
  { path: 'utilisateurs', component: UtilisateurComponent },
  { path: 'changer-mdp', component: ChangerMdpComponent },
  { path: 'demandeInscription', component: DemandeInscriptionComponent },
  { path: 'index', component: InterfaceAdministrateurComponent },
  { path: 'tab_Inscrip', component: GererDemandeInscriComponent },
  { path: 'mot-de-passe-oublie', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'creerTicket', component: CreateTicketPageComponent },
  { path: 'create-categorie', component: CreateCategorieComponent },
  {path: 'enumeration', component: EnumerationComponent},
  {path: 'liste-tickets', component:ListeTicketsComponent },
  {path: 'espace-demandeur', component: EspaceDemandeurComponent, canActivate: [adminGuardGuard]},
  { path: 'create-groupe', component: CreateGroupeComponent },
  { path: '**', redirectTo: 'login' } // page 404 → redirection
];
