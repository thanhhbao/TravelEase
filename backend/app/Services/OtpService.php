<?php

namespace App\Services;

use App\Mail\AccountDeletionCodeMail;
use App\Mail\PasswordResetCodeMail;
use App\Mail\VerificationCodeMail;
use App\Models\AccountDeletionCode;
use App\Models\EmailVerificationCode;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    private const DEFAULT_EMAIL_TTL_MINUTES = 10;
    private const DEFAULT_PASSWORD_TTL_MINUTES = 15;
    private const DEFAULT_ACCOUNT_DELETE_TTL_MINUTES = 15;

    /**
     * Generate a numeric code of the given length.
     */
    public function generateCode(int $length = 6): string
    {
        $max = 10 ** $length - 1;
        return str_pad((string) random_int(0, $max), $length, '0', STR_PAD_LEFT);
    }

    /**
     * Create and email a verification code for the given user.
     */
    public function sendEmailVerificationCode(User $user, int $ttlMinutes = self::DEFAULT_EMAIL_TTL_MINUTES): void
    {
        $code = $this->createEmailVerificationCode($user->email, $ttlMinutes);

        try {
            Mail::to($user->email)->send(
                new VerificationCodeMail($user, $code, $ttlMinutes)
            );
            Log::info("Verification email sent successfully to {$user->email}");
        } catch (\Exception $e) {
            Log::error("Failed to send verification email to {$user->email}: " . $e->getMessage());
            throw $e; // Re-throw to handle in controller if needed
        }
    }

    /**
     * Create and email a password reset code for the given user.
     */
    public function sendPasswordResetCode(User $user, int $ttlMinutes = self::DEFAULT_PASSWORD_TTL_MINUTES): void
    {
        $code = $this->createPasswordResetCode($user->email, $ttlMinutes);

        Mail::to($user->email)->send(
            new PasswordResetCodeMail($user, $code, $ttlMinutes)
        );
    }

    public function sendAccountDeletionCode(User $user, int $ttlMinutes = self::DEFAULT_ACCOUNT_DELETE_TTL_MINUTES): void
    {
        $code = $this->createAccountDeletionCode($user->email, $ttlMinutes);

        Mail::to($user->email)->send(
            new AccountDeletionCodeMail($user, $code, $ttlMinutes)
        );
    }

    /**
     * Persist a hashed email verification code and return the plain value.
     */
    public function createEmailVerificationCode(string $email, int $ttlMinutes): string
    {
        $code = $this->generateCode();
        $expiresAt = CarbonImmutable::now()->addMinutes($ttlMinutes);

        EmailVerificationCode::where('email', $email)->delete();

        EmailVerificationCode::create([
            'email' => $email,
            'code_hash' => Hash::make($code),
            'expires_at' => $expiresAt,
        ]);

        return $code;
    }

    /**
     * Validate the provided email verification code.
     */
    public function validateEmailVerificationCode(string $email, string $code): bool
    {
        $record = EmailVerificationCode::where('email', $email)
            ->latest('expires_at')
            ->first();

        if (! $record) {
            return false;
        }

        if ($record->expires_at?->isPast()) {
            $this->deleteEmailVerificationCodes($email);
            return false;
        }

        return Hash::check($code, $record->code_hash);
    }

    /**
     * Delete all stored verification codes for an email.
     */
    public function deleteEmailVerificationCodes(string $email): void
    {
        EmailVerificationCode::where('email', $email)->delete();
    }

    /**
     * Store hashed reset code in password_reset_tokens and return plain value.
     */
    public function createPasswordResetCode(string $email, int $ttlMinutes): string
    {
        $code = $this->generateCode();

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($code),
                'created_at' => now(),
            ]
        );

        return $code;
    }

    public function createAccountDeletionCode(string $email, int $ttlMinutes): string
    {
        $code = $this->generateCode();
        $expiresAt = CarbonImmutable::now()->addMinutes($ttlMinutes);

        AccountDeletionCode::where('email', $email)->delete();

        AccountDeletionCode::create([
            'email' => $email,
            'code_hash' => Hash::make($code),
            'expires_at' => $expiresAt,
        ]);

        return $code;
    }

    public function validateAccountDeletionCode(string $email, string $code): bool
    {
        $record = AccountDeletionCode::where('email', $email)->latest('expires_at')->first();
        if (! $record) {
            return false;
        }

        if ($record->expires_at?->isPast()) {
            $this->deleteAccountDeletionCodes($email);
            return false;
        }

        return Hash::check($code, $record->code_hash);
    }

    public function deleteAccountDeletionCodes(string $email): void
    {
        AccountDeletionCode::where('email', $email)->delete();
    }
}
