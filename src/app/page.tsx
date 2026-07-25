'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, Utensils, Award, CheckCircle, 
  ArrowRight, Heart, Zap, Play, Check, 
  Smartphone, Wifi, Battery, Signal, User
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/30 via-stone-50 to-stone-50 text-stone-800 flex flex-col justify-between">
      
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-stone-200/60 bg-white/75 backdrop-blur-md">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent text-2xl font-black tracking-tight select-none">
            <Sparkles className="h-6 w-6 text-amber-700" />
            <span>MenuFid</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-stone-600 hover:text-stone-900 transition btn-press"
            >
              Connexion commerçant
            </Link>
            <Link 
              href="/register" 
              className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-amber-100 btn-press"
            >
              Créer mon espace
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 lg:py-20 text-center lg:text-left space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline and Pitch */}
          <div className="lg:col-span-7 text-left space-y-6 lg:pr-8">
            <span className="inline-flex items-center bg-amber-50 text-amber-800 border border-amber-100 text-xs font-bold px-3.5 py-1.5 rounded-full animate-[pulse_3s_infinite]">
              <Zap className="h-3.5 w-3.5 mr-1" />
              Votre carte et vos clients réunis au même endroit
            </span>
            
            <h1 className="text-4xl sm:text-6xl font-black text-stone-900 leading-tight tracking-tight">
              Digitalisez votre carte. <br/>
              <span className="bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
                Faites revenir vos clients régulièrement.
              </span>
            </h1>

            <p className="text-stone-500 text-base sm:text-lg max-w-xl leading-relaxed font-medium">
              MenuFid est la solution clé en main pour les restaurateurs et commerçants. Proposez une carte digitale moderne par QR code et un programme de fidélité directement sur le mobile de vos clients.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-amber-700 hover:bg-amber-600 text-white py-3.5 px-8 rounded-xl font-bold text-sm shadow-lg shadow-amber-200 transition flex items-center justify-center group btn-press"
              >
                <span>Essayer gratuitement</span>
                <ArrowRight className="h-4 w-4 ml-1.5 transition group-hover:translate-x-0.5" />
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 py-3.5 px-8 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center space-x-1.5 btn-press"
              >
                <Play className="h-4 w-4 text-stone-500 fill-stone-500" />
                <span>Tester la démo commerçant</span>
              </Link>
            </div>
          </div>
          {/* Right Column: Premium iPhone Mockup */}
          <div className="lg:col-span-5 flex justify-center items-center relative [perspective:1200px] py-8 lg:py-0 group">
            {/* Glowing gold background circles */}
            <div className="absolute w-72 h-72 bg-amber-100/40 rounded-full blur-[100px] -z-10 animate-pulse"></div>
            <div className="absolute w-60 h-60 bg-amber-250/15 rounded-full blur-[80px] -z-10 bottom-4 right-4"></div>

            {/* Floating Metric Badge 1 (Top-Left) */}
            <div className="absolute top-12 -left-6 lg:-left-12 z-20 bg-white/95 backdrop-blur-md border border-amber-100/80 rounded-2xl p-3 shadow-[0_10px_25px_-5px_rgba(180,83,9,0.1)] flex items-center space-x-2.5 animate-[bounce_5s_ease-in-out_infinite] select-none">
              <div className="bg-amber-50 p-1.5 rounded-lg text-amber-700">
                <Award className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-extrabold text-stone-900">+38% Fidélité</div>
                <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">Taux de retour</div>
              </div>
            </div>

            {/* Floating Metric Badge 2 (Bottom-Right) */}
            <div className="absolute bottom-16 -right-4 lg:-right-8 z-20 bg-white/95 backdrop-blur-md border border-amber-100/80 rounded-2xl p-3 shadow-[0_10px_25px_-5px_rgba(180,83,9,0.1)] flex items-center space-x-2.5 animate-[bounce_5s_ease-in-out_infinite_1.5s] select-none">
              <div className="bg-amber-50 p-1.5 rounded-lg text-amber-700">
                <Check className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-extrabold text-stone-900">Pass NFC Actif</div>
                <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">Wallet Compatible</div>
              </div>
            </div>

            {/* Smartphone device container with premium isometric rotation and smooth hover transitions */}
            <div className="w-[280px] h-[580px] bg-stone-950 rounded-[48px] p-2 shadow-[25px_35px_80px_-15px_rgba(40,20,0,0.28),0_0_0_1px_rgba(180,83,9,0.08)] ring-1 ring-white/10 border-[8px] border-stone-900 relative z-10 [transform:rotateY(-15deg)_rotateX(10deg)_rotateZ(-4deg)] group-hover:[transform:rotateY(-4deg)_rotateX(2deg)_rotateZ(-1deg)] transition-all duration-[800ms] ease-out select-none">
              
              {/* Glossy glare diagonal reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-30 rounded-[38px]"></div>

              {/* Dynamic Island / Speaker notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-22 h-4.5 bg-stone-950 rounded-full z-30 flex items-center justify-between px-2.5 shadow-inner">
                <div className="w-1.5 h-1.5 bg-stone-900 rounded-full"></div>
                <div className="w-6 h-0.5 bg-stone-900 rounded-full"></div>
              </div>

              {/* Volume & Side buttons (CSS decorators) */}
              <div className="absolute -left-2.5 top-24 w-1 h-10 bg-stone-850 rounded-r-xs"></div>
              <div className="absolute -left-2.5 top-36 w-1 h-12 bg-stone-850 rounded-r-xs"></div>
              <div className="absolute -left-2.5 top-50 w-1 h-12 bg-stone-850 rounded-r-xs"></div>
              <div className="absolute -right-2.5 top-36 w-1 h-16 bg-stone-850 rounded-l-xs"></div>

              {/* Screen Content Wrapper */}
              <div className="w-full h-full bg-stone-50 rounded-[38px] overflow-hidden relative flex flex-col justify-between p-3.5 pt-8 border border-stone-900/10 text-left">
                
                {/* Simulated status bar */}
                <div className="flex justify-between items-center px-1.5 text-[8px] font-extrabold text-stone-800 tracking-tight">
                  <span>9:41</span>
                  <div className="flex items-center space-x-1">
                    <Signal className="h-2 w-2 text-stone-800" />
                    <Wifi className="h-2 w-2 text-stone-800" />
                    <div className="w-4 h-2 border border-stone-800 rounded-[3px] p-[1px] flex items-center">
                      <div className="w-2.5 h-full bg-stone-850 rounded-[1px]"></div>
                    </div>
                  </div>
                </div>

                {/* Mobile app header */}
                <div className="flex items-center justify-between mt-1 px-0.5">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-700 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                      M
                    </div>
                    <div>
                      <h4 className="text-[10px] font-extrabold text-stone-900 leading-tight">Le Bistro de Paris</h4>
                      <p className="text-[7px] text-stone-400 font-semibold flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-0.5 animate-pulse"></span>
                        Ouvert
                      </p>
                    </div>
                  </div>
                  <span className="text-[7.5px] bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                    Fidélité Acteur
                  </span>
                </div>

                {/* Mobile Card Visual - Highly Premium Metallic Gold Card */}
                <div className="bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 rounded-2xl p-4 shadow-md space-y-4 relative overflow-hidden mt-3 text-white border border-amber-600/30">
                  {/* Subtle card reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
                  
                  {/* Top card row */}
                  <div className="flex justify-between items-center text-[7.5px] text-amber-100 font-bold uppercase tracking-wider">
                    <span>MenuFid Gold Pass</span>
                    <span className="font-mono">ID: BISTRO-88</span>
                  </div>

                  {/* SIM Chip decorator */}
                  <div className="w-5.5 h-4.5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-250 rounded-sm relative border border-yellow-200/50 overflow-hidden shadow-xs">
                    <div className="absolute inset-0 grid grid-cols-3 gap-[1px] opacity-25">
                      <div className="border border-stone-900"></div>
                      <div className="border border-stone-900"></div>
                      <div className="border border-stone-900"></div>
                    </div>
                  </div>

                  {/* Points display */}
                  <div className="space-y-1">
                    <span className="text-[8px] text-amber-150 font-bold uppercase tracking-wide block">Mon Solde</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-white leading-none">80 pts</span>
                      <span className="text-[7px] text-amber-200 font-bold">Cadeau à 100 pts</span>
                    </div>
                    {/* Premium progress bar */}
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-white h-full rounded-full w-[80%]"></div>
                    </div>
                  </div>
                </div>

                {/* Add to Wallet buttons */}
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  <div className="bg-stone-900 text-white rounded-xl py-1.5 text-center text-[6.5px] font-bold flex items-center justify-center space-x-1 border border-stone-850 hover:bg-stone-800 transition">
                    <Smartphone className="w-2.5 h-2.5 text-stone-300" />
                    <span>Apple Wallet</span>
                  </div>
                  <div className="bg-white text-stone-850 border border-stone-200 rounded-xl py-1.5 text-center text-[6.5px] font-bold flex items-center justify-center space-x-1 hover:bg-stone-50 transition">
                    <Smartphone className="w-2.5 h-2.5 text-stone-400" />
                    <span>Google Wallet</span>
                  </div>
                </div>

                {/* Mini Menu item previews */}
                <div className="space-y-2 mt-3.5 flex-grow overflow-hidden">
                  <span className="text-[7.5px] font-bold text-stone-400 uppercase tracking-wider block">Suggestions de la carte</span>
                  <div className="space-y-1.5">
                    <div className="bg-white border border-stone-200/60 p-2 rounded-xl flex justify-between items-center shadow-xs">
                      <div className="space-y-0.5">
                        <h5 className="text-[7.5px] font-bold text-stone-900 leading-tight">Burger Classic Double</h5>
                        <p className="text-[6.5px] text-stone-400 line-clamp-1">Frites fraîches maison</p>
                      </div>
                      <span className="text-[7.5px] font-black text-amber-700">16.50€</span>
                    </div>
                    <div className="bg-white border border-stone-200/60 p-2 rounded-xl flex justify-between items-center shadow-xs">
                      <div className="space-y-0.5">
                        <h5 className="text-[7.5px] font-bold text-stone-900 leading-tight">Tiramisu Maison</h5>
                        <p className="text-[6.5px] text-stone-400 line-clamp-1">Café et mascarpone</p>
                      </div>
                      <span className="text-[7.5px] font-black text-amber-700">7.50€</span>
                    </div>
                  </div>
                </div>

                {/* Bottom App Navigation Bar */}
                <div className="border-t border-stone-200/60 pt-2.5 pb-1 flex justify-around items-center text-stone-400 text-[6.5px] font-bold flex-shrink-0">
                  <div className="flex flex-col items-center space-y-0.5 text-stone-500">
                    <Utensils className="h-3 w-3" />
                    <span>La Carte</span>
                  </div>
                  <div className="flex flex-col items-center space-y-0.5 text-amber-700">
                    <Award className="h-3 w-3" />
                    <span>Fidélité</span>
                  </div>
                  <div className="flex flex-col items-center space-y-0.5 text-stone-500">
                    <User className="h-3 w-3" />
                    <span>Mon Pass</span>
                  </div>
                </div>

                {/* Apple Home Bar indicator */}
                <div className="w-16 h-1 bg-stone-300 rounded-full mx-auto mt-2 flex-shrink-0"></div>

              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 max-w-5xl mx-auto text-left">
          
          {/* Pillar 1: Menu */}
          <div className="bg-white border border-stone-200/80 p-8 rounded-3xl space-y-6 flex flex-col justify-between hover:border-amber-200 shadow-sm transition">
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 text-amber-700 p-3 rounded-2xl w-12 h-12 flex items-center justify-center">
                <Utensils className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Carte Digitale Interactive</h3>
              <p className="text-stone-500 text-sm leading-relaxed font-medium">
                Vos clients scannent le QR code posé sur leur table pour parcourir vos plats avec de belles photos. Modifiez vos prix, ajoutez des suggestions du jour et masquez les plats indisponibles en 3 secondes depuis votre téléphone.
              </p>
            </div>
            <ul className="space-y-3 text-xs text-stone-600 font-medium">
              <li className="flex items-center"><CheckCircle className="h-4 w-4 text-amber-700 mr-2" /> Modification instantanée sans réimpression</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 text-amber-700 mr-2" /> QR Code unique par établissement</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 text-amber-700 mr-2" /> Statistiques de consultation de votre carte</li>
            </ul>
          </div>

          {/* Pillar 2: Loyalty */}
          <div className="bg-white border border-stone-200/80 p-8 rounded-3xl space-y-6 flex flex-col justify-between hover:border-amber-200 shadow-sm transition">
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 text-amber-700 p-3 rounded-2xl w-12 h-12 flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Fidélité & Rétention Client</h3>
              <p className="text-stone-500 text-sm leading-relaxed font-medium">
                Proposez à vos clients une carte de fidélité à enregistrer dans leur téléphone (Apple & Google Wallet). Scannez leur code à la caisse pour ajouter des points et leur offrir des récompenses personnalisées.
              </p>
            </div>
            <ul className="space-y-3 text-xs text-stone-600 font-medium">
              <li className="flex items-center"><CheckCircle className="h-4 w-4 text-amber-700 mr-2" /> Scanner photo de caisse intégré (sans application)</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 text-amber-700 mr-2" /> Cartes de fidélité mobiles Apple Wallet & Google</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 text-amber-700 mr-2" /> Fichier client (CRM) pour suivre les visites</li>
            </ul>
          </div>

        </div>

        {/* Practical Benefits Details */}
        <div className="bg-white border border-stone-200/80 max-w-5xl mx-auto rounded-3xl p-8 sm:p-10 text-left space-y-4 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-amber-700" />
            <span>Fini les multiples applications : tout est synchronisé</span>
          </h3>
          <p className="text-stone-500 text-sm leading-relaxed font-medium">
            Avec MenuFid, vous pilotez tout depuis une interface unique. Les clients accèdent à votre carte et rejoignent votre club de fidélité depuis le même support QR code. Vous économisez du temps, fidélisez vos clients au moment de l'addition et augmentez la rentabilité de votre commerce.
          </p>
        </div>

        {/* Pricing Section */}
        <div className="pt-16 max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">Des tarifs transparents, adaptés à votre commerce</h2>
            <p className="text-stone-500 text-xs sm:text-sm font-medium">Sans engagement de durée. Modifiable ou annulable en ligne en 1 clic.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Plan 1 */}
            <div className="bg-white border border-stone-200/80 p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-sm hover:border-amber-200 transition">
              <div className="space-y-3">
                <span className="text-stone-500 text-xs font-bold uppercase tracking-wider block">Plan Carte Digitale</span>
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-stone-900">15€</span>
                  <span className="text-slate-550 text-xs ml-1">/ mois</span>
                </div>
                <p className="text-stone-500 text-xs font-medium">L'outil indispensable pour digitaliser votre menu en quelques minutes.</p>
              </div>
              <ul className="space-y-2.5 text-xs text-stone-600 font-medium border-t border-stone-100 pt-4">
                <li className="flex items-center"><Check className="h-4 w-4 text-amber-700 mr-2" /> Menu interactif illimité</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-amber-700 mr-2" /> 1 QR code unique à imprimer</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-amber-700 mr-2" /> Modification temps réel des prix</li>
              </ul>
              <Link 
                href="/register" 
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 rounded-xl text-xs font-bold text-center block transition btn-press"
              >
                Choisir cette formule
              </Link>
            </div>

            {/* Plan 2 */}
            <div className="bg-white border border-stone-200/80 p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-sm hover:border-amber-200 transition">
              <div className="space-y-3">
                <span className="text-amber-700 text-xs font-bold uppercase tracking-wider block">Plan Fidélité CRM</span>
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-stone-900">29€</span>
                  <span className="text-slate-550 text-xs ml-1">/ mois</span>
                </div>
                <p className="text-stone-550 text-xs font-medium">Faites revenir vos clients dans votre établissement.</p>
              </div>
              <ul className="space-y-2.5 text-xs text-stone-600 font-medium border-t border-stone-100 pt-4">
                <li className="flex items-center"><Check className="h-4 w-4 text-amber-700 mr-2" /> Scanner de caisse photo</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-amber-700 mr-2" /> Cartes de fidélité mobiles</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-amber-700 mr-2" /> Fichier CRM clients complet</li>
                <li className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded inline-block">Rentabilisé dès 3 visites par mois !</li>
              </ul>
              <Link 
                href="/register" 
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 rounded-xl text-xs font-bold text-center block transition btn-press"
              >
                Choisir cette formule
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="bg-gradient-to-b from-amber-50/20 to-white border-2 border-amber-600 p-6 rounded-2xl flex flex-col justify-between space-y-6 relative shadow-md">
              <span className="absolute top-3 right-3 bg-amber-700 text-[8px] uppercase font-bold text-white px-2 py-1 rounded-full">Plus populaire</span>
              <div className="space-y-3">
                <span className="text-amber-700 text-xs font-bold uppercase tracking-wider block">Plan Premium 360°</span>
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-stone-900">40€</span>
                  <span className="text-slate-550 text-xs ml-1">/ mois</span>
                </div>
                <p className="text-stone-500 text-xs font-medium">Automatisez vos relances clients et boostez votre chiffre d'affaires.</p>
              </div>
              <ul className="space-y-2.5 text-xs text-stone-600 font-medium border-t border-amber-100 pt-4">
                <li className="flex items-center"><Check className="h-4 w-4 text-amber-700 mr-2" /> Carte Digitale + Fidélité mobile</li>
                <li className="flex items-center font-bold text-stone-900"><Check className="h-4 w-4 text-amber-700 mr-2" /> SMS & Relances emails automatiques</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-amber-700 mr-2" /> Nom de domaine personnalisé</li>
              </ul>
              <Link 
                href="/register" 
                className="w-full bg-amber-700 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold text-center block transition shadow-md shadow-amber-150 btn-press"
              >
                Sélectionner la formule Premium
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-stone-200/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-400 font-medium">
        <p>© 2026 MenuFid SaaS. Tous droits réservés.</p>
        <p className="flex items-center text-stone-500">
          Créé avec <Heart className="h-3.5 w-3.5 mx-1 text-red-500 fill-red-500" /> pour les commerces de proximité.
        </p>
      </footer>

    </div>
  );
}
