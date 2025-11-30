<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hotel extends Model
{
    protected $fillable = [
        'name',
        'description',
        'address',
        'city',
        'country',
        'stars',
        'price_per_night',
        'amenities',
        'images',
        'thumbnail',
    ];

    protected $casts = [
        'price_per_night' => 'decimal:2',
        'stars' => 'integer',
        'amenities' => 'array',
        'images' => 'array',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }
}
