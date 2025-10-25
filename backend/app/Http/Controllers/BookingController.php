<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
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
        ]);

        // Ensure at least hotel or flight is provided
        if (!$validated['hotel_id'] && !$validated['flight_id']) {
            return response()->json(['message' => 'Either hotel_id or flight_id must be provided'], 422);
        }

        // For hotel bookings, check_in and check_out are required
        if ($validated['hotel_id'] && (!$validated['check_in'] || !$validated['check_out'])) {
            return response()->json(['message' => 'check_in and check_out are required for hotel bookings'], 422);
        }

        $validated['user_id'] = $user->id;

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
}
