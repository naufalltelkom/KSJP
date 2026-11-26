<?php

namespace App\Policies;

use App\Models\JadwalMomentum;
use App\Models\User;

class JadwalMomentumPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isGuru();
    }

    public function view(User $user, JadwalMomentum $jadwalMomentum): bool
    {
        return $user->isGuru();
    }

    public function create(User $user): bool
    {
        return $user->isGuru();
    }

    public function update(User $user, JadwalMomentum $jadwalMomentum): bool
    {
        return $user->isGuru();
    }

    public function delete(User $user, JadwalMomentum $jadwalMomentum): bool
    {
        return $user->isGuru();
    }
}
