<?php

namespace App\Policies;

use App\Models\JadwalPelajaran;
use App\Models\User;

class JadwalPelajaranPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isGuru();
    }

    public function view(User $user, JadwalPelajaran $jadwalPelajaran): bool
    {
        return $user->isGuru();
    }

    public function create(User $user): bool
    {
        return $user->isGuru();
    }

    public function update(User $user, JadwalPelajaran $jadwalPelajaran): bool
    {
        return $user->isGuru();
    }

    public function delete(User $user, JadwalPelajaran $jadwalPelajaran): bool
    {
        return $user->isGuru();
    }
}
