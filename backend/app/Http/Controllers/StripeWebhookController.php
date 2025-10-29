<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use UnexpectedValueException;
use App\Models\Booking;

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

        // Handle payment failure events
        if ($event->type === 'payment_intent.payment_failed') {
            $this->handlePaymentFailed($event->data->object);
        }

        return response()->json(['received' => true]);
    }

    private function handlePaymentFailed($paymentIntent): void
    {
        $paymentIntentId = $paymentIntent->id;

        Log::warning('stripe.webhook.payment_failed', [
            'payment_intent_id' => $paymentIntentId,
            'last_payment_error' => $paymentIntent->last_payment_error ?? null,
        ]);

        // Find booking associated with this payment intent
        $booking = Booking::where('stripe_payment_intent_id', $paymentIntentId)->first();

        if ($booking) {
            // Update booking status to reflect payment failure
            $booking->update([
                'payment_status' => 'failed',
                'status' => 'pending', // Keep booking as pending, user can retry payment
            ]);

            Log::info('booking.payment_failed_updated', [
                'booking_id' => $booking->id,
                'payment_intent_id' => $paymentIntentId,
            ]);
        } else {
            Log::warning('stripe.webhook.payment_failed_no_booking', [
                'payment_intent_id' => $paymentIntentId,
            ]);
        }
    }
}

