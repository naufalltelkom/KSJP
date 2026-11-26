<?php

namespace App\Filament\Resources;

use App\Filament\Resources\KelasResource\Pages;
use App\Models\Kelas;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

class KelasResource extends Resource
{
    protected static ?string $model = Kelas::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedAcademicCap;

    protected static string | UnitEnum | null $navigationGroup = 'Data Akademik (Guru)';

    protected static ?string $navigationLabel = 'Data Kelas';

    protected static ?string $modelLabel = 'Kelas';

    protected static ?string $pluralModelLabel = 'Data Kelas';

    protected static ?int $navigationSort = 1;

    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('nama_kelas')
                ->label('Nama Kelas')
                ->required()
                ->maxLength(50)
                ->placeholder('XI PPLG 4'),
            Select::make('tingkat')
                ->label('Tingkat')
                ->options([
                    'X' => 'Kelas X',
                    'XI' => 'Kelas XI',
                    'XII' => 'Kelas XII',
                ])
                ->required(),
            TextInput::make('konsentrasi')
                ->label('Konsentrasi Keahlian')
                ->required()
                ->maxLength(150)
                ->default('Rekayasa Perangkat Lunak'),
            TextInput::make('wali_kelas')
                ->label('Wali Kelas')
                ->required()
                ->maxLength(150),
            TextInput::make('tahun_ajaran')
                ->label('Tahun Ajaran')
                ->required()
                ->maxLength(20)
                ->default('2026/2027'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nama_kelas')
                    ->label('Kelas')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('tingkat')
                    ->label('Tingkat')
                    ->badge(),
                TextColumn::make('konsentrasi')
                    ->label('Konsentrasi')
                    ->searchable(),
                TextColumn::make('wali_kelas')
                    ->label('Wali Kelas')
                    ->searchable(),
                TextColumn::make('siswa_count')
                    ->label('Jumlah Siswa')
                    ->counts('siswa'),
                TextColumn::make('tahun_ajaran')
                    ->label('Tahun Ajaran'),
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
            'index' => Pages\ListKelas::route('/'),
            'create' => Pages\CreateKelas::route('/create'),
            'edit' => Pages\EditKelas::route('/{record}/edit'),
        ];
    }
}
