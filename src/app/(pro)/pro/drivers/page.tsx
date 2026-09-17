'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import {
  Bike,
  Plus,
  Trash2,
  Lock,
  User,
  Phone,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Power,
  X,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  username: string;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
}

export default function ProDriversManagementPage() {
  const { showToast } = useToast();
  const { t, dir } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function fetchDrivers() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/pro/drivers', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (json.success && json.drivers) {
        setDrivers(json.drivers);
      }
    } catch {
      showToast(t('driver_err_loading_list', 'Erreur lors du chargement des livreurs.'), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDriver(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast(t('session_expired', 'Session expirée. Reconnectez-vous.'), 'error');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/pro/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name, username, password, phone }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(json.message || t('driver_created_success', 'Livreur créé avec succès !'), 'success');
        setModalOpen(false);
        setName('');
        setUsername('');
        setPassword('');
        setPhone('');
        fetchDrivers();
      } else {
        showToast(json.error || t('driver_created_error', 'Erreur lors de la création du livreur.'), 'error');
      }
    } catch {
      showToast(t('driver_network_error', 'Erreur réseau.'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(driver: Driver) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/pro/drivers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          driverId: driver.id,
          is_active: !driver.is_active,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(`${t('driver_status_updated_prefix', 'Statut de')} ${driver.name} ${t('driver_status_updated_suffix', 'mis à jour.')}`, 'success');
        setDrivers((prev) =>
          prev.map((d) => (d.id === driver.id ? { ...d, is_active: !d.is_active } : d))
        );
      }
    } catch {
      showToast(t('driver_update_error', 'Erreur lors de la modification.'), 'error');
    }
  }

  async function handleDeleteDriver(driver: Driver) {
    if (!window.confirm(`${t('driver_delete_confirm_prefix', 'Supprimer définitivement le compte du livreur')} ${driver.name} ?`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/pro/drivers?id=${driver.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const json = await res.json();
      if (json.success) {
        showToast(`${t('driver_deleted_prefix', 'Livreur')} ${driver.name} ${t('driver_deleted_suffix', 'supprimé.')}`, 'info');
        setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
      } else {
        showToast(json.error || t('driver_delete_error', 'Erreur lors de la suppression.'), 'error');
      }
    } catch {
      showToast(t('driver_network_error', 'Erreur réseau.'), 'error');
    }
  }

  function handleCopyPortalUrl() {
    const portalUrl = `${window.location.origin}/driver`;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    showToast(t('pro_drivers_copied', 'Lien du portail livreur copié !'), 'success');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black flex flex-col font-sans" dir={dir}>
      {/* Top Header Navigation */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/pro/dashboard"
              className="p-2 rounded-xl text-black hover:bg-[#FFB800] border-2 border-transparent hover:border-black transition shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFB800] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
                <Bike className="w-4 h-4" />
              </div>
              <h1 className="font-black text-lg sm:text-xl tracking-tight uppercase">
                {t('pro_drivers_title', 'Gestion des Livreurs')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Banner Portail Livreur & Accès Rapide */}
        <div className="p-6 rounded-3xl bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB800] border-2 border-black text-black text-xs font-black">
              <Bike className="w-3.5 h-3.5" />
              <span>{t('pro_drivers_badge', 'Portail Mobile Chauffeurs')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-black">
              {t('pro_drivers_link_title', 'Lien d’accès pour vos livreurs')}
            </h2>
            <p className="text-xs text-neutral-600 font-medium max-w-xl">
              {t('pro_drivers_link_desc', 'Donnez cette adresse à vos livreurs. Ils pourront s’y connecter depuis leur smartphone pour voir leurs commandes, lancer le GPS, appeler les clients et valider les encaissements.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCopyPortalUrl}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-neutral-50 text-black border-2 border-black text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('pro_drivers_copied', 'Copié !') : t('pro_drivers_copy_link', 'Copier le lien')}</span>
            </button>

            <Link
              href="/driver"
              target="_blank"
              className="px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_0px_#FFB800]"
            >
              <span>{t('pro_drivers_open_portal', 'Ouvrir le portail')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* En-tête de la liste & Bouton Ajouter */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h3 className="text-lg font-black text-black">{t('pro_drivers_list_title', 'Vos Livreurs Enregistrés')}</h3>
            <p className="text-xs text-neutral-500 font-medium">
              {drivers.length} {t('pro_drivers_count', 'livreur(s) configuré(s)')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#FFB800] hover:bg-[#ffa700] text-black border-2 border-black text-xs font-black flex items-center gap-2 shadow-[3px_3px_0px_0px_#000]"
          >
            <Plus className="w-4 h-4" />
            <span>{t('pro_drivers_add_btn', 'Ajouter un livreur')}</span>
          </button>
        </div>

        {/* Liste des livreurs */}
        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-neutral-400" />
            <p className="text-xs text-neutral-500 mt-2 font-bold">{t('loading', 'Chargement des livreurs...')}</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-10 bg-white border-3 border-black rounded-3xl text-center space-y-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center mx-auto text-2xl">
              🛵
            </div>
            <h4 className="text-base font-black text-black">{t('pro_drivers_empty_title', 'Aucun livreur configuré pour le moment')}</h4>
            <p className="text-xs text-neutral-600 font-medium max-w-sm mx-auto">
              {t('pro_drivers_empty_desc', 'Créez des accès chauffeurs pour permettre à votre équipe de voir et livrer vos commandes avec calcul GPS et encaissement.')}
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 rounded-full bg-black text-white text-xs font-black shadow-[3px_3px_0px_0px_#FFB800]"
            >
              + {t('pro_drivers_add_first_btn', 'Créer mon premier livreur')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className="p-5 bg-white border-3 border-black rounded-3xl shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-neutral-100 border-2 border-black flex items-center justify-center font-black">
                        <Bike className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-black">{driver.name}</h4>
                        <span className="text-[11px] font-mono text-neutral-500 font-bold">
                          @{driver.username}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(driver)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black border border-black flex items-center gap-1 ${
                        driver.is_active
                          ? 'bg-[#00F59B] text-black'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                      title={driver.is_active ? t('pro_drivers_deactivate', 'Désactiver') : t('pro_drivers_activate', 'Activer')}
                    >
                      <Power className="w-3 h-3" />
                      <span>{driver.is_active ? t('pro_drivers_active', 'Actif') : t('pro_drivers_inactive', 'Inactif')}</span>
                    </button>
                  </div>

                  {driver.phone && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-neutral-700">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{driver.phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {new Date(driver.created_at).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteDriver(driver)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                    title={t('delete', 'Supprimer')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Création Livreur */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black rounded-3xl shadow-[10px_10px_0px_0px_#000] max-w-md w-full p-6 relative">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-neutral-100 text-black border-2 border-black"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center">
                  <Bike className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-lg font-black text-black">{t('pro_drivers_modal_title', 'Créer un profil livreur')}</h3>
              </div>

              <form onSubmit={handleCreateDriver} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-black uppercase text-neutral-700 mb-1">
                    {t('pro_drivers_name_label', 'Nom & Prénom du livreur *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('pro_drivers_name_ph', 'Ex: Karim B.')}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-neutral-700 mb-1">
                    {t('pro_drivers_username_label', 'Identifiant de connexion *')}
                  </label>
                  <input
                    type="text"
                    required
                    autoCapitalize="none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder={t('pro_drivers_username_ph', 'Ex: karim-livreur')}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-black text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-neutral-700 mb-1">
                    {t('pro_drivers_pwd_label', 'Mot de passe *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('pro_drivers_pwd_ph', 'Au moins 6 caractères')}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-black text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-neutral-700 mb-1">
                    {t('pro_drivers_phone_label', 'Numéro de téléphone (optionnel)')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('pro_drivers_phone_ph', '06 12 34 56 78')}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-black shadow-[3px_3px_0px_0px_#FFB800] disabled:opacity-50 mt-4"
                >
                  {submitting ? t('pro_drivers_submitting', 'Création...') : t('pro_drivers_submit', 'Créer l\'accès livreur')}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
