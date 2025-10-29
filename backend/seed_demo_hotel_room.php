<?php
// seed_demo_hotel_room.php
// Boot Laravel and insert/update a demo hotel and room so bookings can eager-load them.

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

// Boot the kernel like artisan does
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$now = date('Y-m-d H:i:s');

// Demo Unsplash image
$image = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&h=900&q=80';

// Insert or update hotel with id=1
$hotelData = [
    'name' => 'Seaside Hotel',
    'city' => 'Da Nang',
    'country' => 'Vietnam',
    // Ensure address exists if DB requires it
    'address' => '123 Beach Road',
    'stars' => 4,
    'thumbnail' => $image,
    'description' => 'Demo seaside hotel',
    'created_at' => $now,
    'updated_at' => $now,
];

// Conditionally include slug if column exists
if (Schema::hasColumn('hotels', 'slug')) {
    $hotelData['slug'] = 'demo-hotel-1';
}

// Conditionally include price_per_night or price
if (Schema::hasColumn('hotels', 'price_per_night')) {
    $hotelData['price_per_night'] = 120.00;
} elseif (Schema::hasColumn('hotels', 'price')) {
    $hotelData['price'] = 120.00;
}

// Conditionally include amenities column
if (Schema::hasColumn('hotels', 'amenities')) {
    $hotelData['amenities'] = json_encode(['wifi', 'pool', 'breakfast']);
}

DB::table('hotels')->updateOrInsert(['id' => 1], $hotelData);

// Insert or update room with id=1
DB::table('rooms')->updateOrInsert(
    ['id' => 1],
    [
        'hotel_id' => 1,
        'external_id' => null,
        'name' => 'Deluxe Room',
        'beds' => '1 king',
        'max_guests' => 2,
        'price' => 120.00,
        'created_at' => $now,
        'updated_at' => $now,
    ]
);

echo "Seeded demo hotel and room (id=1)\n";
