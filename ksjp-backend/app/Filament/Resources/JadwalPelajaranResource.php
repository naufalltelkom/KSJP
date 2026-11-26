<?php

namespace App\Filament\Resources;

use App\Enums\UserRole;
use App\Filament\Resources\JadwalPelajaranResource\Pages;
use App\Models\JadwalPelajaran;
use BackedEnum;
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
        return $table
            ->defaultSort('jam_ke')
            ->columns([
                TextColumn::make('kelas.nama_kelas')
                    ->label('Kelas')
                    ->sortable(),
                TextColumn::make('hari')
                    ->label('Hari')
                    ->badge()
                    ->sortable(),
                TextColumn::make('jam_ke')
                    ->label('Jam Ke')
                    ->sortable(),
                TextColumn::make('jam_mulai')
                    ->label('Mulai'),
                TextColumn::make('jam_selesai')
                    ->label('Selesai'),
                TextColumn::make('mata_pelajaran')
                    ->label('Mata Pelajaran')
                    ->searchable(),
                TextColumn::make('nama_guru')
                    ->label('Guru')
                    ->searchable(),
                TextColumn::make('ruangan')
                    ->label('Ruangan')
                    ->searchable(),
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
            'index' => Pages\ListJadwalPelajarans::route('/'),
            'create' => Pages\CreateJadwalPelajaran::route('/create'),
            'edit' => Pages\EditJadwalPelajaran::route('/{record}/edit'),
        ];
    }
}
