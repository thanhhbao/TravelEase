<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\HasApiTokens; // <- quan trọng

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, Notifiable; // <- thêm HasApiTokens

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'location',
        'avatar_path',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'avatar_path',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $appends = [
        'avatar',
    ];

    public function getAvatarAttribute(): ?string
    {
        if (! $this->avatar_path) {
            return null;
        }

        $relative = Storage::disk('public')->url($this->avatar_path);

        if (! str_starts_with($relative, 'http')) {
            return URL::to($relative);
        }

        return $relative;
    }
}
