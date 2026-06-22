import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../services/inventory.service';
import { Article, StatutArticle, StatutArticleLabels, TypeArticle, TypeArticleLabels, Categorie, ApiResponse } from '../Model/article';
import { QRCodeModule } from 'angularx-qrcode';
import { FournisseurService } from '../services/fournisseur.service';
import { Fournisseur } from '../Model/Entity';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, QRCodeModule],
  templateUrl: './article-form.component.html',
  styleUrl: './article-form.component.css'
})
export class ArticleFormComponent implements OnInit {
  @Output() creationReussie = new EventEmitter<void>();

  private inventoryService = inject(InventoryService);
  private fournisseurService = inject(FournisseurService);
  private fb = inject(FormBuilder);

 readonly categoriesInformatiques: Categorie[] = [
    // --- 💻 INFORMATIQUE & SERVEURS (Existants & Enrichis) ---
    { code: 'ECRANS_AFFICHAGE', label: 'Écrans & Affichage', icone: '🖥️', prefixe: 'ECR' },
    { code: 'PC_PORTABLES', label: 'Ordinateurs Portables', icone: '💻', prefixe: 'LAP' },
    { code: 'PC_BUREAU', label: 'Unités Centrales & Serveurs', icone: '🖳', prefixe: 'DES' },
    { code: 'COMPOSANTS', label: 'Composants Internes (RAM, CPU)', icone: '🔌', prefixe: 'CMP' },
    { code: 'STOCKAGE', label: 'Stockage (HDD, SSD, USB)', icone: '💾', prefixe: 'STO' },
    { code: 'PERIPHERIQUES', label: 'Périphériques (Claviers, Souris)', icone: '🖱️', prefixe: 'PER' },
    { code: 'RESEAUX', label: 'Matériel Réseau (Routeurs, Switchs)', icone: '🌐', prefixe: 'NET' },
    { code: 'IMPRESSION', label: 'Imprimantes & Scanners', icone: '🖨️', prefixe: 'PRN' },
    { code: 'ACCESSOIRES', label: 'Connectique & Adaptateurs', icone: '🔌', prefixe: 'ACC' },
    { code: 'LOGICIELS_LICENCES', label: 'Licences & Clés Logiciels', icone: '💿', prefixe: 'SWL' },

    // --- 🎛️ ÉLECTRONIQUE, AUTOMATISMES & COMPOSANTS INDUSTRIELS ---
    { code: 'CARTES_ELECTRONIQUES', label: 'Cartes PCBA & Circuits Imprimés', icone: '📟', prefixe: 'PCB' },
    { code: 'COMPOSANTS_PASSIFS', label: 'Composants Passifs (Résistances, Condensateurs)', icone: '🪡', prefixe: 'PAS' },
    { code: 'SEMICONDUCTEURS', label: 'Semi-conducteurs (Puces, Microchips)', icone: '🔲', prefixe: 'ICM' },
    { code: 'AUTOMATISMES_PLC', label: 'Automates Programmables (PLC) & Relais', icone: '🤖', prefixe: 'PLC' },
    { code: 'CAPTEURS_INDUSTRIELS', label: 'Capteurs (Optique, Laser, Pression)', icone: '👁️‍🗨️', prefixe: 'SEN' },
    { code: 'ALIMENTATIONS_BATTERIES', label: 'Blocs d\'Alimentation & Batteries', icone: '🔋', prefixe: 'PWR' },

    // --- 🔩 OUTILLAGE, MAINTENANCE & R&D (MRO) ---
    { code: 'OUTILLAGE_MAIN', label: 'Outillage à Main (Tournevis, Pinces)', icone: '🔧', prefixe: 'TLH' },
    { code: 'OUTILLAGE_ELECTRIQUE', label: 'Outillage Électrique & Électroportatif', icone: '🪛', prefixe: 'TLE' },
    { code: 'INSTRUMENTS_MESURE', label: 'Appareils de Mesure (Multimètres, Oscilloscopes)', icone: '📊', prefixe: 'MES' },
    { code: 'FOURNITURES_SOUDURE', label: 'Soudure (Étain, Fers, Stations)', icone: '🔥', prefixe: 'WLD' },
    { code: 'PRODUITS_CHIMIQUES', label: 'Chimie & Nettoyage (Flux, Solvants, Colles)', icone: '🧪', prefixe: 'CHM' },

    // --- ⚙️ PIÈCES MÉCANIQUES & INFRASTRUCTURE ---
    { code: 'MECANIQUE_VISSAGE', label: 'Visserie, Boulonnerie & Fixations', icone: '🔩', prefixe: 'FST' },
    { code: 'PNEUMATIQUE_HYDRAULIQUE', label: 'Pneumatique & Vérins', icone: '💨', prefixe: 'PNE' },
    { code: 'CABLAGGE_INDUSTRIEL', label: 'Câbles Bruts, Gaines & Goulottes', icone: '🧵', prefixe: 'CAB' },

    // --- 🛡️ SÉCURITÉ, LOGISTIQUE & EPI ---
    { code: 'EPI_SECURITE', label: 'Équipements de Protection (Gants, Blouses ESD)', icone: '🥽', prefixe: 'EPI' },
    { code: 'EMBALLAGE_LOGISTIQUE', label: 'Logistique (Cartons, Films, Palettes)', icone: '📦', prefixe: 'LOG' },
    { code: 'SECURITE_INCENDIE', label: 'Sécurité Incendie & Signalisation', icone: '🧯', prefixe: 'SEC' },

    // --- 🏢 BUREAUTIQUE & CONSOMMABLES DE BUREAU ---
    { code: 'FOURNITURES_BUREAU', label: 'Fournitures de Bureau (Stylos, Cahiers)', icone: '✏️', prefixe: 'OFF' },
    { code: 'PAPIER_ETIQUETTES', label: 'Papiers & Consommables d\'Étiquetage', icone: '📄', prefixe: 'PAP' },
    { code: 'MOBILIER', label: 'Mobilier de Bureau & Chaises Ergonomiques', icone: '🪑', prefixe: 'FUR' }
];

 readonly designations: Record<string, string[]> = {
  // --- 💻 INFORMATIQUE & SERVEURS ---
  'ECRANS_AFFICHAGE': [
    'Écran Bureau 24" FHD', 'Écran Pro 27" 2K', 'Vidéoprojecteur Salle de Réunion', 'Moniteur Tactile Industriel IP65',
    'Écran Graphique 32" 4K (R&D)', 'Moniteur de Contrôle Rackable 19"', 'Écran PC Portable de Rechange 15.6"', 'Dalle LCD Tactile pour Automate',
    'Écran Ultra-Large 34" Incurvé', 'Filtre de Confidentialité 24"', 'Support Double Écran Articulé', 'Câble Interne de Signal LVDS',
    'Afficheur LED Industriel Message Défilant', 'Moniteur Vidéosurveillance H24', 'Kit Rétroéclairage LED pour Pupitre', 'Contrôleur Vidéo VGA/HDMI/DP',
    'Téléviseur Affichage Dynamique Hall', 'Convertisseur Signal Vidéo Composite', 'Support Mural TV Charge Lourde', 'Verre de Protection Écran Tactile'
  ],
  'PC_PORTABLES': [
    'PC Portable Standard (i5/8Go/256Go)', 'PC Portable Performance (i7/16Go/512Go)', 'Station de Travail Mobile (R&D)', 'PC Portable Durci de Chantier IP67',
    'Ultrabook Ultra-léger Management', 'PC Portable Test Ligne Assemblage', 'Notebook Diagnostic Réseau', 'Chromebook Formation Interne',
    'Batterie de Rechange PC Portable Type A', 'Batterie de Rechange PC Portable Type B', 'Chargeur Secteur Universel PC 65W', 'Chargeur Secteur Universel PC 90W',
    'Station d\'accueil USB-C Triple Écran', 'Clavier de Remplacement PC Portable', 'Ventilateur Interne PC Portable', 'Module Carte Wi-Fi Interne Laptop',
    'Platine Carte Mère PC Portable SAV', 'Coque de Protection Renforcée Laptop', 'Dalle Écran Tactile Remplacement Laptop', 'Pavé Tactile Trackpad de Rechange'
  ],
  'PC_BUREAU': [
    'Unité Centrale Bureau (i3/8Go/256Go)', 'Serveur Rack d\'infrastructure', 'Mini-PC Client Léger', 'Station de Calcul CAO/DAO (32Go RAM)',
    'Serveur de Base de Données Principal', 'PC Industriel Sans Ventilateur (Fanless)', 'Unité Centrale Ligne Production', 'Serveur de Stockage NAS 4 Baies',
    'PC Bureau Format Tour Évolutif', 'Serveur Rack de Secours (Backup)', 'Mini PC Fixation Derrière Écran', 'Calculateur Embarqué Linux',
    'PC de Supervision Passerelle Réseau', 'Serveur de Licences Flottantes', 'Unité Centrale Bureautique (i5/16Go/512Go)', 'PC de Contrôle d\'Accès Sécurité',
    'Serveur Impression Dédié', 'PC Laboratoire Analyse Fréquentielle', 'Module PC Industriel Rail-DIN', 'Châssis Serveur Vide 2U'
  ],
  'COMPOSANTS': [
    'Mémoire RAM 8Go DDR4', 'Mémoire RAM 16Go DDR5', 'Processeur Intel Core i7 LGA1700', 'Ventilateur CPU (Cooler)',
    'Carte Graphique CAO 8Go GDDR6', 'Mémoire RAM Serveur 32Go ECC', 'Processeur AMD Ryzen 5', 'Pâte Thermique Haute Performance (Tube)',
    'Carte Mère Micro-ATX Standard', 'Carte Mère Serveur Bi-Processeur', 'Bloc Alimentation PC 550w Certifié', 'Bloc Alimentation PC 750w Modulaire',
    'Carte Contrôleur RAID PCIe', 'Carte d\'Extension USB 3.0 PCIe', 'Ventilateur Châssis Boîtier 120mm', 'Radiateur Dissipateur Passif M.2',
    'Carte Son Interne Haute Fidélité', 'Boîtier PC Moyen Tour Vide', 'Pile CMOS CR2032 Soudable', 'Câble Interne d\'Alimentation ATX'
  ],
  'STOCKAGE': [
    'Disque Interne SSD 512Go NVMe', 'Disque Interne HDD 1To SATA', 'Clé USB 3.2 (64 Go)', 'Disque Dur Externe Robuste 2To',
    'Disque Interne SSD 1To SATA 2.5"', 'Disque Serveur SAS 600Go 15k', 'Disque Interne SSD 2To NVMe Pro', 'Disque Dur Externe Bureau 4To',
    'Clé USB Sécurisée par Code Chiffré', 'Carte Mémoire MicroSD 32Go Classe 10', 'Carte Mémoire SDHC 64Go Pro', 'Boîtier Externe pour Disque 2.5"',
    'Lecteur de Cartes Mémoires USB-C', 'Disque Serveur SSD Entreprise 960Go', 'Baie d\'Extension Disques Amovibles', 'Clé USB 2.0 Basique (8 Go)',
    'Disque Externe SSD Portable 1To', 'Bande de Sauvegarde Magnétique LTO-8', 'Lecteur Enregistreur Graveur DVD Externe', 'Rack de Remplacement Disque à Chaud'
  ],
  'PERIPHERIQUES': [
    'Pack Clavier + Souris Filaire', 'Souris Optique Sans Fil', 'Douchette / Lecteur Code-Barres USB', 'Casque Audio avec Micro (Call Center)',
    'Clavier Mécanique Confort Saisie', 'Souris Ergonomique Verticale', 'Lecteur Code-Barres Sans Fil Bluetooth', 'Casque Antibruit Sans Fil Réunion',
    'Webcam Professionnelle Full HD 1080p', 'Tablette Graphique Dessin Technique', 'Tapis de Souris Ergonomique avec Repose-poignet', 'Enceintes Acoustiques Bureau USB',
    'Clavier Industriel Silicone Étanche IP68', 'Lecteur de Carte d\'Identité / Badge USB', 'Microphone de Table pour Conférence', 'Pavé Numérique Filaire Isolé',
    'Souris Trackball Station CAO', 'Lecteur Empreinte Digitale USB', 'Hub USB 4 Ports Alimenté', 'Commutateur KVM 2 PC / 1 Écran'
  ],
  'RESEAUX': [
    'Switch Réseau 8 Ports Gigabit', 'Switch Industriel Rail-DIN 16 Ports', 'Routeur Wi-Fi Pro', 'Câble Ethernet RJ45 Cat6 (2m)',
    'Switch Réseau 24 Ports PoE Manageable', 'Injecteur Alimentation PoE+ Monoport', 'Câble Ethernet RJ45 Cat6a (5m)', 'Câble Ethernet RJ45 Cat6 (0.5m)',
    'Routeur Modem 4G/5G de Secours', 'Point d\'Accès Wi-Fi Plafonnier', 'Module Émetteur/Récepteur SFP+ 10G', 'Panneau de Brassage Réseau 24 Ports',
    'Contrôleur Réseau Wi-Fi Physique', 'Répéteur de Signal Wi-Fi Pro', 'Cordon de Brassage Optique LC/LC (3m)', 'Carte Réseau PCIe 10 Gigabit',
    'Convertisseur de Média Fibre vers RJ45', 'Boîtier de Prise Murale RJ45 Double', 'Testeur de Câbles Réseau RJ45/RJ11', 'Pince à Sertir Connecteurs RJ45'
  ],
  'IMPRESSION': [
    'Imprimante Laser Noir & Blanc', 'Imprimante Jet d\'encre Couleur', 'Scanner de Bureau Pro', 'Imprimante d\'Étiquettes Thermique (Zebra)',
    'Traceur de Plans Grand Format A0', 'Imprimante Laser Couleur Réseau Multifonction', 'Cartouche Toner Noir Haute Capacité', 'Cartouche Toner Cyan Standard',
    'Cartouche Toner Magenta Standard', 'Cartouche Toner Jaune Standard', 'Tête d\'Impression Thermique Zebra 300dpi', 'Tambour d\'Imagerie pour Imprimante Laser',
    'Kit de Maintenance / Fusion Imprimante', 'Rouleau de Nettoyage Imprimante', 'Scanner Code-Barres Mobile Autonome', 'Imprimante de Badges PVC Recto-Verso',
    'Ruban Encreur Noir Imprimante Transfert', 'Bac de Chargement Papier Supplémentaire', 'Serveur d\'Impression Externe Réseau', 'Module Recto-Verso pour Imprimante'
  ],
  'ACCESSOIRES': [
    'Câble USB Type-C', 'Adaptateur HDMI vers VGA', 'Housse de Protection PC 15"', 'Multiprise Parasurtenseur 6 plots',
    'Câble Vidéo HDMI 4K (1.8m)', 'Câble Vidéo DisplayPort (2m)', 'Adaptateur USB-C vers RJ45 Gigabit', 'Rallonge Électrique 230V (5m)',
    'Câble Alimentation PC Shuko C13', 'Convertisseur USB vers Port Série RS232', 'Filtre Anti-poussière pour Boîtier PC', 'Kit de Nettoyage Écran (Spray + Microfibre)',
    'Attaches de Câbles Auto-agrippantes (Scratch)', 'Serre-câbles Spirale Organisateur (2m)', 'Adaptateur Secteur International', 'Câble Micro-USB Renforcé',
    'Lampe LED Clipsable pour Écran', 'Support Ventilant pour PC Portable', 'Boîte de Rangement pour Cartes SD/MicroSD', 'Antenne Wi-Fi Gain Élevé Connecteur SMA'
  ],
  'LOGICIELS_LICENCES': [
    'Licence Annuelle Windows 11 Pro', 'Abonnement Suite Bureautique (1 An)', 'Licence Logiciel CAO / R&D', 'Clé Antivirus Entreprise (Endpoint)',
    'Licence Système d\'Exploitation Serveur', 'Licence Base de Données SQL (Par Cœur)', 'Licence Logiciel de Virtualisation Pro', 'Abonnement Outil Gestion de Projet',
    'Licence Logiciel Traitement d\'Image Pro', 'Licence Éditeur de Texte Code Avancé', 'Clé Client d\'Accès Serveur (CAL)', 'Licence Logiciel Sauvegarde Automatique',
    'Licence Pare-Feu (Firewall) Annuelle', 'Abonnement Plateforme Collaboration Équipe', 'Licence Logiciel Analyse Statistique', 'Licence Utilitaire Compression Fichiers',
    'Licence Logiciel Création Diagrammes', 'Licence Client VPN Sécurisé', 'Licence Logiciel Inventaire Réseau', 'Licence Environnement Développement IDE'
  ],

  // --- 🎛️ ÉLECTRONIQUE & AUTOMATISMES ---
  'CARTES_ELECTRONIQUES': [
    'Carte Mère PCBA Prototype v1.2', 'Module Microcontrôleur STM32', 'Carte d\'acquisition de données (DAQ)', 'Module de communication LoRa/Sigfox',
    'Platine d\'Évaluation FPGA Xilinx', 'Carte de Contrôle Moteur Pas-à-Pas', 'Module Bluetooth Low Energy (BLE)', 'Platine Relais 8 Canaux pour Arduino',
    'Carte Interface de Communication RS485', 'Module Convertisseur Analogique-Numérique', 'Carte Shield Shield d\'Extension E/S', 'Module GPS Intégré Antenne',
    'Carte Mère Ordinateur Monocarte Linux', 'Module Afficheur Graphique OLED I2C', 'Carte Driver de Puissance MOSFET', 'Module Wi-Fi de Communication Embarqué',
    'Carte PCBA Alimentation Régulée', 'Circuit Imprimé Nu Double Face (Lot)', 'Module d\'Isolation Galvanique Signal', 'Carte Shield IoT Capteurs Multiples'
  ],
  'COMPOSANTS_PASSIFS': [
    'Kit Résistances CMS (Smd 0805)', 'Condensateur Électrolytique 100uF', 'Inductance de puissance 10uH', 'Potentiomètre de précision linéaire',
    'Résistance Traversante 1/4W 1k Ohm', 'Condensateur Céramique Multicouche 100nF', 'Réseau de Résistances Sil 9 broches', 'Condensateur Tantale 10uF SMD',
    'Quartz de Cadencement 16MHz HC-49', 'Inductance Haute Fréquence CMS', 'Potentiomètre Ajustable Miniature (Trimmer)', 'Supercondensateur 1F 5.5V Backup',
    'Varistance de Protection Surtension', 'Thermistance NTC 10k Ohm Mesure', 'Résistance de Puissance Shunt 0.1 Ohm', 'Filtre EMI Anti-parasite Ligne',
    'Condensateur Film Polypropylène X2', 'Résistance Ajustable Multitours SMD', 'Self de Choc Mode Commun Réseau', 'Ajusteur Capacitif Miniature Trimmer'
  ],
  'SEMICONDUCTEURS': [
    'Microprocesseur ARM Cortex-M4', 'Régulateur de tension 5V (TO-220)', 'Transistor MOSFET Canaux-N', 'Diode Schottky de redressement',
    'Amplificateur Opérationnel Faible Bruit', 'Circuit Intégré Temporisateur NE555', 'Optocoupleur Isolement Rapide', 'Diode Zener 3.3V Protection',
    'Pont de Diodes Redresseur 4A 600V', 'Transistor Bipolaire NPN Multi-usage', 'Régulateur de Tension Ajustable LM317', 'Circuit Intégré Registre de Décalage',
    'Diode Électroluminescente LED Verte SMD', 'Mémoire EEPROM Externe I2C 64K', 'Circuit Intégré Contrôleur PWM', 'Multiplexeur Analogique 8 Canaux',
    'Transistor Darlington Réseau Boîtier', 'Circuit Comparateur de Tension Rapide', 'Diode de Commutation Rapide 1N4148', 'Régulateur de Tension À Décrochage LDO'
  ],
  'AUTOMATISMES_PLC': [
    'Automate Programmable Siemens S7-1200', 'Module d\'extensions Entrées/Sorties PLC', 'Relais Électromécanique 24V DC', 'Contacteur de puissance triphasé',
    'Console de Programmation API Portable', 'Module de Communication Profinet PLC', 'Relais Statique Monophasé (SSR)', 'Variateur de Vitesse Moteur Asynchrone',
    'Bloc d\'Alimentation Automate 24V DC', 'Module Coupleur de Bus Terrain', 'Contacteur Auxiliaire de Commande', 'Relais de Sécurité Catégorie 4 (Arrêt)',
    'Disjoncteur Moteur Magnétothermique', 'Module de Comptage Rapide pour Codeur', 'HMI Terminal Tactile Opérateur 7"', 'Relais Temporisé Multifonction',
    'Module Sorties Analogiques 0-10V/4-20mA', 'Bornier de Raccordement Débrochable API', 'Interrupteur Sectionneur de Tête Coffret', 'Module Maître IO-Link Industriel'
  ],
  'CAPTEURS_INDUSTRIELS': [
    'Capteur de Proximité Inductif M12', 'Capteur Optique Barrière Réflexe', 'Sonde de Température PT100', 'Transmetteur de Pression 0-10 Bar',
    'Capteur de Proximité Capacitif Flacon', 'Codeur Incrémental Rotatif Axe Creux', 'Capteur de Distance Laser Précision', 'Cellule de Pesée Jauge de Contrainte',
    'Capteur de Débit Liquide Ultrasons', 'Sonde d\'Humidité Relative de Gaine', 'Capteur de Fin de Course Mécanique', 'Détecteur de Niveau Liquide Flotteur',
    'Capteur de Vibration Triaxial Machine', 'Détecteur de Présence Magnétique Vérin', 'Capteur de Gaz CO2 Ambiance', 'Sonde Thermocouple Type K Flexible',
    'Capteur de Couleur et Nuances RVB', 'Barrière Immatérielle de Sécurité Doigts', 'Capteur de Courant Effet Hall Ouvrant', 'Détecteur de Fuite Liquide Ponctuel'
  ],
  'ALIMENTATIONS_BATTERIES': [
    'Alimentation Découpée Rail-DIN 24V/5A', 'Batterie Plomb-Acide 12V 7Ah (Onduleur)', 'Pile Lithium CR2032 3V', 'Bloc d\'alimentation externe 12V USB-C',
    'Onduleur Line-Interactive 1500VA', 'Alimentation Laboratoire Régulée Multi-Sorties', 'Batterie Rechargeable Li-Ion 18650 3.7V', 'Coupleur de Batteries redondant',
    'Pile Alcaline AA LR06 (Lot de 24)', 'Pile Alcaline AAA LR03 (Lot de 24)', 'Convertisseur DC/DC Isole Étanche', 'Chargeur Intelligent de Batteries LiPo',
    'Alimentation Découpée Encastrable 5V 10A', 'Batterie Rechargeable NiMH AA 1.2V', 'Transformateur d\'Isolement Monophasé 230V', 'Alimentation Secourue avec Gestion Batterie',
    'Pile Lithium Industrielle 3.6V AA', 'Alimentation Multi-tension Format Open Frame', 'Régulateur de Charge Solaire PWM', 'Module de Protection Surcharge Sorties'
  ],

  // --- 🔧 OUTILLAGE & MAINTENANCE ---
  'OUTILLAGE_MAIN': [
    'Jeu de tournevis de précision (Isolés)', 'Pince coupante diagonale ESD', 'Clé à molette isolée 1000V', 'Pince à sertir pour cosses électroniques',
    'Jeu de clés mâles hexagonales (Allen)', 'Pince à dénuder automatique de précision', 'Pince plate demi-ronde bec long', 'Tournevis Dynamométrique de Précision',
    'Clé à cliquet réversible avec douilles', 'Cutter Professionnel Lame Sécable', 'Pince Étau Grande Capacité', 'Marteau de Mécanicien Rivoir',
    'Jeu de clés mixtes à cliquet (8 à 19mm)', 'Pince à dégrapher les clips plastiques', 'Extracteur de composants intégrés PLCC/IC', 'Miroir d\'inspection télescopique LED',
    'Pince à dénuder les câbles coaxiaux', 'Pince à riveter manuelle professionnelle', 'Pince à décoller les circuits imprimés', 'Jeu de chasses-goupilles (Kit atelier)'
  ],
  'OUTILLAGE_ELECTRIQUE': [
    'Perceuse-Visseuse Sans Fil 18V', 'Décapeur Thermique de précision', 'Mini-meuleuse de précision type Dremel', 'Tournevis Électrique sans fil Assemblage',
    'Fer à souder Autonome sur Batterie', 'Perforateur Burineur SDS-Plus Filaire', 'Scie Sauteuse Pendulaire Professionnelle', 'Meuleuse d\'Angle Électrique 125mm',
    'Visseuse à Chocs Sans Fil Couple Élevé', 'Graveur Électrique de Sécurité Métal', 'Polisseuse Rectifieuse Pneumatique d\'Atelier', 'Scie Sabre multi-matériaux sans fil',
    'Agrafeuse Cloueuse Électrique Coffret', 'Pompe à Dessouder Électrique Chauffante', 'Boulonneuse à Chocs Pneumatique d\'atelier', 'Clé Dynamométrique Électronique Pro',
    'Pistolet à Colle Thermofusible Pro', 'Nettoyeur Haute Pression d\'atelier', 'Compresseur d\'Air Portable Silencieux', 'Ponceuse Excentrique Aspiration Intégrée'
  ],
  'INSTRUMENTS_MESURE': [
    'Multimètre Numérique TRMS Calibré', 'Oscilloscope Numérique 2 Canaux 100MHz', 'Analyseur de Spectre Portable', 'Thermomètre Infrarouge Industriel',
    'Pince Ampèremétrique AC/DC Numérique', 'Calibrateur de Process Courant/Tension', 'Caméra Thermique Infrarouge Diagnostic', 'Pied à Coulisse Numérique Inox',
    'Micromètre d\'Extérieur de Précision', 'Analyseur de Réseau Électrique Triphasé', 'Luxmètre Numérique Mesure Éclairage', 'Sonomètre Enregistreur de Bruit',
    'Manomètre Numérique Étalonné Gaz', 'Générateur de Fonctions Arbitraires DDS', 'Fréquencemètre Numérique de Paillasse', 'Alimentation CC Programmable Mesure',
    'Testeur d\'Isolement et Continuité 1KV', 'Mégaohmmètre de Terre et Résistivité', 'Inductance-Capacitance Mètre (LCR)', 'Réfractomètre Numérique Industriel'
  ],
  'FOURNITURES_SOUDURE': [
    'Bobine Fil d\'Étain Sans Plomb (Sac305)', 'Panne pour Station de Soudage Cône', 'Tresse à dessouder en cuivre (2mm)', 'Flacon de Flux de soudure liquide',
    'Panne pour Station de Soudage Tournevis', 'Seringue de Crème à Jeter pour CMS', 'Station de Soudage Chauffage Induction', 'Station d\'Air Chaud Réparation CMS',
    'Nettoyeur de Pannes à Sec (Laine Laiton)', 'Support Support de Circuit Imprimé (Troisième Main)', 'Stylo Applicateur de Flux No-Clean', 'Buse à Air Chaud pour Composants QFP',
    'Pompe à Dessouder Manuelle Aluminium', 'Bobine de Fil de Rechargement Soudure', 'Pierre Ammoniacale Nettoyage Pannes', 'Kit de Sondes et Crochets de Retouche',
    'Ruban Adhésif Polyimide Kapton Haute Température', 'Pot de Pâte Décapante pour Soudure', 'Résistance de Chauffage pour Station', 'Réflecteur de Chaleur Buse Air Chaud'
  ],
  'PRODUITS_CHIMIQUES': [
    'Bombe Solvant Nettoyant Contacts Isopropanol', 'Aérosol Flux-Remover (Nettoyant flux)', 'Tube de Colle Époxy Bi-composant', 'Graisse Silicone Conductrice Thermique',
    'Bombe d\'Air Sec Dépoussiérant Haute Pression', 'Dégrippant Lubrifiant Universel Multi-usages', 'Aérosol Vernis de Protection PCBA (Tropicalisation)', 'Lingettes Nettoyantes Dégraissantes Isopropyliques',
    'Décapant pour Peintures et Résines Polyuréthane', 'Résine Polyuréthane de Coulée Coulage', 'Mastic Silicone d\'Étanchéité Neutre RTV', 'Graisse Mécanique Haute Température (Tube)',
    'Huile Fine de Lubrification Micro-Mécanique', 'Bombe de Traitement Anti-Statique Surface', 'Liquide de Refroidissement Diélectrique Labo', 'Colle Cyanoacrylate Instantanée Industrielle',
    'Flacon d\'Alcool Dénaturé Nettoyage 1L', 'Freinfilet Résistance Moyenne (Bleu)', 'Solvant Nettoyant Écrans Antistatique', 'Aérosol Détecteur de Fuites Gaz Mousse'
  ],

  // --- ⚙️ PIÈCES MÉCANIQUES & INFRASTRUCTURE ---
  'MECANIQUE_VISSAGE': [
    'Boîte de vis M3x10mm Tête Cylindrique', 'Écrous Hexagonaux M3 Inox', 'Rondelles plates M3 (Lot de 100)', 'Entretoises Nylon M3 Mâle-Femelle',
    'Boîte de vis M4x16mm Tête Fraisée', 'Écrous Autofreinés Nylstop M4', 'Rondelles Freins à Dents (Éventail) M4', 'Entretoises Métalliques Filetées M4',
    'Goujons d\'Ancrage Filetés Béton', 'Vis Autoperceuses pour Tôle (Lot)', 'Boulons Poêliers M6 complets (Vis+Écrou)', 'Goupilles Fendues en Acier (Kit)',
    'Circlips d\'Arrêt Extérieurs pour Axe', 'Rivet Pop Aluminium Standard (Boîte)', 'Inserts Filetés à Sertir M5', 'Pieds Vérins de Mise à Niveau',
    'Colliers de Serrage Métalliques Échappement', 'Tige Filetée 1 Mètre Acier M8', 'Manchons de Raccordement Filetés M8', 'Rondelles Multi-diamètres Cuivre SAV'
  ],
  'PNEUMATIQUE_HYDRAULIQUE': [
    'Vérin Pneumatique Double Effet', 'Électrovanne Pneumatique 5/2 24V DC', 'Tube Polyuréthane pour air comprimé (Ø6mm)', 'Raccord rapide pneumatique G1/4"',
    'Raccord Pneumatique Instantané T (Ø6mm)', 'Filtre Régulateur Lubrificateur d\'Air (FRL)', 'Silencieux d\'Échappement Pneumatique Laiton', 'Distributeur Pneumatique Commande Manuelle',
    'Vérin Pneumatique Compact Simple Effet', 'Tube Polyuréthane Étalonné (Ø8mm)', 'Pressostat Pneumatique Réglable Alerte', 'Raccord Rapide Sécurité Coupleur Mâle',
    'Clapet Anti-retour Pneumatique En Ligne', 'Manomètre de Pression d\'Air 0-12 Bar', 'Flexible Hydraulique Haute Pression Équipé', 'Vanne à Boisseau Sphérique Laiton',
    'Raccord Hydraulique Union Droit Mâle', 'Joint Torique d\'Étanchéité Nitrile (Kit)', 'Bloc de Distribution Pneumatique 4 Emplacements', 'Limiteur de Débit Pneumatique d\'Échappement'
  ],
  'CABLAGGE_INDUSTRIEL': [
    'Bobine Fil Électrique Souple 1.5mm² (Gris)', 'Gaine Thermorétractable Diamètre 4mm (1m)', 'Goulotte de câblage PVC perforée', 'Colliers de serrage en Nylon (Rilsan - Noir)',
    'Bobine Fil Électrique Souple 2.5mm² (Bleu)', 'Bobine Câble Blindé LiYCY 4x0.75mm²', 'Gaine Thermorétractable Diamètre 8mm', 'Embase Autoadhésive pour Collier Nylon',
    'Bornier de Connexion Automatique Rapide', 'Cosses Électriques Pré-isolées À Crimp (Kit)', 'Presse-Étoupe PVC PG11 avec Écrou', 'Gaine Tressée Extensible Protection Câbles',
    'Manchons de Finition pour Extrémités Fils', 'Câble de Terre Vert-Jaune Souple 6mm²', 'Borne de Passage pour Rail-DIN Standard', 'Bouchon Obturateur pour Presse-Étoupe',
    'Repères Clipsables pour Identification Fils', 'Gaine Isolante Annelée Fendue (5m)', 'Connecteur Industriel Multibroches Rectangulaire', 'Bloc de Jonction de Puissance Unipolaire'
  ],

  // --- 🛡️ SÉCURITÉ & LOGISTIQUE ---
  'EPI_SECURITE': [
    'Blouse Anti-statique (ESD) avec logo', 'Gants de manipulation anti-coupure', 'Lunettes de protection UV / Impacts', 'Bracelet de mise à la terre ESD',
    'Chaussures de Sécurité Coquées S3', 'Masque de Protection Respiratoire FFP2', 'Casque de Protection Chantier Standard', 'Bouchons d\'Oreilles Antibruit (Boîte)',
    'Gants de Protection Chimique Nitrile', 'Combinaison de Protection Jetable Type 5/6', 'Écran Facial de Protection Relevable', 'Gants de Protection Thermique Soudure',
    'Gilet de Haute Visibilité Fluorescent Réfléchissant', 'Tapis de Sol Isolant Électrique Haute Tension', 'Surchaussures de Protection Jetables (Lot)', 'Casquette Anti-heurt Renforcée',
    'Cordon de Connexion Bracelet ESD Terre', 'Lunettes Masques Étanche Anti-poussières', 'Gants Fins de Précision Inspection', 'Harnais de Sécurité Anti-chute Toiture'
  ],
  'EMBALLAGE_LOGISTIQUE': [
    'Carton de conditionnement Standard (A4)', 'Rouleau de Film Bulle de protection Antistatique', 'Ruban adhésif d\'emballage marron', 'Sachet de Gel de Silice (Anti-humidité)',
    'Caisse Carton Double Cannelure Charge Lourde', 'Rouleau Film Étirable Palette Transparent', 'Sachet Plastique Zip Transparent (Différents Formats)', 'Feuillard de Cerclage Polypropylène Bobine',
    'Plots d\'Angle Amortisseurs Mousse Polyéthylène', 'Boîte d\'Expédition Sécurisée pour PC Portable', 'Palette Plastique Légère Exportation', 'Profilé de Protection d\'Angles Carton',
    'Étiquette Adhésive Signalisation "Fragile"', 'Pochette Porte-documents Adhésive pour Colis', 'Particules de Calage Polystyrène (Sac)', 'Sachet d\'Expédition Matelassé Bulles',
    'Dévidoir Manuel de Ruban Adhésif (Pistolet)', 'Feuille de Papier Kraft d\'Emballage Rouleau', 'Bac Plastique de Stockage Interne Gerbable', 'Couvercle pour Bac Plastique de Stockage'
  ],
  'SECURITE_INCENDIE': [
    'Extincteur CO2 2kg (Risques Électriques)', 'Panneau de signalisation "Sortie de Secours"', 'Trousse de premiers secours d\'atelier', 'Couverture anti-feu industrielle',
    'Extincteur à Eau Pulvérisée + Additif 6L', 'Détecteur Autonome de Fumée Certifié', 'Déclencheur Manuel d\'Alarme Incendie Incendie', 'Sirène d\'Alarme Incendie Électronique 24V',
    'Rince-œil Autonome Solution Saline (Lavage)', 'Panneau Rigide "Interdit de Fumer"', 'Balise LED d\'Éclairage de Sécurité Évacuation', 'Armoire Pharmacie Murale Vide',
    'Recharge Consommables Trousse Secours', 'Brancard de Secours Pliable Alum', 'Panneau "Emplacement Extincteur" Photoluminescent', 'Mégaphone de Sécurité Évacuation Guide',
    'Cône de Chantier Ligne Bicolore (Lübeck)', 'Ruban de Balisage Rubalise Rouge/Blanc', 'Barrière de Délimitation Repliable Plastique', 'Support Mural pour Fixation Extincteur'
  ],

  // --- 🏢 BUREAUTIQUE & CONSOMMABLES ---
  'FOURNITURES_BUREAU': [
    'Lot de Stylos à bille (Bleu/Noir/Rouge)', 'Cahier de notes quadrillé format A4', 'Boîte de Trombones et pinces double-clip', 'Surligneurs de couleurs assorties',
    'Crayons à Papier HB Tête Gomme', 'Ciseaux de Bureau Lames Acier Inox', 'Agrafeuse de Bureau Standard N°10', 'Boîte d\'Agrafes N°10 Standard',
    'Perforateur de Documents Papier 2 Trous', 'Dévidoir de Ruban Adhésif Bureau', 'Blocs de Notes Autocollantes Repositionnables', 'Classeur à Levier Dos 80mm Carton',
    'Chemises Cartonnées à Élastique Trois Rabats', 'Sous-chemises en Papier Couleurs (Lot)', 'Pochettes Plastiques Transparentes Perforées', 'Règle Plate Graduée Aluminium 30cm',
    'Feutres Pour Tableau Blanc Effaçable À Sec', 'Brosse Effaceur pour Tableau Blanc', 'Calculatrice Scientifique de Bureau', 'Destructeur de Documents Papier Individuel'
  ],
  'PAPIER_ETIQUETTES': [
    'Rame de papier Blanc A4 80g (Imprimante)', 'Rouleau d\'étiquettes autocollantes 50x30mm', 'Bobine papier pour traceur de plans', 'Ruban encreur pour étiqueteuse portable',
    'Rame de papier Blanc A3 80g (Imprimante)', 'Rouleau d\'Étiquettes Thermiques Continu Zebra', 'Carton de Papier Listing Perforé Continu', 'Papier Photo Brillant Format A4 (Pack)',
    'Rouleau d\'Étiquettes d\'Inventaire Non Déchirables', 'Papier pour Organigrammes Grand Format', 'Enveloppes Kraft Grand Format Expédition A4', 'Enveloppes Commerciales Blanches Standard',
    'Cahier de Registre d\'Inventaire Relié', 'Étiquettes Rondes de Couleur Tri Couleur (Pack)', 'Papier Calque pour Dessin Technique A4', 'Rouleau Film Transparent Plastification',
    'Cartes Blanches Vierges Format Badge PVC', 'Étiquettes de Sécurité Destructibles (Garantie)', 'Papier Journal Kraft de Calage Remplissage', 'Pochette de Plastification à Chaud A4'
  ],
  'MOBILIER': [
    'Chaise de bureau ergonomique réglable', 'Repose-pieds inclinable', 'Bureau d\'atelier modulable (Anti-statique)', 'Armoire de rangement métallique fermable',
    'Table de Réunion Modulable 8 Personnes', 'Caisson de Bureau Mobile 3 Tiroirs', 'Bureau Individuel Droit Piétement Métal', 'Armoire Basse À Portes Coulissantes',
    'Fauteuil de Bureau Confort Tissu', 'Étagère Métallique Rayonnage Charge Légère', 'Siège Assis-Debout Réglable Atelier', 'Poste de Travail Ergonomique Réglable Hauteur',
    'Support CPU Mobile Sous Bureau', 'Porte-documents Mural Multi-cases Métal', 'Vestiaire Métallique Individuel Industrie', 'Tableau Blanc Magnétique Mural 120x90cm',
    'Vitrine d\'Affichage Sécurisée Verrouillable', 'Lampe de Bureau LED Articulée Dimmer', 'Goulotte Passe-câbles Horizontale Bureau', 'Portemanteau Sur Pied Métallique'
  ]
};

  form!: FormGroup;
  chargement = false;
  messageSucces = '';
  messageErreur = '';
  articleCree: Article | null = null;
  fournisseurs: Fournisseur[] = [];
  fournisseurSelectionne: string = ''; // On stockera ici le nom sélectionné

  readonly typeArticles = Object.values(TypeArticle);
  readonly typeArticleLabels = TypeArticleLabels;
  readonly statutArticles = Object.values(StatutArticle);
  readonly statutArticleLabels = StatutArticleLabels;

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormListeners();
    this.chargerFournisseurs();
  }

  chargerFournisseurs(): void {
    this.fournisseurService.getAllFournisseurs().subscribe({
      next: (data) => {
        this.fournisseurs = data;
        console.log('✅ Fournisseurs chargés avec succès', this.fournisseurs);
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des fournisseurs', err);
      }
    });
  }

  /**
   * Initialise le formulaire réactif
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      categorie: ['', Validators.required],
      reference: [{ value: '', disabled: true }, Validators.required],
      codeBarres: [{ value: '', disabled: true }],
      designation: ['', Validators.required],
      designationPersonnalisee: [''],
      description: [''],
      typeArticle: [TypeArticle.EQUIPEMENT, Validators.required],
      statut: [StatutArticle.ACTIF, Validators.required],
      quantiteEnStock: [0, [Validators.required, Validators.min(0)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      fournisseur: [''],
      dateAchat: [''],
      dateGarantie: [''],
      seuilMinimum: [5, [Validators.required, Validators.min(1)]],
      seuilCritique: [2, [Validators.required, Validators.min(0)]]
    });
  }

  /**
   * Configure les écouteurs de changements
   */
  private setupFormListeners(): void {
    this.form.get('categorie')?.valueChanges.subscribe(codeCategorie => {
      this.updateReferenceAndBarcode(codeCategorie);
    });

    this.form.get('designation')?.valueChanges.subscribe(designation => {
      this.updateDesignationValidation(designation);
    });
  }

  /**
   * Génère et met à jour la référence ET le code-barres
   */
  private updateReferenceAndBarcode(codeCategorie: string): void {
    const referenceControl = this.form.get('reference');
    const codeBarresControl = this.form.get('codeBarres');

    if (!codeCategorie) {
      referenceControl?.setValue('');
      codeBarresControl?.setValue('');
      return;
    }

    const categorie = this.categoriesInformatiques.find(c => c.code === codeCategorie);
    const prefixe = categorie?.prefixe || 'ART';
    const annee = new Date().getFullYear();
    const numero = Math.floor(1000 + Math.random() * 9000);
    const reference = `${prefixe}-${annee}-${numero}`;
    
    referenceControl?.setValue(reference);

    // Générer le code-barres automatiquement
    const codeBarres = this.generateBarcode(reference);
    codeBarresControl?.setValue(codeBarres);
  }

  /**
   * 🔹 GÉNÈRE UN NOUVEAU CODE-BARRES MANUELLEMENT
   */
  genererCodeBarres(): void {
    const reference = this.form.get('reference')?.value;
    
    if (!reference) {
      this.messageErreur = '⚠️ Veuillez d\'abord sélectionner une catégorie';
      setTimeout(() => this.messageErreur = '', 3000);
      return;
    }

    // Générer un nouveau code-barres
    const nouveauCodeBarres = this.generateBarcode(reference);
    this.form.get('codeBarres')?.setValue(nouveauCodeBarres);
    
    // Feedback utilisateur
    this.messageSucces = '✅ Nouveau code-barres généré !';
    setTimeout(() => this.messageSucces = '', 2000);
    
    console.log('🔄 Code-barres généré:', nouveauCodeBarres);
  }

  /**
   * 🔹 COPIE LE CODE-BARRES DANS LE PRESSE-PAPIERS
   */
  copierCodeBarres(): void {
    const codeBarres = this.form.get('codeBarres')?.value;
    
    if (!codeBarres) {
      this.messageErreur = '❌ Aucun code-barres à copier';
      return;
    }

    navigator.clipboard.writeText(codeBarres).then(() => {
      this.messageSucces = `📋 Code-barres copié : ${codeBarres}`;
      setTimeout(() => this.messageSucces = '', 2000);
      console.log('📋 Copié:', codeBarres);
    }).catch(err => {
      console.error('❌ Erreur copie:', err);
      this.messageErreur = 'Erreur lors de la copie du code-barres';
    });
  }

  /**
   * Génère un code-barres EAN-13 basé sur la référence
   */
  private generateBarcode(reference: string): string {
    const cleanRef = reference.replace(/-/g, '').toUpperCase();
    
    const baseCode = cleanRef
      .split('')
      .map(char => char.charCodeAt(0))
      .join('')
      .substring(0, 12);

    const checksum = this.calculateEAN13Checksum(baseCode.padEnd(12, '0'));
    const barcode = baseCode.padEnd(12, '0') + checksum;

    return barcode;
  }

  /**
   * Calcule le checksum EAN-13
   */
  private calculateEAN13Checksum(code: string): string {
    let sum = 0;
    for (let i = 0; i < code.length; i++) {
      const digit = parseInt(code[i], 10);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return checksum.toString();
  }

  /**
   * Met à jour la validation de la désignation personnalisée
   */
  private updateDesignationValidation(designation: string): void {
    const persoControl = this.form.get('designationPersonnalisee');
    if (designation === 'AUTRE') {
      persoControl?.setValidators([Validators.required, Validators.minLength(5)]);
    } else {
      persoControl?.clearValidators();
    }
    persoControl?.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Obtient les désignations disponibles
   */
  getDesignations(): string[] {
    const categorie = this.form.get('categorie')?.value;
    return categorie ? (this.designations[categorie] || []) : [];
  }

  /**
   * Soumet le formulaire
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageErreur = '⚠️ Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.chargement = true;
    this.clearMessages();

    const articleData = this.prepareArticleData();

    this.inventoryService.creerArticle(articleData).subscribe({
      next: (response: ApiResponse<Article>) => {
        this.handleSuccess(response);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  /**
   * Prépare les données pour le backend
   */
  private prepareArticleData(): Article {
    const formValue = this.form.getRawValue();
    
    const article: Article = {
      ...formValue,
      designation: formValue.designation === 'AUTRE' 
        ? formValue.designationPersonnalisee 
        : formValue.designation,
      codeBarres: formValue.codeBarres || ''
    };

    delete (article as any).designationPersonnalisee;

    console.log('📦 Article à envoyer:', article);
    return article;
  }

  /**
   * Traite la réussite
   */
  private handleSuccess(response: ApiResponse<Article>): void {
    this.chargement = false;
    this.messageSucces = '✅ Article créé avec succès !';
    this.articleCree = response.article;
    this.creationReussie.emit();
    this.resetForm();
    this.clearMessageAfterDelay(3000);
  }

  /**
   * Traite les erreurs
   */
  private handleError(error: any): void {
    this.chargement = false;
    console.error('❌ Erreur:', error);
    
    let errorMessage = 'Erreur lors de la création de l\'article';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors && Array.isArray(error.error.errors)) {
      errorMessage = error.error.errors[0]?.message || errorMessage;
    }
    
    this.messageErreur = errorMessage;
  }

  /**
   * Réinitialise le formulaire
   */
  resetForm(): void {
    this.form.reset({
      typeArticle: TypeArticle.EQUIPEMENT,
      statut: StatutArticle.ACTIF,
      quantiteEnStock: 0,
      prixUnitaire: 0,
      seuilMinimum: 5,
      seuilCritique: 2
    });
    this.clearMessages();
    this.articleCree = null;
  }

  private clearMessages(): void {
    this.messageSucces = '';
    this.messageErreur = '';
  }

  private clearMessageAfterDelay(delay: number): void {
    setTimeout(() => {
      this.messageSucces = '';
    }, delay);
  }

  /**
   * Imprime l'étiquette
   */
  imprimerEtiquette(): void {
    if (!this.articleCree?.reference) return;

    setTimeout(() => {
      const qrCodeDataUrl = this.extractQRCodeImage();
      if (qrCodeDataUrl) {
        this.openPrintWindow(qrCodeDataUrl);
      } else {
        alert('L\'image du QR code n\'est pas encore prête. Réessayez.');
      }
    }, 150);
  }

  private extractQRCodeImage(): string {
    const imgElement = document.querySelector('.qr-code-container qrcode img') as HTMLImageElement;
    if (imgElement?.src) return imgElement.src;

    const canvasElement = document.querySelector('.qr-code-container qrcode canvas') as HTMLCanvasElement;
    if (canvasElement) return canvasElement.toDataURL('image/png');

    return '';
  }

  private openPrintWindow(qrCodeDataUrl: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Impossible d\'ouvrir la fenêtre d\'impression');
      return;
    }

    const html = this.generatePrintHTML(qrCodeDataUrl);
    printWindow.document.write(html);
    printWindow.document.close();
  }

  private generatePrintHTML(qrCodeDataUrl: string): string {
    const reference = this.articleCree?.reference || 'N/A';
    const codeBarres = this.articleCree?.codeBarres || 'N/A';
    const dateActuelle = new Date().toLocaleDateString('fr-FR');

    return `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Impression Étiquette</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              background: #f5f5f5;
              padding: 20px;
            }
            .etiquette { 
              border: 2px dashed #333; 
              padding: 30px; 
              background: white;
              border-radius: 8px;
              text-align: center;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 350px;
            }
            img { width: 150px; height: 150px; margin-bottom: 15px; }
            h3 { margin: 10px 0; font-size: 18px; font-weight: bold; font-family: monospace; }
            .barcode-label { font-size: 11px; color: #666; margin-top: 5px; }
            .barcode-value { 
              font-size: 16px; 
              font-weight: bold; 
              font-family: 'Code128', monospace;
              letter-spacing: 2px;
              margin: 8px 0;
            }
            p { margin: 5px 0; font-size: 12px; color: #666; }
            .date { margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #999; }
          </style>
        </head>
        <body>
          <div class="etiquette">
            <img src="${qrCodeDataUrl}" alt="QR Code" />
            <h3>${reference}</h3>
            <div class="barcode-label">📊 Code-barres :</div>
            <div class="barcode-value">${codeBarres}</div>
            <p>Gestion Inventaire IT</p>
            <div class="date">${dateActuelle}</div>
          </div>
          <script>
            setTimeout(() => { window.print(); window.close(); }, 250);
          </script>
        </body>
      </html>
    `;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) return 'Ce champ est obligatoire';
    if (field.hasError('minlength')) {
      const required = field.getError('minlength').requiredLength;
      return `Minimum ${required} caractères requis`;
    }
    if (field.hasError('min')) return 'La valeur doit être positive';

    return '';
  }
  genererCodeQR() {
    const referenceDuProduit = this.form.get('reference')?.value;

    if (referenceDuProduit) {
      this.chargement = true;

      // Simulation d'une génération (ex: REF-123456 + chaîne aléatoire)
      const chaineAleatoire = Math.random().toString(36).substring(2, 9).toUpperCase();
      const valeurQR = `${referenceDuProduit}-${chaineAleatoire}`;

      // On injecte la valeur dans le formulaire pour que le QR code se mette à jour
      this.form.get('codeBarres')?.setValue(valeurQR);
      
      this.chargement = false;
    }
  }

  // copierCodeBarres() {
  //   const valeur = this.form.get('codeBarres')?.value;
  //   if (valeur) {
  //     navigator.clipboard.writeText(valeur);
  //     alert('Valeur copiée dans le presse-papier !');
  //   }
  // }
}