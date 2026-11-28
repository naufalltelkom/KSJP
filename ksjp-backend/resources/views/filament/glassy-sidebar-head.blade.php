<style>
    /* =========================================================================
       Glassy Sidebar V10 for Filament v5 (Inspired by @paulcodes4 TikTok Video)
       ========================================================================= */
    .fi-sidebar .ksjp-brand-icon-wrap {
        background: rgba(255, 255, 255, 0.20) !important;
        border: 1px solid rgba(255, 255, 255, 0.35) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
    }
    .fi-sidebar .ksjp-brand-title {
        color: #ffffff !important;
    }
    .fi-sidebar .ksjp-brand-subtitle {
        color: rgba(255, 228, 230, 0.85) !important;
    }

    @media (min-width: 1024px) {
        body:has(#fi-main-sidebar.fi-sidebar-open) .fi-topbar-ctn,
        body:has(#fi-main-sidebar.fi-sidebar-open) .fi-main-ctn {
            padding-inline-start: 340px !important;
            transition: padding-inline-start 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        body:has(#fi-main-sidebar:not(.fi-sidebar-open)) .fi-topbar-ctn,
        body:has(#fi-main-sidebar:not(.fi-sidebar-open)) .fi-main-ctn {
            padding-inline-start: 102px !important;
            transition: padding-inline-start 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* Fallback for non-:has browsers synced via JS */
        body.ksjp-fi-open .fi-topbar-ctn,
        body.ksjp-fi-open .fi-main-ctn {
            padding-inline-start: 340px !important;
        }
        body.ksjp-fi-collapsed .fi-topbar-ctn,
        body.ksjp-fi-collapsed .fi-main-ctn {
            padding-inline-start: 102px !important;
        }
    }

    /* Main Floating Glass Container — SMK Telkom Crimson Theme */
    .fi-sidebar.fi-main-sidebar {
        background: linear-gradient(
            180deg,
            rgba(217, 30, 42, 0.90) 0%,
            rgba(162, 16, 30, 0.94) 34%,
            rgba(58, 9, 17, 0.97) 100%
        ) !important;
        backdrop-filter: blur(22px) saturate(165%) !important;
        -webkit-backdrop-filter: blur(22px) saturate(165%) !important;
        border: 1px solid rgba(255, 255, 255, 0.28) !important;
        box-shadow:
            0 24px 60px -14px rgba(88, 12, 22, 0.40),
            0 8px 20px -6px rgba(65, 0, 4, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.46) !important;
        color: #ffffff !important;
    }

    @media (min-width: 1024px) {
        .fi-sidebar.fi-main-sidebar {
            position: fixed !important;
            top: 14px !important;
            left: 14px !important;
            bottom: 14px !important;
            height: calc(100vh - 28px) !important;
            z-index: 35 !important;
            transition:
                width 320ms cubic-bezier(0.22, 1, 0.36, 1),
                border-radius 320ms cubic-bezier(0.22, 1, 0.36, 1),
                padding-right 320ms cubic-bezier(0.22, 1, 0.36, 1) !important;
        }

        .fi-sidebar.fi-main-sidebar.fi-sidebar-open {
            width: 312px !important;
            border-radius: 30px !important;
            padding-right: 48px !important;
            overflow: hidden !important;
        }

        .fi-sidebar.fi-main-sidebar:not(.fi-sidebar-open) {
            width: 72px !important;
            border-radius: 9999px !important;
            padding-right: 0 !important;
            overflow: visible !important;
        }
    }

    @media (max-width: 1023px) {
        .fi-sidebar.fi-main-sidebar {
            border-radius: 0 28px 28px 0 !important;
        }
        .ksjp-fi-white-rail,
        .ksjp-fi-header-toggle {
            display: none !important;
        }
    }

    /* Sidebar Header */
    .fi-sidebar .fi-sidebar-header-ctn {
        background: transparent !important;
        border: 0 !important;
        overflow: visible !important;
    }

    .fi-sidebar .fi-sidebar-header {
        background: transparent !important;
        box-shadow: none !important;
        ring: 0 !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.14) !important;
        padding: 12px 14px !important;
        min-height: 62px !important;
        height: auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 8px !important;
        overflow: visible !important;
    }

    .fi-sidebar:not(.fi-sidebar-open) .fi-sidebar-header {
        justify-content: center !important;
        padding: 12px 8px !important;
        border-bottom-color: transparent !important;
    }

    /* Circular Glass Header & Collapsed Buttons */
    .ksjp-fi-circle-btn {
        width: 30px;
        height: 30px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.22);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        transition: all 180ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .ksjp-fi-circle-btn:hover {
        background: rgba(255, 255, 255, 0.26);
        border-color: rgba(255, 255, 255, 0.50);
        box-shadow: 0 0 18px rgba(253, 164, 175, 0.48);
    }

    .ksjp-fi-expand-emblem,
    .ksjp-fi-search-circle {
        width: 42px;
        height: 42px;
    }

    /* Tooltip in Collapsed Mode */
    .ksjp-fi-tooltip {
        position: absolute;
        left: calc(100% + 12px);
        top: 50%;
        transform: translateY(-50%) translateX(-4px);
        opacity: 0;
        pointer-events: none;
        white-space: nowrap;
        padding: 5px 10px;
        border-radius: 10px;
        background: rgba(28, 12, 15, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.16);
        color: #f8fafc;
        font-size: 11px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.32);
        transition: opacity 150ms ease, transform 150ms ease;
        z-index: 80;
    }

    .ksjp-fi-tooltip kbd {
        padding: 1px 5px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.14);
        font-size: 10px;
        font-family: ui-monospace, monospace;
    }

    .ksjp-fi-circle-btn:hover > .ksjp-fi-tooltip,
    .ksjp-fi-dot-row:hover > .ksjp-fi-tooltip,
    .ksjp-fi-ring-collapsed:hover > .ksjp-fi-tooltip,
    .ksjp-fi-avatar-wrap:hover > .ksjp-fi-tooltip {
        opacity: 1;
        transform: translateY(-50%) translateX(0);
    }

    /* Search Input */
    .ksjp-fi-search-wrap {
        padding: 4px 12px 8px 12px;
    }

    .fi-sidebar:not(.fi-sidebar-open) .ksjp-fi-search-wrap {
        padding: 2px 0 8px 0;
        display: flex;
        justify-content: center;
    }

    .ksjp-fi-search-box {
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.22);
        padding: 6px 10px;
        transition: all 180ms ease;
    }

    .ksjp-fi-search-box:focus-within {
        background: rgba(255, 255, 255, 0.20);
        border-color: rgba(255, 255, 255, 0.45);
    }

    .ksjp-fi-search-icon {
        width: 15px;
        height: 15px;
        color: rgba(255, 255, 255, 0.78);
        flex-shrink: 0;
    }

    .ksjp-fi-search-input {
        width: 100%;
        background: transparent;
        border: 0;
        outline: none;
        color: #ffffff;
        font-size: 12px;
    }

    .ksjp-fi-search-input::placeholder {
        color: rgba(255, 255, 255, 0.65);
    }

    .ksjp-fi-kbd {
        padding: 1px 5px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.16);
        color: rgba(255, 255, 255, 0.90);
        font-size: 10px;
        font-weight: 700;
        flex-shrink: 0;
    }

    /* Navigation Scroll & Group Labels */
    .fi-sidebar .fi-sidebar-nav {
        padding: 6px 0 12px 0 !important;
        overflow-y: auto !important;
        overflow-x: visible !important;
        scrollbar-width: none !important;
    }

    .fi-sidebar .fi-sidebar-nav::-webkit-scrollbar {
        display: none;
    }

    .fi-sidebar:not(.fi-sidebar-open) .fi-sidebar-nav {
        overflow: visible !important;
        padding: 4px 0 !important;
    }

    .fi-sidebar .fi-sidebar-nav-groups {
        row-gap: 10px !important;
    }

    .fi-sidebar .fi-sidebar-group-btn {
        padding-inline: 14px !important;
    }

    .fi-sidebar .fi-sidebar-group-label {
        color: rgba(255, 228, 230, 0.78) !important;
        font-size: 10px !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.12em !important;
    }

    .fi-sidebar .fi-sidebar-group-collapse-btn,
    .fi-sidebar .fi-sidebar-group-btn svg {
        color: rgba(255, 228, 230, 0.78) !important;
    }

    .fi-sidebar .fi-sidebar-group-items {
        row-gap: 6px !important;
    }

    /* Nav Item Pills & Concave Active White Cutout */
    .fi-sidebar .fi-sidebar-item-btn {
        margin-left: 12px !important;
        margin-right: 12px !important;
        border-radius: 9999px !important;
        padding: 8px 14px !important;
        background: rgba(255, 255, 255, 0.08) !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
        transition: all 220ms cubic-bezier(0.22, 1, 0.36, 1) !important;
    }

    .fi-sidebar .fi-sidebar-item-btn:hover {
        background: rgba(255, 255, 255, 0.20) !important;
        border-color: rgba(255, 255, 255, 0.36) !important;
        transform: translateX(2px);
        box-shadow: 0 6px 16px rgba(65, 0, 4, 0.25) !important;
    }

    .fi-sidebar .fi-sidebar-item-label {
        color: rgba(255, 255, 255, 0.94) !important;
        font-size: 12.5px !important;
        font-weight: 600 !important;
    }

    .fi-sidebar .fi-sidebar-item-icon {
        color: rgba(255, 255, 255, 0.88) !important;
        width: 18px !important;
        height: 18px !important;
    }

    .fi-sidebar .fi-sidebar-item-grouped-border {
        display: none !important;
    }

    @media (min-width: 1024px) {
        .fi-sidebar.fi-sidebar-open .fi-sidebar-item.fi-active .fi-sidebar-item-btn {
            position: relative !important;
            margin-left: 12px !important;
            margin-right: 0 !important;
            width: calc(100% - 12px) !important;
            border-radius: 9999px 0 0 9999px !important;
            background: #ffffff !important;
            border-color: #ffffff !important;
            box-shadow: -6px 6px 20px rgba(8, 18, 38, 0.22) !important;
            z-index: 2 !important;
        }

        .fi-sidebar.fi-sidebar-open .fi-sidebar-item.fi-active .fi-sidebar-item-btn::before,
        .fi-sidebar.fi-sidebar-open .fi-sidebar-item.fi-active .fi-sidebar-item-btn::after {
            content: "" !important;
            position: absolute !important;
            right: -1px !important;
            width: 16px !important;
            height: 16px !important;
            pointer-events: none !important;
        }

        .fi-sidebar.fi-sidebar-open .fi-sidebar-item.fi-active .fi-sidebar-item-btn::before {
            top: -16px !important;
            background: radial-gradient(circle at 0 0, transparent 15.5px, #ffffff 16px) !important;
        }

        .fi-sidebar.fi-sidebar-open .fi-sidebar-item.fi-active .fi-sidebar-item-btn::after {
            bottom: -16px !important;
            background: radial-gradient(circle at 0 100%, transparent 15.5px, #ffffff 16px) !important;
        }

        .fi-sidebar:not(.fi-sidebar-open) .fi-sidebar-item-btn {
            width: 42px !important;
            height: 42px !important;
            padding: 0 !important;
            margin: 0 auto !important;
            justify-content: center !important;
        }

        .fi-sidebar:not(.fi-sidebar-open) .fi-sidebar-item.fi-active .fi-sidebar-item-btn {
            background: #ffffff !important;
            border-color: #ffffff !important;
            box-shadow: 0 6px 18px rgba(8, 18, 38, 0.30) !important;
        }

        .fi-sidebar:not(.fi-sidebar-open) .fi-sidebar-group-dropdown-trigger-btn {
            display: none !important;
        }
    }

    .fi-sidebar .fi-sidebar-item.fi-active .fi-sidebar-item-btn {
        background: #ffffff !important;
        border-color: #ffffff !important;
    }

    .fi-sidebar .fi-sidebar-item.fi-active .fi-sidebar-item-label {
        color: #0f172a !important;
        font-weight: 700 !important;
    }

    .fi-sidebar .fi-sidebar-item.fi-active .fi-sidebar-item-icon {
        color: #0f172a !important;
    }

    /* Footer Glass Section */
    .ksjp-fi-footer-glass {
        padding: 8px 12px 10px 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.14);
        display: flex;
        flex-direction: column;
        gap: 7px;
    }

    .fi-sidebar:not(.fi-sidebar-open) .ksjp-fi-footer-glass {
        padding: 8px 6px 12px 6px;
        align-items: center;
    }

    .ksjp-fi-section-label {
        font-size: 9.5px;
        font-weight: 700;
        letter-spacing: 0.14em;
        color: rgba(255, 228, 230, 0.72);
        margin-bottom: 5px;
        padding-inline: 4px;
    }

    .ksjp-fi-dots-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .ksjp-fi-dots-list.is-collapsed {
        align-items: center;
        gap: 8px;
    }

    .ksjp-fi-dot-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 6px;
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.88);
        font-size: 11.5px;
        text-decoration: none;
        position: relative;
        transition: background 160ms ease;
    }

    .ksjp-fi-dot-row:hover {
        background: rgba(255, 255, 255, 0.10);
    }

    .ksjp-fi-dot {
        width: 8px;
        height: 8px;
        border-radius: 9999px;
        flex-shrink: 0;
    }
    .ksjp-fi-dot.is-amber { background: #fbbf24; box-shadow: 0 0 8px rgba(251, 191, 36, 0.85); }
    .ksjp-fi-dot.is-emerald { background: #34d399; box-shadow: 0 0 8px rgba(52, 211, 153, 0.85); }
    .ksjp-fi-dot.is-rose { background: #fb7185; box-shadow: 0 0 8px rgba(251, 113, 133, 0.85); }

    .ksjp-fi-dot-text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
    }

    .ksjp-fi-dot-badge {
        padding: 1px 7px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.12);
        color: rgba(255, 228, 230, 0.92);
        font-size: 10px;
        font-weight: 700;
    }

    .ksjp-fi-portal-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.10);
        border: 1px solid rgba(255, 255, 255, 0.16);
    }

    .ksjp-fi-portal-left {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }

    .ksjp-fi-ring-badge {
        width: 32px;
        height: 32px;
        border-radius: 9999px;
        border: 2px solid rgba(251, 191, 36, 0.85);
        background: rgba(15, 23, 42, 0.40);
        color: #fcd34d;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
        text-decoration: none;
    }

    .ksjp-fi-ring-collapsed {
        width: 38px;
        height: 38px;
    }

    .ksjp-fi-portal-title {
        font-size: 11px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.2;
    }

    .ksjp-fi-portal-sub {
        font-size: 9.5px;
        color: rgba(255, 228, 230, 0.78);
        line-height: 1.2;
    }

    .ksjp-fi-gold-btn {
        padding: 4px 10px;
        border-radius: 9999px;
        background: #e3bc6e;
        color: #0f172a;
        font-size: 10px;
        font-weight: 800;
        text-decoration: none;
        flex-shrink: 0;
        transition: background 150ms ease;
    }

    .ksjp-fi-gold-btn:hover {
        background: #f0ca7d;
    }

    .ksjp-fi-user-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-top: 2px;
    }

    .ksjp-fi-avatar-wrap {
        position: relative;
        flex-shrink: 0;
    }

    .ksjp-fi-avatar {
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        background: linear-gradient(135deg, #f8b384, #e67e5f);
        color: #0f172a;
        font-size: 11.5px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    }

    .ksjp-fi-online-dot {
        position: absolute;
        bottom: -1px;
        right: -1px;
        width: 10px;
        height: 10px;
        border-radius: 9999px;
        background: #34d399;
        border: 2px solid #3a0911;
    }

    .ksjp-fi-user-meta {
        flex: 1;
        min-width: 0;
    }

    .ksjp-fi-user-name {
        font-size: 12px;
        font-weight: 700;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .ksjp-fi-user-role {
        font-size: 10px;
        color: rgba(255, 228, 230, 0.78);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .ksjp-fi-logout-btn {
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        background: transparent;
        border: 0;
        color: rgba(255, 228, 230, 0.82);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 150ms ease;
    }

    .ksjp-fi-logout-btn:hover {
        background: rgba(255, 255, 255, 0.16);
        color: #fda4af;
    }

    /* Right Attached White Utility Rail */
    .ksjp-fi-white-rail {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 48px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 14px 0;
        z-index: 5;
        transition: opacity 220ms ease;
    }

    .ksjp-fi-rail-top {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .ksjp-fi-rail-blue-btn {
        width: 34px;
        height: 34px;
        border-radius: 12px;
        background: #d91e2a;
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 14px rgba(177, 0, 25, 0.30);
        transition: background 150ms ease, transform 150ms ease;
    }

    .ksjp-fi-rail-blue-btn:hover {
        background: #b10019;
        transform: scale(1.04);
    }

    .ksjp-fi-rail-icon-btn {
        width: 32px;
        height: 32px;
        border-radius: 9999px;
        background: transparent;
        border: 0;
        color: #475569;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
        transition: background 150ms ease, color 150ms ease;
    }

    .ksjp-fi-rail-icon-btn:hover {
        background: #f1f5f9;
        color: #0f172a;
    }

    .ksjp-fi-rail-vertical {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        letter-spacing: 0.20em;
        font-size: 10px;
        font-weight: 800;
        color: #94a3b8;
        user-select: none;
        padding-bottom: 4px;
    }

    /* Smooth Page Transition for Filament SPA Mode */
    .fi-page {
        animation: ksjpFiPageEnter 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes ksjpFiPageEnter {
        from {
            opacity: 0;
            transform: translateY(7px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* iOS Liquid Glass Floating Grey Topbar with Black Typography */
    .fi-topbar-ctn {
        padding-top: 12px !important;
        padding-inline-end: 16px !important;
        background: transparent !important;
    }

    .fi-topbar {
        position: relative !important;
        border-radius: 9999px !important;
        background: linear-gradient(
            180deg,
            rgba(222, 226, 234, 0.88) 0%,
            rgba(196, 201, 212, 0.78) 55%,
            rgba(182, 188, 200, 0.84) 100%
        ) !important;
        backdrop-filter: blur(22px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(22px) saturate(180%) !important;
        border: 1px solid rgba(255, 255, 255, 0.65) !important;
        box-shadow:
            0 12px 32px -8px rgba(0, 0, 0, 0.35),
            inset 0 1.5px 1px rgba(255, 255, 255, 0.85),
            inset 0 -1px 1px rgba(255, 255, 255, 0.35) !important;
        min-height: 54px !important;
        height: 54px !important;
        padding-inline: 18px !important;
    }

    .fi-topbar .ksjp-brand-title,
    .fi-topbar .ksjp-brand-subtitle,
    .fi-topbar a,
    .fi-topbar button,
    .fi-topbar svg {
        color: #111827 !important;
    }

    .fi-topbar .fi-avatar {
        background-color: #d91e2a !important;
        color: #ffffff !important;
    }
</style>

<script>
    window.ksjpFilterAdminSidebar = function (rawQuery) {
        const q = (rawQuery || '').trim().toLowerCase();
        document.querySelectorAll('#fi-main-sidebar .fi-sidebar-item').forEach((item) => {
            const label = (item.textContent || '').trim().toLowerCase();
            item.style.display = (!q || label.includes(q)) ? '' : 'none';
        });
    };

    window.ksjpSyncAdminUi = function () {
        const open = window.Alpine?.store('sidebar')?.isOpen;
        if (typeof open === 'boolean') {
            document.body.classList.toggle('ksjp-fi-open', open);
            document.body.classList.toggle('ksjp-fi-collapsed', !open);
        }
        const rail = document.getElementById('ksjp-fi-rail-vertical');
        if (rail) {
            const p = window.location.pathname;
            let label = 'DASHBOARD';
            if (p.includes('kalender')) label = 'KALENDER';
            else if (p.includes('jadwal-momenta')) label = 'MOMENTUM';
            else if (p.includes('jadwal-pelajaran')) label = 'JADWAL';
            else if (p.includes('notifikasi')) label = 'NOTIFIKASI';
            else if (p.includes('users')) label = 'PENGGUNA';
            else if (p.includes('kelas')) label = 'KELAS';
            rail.textContent = label;
        }
    };

    document.addEventListener('alpine:init', () => {
        setTimeout(window.ksjpSyncAdminUi, 0);
        window.addEventListener('resize', window.ksjpSyncAdminUi);
        document.addEventListener('click', () => setTimeout(window.ksjpSyncAdminUi, 10));
    });

    document.addEventListener('livewire:navigated', () => {
        setTimeout(window.ksjpSyncAdminUi, 0);
    });

    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
            const store = window.Alpine?.store('sidebar');
            if (store) {
                e.preventDefault();
                store.isOpen ? store.close() : store.open();
                document.body.classList.toggle('ksjp-fi-open', store.isOpen);
                document.body.classList.toggle('ksjp-fi-collapsed', !store.isOpen);
            }
        } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            const store = window.Alpine?.store('sidebar');
            if (store) {
                e.preventDefault();
                store.open();
                document.body.classList.add('ksjp-fi-open');
                document.body.classList.remove('ksjp-fi-collapsed');
                setTimeout(() => document.getElementById('ksjp-fi-nav-search')?.focus(), 140);
            }
        }
    });
</script>
