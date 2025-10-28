<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class BookingController extends Controller
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

    /**
     * Get authenticated user's bookings with pagination and filters
     */
    public function myBookings(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = Booking::where('user_id', $user->id);

        // Filter by status
        if ($request->has('status') && in_array($request->status, ['pending', 'confirmed', 'cancelled'])) {
            $query->where('status', $request->status);
        }

        // Filter by type (hotel or flight)
        if ($request->has('type')) {
            if ($request->type === 'hotel') {
                $query->whereNotNull('hotel_id');
            } elseif ($request->type === 'flight') {
                $query->whereNotNull('flight_id');
            }
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json($bookings);
    }

    /**
     * Get specific booking details (only if owned by authenticated user)
     */
    public function show($id): JsonResponse
    {
        $user = Auth::user();

        $booking = Booking::with(['hotel', 'room', 'flight'])
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        return response()->json($booking);
    }

    /**
     * Cancel a booking (only if owned by authenticated user and not already cancelled)
     */
    public function cancel($id): JsonResponse
    {
        $user = Auth::user();

        $booking = Booking::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Booking is already cancelled'], 400);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Booking cancelled successfully']);
    }

    /**
     * Create a new booking
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'hotel_id' => 'nullable|integer',
            'room_id' => 'nullable|integer',
            'flight_id' => 'nullable|integer',
            'check_in' => 'nullable|date|after:today',
            'check_out' => 'nullable|date|after:check_in',
            'guests' => 'required|integer|min:1',
            'total_price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'payment_intent_id' => 'nullable|string',
        ]);

        // Ensure at least hotel or flight is provided
        if (!$validated['hotel_id'] && !$validated['flight_id']) {
            return response()->json(['message' => 'Either hotel_id or flight_id must be provided'], 422);
        }

        // For hotel bookings, check_in and check_out are required
        if ($validated['hotel_id'] && (!$validated['check_in'] || !$validated['check_out'])) {
            return response()->json(['message' => 'check_in and check_out are required for hotel bookings'], 422);
        }

        $paymentIntentId = $validated['payment_intent_id'] ?? null;
        unset($validated['payment_intent_id']);

        $currency = strtolower($validated['currency'] ?? config('stripe.currency', 'usd'));
        unset($validated['currency']);

        $bookingStatus = 'pending';
        $paymentStatus = 'unpaid';
        $stripePaymentIntentId = null;

        if ($paymentIntentId) {
            if (Booking::where('stripe_payment_intent_id', $paymentIntentId)->exists()) {
                return response()->json(['message' => 'Payment has already been used for another booking.'], 422);
            }

            try {
                $intent = $this->stripeClient()->paymentIntents->retrieve($paymentIntentId);
            } catch (ApiErrorException $exception) {
                Log::error('stripe.payment_intent.retrieve_failed', [
                    'user_id' => $user->id,
                    'payment_intent_id' => $paymentIntentId,
                    'message' => $exception->getMessage(),
                    'code' => $exception->getStripeCode(),
                ]);

                throw ValidationException::withMessages([
                    'payment_intent_id' => 'Unable to verify payment. Please try again.',
                ]);
            }

            if (($intent->metadata['user_id'] ?? null) !== (string) $user->id) {
                return response()->json(['message' => 'Payment does not belong to the authenticated user.'], 403);
            }

            if ($intent->status !== 'succeeded') {
                return response()->json(['message' => 'Payment has not completed successfully.'], 422);
            }

            $expectedAmount = $this->convertToMinorUnits((float) $validated['total_price'], $intent->currency);
            $actualAmount = $intent->amount_received ?? $intent->amount;

            if ($actualAmount !== $expectedAmount) {
                return response()->json(['message' => 'Payment amount does not match booking total.'], 422);
            }

            $currency = $intent->currency;
            $paymentStatus = $intent->status;
            $bookingStatus = 'confirmed';
            $stripePaymentIntentId = $intent->id;
        }

        $validated['user_id'] = $user->id;
        $validated['currency'] = $currency;
        $validated['status'] = $bookingStatus;
        $validated['stripe_payment_intent_id'] = $stripePaymentIntentId;
        $validated['payment_status'] = $paymentStatus;

        $booking = Booking::create($validated);

        // Log the request
        Log::info('Booking created', [
            'method' => $request->method(),
            'path' => $request->path(),
            'user_id' => $user->id,
            'booking_id' => $booking->id,
        ]);

        return response()->json([
            'message' => 'Booking created successfully',
            'booking' => $booking->load(['hotel', 'room', 'flight'])
        ], 201);
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
