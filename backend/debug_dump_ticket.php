<?php
// debug_dump_ticket.php
// Boot Laravel application and print the first Ticket (with flight) as JSON.

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

// Boot the kernel like artisan does
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Ticket;

$t = Ticket::with('flight')->first();
if (!$t) {
    echo json_encode([]);
    exit(0);
}

// Convert to array and print nicely
echo json_encode($t->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

// End
