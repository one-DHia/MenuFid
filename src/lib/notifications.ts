/**
 * lib/notifications.ts
 * ─────────────────────────────────────────────────────────────
 * Gestionnaire de Notifications Web Push & Mobile du navigateur.
 * Permet de demander la permission et d'afficher des notifications
 * push instantanées sur mobile / desktop (ex. lors d'un scan ou d'une visite).
 */

/** Demande la permission de notification push au navigateur / mobile */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/** Envoie une notification Push locale sur le mobile / ordinateur */
export function sendLocalPushNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch {
      // Ignorer si les notifications sont bloquées sur l'appareil
    }
  }
}
