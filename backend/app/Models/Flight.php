<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Flight extends Model
{
    protected $fillable = [
        'airline',
        'flight_number',
        'from_airport',
        'logo',
        'from_city',
        'to_airport',
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

    protected $appends = [
        'fromAirport',
        'toAirport',
        'departureCity',
        'arrivalCity',
    ];

    public function getFromAirportAttribute()
    {
        return $this->attributes['from_airport'];
    }

    public function getToAirportAttribute()
    {
        return $this->attributes['to_airport'];
    }

    public function getDepartureCityAttribute()
    {
        return $this->attributes['from_city'];
    }

    public function getArrivalCityAttribute()
    {
        return $this->attributes['to_city'];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
