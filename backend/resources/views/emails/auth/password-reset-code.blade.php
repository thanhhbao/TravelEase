<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Password reset code</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f7fafc; padding: 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
        <tr>
            <td style="padding: 24px 24px 12px;">
                <h1 style="margin: 0; font-size: 20px; color: #1f2937;">
                    Hello {{ $user->name ?? 'there' }},
                </h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 24px 12px;">
                <p style="margin: 12px 0; color: #4b5563; font-size: 15px;">
                    We received a request to reset the password for your TravelEase account. Use the code below to complete the process.
                </p>
                <div style="margin: 24px 0; text-align: center;">
                    <span style="display: inline-block; padding: 16px 32px; font-size: 28px; font-weight: bold; letter-spacing: 6px; background-color: #0ea5e9; color: #ffffff; border-radius: 999px;">
                        {{ $code }}
                    </span>
                </div>
                <p style="margin: 12px 0; color: #4b5563; font-size: 15px;">
                    The code expires in {{ $ttlMinutes }} minutes. If you did not request a reset, you can safely ignore this email—your password will remain unchanged.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 16px 24px; background-color: #f3f4f6; color: #9ca3af; font-size: 13px;">
                &copy; {{ date('Y') }} TravelEase. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>

