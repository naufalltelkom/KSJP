<div class="ksjp-fi-header-toggle" x-data="{ hovered: false }">
    {{-- Expanded: circular < collapse button --}}
    <button
        type="button"
        x-show="$store.sidebar.isOpen"
        x-on:click="$store.sidebar.close()"
        title="Ciutkan Sidebar (⌘B)"
        aria-label="Ciutkan Sidebar"
        class="ksjp-fi-circle-btn ksjp-fi-collapse-btn"
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" style="width:15px;height:15px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
    </button>

    {{-- Collapsed: top circular emblem that turns into Expand icon + ⌘B tooltip on hover --}}
    <button
        type="button"
        x-show="! $store.sidebar.isOpen"
        x-on:click="$store.sidebar.open()"
        x-on:mouseenter="hovered = true"
        x-on:mouseleave="hovered = false"
        aria-label="Perluas Sidebar (⌘B)"
        class="ksjp-fi-circle-btn ksjp-fi-expand-emblem"
    >
        <img
            x-show="! hovered"
            src="{{ asset('images/logo-smk-telkom-purwokerto.svg') }}"
            alt="SMK Telkom Purwokerto"
            style="width:24px;height:24px;border-radius:9999px;background:#fff;padding:1.5px;"
        />
        <svg
            x-show="hovered"
            x-cloak
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            style="width:18px;height:18px;color:#fff;"
        >
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5v13.5H3.75V5.25Zm5.25 0v13.5m3.75-8.25 2.25 1.5-2.25 1.5" />
        </svg>
        <span class="ksjp-fi-tooltip">
            <span>Expand</span>
            <kbd>⌘B</kbd>
        </span>
    </button>
</div>
