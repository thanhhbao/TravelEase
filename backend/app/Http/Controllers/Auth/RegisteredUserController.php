<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    public function store(Request $request, OtpService $otpService)
    {
        $data = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','string','lowercase','email','max:255','unique:'.User::class],
            'password' => ['required','confirmed', Rules\Password::defaults()],
        ]);

        // 'password' sẽ tự hash nhờ casts trong User
        $user = User::create($data);

        $otpService->sendEmailVerificationCode($user);

        return response()->json([
            'status' => 'verification-required',
            'message' => 'Verification code sent to your email address.',
            'requires_email_verification' => true,
            'email' => $user->email,
        ], 201);
    }
}
