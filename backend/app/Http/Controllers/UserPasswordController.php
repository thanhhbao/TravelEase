<?php

namespace App\Http\Controllers;

use App\Services\OtpService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;

class UserPasswordController extends Controller
{
    public function sendCode(Request $request, OtpService $otpService): JsonResponse
    {
        $user = $request->user();

        $otpService->sendPasswordResetCode($user);

        return response()->json([
            'status' => 'password-code-sent',
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'code' => ['required', 'string'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->first();

        if (! $record) {
            return response()->json([
                'message' => 'The verification code is invalid or has expired.',
            ], 422);
        }

        $expiresMinutes = config('auth.passwords.users.expire', 60);
        $expiresAt = CarbonImmutable::parse($record->created_at)->addMinutes($expiresMinutes);

        if (! Hash::check($data['code'], $record->token) || $expiresAt->isPast()) {
            DB::table('password_reset_tokens')->where('email', $user->email)->delete();

            return response()->json([
                'message' => 'The verification code is invalid or has expired.',
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make($data['password']),
            'remember_token' => Str::random(60),
        ])->save();

        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        return response()->json([
            'status' => 'password-updated',
        ]);
    }
}
