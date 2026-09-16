# Système de Distribution International (Multi-Pays)

Ce document définit les spécifications et la feuille de route pour l'expansion et la gestion du système de distribution multi-pays de la plateforme.

---

## 1. Modèle Commercial & Distribution sur le Terrain

* **Franchises & Master-Franchises** :
  * Attribution de droits exclusifs de gestion de la plateforme par pays/région.
  * Console d'administration dédiée aux partenaires régionaux.
* **Gestion Multi-Établissements & Chaînes de Restaurants** :
  * Dashboard centralisé pour les propriétaires gérant plusieurs restaurants ou enseignes (ex: succursales à Alger, Oran, Sétif) avec basculement rapide et abonnements de groupe.
* **Réseau de Revendeurs & Affiliés** :
  * Système de commissions automatisé par pays pour les revendeurs locaux.
  * Suivi des acquisitions et des revenus générés par partenaire local.
* **Tarification Adaptée au Pouvoir d'Achat (PPP - Purchasing Power Parity)** :
  * Grille tarifaire dynamique par région/pays (ex: 49 €/mois en Europe, 3 500 DZD/mois en Algérie, 60 TND/mois en Tunisie) pour maximiser le taux de pénétration local.
* **Programme de Parrainage Inter-Restaurants (Referral System)** :
  * Système de recommandation virale entre propriétaires de restaurants (ex: 1 mois offert ou un code de recharge débloqué par parrainage).
  * **Règle de validation anti-fraude** : La récompense n'est attribuée au parrain qu'après l'atteinte d'un niveau d'usage réel par le filleul (ex: **minimum 20 scans de menu / QR codes clients validés** chez le restaurant invité).
* **Générateur Automatique de Kit PLV (Publicité sur Lieu de Vente / POS Materials)** :
  * Génération automatique en PDF prêt à imprimer de chevalets de table A4/A5, d'autocollants vitrine et de flyers de fidélité avec le logo et le QR code unique du restaurant.
* **Offre Marque Blanche (White-Label)** :
  * Possibilité de personnaliser le branding (nom de domaine, logo, couleurs) selon les exigences des marchés locaux ou grands comptes.

---

## 2. Multi-Devises & Paiements

* **Gestion Multi-Devises** :
  * Support et conversion des devises locales (EUR, TND, USD, SAR, AED, etc.).
  * Affichage automatique des prix selon la devise locale du consommateur et du marchand.
* **Passerelles de Paiement Locales** :
  * Intégration des processeurs de paiement dominants par pays (ex: Stripe, PayPal, Flouci, Mobile Money, e-Dinar, GIM-TEL).
* **Système de Vouchers Virtuels & Vente Sociale (Instagram / P2P)** :
  * Génération de codes de recharge virtuels à 12 ou 16 caractères pour les marchés sans API de paiement directes (ex: Algérie avec BaridiMob / CCP).
  * Vente indirecte via les pages Instagram/Facebook partenaire avec confirmation manuelle par reçus d'écran.
  * Console "Revendeur Digital" permettant aux pages Instagram partenaires d'acheter et de distribuer des lots de codes à leurs clients.
* **Conformité Fiscale & Taxative** :
  * Calcul dynamique des taxes (TVA / GST / Sales Tax) en fonction des réglementations fiscales spécifiques à chaque pays.

---

## 3. Localisation & Adaptation Culturelle

* **Landing Pages Dédiées par Pays (ex: `menufid.dz`, `menufid.tn`)** :
  * Détection automatique du pays/région ou routage par domaine local.
  * Affichage spécifique des tarifs adaptés en devise locale (ex: DZD, TND, EUR) et redirection vers le contact support/vente local (WhatsApp).
  * **Spécificité** : Centré uniquement sur la présentation de la solution, la clarté des tarifs et les modes de paiement locaux (ex exclusion délibérée des témoignages).
* **Formats Locaux** :
  * **Numéros de Téléphone** : Prise en charge des indicatifs internationaux (`+33`, `+216`, `+1`, `+212`, etc.) et validation automatique selon la norme E.164.
  * **Formats de Dates & Heures** : Adaptation selon les standards régionaux (`DD/MM/YYYY`, `MM/DD/YYYY`, fuseaux horaires dynamiques UTC/GMT).
* **Internationalisation (i18n) & Support RTL** :
  * Support multi-langue intégral (Français, Anglais, Arabe avec mise en page RTL/Droite-à-gauche, Allemand).

---

## 4. Architecture Technique & Données

* **Modélisation & Schéma de Base de Données (Multi-Tenant & Distribution)** :
  * **Configuration Pays (`country_config`)** : Stockage des grilles tarifaires dynamiques (PPP), devises et règles de paiement par région.
  * **Table des Codes Prépayés (`prepaid_vouchers`)** : Gestion du cycle de vie des codes (hash sécurisé du code, numéro de série `SN-xxx`, montant, statut *Généré/Distribué/Actif/Consommé*, ID revendeur et ID consommateur final).
  * **Table de Parrainage (`referrals`)** : Suivi des parrains/filleuls et compteur dynamique de validation (seuil de 20 scans réels du filleul).
  * **Table Revendeurs & Partenaires (`distributors`)** : Profils des revendeurs Instagram et agents terrain avec solde de crédits et commissions.
  * **Sécurité & Isolation RLS (Row Level Security)** : Stratégies de sécurité Supabase/Postgres basées sur `country_code` et `merchant_id` pour une étanchéité totale des données.
* **Partitionnement des Données (Multi-Region Tenant Architecture)** :
  * Isolation et souveraineté des données pour respecter les normes locales de confidentialité (ex: RGPD en Europe).
* **Routage Dynamique par Pays** :
  * Routage par sous-domaine (`fr.menufid.com`, `tn.menufid.com`) ou détection basée sur l'IP/Géolocalisation.
* **Performance & Edge Caching** :
  * Réseau CDN mondial et répliques de bases de données en lecture pour garantir des temps de réponse rapides à l'échelle globale.

---

## 🔮 Notes pour les Futures Mises à Jour (Future Updates Roadmap)

- [ ] **Phase 1 : Socle i18n, Formats & Landing Pages Locales**
  - Validation et formatage dynamique des numéros de téléphone avec indicatif pays.
  - Sélecteur de devise locale et adaptation des formats de dates/heures dans le tableau de bord.
  - Configuration de la grille de tarifs adaptés au pouvoir d'achat (PPP par pays).
  - Landing pages dédiées par pays (ex: `menufid.dz`, `menufid.tn`) axées sur la tarification et le contact local (sans témoignages).
- [ ] **Phase 2 : Outillage Marketing & Kit PLV Automatique**
  - Moteur de génération PDF pour les supports de table, autocollants vitrine et flyers QR code.
  - Support du mode Multi-Établissements / Chaînes de restaurants dans le compte marchand.
- [ ] **Phase 3 : Module Vouchers Virtuels & Vente Sociale Instagram (Algérie / P2P)**
  - Générateur de lots de codes prépayés virtuels avec suivi des états (*Généré, Actif, Consommé, Annulé*).
  - Interface d'activation client ("Recharger mon compte / Activer un code").
  - Console de gestion des partenaires Instagram (attribution de lots de codes virtuels et suivi des ventes).
- [ ] **Phase 4 : Programme Parrainage Inter-Restaurants**
  - Liens uniques de parrainage entre restaurateurs.
  - Compteur et règle de validation automatique à 20 scans réels du filleul avant déblocage de la récompense parrain.
- [ ] **Phase 5 : Multi-Devises & Intégration Paiements Régionaux**
  - Ajout des passerelles de paiement locales complémentaires selon les pays cibles.
  - Module de gestion des taux de change et facturation multi-devises.
- [ ] **Phase 6 : Module Partenaires & Revendeurs sur le Terrain**
  - Espace dédié pour les revendeurs locaux avec génération de liens/codes d'affiliation.
  - Tableau de bord de suivi des commissions par zone géographique.
- [ ] **Phase 7 : Expansion Multi-Régions & Isolation des Données**
  - Mise en place des serveurs et répliques multi-régions pour optimiser la latence et la conformité légale.
