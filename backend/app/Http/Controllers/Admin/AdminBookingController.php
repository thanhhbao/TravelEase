<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBookingController extends Controller
{
    /**
     * Get all bookings with pagination and filters for admin.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['user', 'hotel', 'room', 'flight']);

        // Implement filters as needed (e.g., by status, user_id, hotel_id, type)
        if ($request->has('status') && in_array($request->status, ['pending', 'confirmed', 'cancelled', 'expired'])) {
            $query->where('status', $request->status);
        }
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
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
     * Get specific booking details for admin.
     */
    public function show($id): JsonResponse
    {
        $booking = Booking::with(['user', 'hotel', 'room', 'flight'])->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        return response()->json($booking);
    }

    /**
     * Update booking status for admin.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,expired',
        ]);

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        $booking->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Booking status updated successfully', 'booking' => $booking]);
    }
}
