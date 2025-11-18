<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('user:assign-role {email} {role} {--host_status=}', function (string $email, string $role) {
    $role = strtolower($role);
    $allowed = ['admin', 'traveler', 'host'];

    if (! in_array($role, $allowed, true)) {
        $this->error('Role must be one of: '.implode(', ', $allowed));
        return self::FAILURE;
    }

    $hostStatus = $this->option('host_status');
    $allowedHostStatus = ['not_registered', 'pending', 'approved', 'rejected', null, ''];
    if (! in_array($hostStatus, $allowedHostStatus, true)) {
        $this->error('host_status must be one of: not_registered, pending, approved, rejected');
        return self::FAILURE;
    }

    /** @var \App\Models\User|null $user */
    $user = User::where('email', $email)->first();

    if (! $user) {
        $this->error("No user found with email {$email}");
        return self::FAILURE;
    }

    if ($role === 'host' && empty($hostStatus)) {
        $hostStatus = 'approved';
    }

    if ($role !== 'host' && empty($hostStatus)) {
        $hostStatus = $user->host_status === 'approved' ? 'not_registered' : $user->host_status;
    }

    $user->forceFill([
        'role' => $role,
        'host_status' => $hostStatus ?? $user->host_status,
    ])->save();

    $this->info("Updated {$user->email} → role={$user->role}, host_status={$user->host_status}");

    return self::SUCCESS;
})->purpose('Assign a role (and optional host_status) to a user by email.');
