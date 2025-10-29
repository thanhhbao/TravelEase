<?php
// debug_dump_booking.php
// Boot Laravel application and print the first Booking (with hotel and room) as JSON.

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

// Boot the kernel like artisan does
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Booking;

$b = Booking::with(['hotel', 'room'])->first();
if (!$b) {
    echo json_encode([]);
    exit(0);
}

// Convert to array and print nicely
echo json_encode($b->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

// End
