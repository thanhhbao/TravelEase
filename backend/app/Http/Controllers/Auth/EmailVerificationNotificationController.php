<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailVerificationNotificationController extends Controller
{
    public function store(Request $request, OtpService $otpService): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'status' => 'already-verified',
            ]);
        }

        try {
            $otpService->sendEmailVerificationCode($request->user());

            return response()->json([
                'status' => 'verification-code-sent',
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send verification notification: " . $e->getMessage());

            return response()->json([
                'status' => 'failed-to-send',
                'message' => 'Unable to send verification email. Please try again later.',
            ], 500);
        }
    }
}
