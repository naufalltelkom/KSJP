<?php

namespace App\Filament\Resources;

use App\Filament\Resources\NotifikasiResource\Pages;
use App\Models\Notifikasi;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

class NotifikasiResource extends Resource
{
    protected static ?string $model = Notifikasi::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedBellAlert;

    protected static string | UnitEnum | null $navigationGroup = 'Kalender & Kegiatan Siswa';

    protected static ?string $navigationLabel = 'Log Notifikasi';

    protected static ?string $modelLabel = 'Notifikasi';

    protected static ?string $pluralModelLabel = 'Notifikasi Real-time';

    protected static ?int $navigationSort = 6;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('id_kelas')
                ->label('Target Kelas (Kosongkan untuk Semua Kelas)')
                ->relationship('kelas', 'nama_kelas')
                ->preload(),
            Select::make('tipe')
                ->label('Tipe Notifikasi')
                ->options([
                    'pengumuman' => 'Pengumuman Umum',
                    'momentum' => 'Jadwal Momentum',
                    'kalender' => 'Agenda Kalender',
                    'pergantian_jam' => 'Pergantian Jam',
                ])
                ->default('pengumuman')
                ->required(),
            TextInput::make('judul')
                ->label('Judul Notifikasi')
                ->required()
                ->maxLength(200)
                ->columnSpanFull(),
            Textarea::make('pesan')
                ->label('Isi Pesan')
                ->required()
                ->rows(4)
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('created_at')
                    ->label('Waktu')
                    ->dateTime('d M Y H:i')
                    ->sortable(),
                TextColumn::make('tipe')
                    ->label('Tipe')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'momentum' => 'warning',
                        'kalender' => 'info',
                        'pergantian_jam' => 'success',
                        default => 'gray',
                    }),
                TextColumn::make('kelas.nama_kelas')
                    ->label('Target Kelas')
                    ->placeholder('Semua Kelas'),
                TextColumn::make('judul')
                    ->label('Judul')
                    ->searchable()
                    ->wrap(),
                TextColumn::make('pesan')
                    ->label('Pesan')
                    ->limit(60),
            ])
            ->filters([
                SelectFilter::make('tipe')
                    ->options([
                        'momentum' => 'Momentum',
                        'kalender' => 'Kalender',
                        'pergantian_jam' => 'Pergantian Jam',
                        'pengumuman' => 'Pengumuman',
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
            'index' => Pages\ListNotifikasis::route('/'),
            'create' => Pages\CreateNotifikasi::route('/create'),
            'edit' => Pages\EditNotifikasi::route('/{record}/edit'),
        ];
    }
}
