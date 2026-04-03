import { Routes } from '@angular/router';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { AuthentificationComponent } from './authentification/authentification.component';
import { ChangerMdpComponent } from './changer-mdp/changer-mdp.component';
import { DemandeInscriptionComponent } from './demande-inscription/demande-inscription.component';
import { InterfaceAdministrateurComponent } from './interface-administrateur/interface-administrateur.component';
import { GererDemandeInscriComponent } from './gerer-demande-inscri/gerer-demande-inscri.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // page par défaut
  { path: 'login', component: AuthentificationComponent },
  { path: 'utilisateurs', component: UtilisateurComponent },
  { path: 'changer-mdp', component: ChangerMdpComponent },
  { path: 'demandeInscription', component: DemandeInscriptionComponent },
  { path: 'index', component: InterfaceAdministrateurComponent },
  { path: 'tab_Inscrip', component: GererDemandeInscriComponent },
  { path: '**', redirectTo: 'login' } // page 404 → redirection
];
