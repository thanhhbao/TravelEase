<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    /**
     * Get authenticated user's tickets
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = Ticket::where('user_id', $user->id)->with('flight');

        // Filter by status
        if ($request->has('status') && in_array($request->status, ['pending', 'confirmed', 'cancelled'])) {
            $query->where('status', $request->status);
        }

        $tickets = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json($tickets);
    }

    /**
     * Get specific ticket details (only if owned by authenticated user)
     */
    public function show($id): JsonResponse
    {
        $user = Auth::user();

        $ticket = Ticket::with('flight')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        return response()->json($ticket);
    }

    /**
     * Cancel a ticket (only if owned by authenticated user and not already cancelled)
     */
    public function cancel($id): JsonResponse
    {
        $user = Auth::user();

        $ticket = Ticket::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        if ($ticket->status === 'cancelled') {
            return response()->json(['message' => 'Ticket is already cancelled'], 400);
        }

        $ticket->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Ticket cancelled successfully']);
    }
}
