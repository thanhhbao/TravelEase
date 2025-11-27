<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\HasApiTokens; // <- quan trọng
use App\Models\Listing;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable; // <- thêm HasApiTokens

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'location',
        'avatar_path',
        'google_id',
        'role',
        'host_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'avatar_path',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'role' => 'string',
        'host_status' => 'string',
    ];

    protected $appends = [
        'avatar',
        'roles',
        'permissions',
        'capabilities',
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

    public function getRoleAttribute(?string $value): string
    {
        return $value ?? 'traveler';
    }

    public function getHostStatusAttribute(?string $value): string
    {
        if ($value) {
            return $value;
        }

        return $this->role === 'host' ? 'approved' : 'not_registered';
    }

    public function getRolesAttribute(): array
    {
        return array_values(array_unique([$this->role]));
    }

    public function getPermissionsAttribute(): array
    {
        return $this->buildPermissions($this->roles, $this->host_status);
    }

    public function getCapabilitiesAttribute(): array
    {
        return $this->buildCapabilitiesFromPermissions(
            $this->buildPermissions($this->roles, $this->host_status)
        );
    }

    public function listings()
    {
        return $this->hasMany(Listing::class);
    }

    /**
     * @param  array<int, string>  $roles
     * @return array<int, string>
     */
    protected function buildPermissions(array $roles, string $hostStatus): array
    {
        $permissions = ['dashboard.view', 'profile.update'];

        if (in_array('admin', $roles, true)) {
            $permissions = array_merge($permissions, [
                'admin.access',
                'users.manage',
                'listings.review',
                'listings.publish',
            ]);
        }

        if (in_array('host', $roles, true) || $hostStatus === 'approved') {
            $permissions = array_merge($permissions, [
                'listings.create',
                'listings.manage',
            ]);
        }

        if ($hostStatus === 'pending') {
            $permissions[] = 'host.apply';
        }

        return array_values(array_unique($permissions));
    }

    /**
     * @param  array<int, string>  $permissions
     */
    protected function buildCapabilitiesFromPermissions(array $permissions): array
    {
        return [
            'canAccessAdmin' => in_array('admin.access', $permissions, true),
            'canManageUsers' => in_array('users.manage', $permissions, true),
            'canPostListings' => in_array('listings.create', $permissions, true),
            'canPublishListings' => in_array('listings.publish', $permissions, true),
        ];
    }
}
