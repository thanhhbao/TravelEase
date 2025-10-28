<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use UnexpectedValueException;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $secret = config('stripe.webhook_secret');

        if (!$secret) {
            Log::warning('stripe.webhook.secret_missing');

            return response()->json(['error' => 'Stripe webhook secret is not configured.'], 500);
        }

        $payload = $request->getContent();
        $signatureHeader = $request->header('Stripe-Signature');

        if (!$signatureHeader) {
            Log::warning('stripe.webhook.signature_missing');

            return response()->json(['error' => 'Missing Stripe signature header.'], 400);
        }

        try {
            $event = Webhook::constructEvent($payload, $signatureHeader, $secret);
        } catch (UnexpectedValueException) {
            Log::warning('stripe.webhook.invalid_payload');

            return response()->json(['error' => 'Invalid payload.'], 400);
        } catch (SignatureVerificationException $exception) {
            Log::warning('stripe.webhook.signature_invalid', [
                'message' => $exception->getMessage(),
            ]);

            return response()->json(['error' => 'Invalid signature.'], 400);
        }

        Log::info('stripe.webhook.received', [
            'type' => $event->type,
            'id' => $event->id,
        ]);

        return response()->json(['received' => true]);
    }
}

