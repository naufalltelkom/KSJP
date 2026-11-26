<?php

namespace App\Filament\Resources;

use App\Filament\Resources\KalenderAkademikResource\Pages;
use App\Models\KalenderAkademik;
use App\Models\User;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class KalenderAkademikResource extends Resource
{
    protected static ?string $model = KalenderAkademik::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedCalendarDays;

    protected static string | UnitEnum | null $navigationGroup = 'Kalender & Kegiatan Siswa';

    protected static ?string $navigationLabel = 'Kalender Pendidikan';

    protected static ?string $modelLabel = 'Agenda Kalender';

    protected static ?string $pluralModelLabel = 'Kalender Pendidikan 2026/2027';

    protected static ?int $navigationSort = 5;

    public static function form(Schema $schema): Schema
    {
        /** @var User|null $user */
        $user = Auth::user();
        $isAdminOrg = $user?->isAdminOrganisasi() ?? false;

        return $schema->components([
            TextInput::make('judul')
                ->label('Judul Agenda / Kegiatan')
                ->required()
                ->maxLength(200)
                ->columnSpanFull(),
            DatePicker::make('tanggal_mulai')
                ->label('Tanggal Mulai')
                ->required()
                ->native(false),
            DatePicker::make('tanggal_selesai')
                ->label('Tanggal Selesai')
                ->required()
                ->native(false),
            Select::make('kategori')
                ->label('Kategori')
                ->options([
                    'agenda_organisasi' => 'Agenda Organisasi Siswa',
                    'kegiatan_sekolah' => 'Kegiatan Sekolah',
                    'upacara' => 'Upacara Hari Besar Nasional',
                    'ujian_asesmen' => 'ANBK/TKA/STS/SAS/PSAJ',
                    'pkl' => 'Praktek Kerja Industri (PKL)',
                    'ukk' => 'Perkiraan UKK',
                    'penyerahan_lhb' => 'Penyerahan LHB / Rapor',
                    'masuk_sekolah' => 'Hari Pertama Masuk Sekolah',
                    'libur_umum' => 'Libur Umum / Cuti Bersama',
                    'libur_semester' => 'Libur Akhir Semester',
                    'ramadhan_idul_fitri' => 'Libur Ramadhan / Idul Fitri',
                    'libur_tahun_pelajaran' => 'Libur Tahun Pelajaran',
                    'kelulusan' => 'Perkiraan Kelulusan',
                    'hut_sekolah' => 'HUT SMK Telkom',
                ])
                ->required()
                ->default($isAdminOrg ? 'agenda_organisasi' : 'kegiatan_sekolah'),
            Select::make('sumber')
                ->label('Sumber Agenda')
                ->options([
                    'resmi_sekolah' => 'Resmi Sekolah',
                    'organisasi' => 'Organisasi Siswa (OSIS/MPK/PMR/Pramuka)',
                ])
                ->default($isAdminOrg ? 'organisasi' : 'resmi_sekolah')
                ->disabled($isAdminOrg)
                ->dehydrated()
                ->required(),
            TextInput::make('penyelenggara')
                ->label('Penyelenggara')
                ->default($isAdminOrg ? ($user?->jabatan_organisasi ?: 'OSIS') : 'SMK Telkom Purwokerto')
                ->maxLength(120),
            TextInput::make('target_kelas')
                ->label('Target Peserta / Kelas')
                ->default('Semua Kelas')
                ->maxLength(100),
            Toggle::make('is_libur')
                ->label('Hari Libur (Tidak Ada KBM)')
                ->default(false),
            Textarea::make('deskripsi')
                ->label('Deskripsi Agenda')
                ->rows(3)
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('tanggal_mulai', 'asc')
            ->columns([
                TextColumn::make('tanggal_mulai')
                    ->label('Mulai')
                    ->date('d M Y')
                    ->sortable(),
                TextColumn::make('tanggal_selesai')
                    ->label('Selesai')
                    ->date('d M Y')
                    ->sortable(),
                TextColumn::make('judul')
                    ->label('Agenda')
                    ->searchable()
                    ->wrap(),
                TextColumn::make('kategori')
                    ->label('Kategori')
                    ->badge(),
                TextColumn::make('sumber')
                    ->label('Sumber')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'organisasi' ? 'warning' : 'info'),
                TextColumn::make('penyelenggara')
                    ->label('Penyelenggara')
                    ->searchable(),
                IconColumn::make('is_libur')
                    ->label('Libur')
                    ->boolean(),
            ])
            ->filters([
                SelectFilter::make('sumber')
                    ->options([
                        'resmi_sekolah' => 'Resmi Sekolah',
                        'organisasi' => 'Organisasi Siswa',
                    ]),
                SelectFilter::make('kategori')
                    ->options([
                        'agenda_organisasi' => 'Agenda Organisasi',
                        'kegiatan_sekolah' => 'Kegiatan Sekolah',
                        'upacara' => 'Upacara',
                        'ujian_asesmen' => 'Ujian / Asesmen',
                        'libur_umum' => 'Libur Umum',
                        'libur_semester' => 'Libur Semester',
                        'ramadhan_idul_fitri' => 'Ramadhan / Idul Fitri',
                        'pkl' => 'PKL',
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListKalenderAkademiks::route('/'),
            'create' => Pages\CreateKalenderAkademik::route('/create'),
            'edit' => Pages\EditKalenderAkademik::route('/{record}/edit'),
        ];
    }
}
