<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;

// ===============================
// 🔐 AUTHENTICATION API (Stateless)
// ===============================

// ✅ Lấy thông tin user hiện tại qua token (Bearer)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json($request->user());
});

// ✅ Đăng ký
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// ✅ Đăng nhập
Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// ✅ Đăng xuất
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:sanctum')
    ->withoutMiddleware([VerifyCsrfToken::class]);

// ===============================
// 🔄 QUÊN / ĐẶT LẠI MẬT KHẨU
// ===============================

// ✅ Gửi mail reset password
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// ✅ Đặt lại mật khẩu
Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// ===============================
// 📧 XÁC MINH EMAIL
// ===============================

// ✅ Gửi lại email verify (phải đăng nhập)
Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// ===============================
// 🧪 TEST ROUTE (tuỳ chọn, để kiểm tra token)
// ===============================
Route::middleware('auth:sanctum')->get('/check-token', function (Request $request) {
    return response()->json([
        'status' => 'ok',
        'user' => $request->user(),
    ]);
});
