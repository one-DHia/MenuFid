import crypto from 'crypto';

const AUTH_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'menufid_driver_secret_key_2026';

/**
 * Hache un mot de passe avec sel cryptographique aléatoire de 16 octets via Scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Vérifie un mot de passe en temps constant (protection contre les attaques temporelles)
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Crée un jeton de session signé HMAC pour le livreur (durée de validité 24 heures)
 */
export function createDriverSessionToken(payload: {
  driverId: string;
  merchantId: string;
  name: string;
  username: string;
}): string {
  const data = {
    ...payload,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
  };
  const jsonStr = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(jsonStr)
    .digest('base64url');

  return `${jsonStr}.${signature}`;
}

/**
 * Vérifie et décode un jeton de session livreur
 */
export function verifyDriverSessionToken(token: string): {
  driverId: string;
  merchantId: string;
  name: string;
  username: string;
} | null {
  try {
    if (!token) return null;
    const [jsonStr, signature] = token.split('.');
    if (!jsonStr || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(jsonStr)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(jsonStr, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      return null; // Expiré
    }

    return {
      driverId: payload.driverId,
      merchantId: payload.merchantId,
      name: payload.name,
      username: payload.username,
    };
  } catch {
    return null;
  }
}
