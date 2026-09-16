/**
 * lib/services/walletService.ts
 * ─────────────────────────────────────────────────────────────
 * Service centralisé pour la gestion du Portefeuille Client Web (Portail 2 - B2C Wallet).
 * Support de l'identification par EMAIL ou par TÉLÉPHONE au choix du client.
 * Persistance unique (l'utilisateur s'identifie 1 seule fois à la création).
 */

import { supabase } from '@/lib/supabase';
import type { Customer, LoyaltyCard, Merchant, Reward, StampTransaction } from '@/types';

export interface WalletCardWithMerchant extends LoyaltyCard {
  merchant: Merchant;
  rewards: Reward[];
}

export const walletService = {
  /**
   * Récupère ou crée un compte client par son EMAIL ou son TÉLÉPHONE.
   */
  async getOrCreateCustomer(identifier: string, fullName?: string): Promise<Customer> {
    const cleanId = identifier.trim();
    const isEmail = cleanId.includes('@');
    const isLoyaltyCode = /^[a-zA-Z0-9]{3}-?[a-zA-Z0-9]{3}$/.test(cleanId);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
    const isShortId = /^[0-9a-f]{8}$/i.test(cleanId);

    let existingQuery = supabase.from('customers').select('*');
    if (isUuid) {
      existingQuery = existingQuery.eq('id', cleanId);
    } else if (isEmail) {
      existingQuery = existingQuery.eq('email', cleanId.toLowerCase());
    } else if (isLoyaltyCode) {
      let formattedCode = cleanId.toUpperCase();
      if (formattedCode.length === 6 && !formattedCode.includes('-')) {
        formattedCode = `${formattedCode.slice(0, 3)}-${formattedCode.slice(3)}`;
      }
      existingQuery = existingQuery.eq('loyalty_code', formattedCode);
    } else if (isShortId) {
      // Pour chercher par les 8 premiers caractères de l'UUID
      const startUuid = `${cleanId.toLowerCase()}-0000-0000-0000-000000000000`;
      const endUuid = `${cleanId.toLowerCase()}-ffff-ffff-ffff-ffffffffffff`;
      existingQuery = existingQuery.gte('id', startUuid).lte('id', endUuid);
    } else {
      const cleanPhone = cleanId.replace(/\s+/g, '');
      existingQuery = existingQuery.eq('phone', cleanPhone);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      if (fullName && !existing.full_name) {
        await supabase
          .from('customers')
          .update({ full_name: fullName })
          .eq('id', existing.id);
      }
      return existing as Customer;
    }

    if (isLoyaltyCode || isUuid || isShortId) {
      throw new Error('Code de fidélité introuvable. Veuillez vérifier la saisie.');
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const randomStr = Array.from({length: 6}).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    const loyaltyCode = `${randomStr.slice(0,3)}-${randomStr.slice(3)}`;

    // Créer un nouveau client avec email OU téléphone
    const payload: any = {
      full_name: fullName || 'Client VIP',
      loyalty_code: loyaltyCode
    };

    if (isEmail) {
      payload.email = cleanId.toLowerCase();
    } else {
      payload.phone = cleanId.replace(/\s+/g, '');
    }

    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Impossible de créer le compte client: ${error.message}`);
    }

    return newCustomer as Customer;
  },

  /**
   * Récupère toutes les cartes de fidélité du portefeuille d'un client.
   */
  async getCustomerWalletCards(customerId: string): Promise<WalletCardWithMerchant[]> {
    const { data: cards, error } = await supabase
      .from('loyalty_cards')
      .select(`
        *,
        customer:customers(*),
        merchant:merchants(
          *,
          rewards(*)
        )
      `)
      .eq('customer_id', customerId)
      .order('last_visit_at', { ascending: false });

    if (error) {
      console.error('[WalletService] Erreur chargement cartes:', error);
      return [];
    }

    return (cards || []).map((card: any) => ({
      ...card,
      merchant: card.merchant,
      rewards: (card.merchant?.rewards || []).filter((r: Reward) => r.is_active),
    }));
  },

  /**
   * Récupère ou initialise la carte de fidélité d'un client chez un restaurateur spécifique.
   */
  async getMerchantLoyaltyCard(customerId: string, merchantId: string): Promise<WalletCardWithMerchant | null> {
    const { data: card } = await supabase
      .from('loyalty_cards')
      .select(`
        *,
        customer:customers(*),
        merchant:merchants(
          *,
          rewards(*)
        )
      `)
      .eq('customer_id', customerId)
      .eq('merchant_id', merchantId)
      .maybeSingle();

    if (card) {
      return {
        ...card,
        merchant: card.merchant,
        rewards: (card.merchant?.rewards || []).filter((r: Reward) => r.is_active),
      };
    }

    // Si la carte n'existe pas encore chez ce commerçant, l'initialiser
    const { data: newCard, error } = await supabase
      .from('loyalty_cards')
      .insert({
        customer_id: customerId,
        merchant_id: merchantId,
        stamps_count: 1, // Bonus de bienvenue 1er tampon
        total_visits: 1,
        last_visit_at: new Date().toISOString(),
      })
      .select(`
        *,
        customer:customers(*),
        merchant:merchants(
          *,
          rewards(*)
        )
      `)
      .single();

    if (error) {
      console.error('[WalletService] Erreur création carte resto:', error);
      throw new Error(`Erreur création carte: ${error.message}`);
    }

    return {
      ...newCard,
      merchant: newCard.merchant,
      rewards: (newCard.merchant?.rewards || []).filter((r: Reward) => r.is_active),
    };
  },

  /**
   * Ajoute 1 ou plusieurs tampons sur la carte d'un client pour un restaurateur.
   */
  async addStampToCard(merchantId: string, customerId: string, count: number = 1): Promise<{ success: boolean; stampsCount: number }> {
    const card = await this.getMerchantLoyaltyCard(customerId, merchantId);
    if (!card) throw new Error('Carte non trouvée');

    if (card.merchant?.plan_tier === 'basic') {
      throw new Error('Cet établissement est sur la formule Starter (Menu QR seul). Le programme de fidélité nécessite la formule PRO.');
    }

    const newStamps = card.stamps_count + count;
    const newVisits = card.total_visits + 1;

    const { error: updateErr } = await supabase
      .from('loyalty_cards')
      .update({
        stamps_count: newStamps,
        total_visits: newVisits,
        last_visit_at: new Date().toISOString(),
      })
      .eq('id', card.id);

    if (updateErr) throw new Error(updateErr.message);

    await supabase.from('stamp_transactions').insert({
      loyalty_card_id: card.id,
      merchant_id: merchantId,
      stamps_change: count,
      note: 'Tampon ajouté en caisse',
    });

    return { success: true, stampsCount: newStamps };
  },

  /**
   * Réclame/Utilise une récompense et déduit le nombre de tampons requis.
   */
  async claimReward(merchantId: string, customerId: string, rewardId: string, stampsRequired: number): Promise<{ success: boolean; remainingStamps: number }> {
    const card = await this.getMerchantLoyaltyCard(customerId, merchantId);
    if (!card) throw new Error('Carte non trouvée');

    if (card.merchant?.plan_tier === 'basic') {
      throw new Error('Cet établissement est sur la formule Starter (Menu QR seul). Le programme de fidélité nécessite la formule PRO.');
    }

    if (card.stamps_count < stampsRequired) {
      throw new Error('Nombre de tampons insuffisant');
    }

    const newStamps = card.stamps_count - stampsRequired;

    const { error: updateErr } = await supabase
      .from('loyalty_cards')
      .update({ stamps_count: newStamps })
      .eq('id', card.id);

    if (updateErr) throw new Error(updateErr.message);

    await supabase.from('stamp_transactions').insert({
      loyalty_card_id: card.id,
      merchant_id: merchantId,
      stamps_change: -stampsRequired,
      reward_id: rewardId,
      note: 'Récompense débloquée et réclamée',
    });

    return { success: true, remainingStamps: newStamps };
  },
};
