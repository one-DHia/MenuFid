'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface QAPair {
  id: string;
  question: string;
  answer: string;
  actionText?: string;
  actionUrl?: string;
}

const FAQ_DATA: QAPair[] = [
  {
    id: '1',
    question: 'Comment MenuFid augmente mes revenus ?',
    answer: 'MenuFid transforme vos visiteurs occasionnels en clients fidèles réguliers. Grâce à la carte de fidélité digitale enregistrée sur leur smartphone, à l’incitation au ré-achat et aux notifications marketing ciblées, vos clients reviennent 2x plus souvent et dépensent davantage à chaque commande !',
    actionText: 'Découvrir nos Abonnements',
    actionUrl: '/pricing',
  },
  {
    id: '2',
    question: 'Comment fonctionne le Menu QR Code ?',
    answer: 'Vos clients scannent le QR Code posé sur vos tables avec leur smartphone sans installer aucune application. Votre menu interactif s’affiche instantanément avec photos haute définition, filtres d’allergènes et mise à jour des prix en temps réel depuis votre dashboard.',
    actionText: 'Créer mon Menu',
    actionUrl: '/register',
  },
  {
    id: '3',
    question: 'Combien coûtent les formules MenuFid ?',
    answer: 'Nos formules sont ultra-accessibles pour maximiser votre rentabilité dès le 1er mois : Formule Basic à 5€/mois, Formule Fidélité complète à 10€/mois et Formule Premium Intégrale à 20€/mois. Sans engagement et sans frais cachés.',
    actionText: 'Voir la grille des tarifs',
    actionUrl: '/pricing',
  },
  {
    id: '4',
    question: 'Comment devenir Partenaire régional MenuFid ?',
    answer: 'Nous accompagnons des partenaires commerciaux et distributeurs régionaux pour déployer MenuFid auprès des restaurants et commerces de leur secteur. Vous bénéficiez d’une commission récurrente et d’un accompagnement dédié.',
    actionText: 'Devenir notre Partenaire',
    actionUrl: '/distribution',
  },
  {
    id: '5',
    question: 'Comment démarrer en moins de 5 minutes ?',
    answer: 'Il vous suffit de créer un compte marchand en 2 étapes, d’ajouter vos premiers plats et de télécharger votre QR Code prêt à imprimer pour vos tables !',
    actionText: 'Créer mon compte Marchand',
    actionUrl: '/register',
  },
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'bot' | 'user'; text: string; actionText?: string; actionUrl?: string }>>([
    {
      role: 'bot',
      text: 'Bonjour 👋 ! Je suis l\'Assistant virtuel MenuFid. Comment puis-je vous aider à augmenter les gains et la fidélité de votre établissement aujourd\'hui ?',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleAskQuestion = (qa: QAPair) => {
    // Ajouter la question utilisateur
    setMessages((prev) => [...prev, { role: 'user', text: qa.question }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: qa.answer,
          actionText: qa.actionText,
          actionUrl: qa.actionUrl,
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2.5 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white font-bold px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all border border-amber-500/30 group"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
          </span>
          <Bot className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
          <span className="text-sm tracking-wide">Une question ? Chat IA</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl border border-amber-900/10 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Top Header */}
          <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  Assistant MenuFid <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </h3>
                <p className="text-xs text-amber-200/80">En ligne pour augmenter vos gains</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-amber-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-800 text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.actionText && msg.actionUrl && (
                  <Link
                    href={msg.actionUrl}
                    onClick={() => setIsOpen(false)}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-200 transition"
                  >
                    <span>{msg.actionText}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white text-slate-400 text-xs w-20 border border-slate-200">
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>

          {/* Preset Questions Suggestions */}
          <div className="p-3 bg-white border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 px-1">
              Questions fréquentes :
            </p>
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
              {FAQ_DATA.map((qa) => (
                <button
                  key={qa.id}
                  onClick={() => handleAskQuestion(qa)}
                  className="text-left text-xs bg-slate-100/80 hover:bg-amber-100/60 hover:text-amber-900 text-slate-700 px-3 py-2 rounded-xl transition border border-slate-200/60 font-medium flex items-center justify-between group"
                >
                  <span className="truncate mr-2">{qa.question}</span>
                  <Send className="w-3 h-3 text-slate-400 group-hover:text-amber-700 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
