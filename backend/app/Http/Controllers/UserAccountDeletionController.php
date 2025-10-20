<?php

namespace App\Http\Controllers;

use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserAccountDeletionController extends Controller
{
    public function sendCode(Request $request, OtpService $otpService): JsonResponse
    {
        $user = $request->user();

        $otpService->sendAccountDeletionCode($user);

        return response()->json([
            'status' => 'deletion-code-sent',
        ]);
    }

    public function destroy(Request $request, OtpService $otpService): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $isValid = $otpService->validateAccountDeletionCode($user->email, $data['code']);

        if (! $isValid) {
            return response()->json([
                'message' => 'The verification code is invalid or has expired.',
            ], 422);
        }

        $otpService->deleteAccountDeletionCodes($user->email);

        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        $user->tokens()->delete();

        $user->forceDelete();

        return response()->json([
            'status' => 'account-deleted',
        ]);
    }
}
