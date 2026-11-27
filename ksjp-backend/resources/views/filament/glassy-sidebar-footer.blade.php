@php
    $user = auth()->user();
    $namaLengkap = $user?->nama_lengkap ?? 'Pengelola KSJP';
    $initials = collect(explode(' ', trim($namaLengkap)))
        ->filter()
        ->take(2)
        ->map(fn (string $part) => mb_strtoupper(mb_substr($part, 0, 1)))
        ->implode('') ?: 'KS';
    $isGuru = $user && method_exists($user, 'isGuru') && $user->isGuru();
    $roleLabel = $isGuru ? 'Wali Kelas & Guru' : 'Admin Organisasi';

    $path = request()->path();
    $railLabel = match (true) {
        str_contains($path, 'kalender') => 'KALENDER',
        str_contains($path, 'jadwal-momenta') => 'MOMENTUM',
        str_contains($path, 'jadwal-pelajaran') => 'JADWAL',
        str_contains($path, 'notifikasi') => 'NOTIFIKASI',
        str_contains($path, 'users') => 'PENGGUNA',
        str_contains($path, 'kelas') => 'KELAS',
        default => 'DASHBOARD',
    };
@endphp

@if ($user)
    <div class="ksjp-fi-footer-glass">
        {{-- 3 Glowing Status Dots (Expanded & Collapsed) --}}
        <div class="ksjp-fi-dots-section">
            <div x-show="$store.sidebar.isOpen" class="ksjp-fi-section-label">STATUS SISTEM</div>

            <div class="ksjp-fi-dots-list" x-bind:class="{ 'is-collapsed': ! $store.sidebar.isOpen }">
                <a href="{{ url('/admin/kalender-akademiks') }}" class="ksjp-fi-dot-row">
                    <span class="ksjp-fi-dot is-amber"></span>
                    <span x-show="$store.sidebar.isOpen" class="ksjp-fi-dot-text">T.A. 2026/2027</span>
                    <span x-show="$store.sidebar.isOpen" class="ksjp-fi-dot-badge">Live</span>
                    <span x-show="! $store.sidebar.isOpen" class="ksjp-fi-tooltip">T.A. 2026/2027 • Live</span>
                </a>

                <a href="{{ url($isGuru ? '/admin/jadwal-pelajarans' : '/admin/kalender-akademiks') }}" class="ksjp-fi-dot-row">
                    <span class="ksjp-fi-dot is-emerald"></span>
                    <span x-show="$store.sidebar.isOpen" class="ksjp-fi-dot-text">{{ $isGuru ? 'XI PPLG 4' : 'Agenda OSIS' }}</span>
                    <span x-show="$store.sidebar.isOpen" class="ksjp-fi-dot-badge">Aktif</span>
                    <span x-show="! $store.sidebar.isOpen" class="ksjp-fi-tooltip">{{ $isGuru ? 'XI PPLG 4 • Aktif' : 'Agenda OSIS • Aktif' }}</span>
                </a>

                <a href="https://ksjp-web.vercel.app" target="_blank" rel="noreferrer" class="ksjp-fi-dot-row">
                    <span class="ksjp-fi-dot is-rose"></span>
                    <span x-show="$store.sidebar.isOpen" class="ksjp-fi-dot-text">Bel Real-Time</span>
                    <span x-show="$store.sidebar.isOpen" class="ksjp-fi-dot-badge">1x Lock</span>
                    <span x-show="! $store.sidebar.isOpen" class="ksjp-fi-tooltip">Bel Real-Time • 1x Lock</span>
                </a>
            </div>
        </div>

        {{-- Portal Siswa Card (Matches Go Pro Card) --}}
        <div x-show="$store.sidebar.isOpen" class="ksjp-fi-portal-card">
            <div class="ksjp-fi-portal-left">
                <span class="ksjp-fi-ring-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:15px;height:15px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
                    </svg>
                </span>
                <div style="min-width:0;">
                    <div class="ksjp-fi-portal-title">Portal Siswa</div>
                    <div class="ksjp-fi-portal-sub">Android &amp; iOS PWA</div>
                </div>
            </div>
            <a href="https://ksjp-web.vercel.app" target="_blank" rel="noreferrer" class="ksjp-fi-gold-btn">
                Buka
            </a>
        </div>

        <a
            x-show="! $store.sidebar.isOpen"
            x-cloak
            href="https://ksjp-web.vercel.app"
            target="_blank"
            rel="noreferrer"
            class="ksjp-fi-ring-badge ksjp-fi-ring-collapsed"
            aria-label="Buka Portal Siswa"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:16px;height:16px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
            </svg>
            <span class="ksjp-fi-tooltip">Buka Portal Siswa</span>
        </a>

        {{-- Profile Row --}}
        <div class="ksjp-fi-user-row" x-bind:class="{ 'is-collapsed': ! $store.sidebar.isOpen }">
            <div class="ksjp-fi-avatar-wrap">
                <div class="ksjp-fi-avatar">{{ $initials }}</div>
                <span class="ksjp-fi-online-dot"></span>
                <span x-show="! $store.sidebar.isOpen" x-cloak class="ksjp-fi-tooltip">
                    {{ $namaLengkap }} • {{ $roleLabel }}
                </span>
            </div>

            <div x-show="$store.sidebar.isOpen" class="ksjp-fi-user-meta">
                <div class="ksjp-fi-user-name">{{ $namaLengkap }}</div>
                <div class="ksjp-fi-user-role">{{ $roleLabel }}</div>
            </div>

            <form x-show="$store.sidebar.isOpen" method="POST" action="{{ filament()->getLogoutUrl() }}">
                @csrf
                <button type="submit" title="Keluar Panel Admin" aria-label="Keluar" class="ksjp-fi-logout-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:16px;height:16px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                    </svg>
                </button>
            </form>
        </div>
    </div>

    {{-- Right Attached White Utility Rail (Desktop Expanded Only) --}}
    <div class="ksjp-fi-white-rail" x-show="$store.sidebar.isOpen">
        <div class="ksjp-fi-rail-top">
            <a
                href="{{ url('/admin/kalender-akademiks') }}"
                title="Kalender Pendidikan"
                class="ksjp-fi-rail-blue-btn"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:18px;height:18px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
            </a>

            <a href="{{ url('/admin') }}" title="Dashboard" class="ksjp-fi-rail-icon-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.9" stroke="currentColor" style="width:17px;height:17px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                </svg>
            </a>

            @if ($isGuru)
                <a href="{{ url('/admin/jadwal-pelajarans') }}" title="Jadwal Reguler" class="ksjp-fi-rail-icon-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.9" stroke="currentColor" style="width:17px;height:17px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </a>
            @else
                <a href="https://ksjp-web.vercel.app" target="_blank" rel="noreferrer" title="Web Siswa" class="ksjp-fi-rail-icon-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.9" stroke="currentColor" style="width:17px;height:17px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                </a>
            @endif

            <button
                type="button"
                x-on:click="$store.sidebar.close()"
                title="Ciutkan Sidebar (⌘B)"
                class="ksjp-fi-rail-icon-btn"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.9" stroke="currentColor" style="width:17px;height:17px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5v13.5H3.75V5.25Zm5.25 0v13.5" />
                </svg>
            </button>
        </div>

        <div class="ksjp-fi-rail-vertical" id="ksjp-fi-rail-vertical">{{ $railLabel }}</div>
    </div>
@endif
