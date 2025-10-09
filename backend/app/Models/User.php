<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens; // <- quan trọng
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable; // <- thêm HasApiTokens

    protected $fillable = ['name','email','password'];
    protected $hidden   = ['password','remember_token'];
    protected $casts    = ['email_verified_at' => 'datetime','password' => 'hashed',];
}
