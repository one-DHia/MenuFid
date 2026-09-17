'use client';

import React, { useState, useEffect } from 'react';
import {
  Bike,
  Phone,
  Navigation,
  CheckCircle2,
  DollarSign,
  LogOut,
  RefreshCw,
  Clock,
  MapPin,
  Utensils,
  Award,
  AlertCircle,
  Lock,
  User,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface DriverSession {
  id: string;
  name: string;
  username: string;
  merchant_id: string;
  restaurant_name: string;
  currency: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface DeliveryOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string | null;
  delivery_notes?: string | null;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  payment_method: 'cash_on_delivery' | 'stripe' | 'card_online';
  payment_status: string;
  order_status: string;
  created_at: string;
}

export default function DriverMobilePortalPage() {
  const { showToast } = useToast();
  const [driver, setDriver] = useState<DriverSession | null>(null);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Login form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Vérifier si un driver est sauvegardé localement
    const saved = localStorage.getItem('menufid_driver_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDriver(parsed);
        fetchOrders();
      } catch {
        localStorage.removeItem('menufid_driver_session');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/driver/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();
      if (json.success && json.driver) {
        setDriver(json.driver);
        localStorage.setItem('menufid_driver_session', JSON.stringify(json.driver));
        showToast(`Bonjour ${json.driver.name} !`, 'success');
        fetchOrders();
      } else {
        setLoginError(json.error || 'Identifiant ou mot de passe incorrect.');
      }
    } catch {
      setLoginError('Erreur de connexion. Vérifiez votre réseau.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/driver/orders');
      const json = await res.json();
      if (json.success && json.orders) {
        setOrders(json.orders);
      }
    } catch {
      showToast('Erreur lors du chargement des commandes.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('menufid_driver_session');
    document.cookie = 'menufid_driver_token=; path=/; max-age=0';
    setDriver(null);
    setOrders([]);
    showToast('Déconnexion réussie.', 'info');
  }

  async function handleCompleteDelivery(order: DeliveryOrder) {
    const isCash = order.payment_method === 'cash_on_delivery';
    const confirmMessage = isCash
      ? `Confirmez-vous avoir encaissé ${order.total_amount} ${order.currency} en espèces ? Cela créditera 1 point fidélité au client.`
      : 'Confirmez-vous que cette commande a bien été remise au client ?';

    if (!window.confirm(confirmMessage)) return;

    setActionLoadingId(order.id);
    try {
      const res = await fetch('/api/driver/complete-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(json.message, 'success');
        // Retirer la commande livrée de la liste
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
      } else {
        showToast(json.error || 'Erreur lors de la validation.', 'error');
      }
    } catch {
      showToast('Erreur réseau.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }

  // ── 1. ÉCRAN DE CONNEXION LIVREUR MOBILE ──
  if (!driver) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-black flex flex-col justify-center px-4 py-8 max-w-sm mx-auto select-none">
        <div className="text-center mb-8 space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-[#FFB800] border-3 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000]">
            <Bike className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight mt-3">
            Portail Livreur
          </h1>
          <p className="text-xs text-neutral-600 font-bold">
            MenuFid • Vos livraisons en direct
          </p>
        </div>

        <div className="p-6 bg-white border-3 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000]">
          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-700 mb-1">
                Identifiant Livreur
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: livreur-karim"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-neutral-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-black shadow-[3px_3px_0px_0px_#FFB800] transition-all disabled:opacity-50 mt-2"
            >
              {loginLoading ? 'Connexion en cours...' : 'Accéder à mes livraisons'}
            </button>
          </form>

          <p className="text-[10px] text-neutral-500 text-center font-bold mt-4">
            Vos identifiants vous sont fournis par le gérant de votre restaurant.
          </p>
        </div>
      </div>
    );
  }

  // ── 2. TABLEAU DE BORD LIVREUR MOBILE CONNECTÉ ──
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pb-12 max-w-md mx-auto flex flex-col font-sans select-none">
      {/* Header Livreur Mobile Fixe */}
      <header className="sticky top-0 z-30 bg-white border-b-3 border-black px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000]">
            <Bike className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="text-xs font-black text-black leading-tight">{driver.name}</p>
            <p className="text-[10px] font-bold text-neutral-500 truncate max-w-[160px]">
              {driver.restaurant_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black text-black"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border-2 border-black text-red-600"
            title="Déconnexion"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase text-black tracking-wider flex items-center gap-2">
            <span>Commandes à livrer</span>
            <span className="bg-[#FFB800] text-black text-xs font-black px-2 py-0.5 rounded-full border border-black">
              {orders.length}
            </span>
          </h2>
          <span className="text-[10px] text-neutral-500 font-bold">
            Actualisé en direct
          </span>
        </div>

        {/* Liste des commandes */}
        {loading && orders.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-neutral-400" />
            <p className="text-xs font-bold text-neutral-500">Chargement de vos livraisons...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 bg-white border-3 border-black rounded-3xl text-center space-y-3 shadow-[4px_4px_0px_0px_#000] mt-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 border-2 border-black flex items-center justify-center mx-auto text-xl">
              ✨
            </div>
            <h3 className="font-black text-sm text-black">Toutes les livraisons sont terminées !</h3>
            <p className="text-xs text-neutral-500 font-medium">
              Dès qu’une nouvelle commande est prête en cuisine, elle apparaîtra automatiquement ici.
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const isCash = order.payment_method === 'cash_on_delivery';
            const isPendingAction = actionLoadingId === order.id;

            return (
              <div
                key={order.id}
                className="p-4 bg-white border-3 border-black rounded-3xl shadow-[5px_5px_0px_0px_#000] space-y-3.5"
              >
                {/* En-tête commande */}
                <div className="flex items-start justify-between border-b-2 border-neutral-100 pb-2.5">
                  <div>
                    <span className="text-sm font-black text-black">
                      #{order.order_number}
                    </span>
                    <p className="text-[11px] font-bold text-neutral-500">
                      Client : <strong className="text-black">{order.customer_name}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-black" dir="ltr">
                      {order.total_amount} {order.currency}
                    </span>
                    <div className="mt-0.5">
                      {isCash ? (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFB800] text-black border border-black">
                          💵 Espèces
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#00F59B] text-black border border-black">
                          💳 Déjà Payé (Stripe)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adresse & GPS */}
                <div className="p-3 bg-neutral-50 rounded-2xl border-2 border-black/10 space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-black leading-snug">
                        {order.customer_address || 'Adresse non renseignée'}
                      </p>
                      {order.delivery_notes && (
                        <p className="text-[10px] text-neutral-600 font-medium mt-1 italic">
                          « {order.delivery_notes} »
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Boutons d'action rapides 1-clic */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* 📍 GPS Navigation */}
                    {order.customer_address ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          order.customer_address
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl bg-white border-2 border-black text-black text-[11px] font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000] hover:bg-neutral-50"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ouvrir GPS</span>
                      </a>
                    ) : (
                      <div className="py-2 px-3 rounded-xl bg-neutral-200 text-neutral-400 text-[11px] font-bold text-center">
                        Pas de GPS
                      </div>
                    )}

                    {/* 📞 Appel Téléphonique */}
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="py-2 px-3 rounded-xl bg-white border-2 border-black text-black text-[11px] font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000] hover:bg-neutral-50"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Appeler</span>
                    </a>
                  </div>
                </div>

                {/* Détail des plats */}
                <div className="space-y-1 text-xs font-medium">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-neutral-700">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-bold text-black" dir="ltr">
                        {item.price * item.quantity} {order.currency}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bouton de Validation de la Livraison */}
                <div className="pt-2">
                  {isCash ? (
                    /* Bouton Espèces + 1 Point Fidélité */
                    <button
                      type="button"
                      disabled={isPendingAction}
                      onClick={() => handleCompleteDelivery(order)}
                      className="w-full py-3.5 rounded-2xl bg-[#FFB800] hover:bg-[#ffa700] text-black border-2 border-black text-xs font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 transition-all"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {isPendingAction
                          ? 'Enregistrement...'
                          : `Encaisser ${order.total_amount} ${order.currency} & Livrer (+1 Point)`}
                      </span>
                    </button>
                  ) : (
                    /* Bouton Stripe déjà payé */
                    <button
                      type="button"
                      disabled={isPendingAction}
                      onClick={() => handleCompleteDelivery(order)}
                      className="w-full py-3.5 rounded-2xl bg-[#00F59B] hover:bg-[#00df8d] text-black border-2 border-black text-xs font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isPendingAction ? 'Validation...' : 'Valider la Livraison (Déjà Payé)'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
