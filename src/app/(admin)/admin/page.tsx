'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogOut, Plus, Trash2, Users, Building, Coins, ShieldAlert } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/i18n';

interface Distributor {
  id: string;
  name: string;
  email: string;
  code: string;
  commission_rate: number;
  created_at: string;
}

export default function SuperAdminPage() {
  const { t, dir, language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  
  // Add Admin states
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [addAdminLoading, setAddAdminLoading] = useState(false);

  // Add Distributor states
  const [showAddDistributor, setShowAddDistributor] = useState(false);
  const [distName, setDistName] = useState('');
  const [distEmail, setDistEmail] = useState('');
  const [distPassword, setDistPassword] = useState('');
  const [distCode, setDistCode] = useState('');
  const [distCity, setDistCity] = useState('');
  const [distCountry, setDistCountry] = useState('');
  const [distCommission, setDistCommission] = useState(10);
  const [addDistLoading, setAddDistLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const is2FA = localStorage.getItem('admin_2fa_verified');
      if (is2FA !== 'true') {
        router.push('/admin/login');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }

      // Check if actually admin
      const { data: adminData, error } = await supabase
        .from('admins')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !adminData) {
        localStorage.removeItem('admin_2fa_verified');
        await supabase.auth.signOut();
        router.push('/admin/login');
        return;
      }

      // Setup realtime and fetch initial data
      await fetchDistributors();
      await fetchMerchants();
      await fetchLogs();
      setupRealtime();
    } catch (err) {
      console.error(err);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistributors = async () => {
    const { data, error } = await supabase
      .from('distributors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setDistributors(data);
    
    // In a real scenario, calculate total revenue from merchants
    const { data: merchantsData } = await supabase
      .from('merchants')
      .select('monthly_price, plan_status')
      .eq('plan_status', 'active');
      
    if (merchantsData) {
      const total = merchantsData.reduce((acc, m) => acc + (m.monthly_price || 0), 0);
      setTotalRevenue(total);
    }
  };

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setLogs(data);
  };

  const fetchMerchants = async () => {
    // Vérification automatique en arrière-plan des abonnements et de la rétention
    fetch('/api/cron/check-subscriptions').catch(() => {});

    const { data } = await supabase
      .from('merchants')
      .select('*, distributors(name)')
      .order('created_at', { ascending: false });
    if (data) setMerchants(data);
  };

  const handleExtendSubscription = async (merchantId: string) => {
    if (confirm('Accorder 1 mois (30 jours) supplémentaire à ce restaurant ?')) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const res = await fetch('/api/admin/toggle-merchant-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ merchantId, extendDays: 30 })
        });
        
        if (res.ok) {
          fetchMerchants();
          fetchLogs();
        } else {
          alert('Erreur lors de la prolongation');
        }
      } catch (e) {
        alert('Erreur serveur');
      }
    }
  };

  const handleAddDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distName || !distEmail || !distPassword || !distCode) return;
    setAddDistLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const res = await fetch('/api/admin/create-distributor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          name: distName, 
          email: distEmail, 
          password: distPassword, 
          code: distCode,
          city: distCity,
          country: distCountry,
          commission_rate: distCommission
        })
      });
      
      const resData = await res.json();
      if (!res.ok) {
        alert('Erreur: ' + (resData.error || 'Erreur lors de la création'));
      } else {
        alert('Distributeur ajouté avec succès !');
        setShowAddDistributor(false);
        setDistName('');
        setDistEmail('');
        setDistPassword('');
        setDistCode('');
        setDistCity('');
        setDistCountry('');
        fetchDistributors();
        fetchLogs();
      }
    } catch (err) {
      alert('Erreur serveur');
    } finally {
      setAddDistLoading(false);
    }
  };

  const handleToggleMerchantStatus = async (merchantId: string, currentStatus: boolean) => {
    if (confirm(`Voulez-vous vraiment ${currentStatus ? 'RÉACTIVER' : 'SUSPENDRE'} ce restaurant ?`)) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const res = await fetch('/api/admin/toggle-merchant-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ merchantId, isSuspended: !currentStatus })
        });
        
        if (res.ok) {
          fetchMerchants();
          fetchLogs();
        } else {
          alert('Erreur lors de la modification');
        }
      } catch (e) {
        alert('Erreur serveur');
      }
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword) return;
    setAddAdminLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword })
      });
      
      const resData = await res.json();
      if (!res.ok) {
        alert(resData.error || 'Erreur lors de la création');
      } else {
        alert('Administrateur ajouté avec succès !');
        setShowAddAdmin(false);
        setNewAdminEmail('');
        setNewAdminPassword('');
        fetchLogs();
      }
    } catch (err) {
      alert('Erreur serveur');
    } finally {
      setAddAdminLoading(false);
    }
  };

  const setupRealtime = () => {
    const distSub = supabase.channel('distributors_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'distributors' }, () => {
        fetchDistributors();
      })
      .subscribe();

    const merchSub = supabase.channel('merchants_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'merchants' }, () => {
        fetchDistributors();
      })
      .subscribe();
      
    const logsSub = supabase.channel('logs_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(distSub);
      supabase.removeChannel(merchSub);
      supabase.removeChannel(logsSub);
    };
  };

  const handleLogout = async () => {
    localStorage.removeItem('admin_2fa_verified');
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleDeleteDistributor = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce distributeur ?')) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const res = await fetch('/api/admin/delete-distributor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ distributorId: id })
        });
        
        if (res.ok) {
          fetchDistributors();
          fetchLogs();
        } else {
          const resData = await res.json();
          alert(resData.error || 'Erreur lors de la suppression');
        }
      } catch (e) {
        alert('Erreur serveur');
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">{t('admin_loading', 'Chargement sécurisé...')}</div>;
  }

  return (
    <div dir={dir} className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-emerald-500/30">
      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-emerald-400 w-8 h-8" />
          <h1 className="text-xl font-bold tracking-wider">{t('admin_super_title', 'SUPER ADMIN')}</h1>
        </div>
        <div className="flex items-center gap-6">
          <LanguageSelector />
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4" /> {t('logout', 'Déconnexion')}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <Coins className="w-24 h-24" />
            </div>
            <h3 className="text-gray-400 font-medium">{t('admin_stat_monthly_rev', 'Revenu Mensuel Global')}</h3>
            <p className="text-5xl font-black mt-2 text-emerald-400">{totalRevenue} €</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <Building className="w-24 h-24" />
            </div>
            <h3 className="text-gray-400 font-medium">{t('admin_stat_active_dist', 'Distributeurs Actifs')}</h3>
            <p className="text-5xl font-black mt-2 text-white">{distributors.length}</p>
          </div>
        </div>

        {/* Distributors Management */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-400" />
                {t('admin_dist_title', 'Gestion des Distributeurs')}
              </h2>
              <p className="text-gray-400 mt-1">{t('admin_dist_desc', 'Gérez les partenaires régionaux (mise à jour en temps réel).')}</p>
            </div>
            <button 
              onClick={() => setShowAddDistributor(!showAddDistributor)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('admin_dist_new_btn', 'Nouveau Distributeur')}
            </button>
          </div>

          {showAddDistributor && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300">
              <form onSubmit={handleAddDistributor} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('admin_dist_form_name', 'Nom Complet')}</label>
                    <input type="text" required value={distName} onChange={e => setDistName(e.target.value)} className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white" placeholder="Agence Paris" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('admin_dist_form_email', 'Email')}</label>
                    <input type="email" required value={distEmail} onChange={e => setDistEmail(e.target.value)} className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white" placeholder="contact@..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('admin_dist_form_pwd', 'Mot de passe')}</label>
                    <input type="password" required minLength={8} value={distPassword} onChange={e => setDistPassword(e.target.value)} className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('admin_dist_form_code', 'Code Région (Unique)')}</label>
                    <input type="text" required value={distCode} onChange={e => setDistCode(e.target.value)} className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white font-mono" placeholder="paris-01" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('admin_dist_form_city', 'Ville')}</label>
                    <input type="text" value={distCity} onChange={e => setDistCity(e.target.value)} className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white" placeholder="Paris" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('admin_dist_form_country', 'Pays')}</label>
                    <input type="text" value={distCountry} onChange={e => setDistCountry(e.target.value)} className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white" placeholder="France" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('admin_dist_form_commission', 'Commission (%)')}</label>
                    <input type="number" required min={0} max={100} value={distCommission} onChange={e => setDistCommission(Number(e.target.value))} className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white" />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button type="submit" disabled={addDistLoading} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium transition-colors">
                    {addDistLoading ? t('admin_dist_form_submitting', 'Création...') : t('admin_dist_form_submit', 'Créer le Distributeur')}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-400">{t('admin_dist_th_dist', 'Distributeur')}</th>
                  <th className="px-6 py-4 font-medium text-gray-400">{t('admin_dist_form_email', 'Email')}</th>
                  <th className="px-6 py-4 font-medium text-gray-400">{t('admin_dist_th_code', 'Code Région')}</th>
                  <th className="px-6 py-4 font-medium text-gray-400">{t('admin_dist_th_commission', 'Commission')}</th>
                  <th className="px-6 py-4 font-medium text-gray-400 text-right">{t('admin_dist_th_actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {distributors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {t('admin_dist_empty', 'Aucun distributeur trouvé.')}
                    </td>
                  </tr>
                ) : (
                  distributors.map(dist => (
                    <tr key={dist.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{dist.name}</td>
                      <td className="px-6 py-4 text-gray-300">{dist.email}</td>
                      <td className="px-6 py-4 text-emerald-400 font-mono">{dist.code}</td>
                      <td className="px-6 py-4 text-gray-300">{dist.commission_rate}%</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteDistributor(dist.id)}
                          className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Merchants Management */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Building className="w-6 h-6 text-orange-400" />
                {t('admin_merch_title', 'Gestion des Abonnements Restaurants')}
              </h2>
              <p className="text-gray-400 mt-1">{t('admin_merch_desc', 'Supervisez le statut des abonnements, échéances et suspensions.')}</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-400">{t('admin_merch_th_resto', 'Restaurant')}</th>
                  <th className="px-6 py-4 font-medium text-gray-400">{t('admin_merch_th_dist', 'Distributeur')}</th>
                  <th className="px-6 py-4 font-medium text-gray-400">{t('admin_merch_th_plan', 'Plan & Règlement')}</th>
                  <th className="px-6 py-4 font-medium text-gray-400">{t('admin_merch_th_due', 'Échéance / Rétention')}</th>
                  <th className="px-6 py-4 font-medium text-gray-400">{t('admin_merch_th_status', 'Statut')}</th>
                  <th className="px-6 py-4 font-medium text-gray-400 text-right">{t('admin_dist_th_actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {merchants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">{t('admin_merch_empty', 'Aucun restaurant.')}</td>
                  </tr>
                ) : (
                  merchants.map(merch => (
                    <tr key={merch.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-medium text-white">
                        <div>{merch.business_name} <span className="text-gray-500 text-sm ml-1">({merch.short_code})</span></div>
                        <div className="text-xs text-gray-400 font-normal">{merch.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{merch.distributors?.name || t('admin_direct_online', 'Direct / En ligne')}</td>
                      <td className="px-6 py-4">
                        <div className="text-orange-400 font-medium text-sm">
                          {merch.plan_tier === 'basic' ? 'Starter' : merch.plan_tier === 'loyalty' ? 'Pro' : merch.plan_tier}
                        </div>
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                          merch.payment_method === 'stripe' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {merch.payment_method === 'stripe' ? 'Stripe 💳' : t('admin_manual_distributor', 'Manuel / Distributeur')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {merch.is_suspended ? (
                          (() => {
                            if (!merch.deactivated_at) {
                              return <span className="text-xs text-red-400 font-bold">{t('admin_suspended_unpaid', 'Suspendu (Impayé)')}</span>;
                            }
                            const daysPassed = Math.floor((Date.now() - new Date(merch.deactivated_at).getTime()) / 86400000);
                            const daysLeft = Math.max(0, 90 - daysPassed);
                            return (
                              <div className="text-xs">
                                <span className="text-red-400 font-bold block">
                                  {t('admin_suspended_since', 'Suspendu depuis')} {daysPassed}{t('admin_days_suffix', 'j')}
                                </span>
                                <span className={`text-[11px] font-semibold ${daysLeft <= 15 ? 'text-red-500 font-black' : 'text-amber-300'}`}>
                                  {t('admin_purge_in', 'Suppr. définitive dans')} {daysLeft}{t('admin_days_suffix', 'j')}
                                </span>
                              </div>
                            );
                          })()
                        ) : (
                          merch.subscription_expires_at ? (
                            <div className="text-xs">
                              <span className="text-emerald-400 font-bold block">
                                {t('admin_expires_on', 'Expire le')} {new Date(merch.subscription_expires_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : (language === 'en' ? 'en-US' : 'fr-FR'))}
                              </span>
                              <span className="text-gray-400 text-[11px]">{merch.monthly_price} €/{language === 'ar' ? 'شهرياً' : (language === 'en' ? 'mo' : 'mois')}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">{merch.monthly_price || 0} €/{language === 'ar' ? 'شهرياً' : (language === 'en' ? 'mo' : 'mois')}</span>
                          )
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {merch.is_suspended ? (
                          <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold">{t('admin_status_suspended', 'SUSPENDU')}</span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">{t('admin_status_active', 'ACTIF')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleExtendSubscription(merch.id)}
                            title="+1 Mois"
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                          >
                            {t('admin_btn_add_month', '+1 Mois')}
                          </button>
                          <button 
                            onClick={() => handleToggleMerchantStatus(merch.id, merch.is_suspended)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${merch.is_suspended ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                          >
                            {merch.is_suspended ? t('admin_btn_reactivate', 'Réactiver') : t('admin_btn_suspend', 'Suspendre')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admins Management */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-blue-400" />
                {t('admin_admins_title', 'Gestion des Administrateurs')}
              </h2>
              <p className="text-gray-400 mt-1">{t('admin_admins_desc', 'Ajouter un nouveau Super-Admin pour la plateforme.')}</p>
            </div>
            <button 
              onClick={() => setShowAddAdmin(!showAddAdmin)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('admin_new_admin_btn', 'Nouveau Admin')}
            </button>
          </div>

          {showAddAdmin && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300">
              <form onSubmit={handleAddAdmin} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('admin_dist_form_email', 'Email')}</label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="block w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="nouvel.admin@menufid.site"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('admin_dist_form_pwd', 'Mot de passe')}</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addAdminLoading}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium flex-shrink-0 transition-colors"
                >
                  {addAdminLoading ? t('admin_dist_form_submitting', 'Création...') : t('admin_dist_form_submit', 'Créer')}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* System Logs */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <LogOut className="w-6 h-6 text-purple-400 rotate-180" />
              {t('admin_logs_title', 'Historique des Actions (Logs)')}
            </h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/10 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-400">{t('admin_logs_th_date', 'Date')}</th>
                  <th className="px-6 py-4 font-medium text-gray-400">{t('admin_logs_th_action', 'Action')}</th>
                  <th className="px-6 py-4 font-medium text-gray-400">{t('admin_logs_th_details', 'Détails')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">{t('admin_logs_empty', 'Aucun log récent.')}</td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : (language === 'en' ? 'en-US' : 'fr-FR'))}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-gray-400 truncate max-w-xl">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
