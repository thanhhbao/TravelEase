<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request, OtpService $otpService): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'status' => 'already-verified',
            ]);
        }

        $otpService->sendEmailVerificationCode($request->user());

        return response()->json([
            'status' => 'verification-code-sent',
        ]);
    }
}
