<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'phucvu1470@gmail.com';
$codes = App\Models\EmailVerificationCode::where('email', $email)->get()->toArray();
echo "Found " . count($codes) . " record(s) for $email\n";
if (count($codes) > 0) {
    foreach ($codes as $c) {
        echo json_encode($c, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    }
}

// Also show the user row if exists
$user = App\Models\User::where('email', $email)->first();
if ($user) {
    echo "User found: " . $user->email . " id=" . $user->id . "\n";
} else {
    echo "User not found\n";
}
