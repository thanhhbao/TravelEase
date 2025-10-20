<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationCodeController extends Controller
{
    /**
     * Verify the email address using a one-time code.
     */
    public function __invoke(Request $request, OtpService $otpService): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'status' => 'already-verified',
            ]);
        }

        if (! $otpService->validateEmailVerificationCode($user->email, $data['code'])) {
            return response()->json([
                'message' => 'Invalid or expired verification code.',
            ], 422);
        }

        $user->markEmailAsVerified();

        event(new Verified($user));

        $otpService->deleteEmailVerificationCodes($user->email);

        return response()->json([
            'status' => 'verified',
            'user' => $user->fresh(),
        ]);
    }
}

