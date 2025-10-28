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
            ]);

            throw ValidationException::withMessages([
                'stripe' => 'Unable to initiate payment at the moment. Please try again later.',
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
}
