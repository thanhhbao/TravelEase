<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'hotel_id',
        'room_id',
        'flight_id',
        'check_in',
        'check_out',
        'guests',
        'total_price',
        'currency',
        'status',
        'stripe_payment_intent_id',
        'payment_status',
    ];

    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'total_price' => 'decimal:2',
        'guests' => 'integer',
        'currency' => 'string',
        'status' => 'string',
        'payment_status' => 'string',
    ];

    /**
     * Append computed attributes to array / JSON form.
     */
    protected $appends = ['type'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function flight(): BelongsTo
    {
        return $this->belongsTo(Flight::class);
    }

    /**
     * Expose a computed `type` attribute for the frontend.
     *
     * Returns 'hotel' when hotel_id is present, 'flight' when flight_id is present,
     * otherwise 'unknown'. This will be serialized into JSON responses so the
     * frontend can easily filter bookings by type.
     */
    public function getTypeAttribute(): string
    {
        if ($this->hotel_id !== null) return 'hotel';
        if ($this->flight_id !== null) return 'flight';
        return 'unknown';
    }
}
