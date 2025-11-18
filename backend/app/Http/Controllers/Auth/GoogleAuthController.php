<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::where('google_id', $googleUser->getId())->first();

            if (!$user) {
                // Check if user exists with same email
                $existingUser = User::where('email', $googleUser->getEmail())->first();

                if ($existingUser) {
                    // Link Google account to existing user
                    $existingUser->update(['google_id' => $googleUser->getId()]);
                    $user = $existingUser;
                } else {
                    // Create new user
                    $user = User::create([
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'google_id' => $googleUser->getId(),
                        'password' => bcrypt(uniqid()), // Random password since OAuth
                        'email_verified_at' => now(), // Google emails are verified
                    ]);
                }
            }

            // Generate token
            $token = $user->createToken('web')->plainTextToken;

            // Redirect to frontend with token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away($frontendUrl . '/auth/callback?token=' . $token . '&login=google');

        } catch (\Throwable $e) {
            report($e);
            // Redirect to frontend with error (include reason only in debug/local)
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            $query = '?error=google_auth_failed';
            // Only append exception message when app is in debug to avoid leaking details in production
            if (config('app.debug')) {
                $reason = urlencode($e->getMessage());
                $query .= '&reason=' . $reason;
            }
            return redirect()->away($frontendUrl . '/auth/callback' . $query);
        }
    }
}
