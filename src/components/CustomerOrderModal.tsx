'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { formatPrice } from '@/lib/currency';
import type { MenuItem } from '@/types';
import {
  X,
  ShoppingBag,
  Truck,
  Store,
  MapPin,
  Phone,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Banknote,
  MessageCircle,
  FileText
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export interface OrderCartItem {
  item: MenuItem;
  quantity: number;
}

interface CustomerOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: any;
  cart: OrderCartItem[];
  totalCartPrice: number;
  onOrderSuccess: (order: any) => void;
}

export default function CustomerOrderModal({
  isOpen,
  onClose,
  merchant,
  cart,
  totalCartPrice,
  onOrderSuccess,
}: CustomerOrderModalProps) {
  const { t, dir, language } = useLanguage();
  const isRtl = dir === 'rtl';

  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState(''); // Honeypot anti-bot

  // Payment mode: 'cash_on_delivery' or 'card_online'
  const defaultPayment = merchant?.delivery_payment_mode === 'online_only' ? 'card_online' : 'cash_on_delivery';
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'card_online'>(defaultPayment);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  if (!isOpen) return null;

  // Calculs financiers
  const currency = merchant?.currency || 'EUR';
  const minOrderAmount = Number(merchant?.min_order_amount) || 0;
  const deliveryFee = orderType === 'delivery' ? (Number(merchant?.delivery_fee) || 0) : 0;
  const finalTotal = totalCartPrice + deliveryFee;

  const isBelowMinOrder = orderType === 'delivery' && minOrderAmount > 0 && totalCartPrice < minOrderAmount;
  const isOrdersPaused = !!merchant?.orders_paused;

  // Vérification des horaires côté client (indication visuelle)
  let isStoreClosed = false;
  let storeHoursLabel = '';
  if (merchant?.delivery_hours) {
    try {
      const hours = typeof merchant.delivery_hours === 'string'
        ? JSON.parse(merchant.delivery_hours)
        : merchant.delivery_hours;
      if (hours?.open && hours?.close) {
        storeHoursLabel = `${hours.open} - ${hours.close}`;
      }
    } catch {
      // ignore
    }
  }

  const getWhatsAppMessage = (orderNum?: string) => {
    const num = orderNum || (confirmedOrder ? confirmedOrder.order_number : `ORD-${Math.floor(1000 + Math.random() * 9000)}`);
    const itemsText = cart.map((ci) => `• ${ci.quantity}x ${ci.item.name} (${formatPrice(ci.item.price * ci.quantity, currency, language)})`).join('\n');
    const msg = `*NOUVELLE COMMANDE #${num}*\n` +
      `🍽️ Restaurant : ${merchant?.business_name || 'MenuFid'}\n` +
      `👤 Client : ${customerName.trim() || 'Client'}\n` +
      `📞 Tél : ${customerPhone.trim() || 'Non spécifié'}\n` +
      (orderType === 'delivery' ? `📍 Adresse livraison : ${customerAddress.trim() || 'Non spécifiée'}\n` : `🏪 Mode : À emporter / Retrait comptoir\n`) +
      (deliveryNotes.trim() ? `📝 Note : ${deliveryNotes.trim()}\n` : '') +
      `💳 Règlement : ${paymentMethod === 'cash_on_delivery' ? 'À la livraison (Espèces)' : 'En ligne'}\n\n` +
      `*Détails du panier :*\n${itemsText}\n\n` +
      (deliveryFee > 0 ? `🛵 Livraison : ${formatPrice(deliveryFee, currency, language)}\n` : '') +
      `💰 *TOTAL À RÉGLER : ${formatPrice(finalTotal, currency, language)}*`;
    return encodeURIComponent(msg);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('menufid_customer_phone');
      const savedName = localStorage.getItem('menufid_customer_name');
      const savedAddress = localStorage.getItem('menufid_customer_address');
      if (savedPhone) setCustomerPhone(savedPhone);
      if (savedName) setCustomerName(savedName);
      if (savedAddress) setCustomerAddress(savedAddress);
    }
  }, []);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isOrdersPaused) {
      setErrorMsg(t('orders_paused_alert', 'La prise de commande est temporairement suspendue par le restaurant.'));
      return;
    }

    if (isBelowMinOrder) {
      setErrorMsg(`${t('min_basket_not_reached', 'Le montant minimum de commande est de')} ${minOrderAmount} ${currency}.`);
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Veuillez renseigner votre nom et numéro de téléphone.');
      return;
    }

    if (orderType === 'delivery' && !customerAddress.trim()) {
      setErrorMsg("L'adresse de livraison est obligatoire pour les commandes à domicile.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.id,
          merchantSlug: merchant.slug,
          items: cart.map((ci) => ({
            itemId: ci.item.id,
            quantity: ci.quantity,
          })),
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: orderType === 'delivery' ? customerAddress.trim() : null,
          deliveryNotes: deliveryNotes.trim() || null,
          orderType,
          paymentMethod,
          websiteHoneypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la prise de commande.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('menufid_customer_phone', customerPhone.trim());
        localStorage.setItem('menufid_customer_name', customerName.trim());
        if (customerAddress.trim()) {
          localStorage.setItem('menufid_customer_address', customerAddress.trim());
        }
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setConfirmedOrder(data.order);
      onOrderSuccess(data.order);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Impossible de transmettre la commande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      dir={dir}
    >
      <div className="relative w-full max-w-lg bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_#000] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b-2 border-black flex items-center justify-between bg-[#FFB800]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-black" />
            <h2 className="text-base sm:text-lg font-black uppercase text-black tracking-tight">
              {confirmedOrder ? t('order_success_title', 'Commande Confirmée !') : t('cart_summary', 'Finaliser ma commande')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-black bg-white hover:bg-neutral-100 flex items-center justify-center shadow-[2px_2px_0px_0px_#000] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {confirmedOrder ? (
            /* ── SUCCESS SCREEN ── */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#00F59B] border-3 border-black mx-auto flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                <CheckCircle2 className="w-9 h-9 text-black" />
              </div>
              <div>
                <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-black text-[#FFB800]">
                  #{confirmedOrder.order_number}
                </span>
                <h3 className="text-2xl font-black text-black mt-2">
                  {t('order_sent_success', 'Votre commande a été transmise à la cuisine !')}
                </h3>
                <p className="text-xs text-neutral-600 font-bold mt-1">
                  {t('order_being_prepared', 'Votre commande est en cours de traitement par le restaurant.')}
                </p>
              </div>

              <div className="neo-box p-4 bg-neutral-50 text-left space-y-2 text-xs font-bold">
                <div className="flex justify-between border-b border-neutral-200 pb-1.5">
                  <span className="text-neutral-500">{t('order_mode_label', 'Mode :')}</span>
                  <span className="font-black">
                    {confirmedOrder.order_type === 'delivery' ? t('order_mode_delivery', 'Livraison à domicile') : t('order_mode_takeaway', 'À emporter')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-1.5">
                  <span className="text-neutral-500">{t('order_payment_label', 'Règlement :')}</span>
                  <span className="font-black">
                    {confirmedOrder.payment_method === 'cash_on_delivery'
                      ? t('order_cash_door', '💵 À la porte (Espèces)')
                      : t('order_card_online', '💳 Carte Bancaire en ligne')}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black pt-1">
                  <span>{t('order_total', 'Total à régler :')}</span>
                  <span className="font-mono text-base">
                    {formatPrice(confirmedOrder.total_amount, currency, language)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <a
                  href={`/wallet/${merchant?.slug || ''}?tab=orders`}
                  className="w-full neo-pill-btn bg-[#FFB800] hover:bg-amber-400 text-black py-3.5 text-xs font-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000]"
                >
                  <Truck className="w-4 h-4" />
                  <span>{t('orders_tracking_title', 'Suivi de Mes Commandes')} 🛵</span>
                </a>

                <a
                  href={`https://wa.me/?text=${getWhatsAppMessage(confirmedOrder.order_number)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full neo-pill-btn bg-[#25D366] hover:bg-emerald-500 text-black py-3.5 text-xs font-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('order_send_whatsapp', 'Envoyer la confirmation sur WhatsApp')}</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full neo-pill-btn-white py-3 text-xs font-black"
                >
                  {t('order_close_menu', 'Fermer et retourner au menu')}
                </button>
              </div>
            </div>
          ) : (
            /* ── ORDER FORM ── */
            <form id="customer-order-form" onSubmit={handleSubmitOrder} className="space-y-5">
              {/* Alerte Pause active */}
              {isOrdersPaused && (
                <div className="p-3.5 rounded-xl border-2 border-black bg-red-100 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-black text-red-900">
                    {t('orders_paused_alert', 'La prise de commande est temporairement suspendue par le restaurant.')}
                  </p>
                </div>
              )}

              {/* Erreur API avec secours WhatsApp */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl border-2 border-black bg-rose-100 text-rose-900 text-xs font-bold space-y-2">
                  <p className="font-black">⚠️ {errorMsg}</p>
                  <a
                    href={`https://wa.me/?text=${getWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366] text-black rounded-xl border border-black font-black text-xs shadow-[2px_2px_0px_0px_#000]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t('order_whatsapp_fallback', 'Transmettre directement la commande sur WhatsApp')}</span>
                  </a>
                </div>
              )}

              {/* Sélecteur Type de Commande : Livraison vs À emporter */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5">
                  {t('choose_order_mode', 'Mode de commande')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`p-3 rounded-2xl border-2 border-black font-black text-xs flex items-center justify-center gap-2 transition shadow-[2px_2px_0px_0px_#000] ${
                      orderType === 'delivery'
                        ? 'bg-[#FFB800] text-black'
                        : 'bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>{t('order_type_delivery', 'Livraison à domicile')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`p-3 rounded-2xl border-2 border-black font-black text-xs flex items-center justify-center gap-2 transition shadow-[2px_2px_0px_0px_#000] ${
                      orderType === 'takeaway'
                        ? 'bg-[#FFB800] text-black'
                        : 'bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>{t('order_type_takeaway', 'À emporter')}</span>
                  </button>
                </div>
              </div>

              {/* Alerte Panier Minimum */}
              {isBelowMinOrder && (
                <div className="p-3.5 rounded-xl border-2 border-black bg-amber-50 text-amber-950 text-xs font-bold space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{t('order_min_not_met_title', 'Panier minimum non atteint')}</span>
                  </div>
                  <p className="text-[11px]">
                    {t('min_basket_not_reached', 'Le montant minimum de commande est de')}{' '}
                    <span className="font-black">{formatPrice(minOrderAmount, currency, language)}</span>. 
                    Il vous manque encore <span className="font-black">{formatPrice(minOrderAmount - totalCartPrice, currency, language)}</span> {t('order_min_not_met_suffix', 'pour commander en livraison.')}
                  </p>
                </div>
              )}

              {/* Coordonnées Client */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-black mb-1">
                      {t('order_full_name_label', 'Nom complet *')}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={t('order_name_placeholder', 'Votre nom complet')}
                        className="w-full neo-input text-xs pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-black mb-1">
                      {t('order_phone_label', 'Numéro de téléphone *')}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder={t('order_phone_placeholder', 'ex: 06 12 34 56 78')}
                        className="w-full neo-input text-xs pl-9 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {orderType === 'delivery' && (
                  <div>
                    <label className="block text-[11px] font-black uppercase text-black mb-1">
                      {t('delivery_address', 'Adresse de livraison')} *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-red-500 absolute left-3 top-3" />
                      <textarea
                        required
                        rows={2}
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder={t('order_address_placeholder', 'Rue, numéro, bâtiment, étage, code d\'accès')}
                        className="w-full neo-input text-xs pl-9 resize-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-black uppercase text-black mb-1">
                    {t('order_notes', 'Instructions / Digicode')}
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder={t('order_notes_placeholder', 'Instructions pour la cuisine ou le livreur')}
                      className="w-full neo-input text-xs pl-9"
                    />
                  </div>
                </div>

                {/* Champ Honeypot invisible pour piéger les bots */}
                <input
                  type="text"
                  name="website_honeypot"
                  value={websiteHoneypot}
                  onChange={(e) => setWebsiteHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Mode de Paiement */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5">
                  {t('choose_payment_mode', 'Mode de paiement')}
                </label>
                <div className="space-y-2">
                  {merchant?.delivery_payment_mode !== 'online_only' && (
                    <label
                      className={`p-3 rounded-2xl border-2 border-black flex items-center justify-between cursor-pointer transition shadow-[2px_2px_0px_0px_#000] ${
                        paymentMethod === 'cash_on_delivery' ? 'bg-amber-50 border-black' : 'bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cash_on_delivery'}
                          onChange={() => setPaymentMethod('cash_on_delivery')}
                          className="accent-black w-4 h-4"
                        />
                        <div>
                          <p className="text-xs font-black text-black">
                            💵 {t('payment_cash_door', 'Paiement à la porte (Espèces)')}
                          </p>
                          <p className="text-[10px] text-neutral-500 font-bold">
                            {t('order_payment_cash_desc', 'Réglez directement au livreur ou au comptoir')}
                          </p>
                        </div>
                      </div>
                      <Banknote className="w-5 h-5 text-emerald-600" />
                    </label>
                  )}

                  {merchant?.delivery_payment_mode !== 'cash_on_delivery' && (
                    <label
                      className={`p-3 rounded-2xl border-2 border-black flex items-center justify-between cursor-pointer transition shadow-[2px_2px_0px_0px_#000] ${
                        paymentMethod === 'card_online' ? 'bg-amber-50 border-black' : 'bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'card_online'}
                          onChange={() => setPaymentMethod('card_online')}
                          className="accent-black w-4 h-4"
                        />
                        <div>
                          <p className="text-xs font-black text-black">
                            💳 {t('payment_card_online', 'Paiement CB en ligne')}
                          </p>
                          <p className="text-[10px] text-neutral-500 font-bold">
                            {t('order_payment_card_desc', 'Transaction sécurisée par Stripe')}
                          </p>
                        </div>
                      </div>
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </label>
                  )}
                </div>
              </div>

              {/* Récapitulatif du total */}
              <div className="p-4 rounded-2xl bg-neutral-100 border-2 border-black space-y-2 text-xs font-bold">
                <div className="flex justify-between text-neutral-600">
                  <span>{t('order_subtotal', 'Sous-total')} ({cart.reduce((s, c) => s + c.quantity, 0)} plats)</span>
                  <span className="font-mono font-black text-black">
                    {formatPrice(totalCartPrice, currency, language)}
                  </span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between text-neutral-600">
                    <span>{t('delivery_fee', 'Frais de livraison')}</span>
                    <span className="font-mono font-black text-black">
                      {deliveryFee > 0 ? formatPrice(deliveryFee, currency, language) : t('order_delivery_free', 'Gratuit')}
                    </span>
                  </div>
                )}
                <div className="border-t-2 border-black pt-2 flex justify-between items-center text-sm font-black text-black">
                  <span>{t('order_total', 'Total à régler')}</span>
                  <span className="font-mono text-lg text-black">
                    {formatPrice(finalTotal, currency, language)}
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Sticky Footer (Always visible & accessible across all mobile devices & foldables) */}
        {!confirmedOrder && (
          <div className="shrink-0 p-3.5 sm:p-4 border-t-2 border-black bg-white pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))]">
            <button
              type="submit"
              form="customer-order-form"
              disabled={loading || isOrdersPaused || isBelowMinOrder}
              className="w-full neo-pill-btn bg-[#00F59B] hover:bg-emerald-400 text-black py-3.5 sm:py-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Spinner size={20} className="text-black" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {t('order_now', 'Commander maintenant')} • {formatPrice(finalTotal, currency, language)}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
