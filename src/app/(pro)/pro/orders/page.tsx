'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';
import { Order, OrderStatus } from '@/lib/types/database';
import {
  ShoppingBag,
  Bell,
  BellOff,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Truck,
  ChefHat,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Volume2,
  VolumeX,
  MessageCircle,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import ProBottomNav from '@/components/ProBottomNav';

export default function ProOrdersPage() {
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const { merchant, isLoading } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'preparing' | 'in_delivery' | 'delivered'>('all');
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [ordersPaused, setOrdersPaused] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialisation et récupération des commandes
  useEffect(() => {
    if (!merchant?.id) return;
    setOrdersPaused(!!merchant.orders_paused);
    fetchOrders();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel(`merchant-orders-${merchant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `merchant_id=eq.${merchant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders((prev) => [newOrder, ...prev]);
            if (newOrder.order_status === 'pending') {
              playAlarm();
              showToast(`Nouvelle commande reçue ! (#${newOrder.order_number})`, 'success');
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Order;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      stopAlarm();
      supabase.removeChannel(channel);
    };
  }, [merchant?.id]);

  // Alarme sonore continue via Web Audio API (fonctionne sans fichier audio externe)
  function playAlarm() {
    setIsAlarmPlaying(true);
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }

    const beep = () => {
      try {
        if (!audioContextRef.current) return;
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // Note A5
        gain.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.4);
        osc.start();
        osc.stop(audioContextRef.current.currentTime + 0.4);
      } catch (e) {
        console.error('Audio beep error:', e);
      }
    };

    beep();
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = setInterval(beep, 1200);
  }

  function stopAlarm() {
    setIsAlarmPlaying(false);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }

  async function fetchOrders() {
    if (!merchant?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders((data as Order[]) || []);

      // Si une commande est en attente, sonner
      const hasPending = (data || []).some((o: Order) => o.order_status === 'pending');
      if (hasPending) {
        playAlarm();
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }

  // Changement de statut de commande
  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
      setUpdatingOrderId(orderId);
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('merchant_id', merchant?.id);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );

      // Si on accepte ou refuse, vérifier s'il reste des pending pour arrêter la sonnerie
      const remainingPending = orders.filter(
        (o) => o.id !== orderId && o.order_status === 'pending'
      );
      if (remainingPending.length === 0) {
        stopAlarm();
      }

      showToast(`Statut mis à jour : ${newStatus}`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de la mise à jour.', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  }

  // Pause / Reprise des commandes (Rush cuisine)
  async function toggleOrdersPause() {
    if (!merchant?.id) return;
    try {
      const nextState = !ordersPaused;
      const { error } = await supabase
        .from('merchants')
        .update({ orders_paused: nextState })
        .eq('id', merchant.id);

      if (error) throw error;
      setOrdersPaused(nextState);
      merchant.orders_paused = nextState;
      showToast(
        nextState
          ? 'Prise de commande suspendue (Mode Pause Cuisine actif).'
          : 'Prise de commande réactivée !',
        'success'
      );
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur.', 'error');
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.order_status === activeTab;
  });

  const pendingCount = orders.filter((o) => o.order_status === 'pending').length;
  const preparingCount = orders.filter((o) => o.order_status === 'preparing').length;
  const inDeliveryCount = orders.filter((o) => o.order_status === 'in_delivery').length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black pb-28 sm:pb-24 font-sans" dir={dir}>
      {/* 🚨 Wrapper Header Flottant (Alarme + Navigation + Filtres) */}
      <div className="sticky top-0 z-40 bg-white border-b-2 border-black shadow-sm">
        {/* Alerte sonore active bandeau flottant */}
        {isAlarmPlaying && (
          <div className="bg-[#FFB800] border-b-2 border-black p-2.5 sm:p-3.5 px-3 sm:px-4 flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2 min-w-0">
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 animate-bounce" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-tight sm:tracking-wider text-black truncate">
                🔔 Nouvelle commande reçue !
              </span>
            </div>
            <button
              onClick={stopAlarm}
              className="neo-pill-btn bg-black text-white hover:bg-neutral-800 text-xs py-1.5 sm:py-2 px-3 sm:px-4 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#fff] shrink-0"
            >
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{t('sound_alert_stop', 'Arrêter la sonnerie')}</span>
              <span className="xs:hidden">Stop</span>
            </button>
          </div>
        )}

        {/* Header Bar */}
        <header className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/pro/dashboard"
              className="p-2 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_#000] transition shrink-0"
              title="Retour au Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-black shrink-0" />
                <h1 className="text-base sm:text-2xl font-black uppercase tracking-tight text-black truncate">
                  {t('live_orders_title', 'Commandes Directes')}
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-500 font-bold truncate">
                {merchant?.business_name || 'Restaurant'} • {orders.length} commande(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Rush / Pause Toggle */}
            <button
              onClick={toggleOrdersPause}
              className={`neo-pill-btn text-xs py-2 sm:py-2.5 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 shadow-[2px_2px_0px_0px_#000] transition ${
                ordersPaused
                  ? 'bg-[#00F59B] text-black hover:bg-emerald-400'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {ordersPaused ? (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('resume_orders', 'Reprendre les commandes')}</span>
                  <span className="sm:hidden">Reprendre</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('pause_orders', 'Pause Cuisine (Rush)')}</span>
                  <span className="sm:hidden">Pause Rush</span>
                </>
              )}
            </button>

            <button
              onClick={fetchOrders}
              className="p-2 sm:p-2.5 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_#000] transition shrink-0"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Tab Filters Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-2 border-t border-neutral-100">
          <button
            onClick={() => setActiveTab('all')}
            className={`text-xs font-black px-3 py-1.5 rounded-xl border-2 border-black whitespace-nowrap transition shrink-0 shadow-[2px_2px_0px_0px_#000] ${
              activeTab === 'all' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            Toutes ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`text-xs font-black px-3 py-1.5 rounded-xl border-2 border-black whitespace-nowrap transition shrink-0 shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#FFB800] text-black'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <span>{t('order_status_pending', 'Nouvelles')}</span>
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-black">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('preparing')}
            className={`text-xs font-black px-3 py-1.5 rounded-xl border-2 border-black whitespace-nowrap transition shrink-0 shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 ${
              activeTab === 'preparing'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <span>{t('order_status_preparing', 'En préparation')}</span>
            {preparingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-black">
                {preparingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('in_delivery')}
            className={`text-xs font-black px-3 py-1.5 rounded-xl border-2 border-black whitespace-nowrap transition shrink-0 shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 ${
              activeTab === 'in_delivery'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <span>{t('order_status_in_delivery', 'En livraison')}</span>
            {inDeliveryCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-black">
                {inDeliveryCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`text-xs font-black px-3 py-1.5 rounded-xl border-2 border-black whitespace-nowrap transition shrink-0 shadow-[2px_2px_0px_0px_#000] ${
              activeTab === 'delivered'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            {t('order_status_delivered', 'Livrées')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-5 sm:pt-8">
        {ordersPaused && (
          <div className="neo-box p-4 bg-red-100 border-3 border-black mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PauseCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="text-xs font-black uppercase text-red-900">
                  {t('orders_paused_alert', 'La prise de commande est temporairement suspendue par le restaurant.')}
                </p>
                <p className="text-[11px] text-red-800 font-bold">
                  Vos clients voient un message leur demandant de patienter.
                </p>
              </div>
            </div>
            <button
              onClick={toggleOrdersPause}
              className="neo-pill-btn bg-black text-white text-xs py-2 px-4 shadow-[2px_2px_0px_0px_#fff]"
            >
              {t('resume_orders', 'Reprendre')}
            </button>
          </div>
        )}

        {/* Orders Feed */}
        {filteredOrders.length === 0 ? (
          <div className="neo-box p-12 text-center bg-white border-dashed border-4 border-neutral-300 my-8 space-y-3">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
            <p className="text-base font-black text-neutral-700 uppercase">
              {t('no_active_orders', 'Aucune commande en attente pour le moment.')}
            </p>
            <p className="text-xs text-neutral-500 font-bold">
              Dès qu'un client passe commande, elle apparaîtra ici avec une alerte sonore continue.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const isPending = order.order_status === 'pending';
              const isPreparing = order.order_status === 'preparing';
              const isInDelivery = order.order_status === 'in_delivery';
              const isDelivered = order.order_status === 'delivered';
              const isRejected = order.order_status === 'rejected';

              return (
                <div
                  key={order.id}
                  className={`neo-box p-5 flex flex-col justify-between transition-all bg-white ${
                    isPending
                      ? 'border-4 border-black bg-amber-50 shadow-[6px_6px_0px_0px_#FFB800] ring-2 ring-[#FFB800]'
                      : 'border-3 border-black shadow-[4px_4px_0px_0px_#000]'
                  }`}
                >
                  {/* Top Bar: Order Number, Time & Status Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-3 border-b-2 border-neutral-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-black">
                            #{order.order_number || order.id.slice(0, 6)}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black ${
                              order.order_type === 'delivery'
                                ? 'bg-purple-100 text-purple-900'
                                : order.order_type === 'takeaway'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {order.order_type === 'delivery'
                              ? t('order_type_delivery', 'Livraison')
                              : order.order_type === 'takeaway'
                              ? t('order_type_takeaway', 'À emporter')
                              : t('order_type_dine_in', 'Sur place')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-bold mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div>
                        {isPending && (
                          <span className="bg-[#FFB800] border border-black text-black text-[10px] font-black uppercase px-2 py-1 rounded-full animate-pulse">
                            {t('order_status_pending', 'À Traiter')}
                          </span>
                        )}
                        {isPreparing && (
                          <span className="bg-blue-500 border border-black text-white text-[10px] font-black uppercase px-2 py-1 rounded-full">
                            {t('order_status_preparing', 'En Cuisine')}
                          </span>
                        )}
                        {isInDelivery && (
                          <span className="bg-purple-600 border border-black text-white text-[10px] font-black uppercase px-2 py-1 rounded-full">
                            {t('order_status_in_delivery', 'En Livraison')}
                          </span>
                        )}
                        {isDelivered && (
                          <span className="bg-emerald-500 border border-black text-white text-[10px] font-black uppercase px-2 py-1 rounded-full">
                            {t('order_status_delivered', 'Livrée')}
                          </span>
                        )}
                        {isRejected && (
                          <span className="bg-red-500 border border-black text-white text-[10px] font-black uppercase px-2 py-1 rounded-full">
                            {t('order_status_rejected', 'Refusée')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="py-3 border-b border-neutral-200 space-y-1.5 text-xs">
                      <div className="font-black text-black flex items-center justify-between">
                        <span>{order.customer_name}</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${order.customer_phone}`}
                            className="p-1 rounded-lg border border-black bg-neutral-100 hover:bg-neutral-200 text-black font-bold flex items-center gap-1 text-[11px]"
                            title="Appeler"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{order.customer_phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-lg border border-black bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {order.customer_address && (
                        <div className="flex items-start gap-1.5 text-neutral-600 text-[11px] font-bold">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.customer_address}</span>
                        </div>
                      )}

                      {order.delivery_notes && (
                        <div className="p-2 rounded-lg bg-amber-100/60 border border-amber-300 text-[11px] font-bold text-amber-900">
                          <span className="font-black">Note :</span> {order.delivery_notes}
                        </div>
                      )}
                    </div>

                    {/* Order Items List */}
                    <div className="py-3 space-y-1.5 text-xs">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between font-bold">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-black text-white text-[11px] font-black flex items-center justify-center">
                              {item.quantity}x
                            </span>
                            <span className="text-black">{item.name}</span>
                          </div>
                          <span className="font-mono text-neutral-700">
                            {(item.price * item.quantity).toFixed(2)} {order.currency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Price Total & Action Buttons */}
                  <div className="pt-3 border-t-2 border-black space-y-3">
                    <div className="flex items-center justify-between text-sm font-black">
                      <div className="text-[11px] font-bold text-neutral-500">
                        {order.payment_method === 'cash_on_delivery' ? (
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-black">
                            💵 {t('payment_cash_door', 'À la porte (Espèces)')}
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 font-black">
                            💳 {t('payment_card_online', 'Payé en ligne')}
                          </span>
                        )}
                      </div>
                      <div className="text-base font-black text-black">
                        {Number(order.total_amount).toFixed(2)} {order.currency}
                      </div>
                    </div>

                    {/* Dynamic Action Buttons according to state */}
                    <div className="space-y-2">
                      {isPending && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'accepted')}
                            disabled={updatingOrderId === order.id}
                            className="neo-pill-btn bg-[#00F59B] hover:bg-emerald-400 text-black min-h-[44px] py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:scale-95 transition"
                          >
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{t('accept_order', 'Accepter')}</span>
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'rejected')}
                            disabled={updatingOrderId === order.id}
                            className="neo-pill-btn bg-red-500 hover:bg-red-600 text-white min-h-[44px] py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:scale-95 transition"
                          >
                            <XCircle className="w-4 h-4 shrink-0" />
                            <span>{t('refuse_order', 'Refuser')}</span>
                          </button>
                        </div>
                      )}

                      {order.order_status === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          disabled={updatingOrderId === order.id}
                          className="w-full neo-pill-btn bg-blue-500 hover:bg-blue-600 text-white min-h-[44px] py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:scale-95 transition"
                        >
                          <ChefHat className="w-4 h-4 shrink-0" />
                          <span>{t('mark_preparing', 'Lancer la préparation')}</span>
                        </button>
                      )}

                      {isPreparing && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'in_delivery')}
                          disabled={updatingOrderId === order.id}
                          className="w-full neo-pill-btn bg-purple-600 hover:bg-purple-700 text-white min-h-[44px] py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:scale-95 transition"
                        >
                          <Truck className="w-4 h-4 shrink-0" />
                          <span>{t('mark_in_delivery', 'Départ en livraison')}</span>
                        </button>
                      )}

                      {isInDelivery && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          disabled={updatingOrderId === order.id}
                          className="w-full neo-pill-btn bg-emerald-500 hover:bg-emerald-600 text-white min-h-[44px] py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:scale-95 transition"
                        >
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{t('mark_delivered', 'Marquer comme livrée')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <ProBottomNav />
    </div>
  );
}
