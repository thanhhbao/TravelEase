<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'phucvu1470@gmail.com';
$user = App\Models\User::where('email', $email)->first();
if (! $user) {
    echo "User $email not found\n"; exit(1);
}

try {
    app(App\Services\OtpService::class)->sendEmailVerificationCode($user);
    echo "OtpService::sendEmailVerificationCode called successfully\n";
} catch (Throwable $e) {
    echo "Exception while sending: " . get_class($e) . ": " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

// Print last 200 lines of laravel.log (simple tail)
$logfile = __DIR__ . '/storage/logs/laravel.log';
if (! file_exists($logfile)) {
    echo "Log file not found: $logfile\n"; exit(0);
}

$lines = 200;
$fp = fopen($logfile, 'r');
$pos = -1;
$line = '';
$tail = [];
while (count($tail) < $lines) {
    if (fseek($fp, $pos, SEEK_END) !== 0) { break; }
    $char = fgetc($fp);
    if ($char === "\n") {
        array_unshift($tail, $line);
        $line = '';
    } else {
        $line = $char . $line;
    }
    $pos--;
    if (ftell($fp) === 0) { if ($line !== '') array_unshift($tail, $line); break; }
}
fclose($fp);

echo "\n---- last log lines ----\n";
foreach ($tail as $l) echo $l . "\n";
