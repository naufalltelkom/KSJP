<?php

namespace App\Policies;

use App\Models\Notifikasi;
use App\Models\User;

class NotifikasiPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isGuru() || $user->isAdminOrganisasi();
    }

    public function view(User $user, Notifikasi $notifikasi): bool
    {
        return $user->isGuru() || $user->isAdminOrganisasi();
    }

    public function create(User $user): bool
    {
        return $user->isGuru() || $user->isAdminOrganisasi();
    }

    public function update(User $user, Notifikasi $notifikasi): bool
    {
        return $user->isGuru();
    }

    public function delete(User $user, Notifikasi $notifikasi): bool
    {
        return $user->isGuru();
    }
}
