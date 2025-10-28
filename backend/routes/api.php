<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\EmailVerificationCodeController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\UserPasswordController;
use App\Http\Controllers\UserAccountDeletionController;
use App\Http\Controllers\ContactController;

// Lấy user bằng Bearer token (Sanctum PAT)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    \Log::debug('Authorization header', ['auth' => $request->header('Authorization')]);
    return $request->user();
});

Route::middleware('auth:sanctum')->put('/user/profile', [UserProfileController::class, 'update'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::middleware(['auth:sanctum', 'throttle:6,1'])->post('/user/password/code', [UserPasswordController::class, 'sendCode'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::middleware('auth:sanctum')->post('/user/password', [UserPasswordController::class, 'update'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::middleware(['auth:sanctum', 'throttle:6,1'])->post('/user/delete/code', [UserAccountDeletionController::class, 'sendCode'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::middleware('auth:sanctum')->post('/user/delete', [UserAccountDeletionController::class, 'destroy'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// ===== Bookings =====
use App\Http\Controllers\BookingController;

Route::middleware('auth:sanctum')->get('/my-bookings', [BookingController::class, 'myBookings'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::middleware('auth:sanctum')->post('/my-bookings', [BookingController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::middleware('auth:sanctum')->get('/my-bookings/{id}', [BookingController::class, 'show'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::middleware('auth:sanctum')->post('/my-bookings/{id}/cancel', [BookingController::class, 'cancel'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

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

Route::post('/email/verify-code', EmailVerificationCodeController::class)
    ->middleware('throttle:6,1')
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::get('/_debug/auth-header', function (Request $request) {
    \Log::debug('debug.auth-header', [
        'authorization' => $request->header('Authorization'),
        'tokens' => $request->bearerToken(),
    ]);

    return response()->json([
        'authorization' => $request->header('Authorization'),
        'token' => $request->bearerToken(),
    ]);
});

// ===== Gửi email verify (cần Bearer token) =====
Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// ===== Flights =====
use App\Http\Controllers\FlightController;

Route::get('/flights', [FlightController::class, 'index'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::get('/flights/{id}', [FlightController::class, 'show'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// ===== Hotels =====
use App\Http\Controllers\HotelController;

Route::get('/hotels', [HotelController::class, 'index'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::get('/hotels/{id}', [HotelController::class, 'show'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// ===== Tickets =====
use App\Http\Controllers\TicketController;

Route::middleware('auth:sanctum')->get('/tickets', [TicketController::class, 'index'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::middleware('auth:sanctum')->get('/tickets/{id}', [TicketController::class, 'show'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::middleware('auth:sanctum')->post('/tickets/{id}/cancel', [TicketController::class, 'cancel'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// ===== Contact Support =====
Route::post('/contact', [ContactController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::middleware('auth:sanctum')->get('/contacts', [ContactController::class, 'index'])
    ->withoutMiddleware([VerifyCsrfToken::class]);
