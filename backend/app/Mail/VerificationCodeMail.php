<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $code,
        public int $ttlMinutes
    ) {
    }

    public function build(): self
    {
        return $this->subject('Your TravelEase verification code')
            ->view('emails.auth.verify-code')
            ->with([
                'user' => $this->user,
                'code' => $this->code,
                'ttlMinutes' => $this->ttlMinutes,
            ]);
    }
}

