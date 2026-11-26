<?php

namespace App\Filament\Resources;

use App\Filament\Resources\JadwalMomentumResource\Pages;
use App\Models\JadwalMomentum;
use App\Models\JadwalPelajaran;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\TimePicker;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

class JadwalMomentumResource extends Resource
{
    protected static ?string $model = JadwalMomentum::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedBolt;

    protected static string | UnitEnum | null $navigationGroup = 'Manajemen Jadwal (Guru)';

    protected static ?string $navigationLabel = 'Jadwal Momentum';

    protected static ?string $modelLabel = 'Jadwal Momentum';

    protected static ?string $pluralModelLabel = 'Jadwal Dinamis (Momentum)';

    protected static ?int $navigationSort = 4;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('id_kelas')
                ->label('Kelas')
                ->relationship('kelas', 'nama_kelas')
                ->required()
                ->preload(),
            DatePicker::make('tanggal')
                ->label('Tanggal Berlaku')
                ->required()
                ->native(false),
            Select::make('id_jadwal_reguler')
                ->label('Timpa Jadwal Reguler (Opsional)')
                ->options(function (): array {
                    return JadwalPelajaran::with('kelas')
                        ->orderBy('id_kelas')
                        ->orderBy('hari')
                        ->orderBy('jam_ke')
                        ->get()
                        ->mapWithKeys(fn (JadwalPelajaran $j): array => [
                            $j->id => ($j->kelas?->nama_kelas ?? '-') . " | {$j->hari} Jam {$j->jam_ke} — {$j->mata_pelajaran}",
                        ])
                        ->all();
                })
                ->searchable(),
            Select::make('status_perubahan')
                ->label('Jenis Perubahan')
                ->options([
                    'penggantian_guru' => 'Penggantian Guru',
                    'pindah_ruangan' => 'Pindah Ruangan',
                    'ganti_mapel' => 'Ganti Mata Pelajaran',
                    'jam_kosong' => 'Jam Kosong / Penugasan',
                    'kegiatan_khusus' => 'Kegiatan Khusus',
                    'jadwal_tambahan' => 'Jadwal Tambahan',
                ])
                ->required()
                ->default('penggantian_guru'),
            TextInput::make('jam_ke')
                ->label('Jam Ke (jika tidak memilih slot reguler)')
                ->numeric()
                ->minValue(1)
                ->maxValue(15),
            TimePicker::make('jam_mulai')
                ->label('Jam Mulai Baru (Opsional)')
                ->seconds(false),
            TimePicker::make('jam_selesai')
                ->label('Jam Selesai Baru (Opsional)')
                ->seconds(false),
            TextInput::make('mata_pelajaran')
                ->label('Mata Pelajaran Pengganti (Opsional)')
                ->maxLength(150),
            TextInput::make('nama_guru_pengganti')
                ->label('Guru Pengganti (Opsional)')
                ->maxLength(150),
            TextInput::make('ruangan_baru')
                ->label('Ruangan Baru (Opsional)')
                ->maxLength(80),
            Textarea::make('keterangan')
                ->label('Keterangan / Instruksi untuk Siswa')
                ->rows(3)
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('tanggal', 'desc')
            ->columns([
                TextColumn::make('tanggal')
                    ->label('Tanggal')
                    ->date('d M Y')
                    ->sortable(),
                TextColumn::make('kelas.nama_kelas')
                    ->label('Kelas'),
                TextColumn::make('status_perubahan')
                    ->label('Status')
                    ->badge()
                    ->color('warning'),
                TextColumn::make('mata_pelajaran')
                    ->label('Mapel')
                    ->placeholder('(Ikut Reguler)')
                    ->searchable(),
                TextColumn::make('nama_guru_pengganti')
                    ->label('Guru Pengganti')
                    ->placeholder('-'),
                TextColumn::make('ruangan_baru')
                    ->label('Ruangan Baru')
                    ->placeholder('-'),
                TextColumn::make('pembuat.nama_lengkap')
                    ->label('Diinput Oleh')
                    ->placeholder('-'),
            ])
            ->filters([
                SelectFilter::make('status_perubahan')
                    ->label('Status Perubahan')
                    ->options([
                        'penggantian_guru' => 'Penggantian Guru',
                        'pindah_ruangan' => 'Pindah Ruangan',
                        'ganti_mapel' => 'Ganti Mapel',
                        'jam_kosong' => 'Jam Kosong',
                        'kegiatan_khusus' => 'Kegiatan Khusus',
                        'jadwal_tambahan' => 'Jadwal Tambahan',
                    ]),
                SelectFilter::make('id_kelas')
                    ->label('Kelas')
                    ->relationship('kelas', 'nama_kelas'),
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
            'index' => Pages\ListJadwalMomenta::route('/'),
            'create' => Pages\CreateJadwalMomentum::route('/create'),
            'edit' => Pages\EditJadwalMomentum::route('/{record}/edit'),
        ];
    }
}
