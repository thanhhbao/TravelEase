@php
    $expiresAt = now()->addMinutes($ttlMinutes)->format('H:i');
@endphp

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Confirm account deletion</title>
</head>
<body>
    <p>Hi {{ $user->name }},</p>

    <p>Someone (hopefully you) requested to delete the TravelEase account using this email address.</p>

    <p>Your verification code is:</p>

    <h2 style="font-size: 24px; letter-spacing: 4px; text-align: center; background: #f5f5f5; padding: 12px 24px; display: inline-block;">
        {{ $code }}
    </h2>

    <p>This code will expire in {{ $ttlMinutes }} minutes (at approximately {{ $expiresAt }}).</p>

    <p>If you did not request account deletion, you can safely ignore this email.</p>

    <p>Thanks,<br>TravelEase</p>
</body>
</html>
