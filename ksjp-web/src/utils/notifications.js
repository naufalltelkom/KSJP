import {
  fetchVapidPublicKey,
  sendTestWebPushApi,
  subscribeWebPushApi,
} from '../services/api';

/**
 * Helper notifikasi real-time & Web Push (VAPID) untuk Android Chrome/PWA dan iOS 16.4+ PWA.
 */

export function getNotificationStatus() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return window.Notification.permission;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
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
    new window.Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

export async function registerWebPushSubscription() {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return false;
  }

  try {
    const reg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);
    if (!reg?.pushManager) return false;

    const keyRes = await fetchVapidPublicKey().catch(() => null);
    const publicKey = keyRes?.public_key;
    if (!publicKey) return false;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const json = sub.toJSON();
    if (!json?.endpoint || !json?.keys?.p256dh || !json?.keys?.auth) {
      return false;
    }

    await subscribeWebPushApi({
      endpoint: json.endpoint,
      keys: json.keys,
      content_encoding: 'aes128gcm',
    });
    return true;
  } catch {
    return false;
  }
}

export async function syncExistingPushSubscription() {
  if (getNotificationStatus() !== 'granted') return false;
  return registerWebPushSubscription();
}

export async function requestOsNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  const result = await window.Notification.requestPermission();
  if (result === 'granted') {
    await registerWebPushSubscription();
    await showOsPopupNotification(
      'Notifikasi Real-Time KSJP Aktif',
      'Perangkat Android / iOS Anda kini terhubung untuk menerima push jadwal & agenda secara langsung.',
      'ksjp-notif-activated'
    );
  }
  return result;
}

export async function triggerServerPushTest() {
  const subscribed = await registerWebPushSubscription();
  if (subscribed) {
    const res = await sendTestWebPushApi().catch(() => null);
    if (res?.sent > 0) {
      return { via: 'webpush', ok: true };
    }
  }
  const localOk = await showOsPopupNotification(
    'Tes Notifikasi KSJP Stematel',
    'Notifikasi pop-up berhasil tampil di perangkat Anda.',
    `ksjp-test-${Date.now()}`
  );
  return { via: 'local', ok: localOk };
}
