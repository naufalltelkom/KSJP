<?php

namespace App\Filament\Resources;

use App\Enums\UserRole;
use App\Filament\Resources\JadwalPelajaranResource\Pages;
use App\Models\JadwalMomentum;
use App\Models\JadwalPelajaran;
use App\Services\JadwalService;
use BackedEnum;
use Carbon\Carbon;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\TimePicker;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class JadwalPelajaranResource extends Resource
{
    protected static ?string $model = JadwalPelajaran::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedClock;

    protected static string | UnitEnum | null $navigationGroup = 'Manajemen Jadwal (Guru)';

    protected static ?string $navigationLabel = 'Jadwal Reguler';

    protected static ?string $modelLabel = 'Jadwal Pelajaran';

    protected static ?string $pluralModelLabel = 'Jadwal Pelajaran Reguler';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('id_kelas')
                ->label('Kelas')
                ->relationship('kelas', 'nama_kelas')
                ->required()
                ->preload(),
            Select::make('hari')
                ->label('Hari')
                ->options([
                    'Senin' => 'Senin',
                    'Selasa' => 'Selasa',
                    'Rabu' => 'Rabu',
                    'Kamis' => 'Kamis',
                    'Jumat' => 'Jumat',
                    'Sabtu' => 'Sabtu',
                ])
                ->required(),
            TextInput::make('jam_ke')
                ->label('Jam Ke')
                ->numeric()
                ->minValue(1)
                ->maxValue(15)
                ->required(),
            TimePicker::make('jam_mulai')
                ->label('Jam Mulai')
                ->seconds(false)
                ->required(),
            TimePicker::make('jam_selesai')
                ->label('Jam Selesai')
                ->seconds(false)
                ->required(),
            TextInput::make('mata_pelajaran')
                ->label('Mata Pelajaran')
                ->required()
                ->maxLength(150),
            Select::make('id_guru')
                ->label('Akun Guru (Opsional)')
                ->relationship(
                    name: 'guru',
                    titleAttribute: 'nama_lengkap',
                    modifyQueryUsing: fn (Builder $query) => $query->where('role', UserRole::Guru->value),
                )
                ->searchable()
                ->preload(),
            TextInput::make('nama_guru')
                ->label('Nama Guru Pengampu')
                ->required()
                ->maxLength(150),
            TextInput::make('ruangan')
                ->label('Ruangan / Lab')
                ->required()
                ->maxLength(80),
        ]);
    }

    public static function table(Table $table): Table
    {
        $nowWib = Carbon::now('Asia/Jakarta');
        $todayHari = JadwalService::namaHari($nowWib);
        $nowTime = $nowWib->format('H:i:s');
        $momentumByRegulerId = JadwalMomentum::whereDate('tanggal', $nowWib->toDateString())
            ->whereNotNull('id_jadwal_reguler')
            ->pluck('status_perubahan', 'id_jadwal_reguler')
            ->all();

        return $table
            ->defaultSort('jam_ke')
            ->paginated([25, 50, 'all'])
            ->defaultPaginationPageOption(50)
            ->columns([
                TextColumn::make('hari')
                    ->label('Hari')
                    ->badge()
                    ->color('gray')
                    ->sortable(),
                TextColumn::make('jam_ke')
                    ->label('Jam')
                    ->formatStateUsing(fn ($state): string => "Jam {$state}")
                    ->badge()
                    ->color('danger')
                    ->sortable(),
                TextColumn::make('jam_mulai')
                    ->label('Waktu (WIB)')
                    ->formatStateUsing(fn (JadwalPelajaran $record): string => substr((string) $record->jam_mulai, 0, 5) . ' - ' . substr((string) $record->jam_selesai, 0, 5))
                    ->weight('semibold'),
                TextColumn::make('mata_pelajaran')
                    ->label('Mata Pelajaran / Kegiatan')
                    ->weight('bold')
                    ->searchable()
                    ->wrap(),
                TextColumn::make('nama_guru')
                    ->label('Guru Pengampu')
                    ->searchable()
                    ->wrap(),
                TextColumn::make('ruangan')
                    ->label('Ruangan / Lab')
                    ->badge()
                    ->color('info')
                    ->searchable(),
                TextColumn::make('status_live')
                    ->label('Status Live')
                    ->state(function (JadwalPelajaran $record) use ($todayHari, $nowTime, $momentumByRegulerId): string {
                        if (isset($momentumByRegulerId[$record->id])) {
                            return 'Momentum Aktif';
                        }
                        if ($record->hari !== $todayHari) {
                            return 'Terjadwal';
                        }
                        $mulai = substr((string) $record->jam_mulai, 0, 8);
                        $selesai = substr((string) $record->jam_selesai, 0, 8);
                        if ($nowTime >= $mulai && $nowTime < $selesai) {
                            return 'Sedang Berlangsung';
                        }
                        if ($nowTime >= $selesai) {
                            return 'Selesai';
                        }

                        return 'Akan Datang';
                    })
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Sedang Berlangsung' => 'success',
                        'Momentum Aktif' => 'warning',
                        'Akan Datang' => 'info',
                        default => 'gray',
                    }),
            ])
            ->filters([
                SelectFilter::make('hari')
                    ->options([
                        'Senin' => 'Senin',
                        'Selasa' => 'Selasa',
                        'Rabu' => 'Rabu',
                        'Kamis' => 'Kamis',
                        'Jumat' => 'Jumat',
                        'Sabtu' => 'Sabtu',
                    ]),
                SelectFilter::make('id_kelas')
                    ->label('Kelas')
                    ->relationship('kelas', 'nama_kelas')
                    ->default(fn () => Auth::user()?->id_kelas),
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
            'index' => Pages\ListJadwalPelajarans::route('/'),
            'create' => Pages\CreateJadwalPelajaran::route('/create'),
            'edit' => Pages\EditJadwalPelajaran::route('/{record}/edit'),
        ];
    }
}
