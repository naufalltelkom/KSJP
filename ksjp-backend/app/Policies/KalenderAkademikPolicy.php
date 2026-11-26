<?php

namespace App\Policies;

use App\Models\KalenderAkademik;
use App\Models\User;

class KalenderAkademikPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isGuru() || $user->isAdminOrganisasi();
    }

    public function view(User $user, KalenderAkademik $kalenderAkademik): bool
    {
        return $user->isGuru() || $user->isAdminOrganisasi();
    }

    public function create(User $user): bool
    {
        return $user->isGuru() || $user->isAdminOrganisasi();
    }

    public function update(User $user, KalenderAkademik $kalenderAkademik): bool
    {
        if ($user->isGuru()) {
            return true;
        }

        return $user->isAdminOrganisasi() && $kalenderAkademik->sumber === 'organisasi';
    }

    public function delete(User $user, KalenderAkademik $kalenderAkademik): bool
    {
        if ($user->isGuru()) {
            return true;
        }

        return $user->isAdminOrganisasi() && $kalenderAkademik->sumber === 'organisasi';
    }
}
