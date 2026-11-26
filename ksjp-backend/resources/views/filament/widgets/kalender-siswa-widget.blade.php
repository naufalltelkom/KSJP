<x-filament-widgets::widget>
    <div style="border-radius:18px;background:#ffffff;border:1px solid #e5e7eb;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.03);display:flex;flex-direction:column;gap:16px;color:#191c1d;">
        {{-- Header & Controls (Mirip Web Siswa) --}}
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
            <div>
                <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#b10019;">
                    {{ $snippetMode ? 'Cuplikan Kalender Pendidikan • Panel Organisasi' : 'Portal KSJP > Kalender Pendidikan 2026/2027' }}
                </div>
                <h2 style="font-size:18px;font-weight:800;margin:2px 0 4px 0;color:#191c1d;">
                    {{ $snippetMode ? 'Cuplikan Kalender Pendidikan & Agenda Organisasi T.A. 2026/2027' : 'Kalender Pendidikan & Akademik SMK Telkom Purwokerto T.A. 2026/2027' }}
                </h2>
                <div style="display:flex;flex-wrap:wrap;gap:6px;font-size:11px;font-weight:700;">
                    <span style="background:#ffdad7;color:#410004;padding:3px 10px;border-radius:999px;">
                        SK: Kepsek/07/2026
                    </span>
                    <span style="background:#f3f4f6;color:#4b5563;padding:3px 10px;border-radius:999px;">
                        {{ $snippetMode ? 'Menampilkan 3 Bulan Aktif Terdekat' : 'Juli 2026 – Juni 2027 (12 Bulan)' }}
                    </span>
                </div>
            </div>

            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
                @if (! $snippetMode)
                    <select
                        wire:model.live="semester"
                        style="border-radius:10px;background:#f8f9fa;border:1px solid #d1d5db;padding:6px 10px;font-size:12px;font-weight:600;color:#191c1d;"
                    >
                        <option value="all">Semua Semester (12 Bulan)</option>
                        <option value="ganjil">Semester Ganjil 2026</option>
                        <option value="genap">Semester Genap 2027</option>
                    </select>
                @endif

                <select
                    wire:model.live="sumber"
                    style="border-radius:10px;background:#f8f9fa;border:1px solid #d1d5db;padding:6px 10px;font-size:12px;font-weight:600;color:#191c1d;"
                >
                    <option value="all">Semua Sumber</option>
                    <option value="resmi_sekolah">Resmi Sekolah</option>
                    <option value="organisasi">Agenda Organisasi</option>
                </select>

                <input
                    type="search"
                    wire:model.live.debounce.300ms="search"
                    placeholder="Cari PSTS, UKK, OSIS, libur..."
                    style="border-radius:10px;background:#f8f9fa;border:1px solid #d1d5db;padding:6px 10px;font-size:12px;color:#191c1d;min-width:190px;"
                />

                @if ($snippetMode)
                    <a
                        href="{{ \App\Filament\Resources\KalenderAkademikResource::getUrl('index') }}"
                        style="border-radius:10px;background:#d91e2a;color:#ffffff;padding:7px 12px;font-size:12px;font-weight:700;text-decoration:none;"
                    >
                        Buka Kalender Lengkap
                    </a>
                    <a
                        href="{{ \App\Filament\Resources\KalenderAkademikResource::getUrl('create') }}"
                        style="border-radius:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;padding:7px 12px;font-size:12px;font-weight:700;text-decoration:none;"
                    >
                        + Tambah Agenda Organisasi
                    </a>
                @endif
            </div>
        </div>

        {{-- 10-Category Legend Bar --}}
        <div style="border-radius:14px;background:#f8f9fa;border:1px solid #e5e7eb;padding:12px 14px;">
            <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;margin-bottom:8px;">
                Keterangan Simbol &amp; Indikator Warna
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:6px 12px;">
                @foreach ($legendItems as $item)
                    <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:#191c1d;">
                        <span style="width:12px;height:12px;border-radius:999px;flex-shrink:0;{{ $item['dotStyle'] }}"></span>
                        <span>{{ $item['label'] }}</span>
                    </div>
                @endforeach
            </div>
        </div>

        {{-- Main Matrix + Agenda Sidebar --}}
        <style>
            .ksjp-cal-layout {
                display: grid;
                grid-template-columns: 1fr;
                gap: 16px;
                align-items: start;
            }
            @media (min-width: 1024px) {
                .ksjp-cal-layout {
                    grid-template-columns: 2fr 1fr;
                }
            }
        </style>
        <div class="ksjp-cal-layout">
            {{-- Calendar Month Cards --}}
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
                @foreach ($monthCards as $m)
                    <div style="border-radius:16px;background:#ffffff;border:1px solid #e5e7eb;padding:12px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                            <span style="font-size:13px;font-weight:800;color:#191c1d;">{{ $m['label'] }}</span>
                            <span style="background:#f3f4f6;color:#6b7280;border-radius:999px;padding:2px 8px;font-size:10px;font-weight:700;">{{ $m['code'] }}</span>
                        </div>

                        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center;margin-bottom:4px;">
                            @foreach (['M', 'S', 'S', 'R', 'K', 'J', 'S'] as $dIdx => $dLabel)
                                <div style="font-size:10px;font-weight:700;color:{{ $dIdx === 0 ? '#ba1a1a' : '#6b7280' }};">
                                    {{ $dLabel }}
                                </div>
                            @endforeach
                        </div>

                        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center;">
                            @foreach ($m['cells'] as $cell)
                                @if ($cell === null)
                                    <div style="height:26px;"></div>
                                @else
                                    @php
                                        $hasEvents = count($cell['events']) > 0;
                                        $isSelected = $selectedIso === $cell['iso'];
                                        $cellStyle = $cell['style']['cellStyle'] ?? ($cell['isSunday'] ? 'color:#ba1a1a;font-weight:600;' : 'color:#191c1d;');
                                        $title = collect($cell['events'])->pluck('judul')->implode(' | ');
                                    @endphp
                                    <button
                                        type="button"
                                        @if ($hasEvents)
                                            wire:click="selectDate('{{ $cell['iso'] }}')"
                                        @endif
                                        title="{{ $title }}"
                                        style="height:26px;width:100%;border-radius:999px;font-size:11px;display:flex;align-items:center;justify-content:center;border:none;{{ $cellStyle }} {{ $hasEvents ? 'cursor:pointer;' : 'background:transparent;cursor:default;' }} {{ $isSelected ? 'outline:2px solid #191c1d;outline-offset:1px;' : '' }}"
                                    >
                                        {{ $cell['day'] }}
                                    </button>
                                @endif
                            @endforeach
                        </div>
                    </div>
                @endforeach
            </div>

            {{-- Right Panel: Selected Date or Agenda List + Pengesahan --}}
            <div style="display:flex;flex-direction:column;gap:12px;">
                @if ($selectedIso && count($selectedEvents) > 0)
                    <div style="border-radius:16px;background:#fff1f2;border:1px solid #fecdd3;padding:14px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                            <div style="font-size:12px;font-weight:800;color:#b10019;">
                                Detail Tanggal {{ \Carbon\Carbon::parse($selectedIso)->translatedFormat('d F Y') }}
                            </div>
                            <button
                                type="button"
                                wire:click="$set('selectedIso', null)"
                                style="background:#ffffff;border:1px solid #fecdd3;border-radius:999px;padding:2px 8px;font-size:10px;font-weight:700;color:#b10019;cursor:pointer;"
                            >
                                Tutup
                            </button>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:8px;">
                            @foreach ($selectedEvents as $ev)
                                <div style="background:#ffffff;border-radius:12px;padding:10px;border:1px solid #f3f4f6;">
                                    <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;{{ $ev['style']['badgeStyle'] }}">
                                        {{ $ev['style']['label'] }}
                                    </span>
                                    <div style="font-size:13px;font-weight:700;color:#191c1d;margin-top:4px;">{{ $ev['judul'] }}</div>
                                    <div style="font-size:11px;color:#6b7280;margin-top:2px;">
                                        {{ $ev['tanggal_mulai'] }} • {{ $ev['penyelenggara'] }} • {{ $ev['target_kelas'] }}
                                    </div>
                                    @if ($ev['deskripsi'])
                                        <div style="font-size:11px;color:#4b5563;margin-top:4px;">{{ $ev['deskripsi'] }}</div>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                <div style="border-radius:16px;background:#f8f9fa;border:1px solid #e5e7eb;padding:14px;">
                    <div style="font-size:13px;font-weight:800;color:#191c1d;margin-bottom:8px;">
                        Daftar Agenda ({{ $totalAgenda }})
                    </div>
                    <div style="max-height:360px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding-right:4px;">
                        @forelse (array_slice($agendaList, 0, $snippetMode ? 12 : 100) as $ev)
                            <button
                                type="button"
                                wire:click="selectDate('{{ $ev['iso'] }}')"
                                style="text-align:left;width:100%;border-radius:12px;background:#ffffff;border:1px solid #e5e7eb;padding:10px;cursor:pointer;"
                            >
                                <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                                    <span style="padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;{{ $ev['style']['badgeStyle'] }}">
                                        {{ $ev['style']['label'] }}
                                    </span>
                                    <span style="font-size:10px;font-weight:600;color:#6b7280;">{{ $ev['penyelenggara'] }}</span>
                                </div>
                                <div style="font-size:12px;font-weight:700;color:#191c1d;margin-top:4px;">{{ $ev['judul'] }}</div>
                                <div style="font-size:11px;color:#6b7280;margin-top:2px;">{{ $ev['rentang'] }}</div>
                            </button>
                        @empty
                            <div style="font-size:12px;color:#6b7280;text-align:center;padding:16px 0;">
                                Tidak ada agenda yang cocok dengan filter.
                            </div>
                        @endforelse
                    </div>
                </div>

                <div style="border-radius:16px;background:#f8f9fa;border:1px solid #e5e7eb;padding:12px 14px;">
                    <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#b10019;">
                        Pengesahan Resmi Kalender Pendidikan
                    </div>
                    <div style="font-size:13px;font-weight:700;color:#191c1d;margin-top:3px;">
                        Aris Puji Santoso, S.Kom., M.M.
                    </div>
                    <div style="font-size:11px;color:#6b7280;">
                        Kepala SMK Telkom Purwokerto • Purwokerto, 10 Juli 2026
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-filament-widgets::widget>
