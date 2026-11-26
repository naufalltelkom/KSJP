/**
 * Helper notifikasi pop-up OS untuk Android Chrome/PWA dan iOS 16.4+ Home Screen PWA.
 */

export function getNotificationStatus() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return window.Notification.permission;
}

export async function showOsPopupNotification(title, body, tag = 'ksjp-popup') {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (window.Notification.permission !== 'granted') {
    return false;
  }

  const options = {
    body: body || 'Pembaruan jadwal atau agenda SMK Telkom Purwokerto.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag,
    renotify: true,
    vibrate: [150, 80, 150],
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.showNotification) {
        await reg.showNotification(title, options);
        return true;
      }
      const ready = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((resolve) => setTimeout(() => resolve(null), 1500)),
      ]);
      if (ready?.showNotification) {
        await ready.showNotification(title, options);
        return true;
      }
    }
    // Fallback untuk browser desktop jika SW belum aktif
    new window.Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

export async function requestOsNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  const result = await window.Notification.requestPermission();
  if (result === 'granted') {
    await showOsPopupNotification(
      'Notifikasi Pop-up KSJP Aktif',
      'Pengingat pergantian jam, Jadwal Momentum, dan agenda kalender akan muncul otomatis.',
      'ksjp-notif-activated'
    );
  }
  return result;
}
