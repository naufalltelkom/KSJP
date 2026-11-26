<?php

namespace App\Filament\Widgets\Concerns;

use App\Models\KalenderAkademik;
use Carbon\Carbon;
use Illuminate\Support\Collection;

trait BuildsKalenderViewData
{
    public string $semester = 'all';

    public string $sumber = 'all';

    public string $search = '';

    public ?string $selectedIso = null;

    public function selectDate(string $iso): void
    {
        $this->selectedIso = $this->selectedIso === $iso ? null : $iso;
    }

    /**
     * @return array<int, array{tahun: int, bulan: int, label: string, code: string, semester: string}>
     */
    protected function academicMonths(): array
    {
        return [
            ['tahun' => 2026, 'bulan' => 7, 'label' => 'JULI 2026', 'code' => 'Bln 07', 'semester' => 'ganjil'],
            ['tahun' => 2026, 'bulan' => 8, 'label' => 'AGUSTUS 2026', 'code' => 'Bln 08', 'semester' => 'ganjil'],
            ['tahun' => 2026, 'bulan' => 9, 'label' => 'SEPTEMBER 2026', 'code' => 'Bln 09', 'semester' => 'ganjil'],
            ['tahun' => 2026, 'bulan' => 10, 'label' => 'OKTOBER 2026', 'code' => 'Bln 10', 'semester' => 'ganjil'],
            ['tahun' => 2026, 'bulan' => 11, 'label' => 'NOVEMBER 2026', 'code' => 'Bln 11', 'semester' => 'ganjil'],
            ['tahun' => 2026, 'bulan' => 12, 'label' => 'DESEMBER 2026', 'code' => 'Bln 12', 'semester' => 'ganjil'],
            ['tahun' => 2027, 'bulan' => 1, 'label' => 'JANUARI 2027', 'code' => 'Bln 01', 'semester' => 'genap'],
            ['tahun' => 2027, 'bulan' => 2, 'label' => 'FEBRUARI 2027', 'code' => 'Bln 02', 'semester' => 'genap'],
            ['tahun' => 2027, 'bulan' => 3, 'label' => 'MARET 2027', 'code' => 'Bln 03', 'semester' => 'genap'],
            ['tahun' => 2027, 'bulan' => 4, 'label' => 'APRIL 2027', 'code' => 'Bln 04', 'semester' => 'genap'],
            ['tahun' => 2027, 'bulan' => 5, 'label' => 'MEI 2027', 'code' => 'Bln 05', 'semester' => 'genap'],
            ['tahun' => 2027, 'bulan' => 6, 'label' => 'JUNI 2027', 'code' => 'Bln 06', 'semester' => 'genap'],
        ];
    }

    /**
     * @return array<int, array{label: string, dotStyle: string}>
     */
    protected function legendItems(): array
    {
        return [
            ['label' => 'Libur Umum / Cuti Bersama', 'dotStyle' => 'background:#ba1a1a;'],
            ['label' => 'Libur Tahun / Akhir Semester', 'dotStyle' => 'background:#ffffff;border:2px solid #ba1a1a;'],
            ['label' => 'Hari Pertama Masuk Sekolah', 'dotStyle' => 'background:#fbbf24;'],
            ['label' => 'Upacara Hari Besar Nasional', 'dotStyle' => 'background:#ffdad7;border:1px solid rgba(177,0,25,0.45);'],
            ['label' => 'PSTS / PSAS / TKA / PSAJ / UKK', 'dotStyle' => 'background:#eff6ff;border:1px solid #3b82f6;'],
            ['label' => 'Penyerahan Raport (LHB)', 'dotStyle' => 'background:#2563eb;'],
            ['label' => 'Libur Ramadhan / Idul Fitri', 'dotStyle' => 'background:#34d399;'],
            ['label' => 'PKL / Prakerin', 'dotStyle' => 'background:#a8a29e;'],
            ['label' => 'HUT SMK Telkom', 'dotStyle' => 'background:#fb7185;'],
            ['label' => 'Agenda Organisasi (OSIS/MPK/Pramuka)', 'dotStyle' => 'background:#f59e0b;'],
        ];
    }

    /**
     * @return array{label: string, cellStyle: string, badgeStyle: string}
     */
    protected function resolveCategoryStyle(string $kategori, string $sumber): array
    {
        if ($sumber === 'organisasi' || $kategori === 'agenda_organisasi') {
            return [
                'label' => 'Agenda Organisasi',
                'cellStyle' => 'background:#fef3c7;color:#78350f;font-weight:700;',
                'badgeStyle' => 'background:#fffbeb;color:#92400e;border:1px solid #fde68a;',
            ];
        }

        return match ($kategori) {
            'libur_umum' => [
                'label' => 'Libur Umum',
                'cellStyle' => 'background:#ba1a1a;color:#ffffff;font-weight:700;',
                'badgeStyle' => 'background:#fef2f2;color:#ba1a1a;border:1px solid #fecaca;',
            ],
            'libur_tahun_pelajaran', 'libur_semester' => [
                'label' => 'Libur Semester / Tahun',
                'cellStyle' => 'background:#ffffff;color:#ba1a1a;border:2px solid #ba1a1a;font-weight:700;',
                'badgeStyle' => 'background:#fff1f2;color:#ba1a1a;border:1px solid #fecdd3;',
            ],
            'masuk_sekolah' => [
                'label' => 'Hari Pertama Masuk',
                'cellStyle' => 'background:#fbbf24;color:#191c1d;font-weight:800;',
                'badgeStyle' => 'background:#fef3c7;color:#78350f;',
            ],
            'upacara' => [
                'label' => 'Upacara Nasional',
                'cellStyle' => 'background:#ffdad7;color:#b10019;font-weight:700;',
                'badgeStyle' => 'background:#ffdad7;color:#b10019;',
            ],
            'ujian_asesmen', 'ukk' => [
                'label' => $kategori === 'ukk' ? 'Perkiraan UKK' : 'Asesmen / Ujian',
                'cellStyle' => 'background:#eff6ff;color:#1d4ed8;border:1px solid #60a5fa;font-weight:700;',
                'badgeStyle' => 'background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;',
            ],
            'penyerahan_lhb' => [
                'label' => 'Penyerahan LHB',
                'cellStyle' => 'background:#2563eb;color:#ffffff;font-weight:700;',
                'badgeStyle' => 'background:#2563eb;color:#ffffff;',
            ],
            'ramadhan_idul_fitri' => [
                'label' => 'Ramadhan / Idul Fitri',
                'cellStyle' => 'background:#d1fae5;color:#065f46;font-weight:700;',
                'badgeStyle' => 'background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;',
            ],
            'pkl' => [
                'label' => 'PKL / Prakerin',
                'cellStyle' => 'background:#e7e5e4;color:#292524;font-weight:700;',
                'badgeStyle' => 'background:#f5f5f4;color:#44403c;',
            ],
            'hut_sekolah' => [
                'label' => 'HUT SMK Telkom',
                'cellStyle' => 'background:#ffe4e6;color:#b10019;font-weight:800;',
                'badgeStyle' => 'background:#ffe4e6;color:#b10019;',
            ],
            default => [
                'label' => 'Kegiatan Sekolah',
                'cellStyle' => 'background:#f3f4f6;color:#1f2937;font-weight:600;',
                'badgeStyle' => 'background:#f3f4f6;color:#374151;',
            ],
        };
    }

    /**
     * @return array<string, mixed>
     */
    protected function prepareKalenderData(bool $snippetMode): array
    {
        $allItems = KalenderAkademik::orderBy('tanggal_mulai')->get();

        $filtered = $allItems->filter(function (KalenderAkademik $ev): bool {
            if ($this->sumber !== 'all' && $ev->sumber !== $this->sumber) {
                return false;
            }
            if ($this->semester !== 'all' && $ev->tanggal_mulai) {
                $m = (int) $ev->tanggal_mulai->format('n');
                $y = (int) $ev->tanggal_mulai->format('Y');
                $isGanjil = $y === 2026 && $m >= 7;
                if ($this->semester === 'ganjil' && ! $isGanjil) {
                    return false;
                }
                if ($this->semester === 'genap' && $isGanjil) {
                    return false;
                }
            }
            if (trim($this->search) !== '') {
                $q = mb_strtolower(trim($this->search));
                $hay = mb_strtolower(($ev->judul ?? '') . ' ' . ($ev->deskripsi ?? '') . ' ' . ($ev->penyelenggara ?? ''));
                if (! str_contains($hay, $q)) {
                    return false;
                }
            }

            return true;
        })->values();

        $eventsByDate = [];
        foreach ($filtered as $ev) {
            if (! $ev->tanggal_mulai || ! $ev->tanggal_selesai) {
                continue;
            }
            $cursor = $ev->tanggal_mulai->copy()->startOfDay();
            $end = $ev->tanggal_selesai->copy()->startOfDay();
            $guard = 0;
            while ($cursor->lte($end) && $guard < 180) {
                $iso = $cursor->toDateString();
                $eventsByDate[$iso][] = [
                    'id' => $ev->id,
                    'judul' => $ev->judul,
                    'tanggal_mulai' => $ev->tanggal_mulai->translatedFormat('d M Y'),
                    'tanggal_selesai' => $ev->tanggal_selesai->translatedFormat('d M Y'),
                    'kategori' => $ev->kategori,
                    'sumber' => $ev->sumber,
                    'penyelenggara' => $ev->penyelenggara,
                    'target_kelas' => $ev->target_kelas,
                    'deskripsi' => $ev->deskripsi,
                    'style' => $this->resolveCategoryStyle($ev->kategori, $ev->sumber),
                ];
                $cursor->addDay();
                $guard++;
            }
        }

        $months = $this->academicMonths();
        if ($this->semester !== 'all') {
            $months = array_values(array_filter($months, fn (array $m): bool => $m['semester'] === $this->semester));
        }

        if ($snippetMode) {
            $now = Carbon::now('Asia/Jakarta');
            $curIdx = 0;
            foreach ($months as $idx => $m) {
                if ($m['tahun'] === (int) $now->year && $m['bulan'] === (int) $now->month) {
                    $curIdx = $idx;
                    break;
                }
            }
            $startSlice = max(0, min($curIdx, max(0, count($months) - 3)));
            $months = array_slice($months, $startSlice, 3);
        }

        $monthCards = [];
        foreach ($months as $m) {
            $firstOfMonth = Carbon::create($m['tahun'], $m['bulan'], 1);
            $firstDay = $firstOfMonth->dayOfWeek;
            $daysInMonth = $firstOfMonth->daysInMonth;
            $cells = [];
            for ($i = 0; $i < $firstDay; $i++) {
                $cells[] = null;
            }
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $iso = sprintf('%04d-%02d-%02d', $m['tahun'], $m['bulan'], $d);
                $dayEvents = $eventsByDate[$iso] ?? [];
                $cells[] = [
                    'day' => $d,
                    'iso' => $iso,
                    'isSunday' => Carbon::create($m['tahun'], $m['bulan'], $d)->dayOfWeek === 0,
                    'events' => $dayEvents,
                    'style' => $dayEvents[0]['style'] ?? null,
                ];
            }
            $monthCards[] = array_merge($m, ['cells' => $cells]);
        }

        /** @var Collection<int, array<string, mixed>> $agendaList */
        $agendaList = $filtered->map(fn (KalenderAkademik $ev): array => [
            'id' => $ev->id,
            'judul' => $ev->judul,
            'iso' => $ev->tanggal_mulai?->toDateString(),
            'rentang' => $ev->tanggal_mulai && $ev->tanggal_selesai
                ? ($ev->tanggal_mulai->equalTo($ev->tanggal_selesai)
                    ? $ev->tanggal_mulai->translatedFormat('d M Y')
                    : $ev->tanggal_mulai->translatedFormat('d M') . ' – ' . $ev->tanggal_selesai->translatedFormat('d M Y'))
                : '-',
            'sumber' => $ev->sumber,
            'penyelenggara' => $ev->penyelenggara ?: 'SMK Telkom Purwokerto',
            'target_kelas' => $ev->target_kelas ?: 'Semua Kelas',
            'deskripsi' => $ev->deskripsi,
            'style' => $this->resolveCategoryStyle($ev->kategori, $ev->sumber),
        ])->all();

        $selectedEvents = $this->selectedIso ? ($eventsByDate[$this->selectedIso] ?? []) : [];

        return [
            'snippetMode' => $snippetMode,
            'monthCards' => $monthCards,
            'legendItems' => $this->legendItems(),
            'agendaList' => $agendaList,
            'selectedIso' => $this->selectedIso,
            'selectedEvents' => $selectedEvents,
            'totalAgenda' => $filtered->count(),
        ];
    }
}
