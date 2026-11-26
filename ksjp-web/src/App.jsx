import { useCallback, useEffect, useRef, useState } from 'react';
import Layout from './components/Layout';
import LoginView from './components/LoginView';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import JadwalPage from './pages/JadwalPage';
import KalenderPage from './pages/KalenderPage';
import NotifikasiPage from './pages/NotifikasiPage';
import ProfilPage from './pages/ProfilPage';
import {
  fetchJadwal,
  fetchKalender,
  fetchNotifikasi,
  markAllNotifikasiRead,
  markNotifikasiRead,
} from './services/api';
import {
  evaluateLocalBellAlert,
  showOsPopupNotification,
  syncExistingPushSubscription,
} from './utils/notifications';

function PortalShell() {
  const { isAuthenticated, initializing } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [kalenderSearch, setKalenderSearch] = useState('');

  const [jadwalData, setJadwalData] = useState(null);
  const [kalenderItems, setKalenderItems] = useState([]);
  const [notifikasiState, setNotifikasiState] = useState({
    unreadCount: 0,
    pengingat_pergantian_jam: null,
    items: [],
  });
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [toast, setToast] = useState(null);

  const knownNotifIdsRef = useRef(new Set());
  const firstPollDoneRef = useRef(false);
  const lastBellKeyRef = useRef('');

  const loadNotifikasi = useCallback(async (showToastOnNew = false) => {
    try {
      const res = await fetchNotifikasi({ limit: 50 });
      const items = res?.data || [];
      const unreadCount = res?.unread_count ?? 0;

      if (showToastOnNew && firstPollDoneRef.current) {
        const newestUnread = items.find(
          (item) => !item.is_read && !knownNotifIdsRef.current.has(item.id)
        );
        if (newestUnread) {
          setToast({
            title: newestUnread.judul,
            message: newestUnread.pesan,
          });
          showOsPopupNotification(
            newestUnread.judul,
            newestUnread.pesan,
            `ksjp-notif-${newestUnread.id}`
          );
        }
      }

      const bell = res?.pengingat_pergantian_jam;
      if (bell?.pengingat_aktif && bell?.pesan_pengingat) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const bellStage = bell.peringatan_jenis || 'bell';
        const bellKey = `${todayStr}-${bellStage}-${bell.slot_aktif?.id || 'x'}-${bell.slot_berikutnya?.id || 'y'}`;
        if (lastBellKeyRef.current !== bellKey) {
          lastBellKeyRef.current = bellKey;
          const bellTitle = bell.peringatan_judul || 'Pengingat Pergantian Jam KSJP';
          if (showToastOnNew) {
            setToast({
              title: bellTitle,
              message: bell.pesan_pengingat,
            });
          }
          showOsPopupNotification(bellTitle, bell.pesan_pengingat, `ksjp-bell-${bellKey}`);
        }
      }

      items.forEach((item) => knownNotifIdsRef.current.add(item.id));
      firstPollDoneRef.current = true;

      setNotifikasiState({
        unreadCount,
        pengingat_pergantian_jam: res?.pengingat_pergantian_jam || null,
        items,
      });
    } catch {
      // Abaikan error sementara saat polling background
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoadingInitial(true);
    try {
      const [jadwalRes, kalenderRes] = await Promise.all([
        fetchJadwal({ mode: 'harian' }),
        fetchKalender(),
      ]);

      setJadwalData({ harian: jadwalRes?.data || null, kelas: jadwalRes?.kelas || null });
      setKalenderItems(kalenderRes?.data || []);
      await loadNotifikasi(false);
    } finally {
      setLoadingInitial(false);
    }
  }, [loadNotifikasi]);

  useEffect(() => {
    if (!isAuthenticated) {
      firstPollDoneRef.current = false;
      knownNotifIdsRef.current.clear();
      return;
    }

    loadAllData();
    syncExistingPushSubscription();

    const pollNow = () => {
      loadNotifikasi(true);
      fetchJadwal({ mode: 'harian' })
        .then((res) => {
          setJadwalData({ harian: res?.data || null, kelas: res?.kelas || null });
        })
        .catch(() => {});
    };

    const interval = setInterval(pollNow, 10000);
    const handleResume = () => {
      if (document.visibilityState === 'visible') {
        pollNow();
      }
    };

    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('focus', pollNow);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('focus', pollNow);
    };
  }, [isAuthenticated, loadAllData, loadNotifikasi]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Evaluasi presisi tiap 5 detik untuk pengingat -10 menit ("Sebentar lagi selesai...") & -5 menit ("Pergantian Pelajaran & Ruangan")
  useEffect(() => {
    if (!isAuthenticated || !jadwalData?.harian) return undefined;

    const checkBell = () => {
      const alert = evaluateLocalBellAlert(jadwalData.harian);
      if (!alert) return;

      const storageKey = `ksjp_bell_sent_${alert.key}`;
      if (localStorage.getItem(storageKey)) return;

      localStorage.setItem(storageKey, '1');
      setToast({ title: alert.title, message: alert.body });
      showOsPopupNotification(alert.title, alert.body, `ksjp-bell-${alert.key}`);
    };

    checkBell();
    const bellTimer = setInterval(checkBell, 5000);
    return () => clearInterval(bellTimer);
  }, [isAuthenticated, jadwalData]);

  const handleMarkRead = async (id) => {
    await markNotifikasiRead(id);
    await loadNotifikasi(false);
  };

  const handleMarkAllRead = async () => {
    await markAllNotifikasiRead();
    await loadNotifikasi(false);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-container text-white mx-auto flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-[26px]">school</span>
          </div>
          <div className="text-sm font-bold text-on-surface">Memuat Portal KSJP...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const momentumCount = (jadwalData?.harian?.jadwal || []).filter((s) => s.is_momentum).length;
  const pergantianAktif = Boolean(
    jadwalData?.harian?.pergantian_jam?.pengingat_aktif ||
      notifikasiState?.pengingat_pergantian_jam?.pengingat_aktif
  );

  return (
    <Layout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      unreadCount={notifikasiState.unreadCount}
      momentumCount={momentumCount}
      pergantianAktif={pergantianAktif}
      searchQuery={kalenderSearch}
      onSearchSubmit={(q) => {
        setKalenderSearch(q);
        setActiveTab('kalender');
      }}
      toast={toast}
      onDismissToast={() => setToast(null)}
    >
      {activeTab === 'dashboard' && (
        <DashboardPage
          jadwalData={jadwalData}
          kalenderItems={kalenderItems}
          notifikasiState={notifikasiState}
          onNavigate={setActiveTab}
          onRefreshAll={loadAllData}
          loading={loadingInitial}
        />
      )}

      {activeTab === 'jadwal' && <JadwalPage initialHarianData={jadwalData?.harian} />}

      {activeTab === 'kalender' && (
        <KalenderPage kalenderItems={kalenderItems} externalSearch={kalenderSearch} />
      )}

      {activeTab === 'notifikasi' && (
        <NotifikasiPage
          notifikasiState={notifikasiState}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onRefresh={() => loadNotifikasi(false)}
        />
      )}

      {activeTab === 'profil' && <ProfilPage />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PortalShell />
    </AuthProvider>
  );
}
