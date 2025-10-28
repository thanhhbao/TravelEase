<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Flight extends Model
{
    protected $fillable = [
        'airline',
        'flight_number',
        'logo',
        'from_city',
        'to_city',
        'departure_time',
        'arrival_time',
        'duration',
        'stops',
        'price',
        'class',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
