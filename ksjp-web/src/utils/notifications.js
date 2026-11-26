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

export async function triggerServerPushTest(mode = 'default') {
  const subscribed = await registerWebPushSubscription();
  if (subscribed) {
    const res = await sendTestWebPushApi(mode).catch(() => null);
    if (res?.sent > 0) {
      return { via: 'webpush', ok: true };
    }
  }

  const fallback =
    mode === 'jam_masuk'
      ? {
          title: 'Pengingat Jam Masuk',
          body: '10 menit lagi jam masuk / sesi 1 mulai (07:00 WIB): Tadarus • Ruang B.2.2.',
        }
      : mode === 'segera_selesai'
        ? {
            title: 'Sebentar lagi selesai pelajaran Bahasa Indonesia',
            body: 'Sebentar lagi selesai pelajaran Bahasa Indonesia (10 menit lagi, pukul 14:00 WIB). Berikutnya: Kreativitas, Inovasi, dan Kewirausahaan (Ruang RPS SEL).',
          }
        : mode === 'pergantian'
          ? {
              title: 'Pergantian Pelajaran dan Ruangan',
              body: 'Pergantian Pelajaran dan Ruangan dalam 5 menit (14:00 WIB): Kreativitas, Inovasi, dan Kewirausahaan • Ruang RPS SEL • Guru: Tutut Destria Eliana.',
            }
          : mode === 'sesi_terakhir'
            ? {
                title: 'Sesi Terakhir Akan Selesai',
                body: 'Sesi terakhir (Ekskul Prestasi atau Ekskul Sentra) akan selesai dalam 10 menit (jam pulang pukul 16:00 WIB).',
              }
            : {
                title: 'Tes Notifikasi KSJP Stematel',
                body: 'Notifikasi pop-up berhasil tampil di perangkat Anda.',
              };

  const localOk = await showOsPopupNotification(
    fallback.title,
    fallback.body,
    `ksjp-test-${mode}-${Date.now()}`
  );
  return { via: 'local', ok: localOk };
}

function parseWibTodaySeconds(timeStr) {
  const [h = 0, m = 0, s = 0] = String(timeStr || '00:00:00')
    .split(':')
    .map(Number);
  return h * 3600 + m * 60 + s;
}

function getWibNowParts() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const dateStr = `${parts.year}-${parts.month}-${parts.day}`;
  const secOfDay = Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second);
  return { dateStr, secOfDay };
}

/**
 * Evaluasi timer lokal per 5 detik untuk notifikasi -10 menit & -5 menit sesuai waktu nyata WIB.
 */
export function evaluateLocalBellAlert(harian) {
  if (!harian || harian.is_libur || !Array.isArray(harian.jadwal) || harian.jadwal.length === 0) {
    return null;
  }

  const { dateStr, secOfDay } = getWibNowParts();
  if (harian.tanggal !== dateStr) {
    return null;
  }

  let slotAktif = null;
  let slotBerikutnya = null;

  for (const slot of harian.jadwal) {
    const startSec = parseWibTodaySeconds(slot.jam_mulai);
    const endSec = parseWibTodaySeconds(slot.jam_selesai);
    if (secOfDay >= startSec && secOfDay < endSec) {
      slotAktif = slot;
    } else if (!slotBerikutnya && startSec > secOfDay) {
      slotBerikutnya = slot;
    }
  }

  const slotPertama = harian.jadwal[0] || null;
  const isMenjelangSesiPertama =
    !slotAktif &&
    slotBerikutnya &&
    slotPertama &&
    slotBerikutnya.jam_mulai === slotPertama.jam_mulai;
  const isSesiTerakhir = Boolean(slotAktif && !slotBerikutnya);

  if (isMenjelangSesiPertama) {
    const startSec = parseWibTodaySeconds(slotBerikutnya.jam_mulai);
    const menitMenuju = Math.max(0, Math.ceil((startSec - secOfDay) / 60));
    if (menitMenuju <= 10 && menitMenuju >= 1) {
      const jamMasuk = String(slotBerikutnya.jam_mulai).slice(0, 5);
      const ref = String(slotBerikutnya.jam_mulai).replace(/[^0-9]/g, '');
      return {
        key: `${dateStr}_masuk_${ref}`,
        title: 'Pengingat Jam Masuk',
        body: `${menitMenuju} menit lagi jam masuk / sesi 1 mulai (${jamMasuk} WIB): ${slotBerikutnya.mata_pelajaran} • Ruang ${slotBerikutnya.ruangan}.`,
      };
    }
  }

  if (isSesiTerakhir) {
    const endSec = parseWibTodaySeconds(slotAktif.jam_selesai);
    const sisaMenit = Math.max(0, Math.ceil((endSec - secOfDay) / 60));
    if (sisaMenit <= 10 && sisaMenit >= 1) {
      const jamPulang = String(slotAktif.jam_selesai).slice(0, 5);
      const ref = String(slotAktif.jam_selesai).replace(/[^0-9]/g, '');
      return {
        key: `${dateStr}_pulang_${ref}`,
        title: 'Sesi Terakhir Akan Selesai',
        body: `Sesi terakhir (${slotAktif.mata_pelajaran}) akan selesai dalam ${sisaMenit} menit (jam pulang pukul ${jamPulang} WIB).`,
      };
    }
  }

  if (slotAktif && slotBerikutnya) {
    const endSec = parseWibTodaySeconds(slotAktif.jam_selesai);
    const sisaMenit = Math.max(0, Math.ceil((endSec - secOfDay) / 60));

    if (sisaMenit <= 5 && sisaMenit >= 1) {
      const jamNext = String(slotBerikutnya.jam_mulai).slice(0, 5);
      const ref = String(slotBerikutnya.jam_mulai).replace(/[^0-9]/g, '');
      return {
        key: `${dateStr}_5m_${ref}`,
        title: 'Pergantian Pelajaran dan Ruangan',
        body: `Pergantian Pelajaran dan Ruangan dalam ${sisaMenit} menit (${jamNext} WIB): ${slotBerikutnya.mata_pelajaran} • Ruang ${slotBerikutnya.ruangan} • Guru: ${slotBerikutnya.nama_guru}.`,
      };
    }

    if (sisaMenit <= 10 && sisaMenit > 5) {
      const jamEnd = String(slotAktif.jam_selesai).slice(0, 5);
      const ref = String(slotAktif.jam_selesai).replace(/[^0-9]/g, '');
      return {
        key: `${dateStr}_10m_${ref}`,
        title: `Sebentar lagi selesai pelajaran ${slotAktif.mata_pelajaran}`,
        body: `Sebentar lagi selesai pelajaran ${slotAktif.mata_pelajaran} (${sisaMenit} menit lagi, pukul ${jamEnd} WIB). Berikutnya: ${slotBerikutnya.mata_pelajaran} (Ruang ${slotBerikutnya.ruangan}).`,
      };
    }
  } else if (slotBerikutnya && !isMenjelangSesiPertama) {
    const startSec = parseWibTodaySeconds(slotBerikutnya.jam_mulai);
    const menitMenuju = Math.max(0, Math.ceil((startSec - secOfDay) / 60));
    const jamNext = String(slotBerikutnya.jam_mulai).slice(0, 5);
    const ref = String(slotBerikutnya.jam_mulai).replace(/[^0-9]/g, '');

    if (menitMenuju <= 5 && menitMenuju >= 1) {
      return {
        key: `${dateStr}_5m_${ref}`,
        title: 'Pergantian Pelajaran dan Ruangan',
        body: `Pergantian Pelajaran dan Ruangan dalam ${menitMenuju} menit (${jamNext} WIB): ${slotBerikutnya.mata_pelajaran} • Ruang ${slotBerikutnya.ruangan} • Guru: ${slotBerikutnya.nama_guru}.`,
      };
    }
  }

  return null;
}
