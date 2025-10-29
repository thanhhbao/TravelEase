<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class PaymentController extends Controller
{
    private const ZERO_DECIMAL_CURRENCIES = [
        'BIF',
        'CLP',
        'DJF',
        'GNF',
        'JPY',
        'KMF',
        'KRW',
        'MGA',
        'PYG',
        'RWF',
        'UGX',
        'VND',
        'VUV',
        'XAF',
        'XOF',
        'XPF',
    ];

    public function createIntent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'currency' => ['nullable', 'string', 'size:3'],
            'description' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
            'metadata.*' => ['string'],
            'amount_in_minor' => ['nullable', 'boolean'],
        ]);

        $currency = strtolower($validated['currency'] ?? config('stripe.currency', 'usd'));

        $amountMinor = isset($validated['amount_in_minor']) && $validated['amount_in_minor']
            ? (int) round($validated['amount'])
            : $this->convertToMinorUnits((float) $validated['amount'], $currency);

        if ($amountMinor < 1) {
            throw ValidationException::withMessages([
                'amount' => 'Amount must be at least 1 unit in the selected currency.',
            ]);
        }

        $metadata = array_map('strval', $validated['metadata'] ?? []);
        $metadata['user_id'] = (string) $request->user()->id;

        try {
            $intent = $this->stripeClient()->paymentIntents->create([
                'amount' => $amountMinor,
                'currency' => $currency,
                'description' => $validated['description'] ?? null,
                'automatic_payment_methods' => ['enabled' => true],
                'metadata' => $metadata,
            ]);
        } catch (ApiErrorException $exception) {
            Log::error('stripe.payment_intent.create_failed', [
                'user_id' => $request->user()->id,
                'currency' => $currency,
                'amount_minor' => $amountMinor,
                'message' => $exception->getMessage(),
                'code' => $exception->getStripeCode(),
                'type' => $exception->getError()->type ?? null,
            ]);

            $errorMessage = $this->getStripeErrorMessage($exception);
            throw ValidationException::withMessages([
                'stripe' => $errorMessage,
            ]);
        }

        return response()->json([
            'clientSecret' => $intent->client_secret,
            'paymentIntentId' => $intent->id,
            'currency' => $intent->currency,
            'amount' => $intent->amount,
            'publishableKey' => config('stripe.publishable_key'),
        ]);
    }

    private function convertToMinorUnits(float $amount, string $currency): int
    {
        $currency = strtoupper($currency);
        $multiplier = in_array($currency, self::ZERO_DECIMAL_CURRENCIES, true) ? 1 : 100;

        return (int) round($amount * $multiplier);
    }

    private function stripeClient(): StripeClient
    {
        $secret = config('stripe.secret_key');

        if (!$secret) {
            throw ValidationException::withMessages([
                'payment' => 'Stripe is not configured. Please contact support.',
            ]);
        }

        return app(StripeClient::class);
    }

    private function getStripeErrorMessage(ApiErrorException $exception): string
    {
        $code = $exception->getStripeCode();
        $type = $exception->getError()->type ?? null;

        return match ($code) {
            'card_declined' => 'Your card was declined. Please try a different payment method or contact your bank.',
            'expired_card' => 'Your card has expired. Please use a different card.',
            'incorrect_cvc' => 'The security code (CVC) is incorrect. Please check and try again.',
            'processing_error' => 'An error occurred while processing your payment. Please try again.',
            'incorrect_number' => 'The card number is incorrect. Please check and try again.',
            'invalid_expiry_month' => 'The expiration month is invalid. Please check and try again.',
            'invalid_expiry_year' => 'The expiration year is invalid. Please check and try again.',
            'invalid_cvc' => 'The security code is invalid. Please check and try again.',
            default => match ($type) {
                'card_error' => 'There was an issue with your card. Please check your details and try again.',
                'invalid_request_error' => 'Invalid payment request. Please contact support if this persists.',
                'api_connection_error' => 'Connection error. Please check your internet and try again.',
                'api_error' => 'Payment service temporarily unavailable. Please try again later.',
                'authentication_error' => 'Payment authentication failed. Please contact support.',
                'rate_limit_error' => 'Too many payment attempts. Please wait a moment and try again.',
                default => 'Unable to process payment. Please try again or contact support.',
            },
        };
    }
}
