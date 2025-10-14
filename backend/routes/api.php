<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;

// Lấy user bằng Bearer token (Sanctum PAT)
Route::middleware('auth:sanctum')->get('/user', fn (Request $r) => $r->user());

// ===== Auth (stateless JSON, KHÔNG dùng CSRF) =====
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:sanctum')
    ->withoutMiddleware([VerifyCsrfToken::class]);

// ===== Password reset (JSON) =====
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// Temporary debug endpoint to echo request body/headers (only in local)
if (env('APP_ENV') === 'local') {
    Route::post('/debug/echo', function (\Illuminate\Http\Request $r) {
        return response()->json([
            'body' => $r->all(),
            'headers' => $r->headers->all(),
        ]);
    })->withoutMiddleware([VerifyCsrfToken::class]);
}

// ===== Gửi email verify (cần Bearer token) =====
Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->withoutMiddleware([VerifyCsrfToken::class]);
