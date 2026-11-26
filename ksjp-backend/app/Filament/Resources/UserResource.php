<?php

namespace App\Filament\Resources;

use App\Enums\UserRole;
use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
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
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use UnitEnum;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedUsers;

    protected static string | UnitEnum | null $navigationGroup = 'Data Akademik (Guru)';

    protected static ?string $navigationLabel = 'Siswa & Pengguna';

    protected static ?string $modelLabel = 'Pengguna';

    protected static ?string $pluralModelLabel = 'Siswa & Pengguna';

    protected static ?int $navigationSort = 2;

    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('nis')
                ->label('NIS / Kode')
                ->unique(ignoreRecord: true)
                ->maxLength(30),
            TextInput::make('username')
                ->label('Username')
                ->required()
                ->unique(ignoreRecord: true)
                ->maxLength(60),
            TextInput::make('nama_lengkap')
                ->label('Nama Lengkap')
                ->required()
                ->maxLength(150),
            TextInput::make('email')
                ->label('Email')
                ->email()
                ->unique(ignoreRecord: true)
                ->maxLength(255),
            Select::make('role')
                ->label('Peran (RBAC)')
                ->options(UserRole::class)
                ->required()
                ->default(UserRole::Siswa),
            Select::make('id_kelas')
                ->label('Kelas')
                ->relationship('kelas', 'nama_kelas')
                ->searchable()
                ->preload(),
            Select::make('jenis_kelamin')
                ->label('Jenis Kelamin (L/P)')
                ->options([
                    'L' => 'Laki-laki (L)',
                    'P' => 'Perempuan (P)',
                ]),
            TextInput::make('jabatan_organisasi')
                ->label('Jabatan / Organisasi')
                ->maxLength(100),
            TextInput::make('password')
                ->label('Password')
                ->password()
                ->revealable()
                ->required(fn (string $operation): bool => $operation === 'create')
                ->dehydrated(fn (?string $state): bool => filled($state))
                ->maxLength(255),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nis')
                    ->label('NIS / Kode')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('nama_lengkap')
                    ->label('Nama Lengkap')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('role')
                    ->label('Peran')
                    ->badge(),
                TextColumn::make('kelas.nama_kelas')
                    ->label('Kelas')
                    ->placeholder('-'),
                TextColumn::make('jenis_kelamin')
                    ->label('L/P')
                    ->placeholder('-'),
                TextColumn::make('username')
                    ->label('Username')
                    ->searchable(),
            ])
            ->filters([
                SelectFilter::make('role')
                    ->label('Peran')
                    ->options(UserRole::class),
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
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
