<x-filament-widgets::widget>
    @if ($kelas)
        <div style="border-radius:18px;background:linear-gradient(135deg,#b10019 0%,#d91e2a 55%,#a52522 100%);color:#ffffff;padding:20px 24px;box-shadow:0 8px 24px rgba(177,0,25,0.16);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">
            <div style="display:flex;flex-direction:column;gap:6px;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.9;">
                    <span style="background:rgba(255,255,255,0.18);padding:3px 10px;border-radius:999px;">
                        {{ $kelas->nama_kelas }} • T.A. {{ $kelas->tahun_ajaran }}
                    </span>
                    <span>Wali Kelas: {{ $kelas->wali_kelas }}</span>
                </div>
                <div style="font-size:20px;font-weight:800;letter-spacing:-0.01em;">
                    Jadwal Pelajaran {{ $kelas->nama_kelas }} — {{ $kelas->konsentrasi }}
                </div>
                <div style="font-size:13px;opacity:0.92;">
                    Hari ini: <strong>{{ $harian['hari'] ?? '-' }}</strong> ({{ $waktuWib }} WIB)
                    • Total <strong>{{ count($harian['jadwal'] ?? []) }}</strong> sesi hari ini
                    @if ($momentumCount > 0)
                        • <span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:999px;font-weight:700;font-size:11px;">{{ $momentumCount }} Momentum Aktif</span>
                    @endif
                </div>
            </div>

            <div style="background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.25);border-radius:14px;padding:12px 16px;min-width:250px;">
                @if ($slotAktif)
                    <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#bbf7d0;">
                        ● Sedang Berlangsung ({{ substr($slotAktif['jam_mulai'], 0, 5) }} - {{ substr($slotAktif['jam_selesai'], 0, 5) }})
                    </div>
                    <div style="font-size:15px;font-weight:800;margin-top:2px;">
                        {{ $slotAktif['mata_pelajaran'] }}
                    </div>
                    <div style="font-size:12px;opacity:0.9;margin-top:2px;">
                        {{ $slotAktif['nama_guru'] }} • Ruang {{ $slotAktif['ruangan'] }}
                    </div>
                @else
                    <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;opacity:0.85;">
                        Status Waktu Sekolah ({{ $waktuWib }} WIB)
                    </div>
                    <div style="font-size:14px;font-weight:700;margin-top:2px;">
                        Di Luar Jam Pelajaran Aktif
                    </div>
                    @if ($slotBerikutnya)
                        <div style="font-size:12px;opacity:0.9;margin-top:2px;">
                            Berikutnya: {{ $slotBerikutnya['mata_pelajaran'] }} ({{ substr($slotBerikutnya['jam_mulai'], 0, 5) }})
                        </div>
                    @endif
                @endif
            </div>
        </div>
    @endif
</x-filament-widgets::widget>
