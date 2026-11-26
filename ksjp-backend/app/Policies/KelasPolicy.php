<?php

namespace App\Policies;

use App\Models\Kelas;
use App\Models\User;

class KelasPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isGuru();
    }

    public function view(User $user, Kelas $kelas): bool
    {
        return $user->isGuru();
    }

    public function create(User $user): bool
    {
        return $user->isGuru();
    }

    public function update(User $user, Kelas $kelas): bool
    {
        return $user->isGuru();
    }

    public function delete(User $user, Kelas $kelas): bool
    {
        return $user->isGuru();
    }
}
