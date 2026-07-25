'use client';

/**
 * app/dashboard/crm/page.tsx
 * ─────────────────────────────────────────────────────────────
 * CRM — Fichier clients fidélité.
 * Permet de visualiser, rechercher et ajuster les points des clients.
 */

import React, { useState, useEffect } from 'react';
import { Users, Search, Calendar, Mail, Phone, Filter, Send, Zap, MessageSquare } from 'lucide-react';
import { db } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import type { Customer } from '@/types';

// ─── Page ─────────────────────────────────────────────────────

export default function CrmPage() {
  const { merchant, merchantId } = useAuth();
  const { showToast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal d'ajustement de points
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [pointsDelta, setPointsDelta] = useState('');
  const [pointsAction, setPointsAction] = useState<'add' | 'remove'>('add');

  // Modal campagne flash
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('🔥 Offre Flash Happy Hour');
  const [campaignMessage, setCampaignMessage] = useState('Ce soir de 18h à 20h : -20% sur la carte pour nos membres fidélité !');
  const [campaignChannel, setCampaignChannel] = useState<'email' | 'sms'>('email');
  const [sendingCampaign, setSendingCampaign] = useState(false);

  useEffect(() => { loadCustomers(); }, [merchantId]);

  async function loadCustomers() {
    if (!merchantId) return;
    setLoading(true);
    try {
      const items = await db.collection('customers').getFullList<Customer>({
        filter: `merchant = "${merchantId}"`,
        sort: '-created',
      });
      setCustomers(items);
    } catch {
      showToast('Erreur lors du chargement des clients.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdjustPoints(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedCustomer || !pointsDelta) return;

    const delta = parseInt(pointsDelta, 10);
    if (isNaN(delta) || delta <= 0) return;

    const change = pointsAction === 'add' ? delta : -delta;
    const newBalance = Math.max(0, selectedCustomer.points_balance + change);

    try {
      const updated = await db.collection('customers').update<Customer>(selectedCustomer.id, {
        points_balance: newBalance,
      });

      // Enregistrer la visite uniquement lors d'un ajout de points
      if (pointsAction === 'add') {
        await db.collection('visits').create({
          merchant: merchantId,
          customer: selectedCustomer.id,
          points_awarded: delta,
        });
      }

      setCustomers((prev) => prev.map((c) => (c.id === selectedCustomer.id ? updated : c)));
      showToast(
        `${delta} point(s) ${pointsAction === 'add' ? 'ajoutés' : 'retirés'} à ${selectedCustomer.name}.`,
        'success'
      );
      setSelectedCustomer(null);
      setPointsDelta('');
    } catch {
      showToast('Erreur lors de l\'ajustement des points.', 'error');
    }
  }

  function openAdjustModal(customer: Customer) {
    setSelectedCustomer(customer);
    setPointsDelta('');
    setPointsAction('add');
  }

  // Filtrage local par nom, email ou téléphone
  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.includes(query)
    );
  });

  async function handleSendCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!campaignTitle.trim() || !campaignMessage.trim()) return;

    setSendingCampaign(true);

    try {
      const emailList = customers.map((c) => c.email).filter(Boolean);

      if (emailList.length > 0) {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: emailList,
            subject: campaignTitle.trim(),
            message: campaignMessage.trim(),
            businessName: merchant?.business_name || 'Votre Restaurant',
          }),
        }).catch(() => null);
      }

      showToast(`Offre Flash transmise avec succès à ${customers.length} client(s) !`, 'success');
      setCampaignTitle('');
      setCampaignMessage('');
      setIsCampaignModalOpen(false);
    } catch {
      showToast('Erreur lors de l\'envoi de la campagne.', 'error');
    } finally {
      setSendingCampaign(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Fichier Clients (CRM)</h1>
          <p className="text-stone-500 text-sm mt-1 font-semibold">
            Consultez et gérez vos clients fidèles. Envoyez des offres flash et ajustez les points.
          </p>
        </div>

        <button
          onClick={() => setIsCampaignModalOpen(true)}
          className="bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-auto btn-press"
        >
          <Zap className="h-4 w-4" />
          Offre Flash / Happy Hour
        </button>
      </div>

      <div className="bg-white border border-slate-200/85 rounded-3xl overflow-hidden shadow-sm">

        {/* ── Barre de recherche ── */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>
          <div className="flex items-center text-xs text-stone-500 font-semibold bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl self-start sm:self-auto">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
            {filteredCustomers.length} client{filteredCustomers.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ── Tableau des clients ── */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size={28} />
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Client</th>
                  <th className="p-4">Coordonnées</th>
                  <th className="p-4">Solde Points</th>
                  <th className="p-4">Inscrit le</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/30 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{customer.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {customer.id.substring(0, 10)}...
                      </span>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
                          {customer.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-0.5 rounded-full font-bold text-xs">
                        {customer.points_balance} pts
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        {new Date(customer.created).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openAdjustModal(customer)}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition btn-press"
                      >
                        Ajuster points
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400 font-bold">
                      {searchQuery
                        ? 'Aucun client correspondant à votre recherche.'
                        : 'Aucun client inscrit pour le moment.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modal ajustement de points ── */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Ajustement manuel des points"
      >
        {selectedCustomer && (
          <form onSubmit={handleAdjustPoints} className="space-y-4">
            {/* Info client */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold text-slate-700">
              <span className="font-bold text-slate-900">{selectedCustomer.name}</span>
              {' — '}
              <span className="text-amber-700 font-bold">{selectedCustomer.points_balance} pts actuels</span>
            </div>

            {/* Sélection action */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPointsAction('add')}
                  className={`py-2 px-4 rounded-xl font-bold text-xs border transition btn-press ${
                    pointsAction === 'add'
                      ? 'bg-amber-700 border-amber-600 text-white'
                      : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  Ajouter des points
                </button>
                <button
                  type="button"
                  onClick={() => setPointsAction('remove')}
                  className={`py-2 px-4 rounded-xl font-bold text-xs border transition btn-press ${
                    pointsAction === 'remove'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  Retirer des points
                </button>
              </div>
            </div>

            {/* Nombre de points */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre de points</label>
              <input
                type="number"
                required
                min={1}
                placeholder="Ex: 10"
                value={pointsDelta}
                onChange={(e) => setPointsDelta(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition btn-press"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition btn-press"
              >
                Confirmer
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Modal Campagne Offre Flash / Happy Hour ── */}
      <Modal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        title="Lancer une Offre Flash (SMS / Email)"
      >
        <form onSubmit={handleSendCampaign} className="space-y-4">
          {/* Canal d'envoi */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Canal de diffusion</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCampaignChannel('email')}
                className={`py-2 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition btn-press ${
                  campaignChannel === 'email'
                    ? 'bg-amber-700 border-amber-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Mail className="h-3.5 w-3.5" /> E-mail
              </button>
              <button
                type="button"
                onClick={() => setCampaignChannel('sms')}
                className={`py-2 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition btn-press ${
                  campaignChannel === 'sms'
                    ? 'bg-amber-700 border-amber-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" /> SMS Flash
              </button>
            </div>
          </div>

          {/* Titre de l'offre */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Titre de la campagne *</label>
            <input
              type="text"
              required
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>

          {/* Contenu du message */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Message adressé aux clients *</label>
            <textarea
              rows={3}
              required
              value={campaignMessage}
              onChange={(e) => setCampaignMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>

          <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[11px] text-amber-900 font-semibold flex items-center gap-2">
            <Send className="h-4 w-4 text-amber-700 flex-shrink-0" />
            <span>Sera transmis aux {customers.length} client(s) inscrits dans votre fichier CRM.</span>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCampaignModalOpen(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition btn-press"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={sendingCampaign}
              className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 btn-press disabled:opacity-60"
            >
              {sendingCampaign ? <Spinner size={14} colorClass="border-white" /> : <Send className="h-3.5 w-3.5" />}
              Envoyer la campagne
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
