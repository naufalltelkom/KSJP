<div class="ksjp-fi-search-wrap" x-data="{ query: '' }">
    <div x-show="$store.sidebar.isOpen" class="ksjp-fi-search-box">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="ksjp-fi-search-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
            id="ksjp-fi-nav-search"
            type="search"
            x-model="query"
            x-on:input="window.ksjpFilterAdminSidebar(query)"
            placeholder="Cari menu..."
            class="ksjp-fi-search-input"
        />
        <kbd class="ksjp-fi-kbd">⌘K</kbd>
    </div>

    <div x-show="! $store.sidebar.isOpen" x-cloak class="ksjp-fi-search-collapsed-wrap">
        <button
            type="button"
            x-on:click="$store.sidebar.open(); setTimeout(() => document.getElementById('ksjp-fi-nav-search')?.focus(), 140)"
            aria-label="Cari Menu"
            class="ksjp-fi-circle-btn ksjp-fi-search-circle"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:17px;height:17px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <span class="ksjp-fi-tooltip">
                <span>Cari menu</span>
                <kbd>⌘K</kbd>
            </span>
        </button>
    </div>
</div>
