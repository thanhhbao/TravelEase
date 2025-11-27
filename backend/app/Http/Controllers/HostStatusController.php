<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\HostApplication;
use Illuminate\Support\Facades\Log;

class HostStatusController extends Controller
{
    public function request(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'host' || $user->host_status === 'approved') {
            return response()->json([
                'message' => 'You are already approved as a host.',
                'user' => $user,
            ], 422);
        }

        $data = $request->validate([
            'phone' => ['nullable', 'string', 'max:30'],
            'city' => ['nullable', 'string', 'max:255'],
            'inventory' => ['nullable', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        // If an existing pending application exists for this user, return it
        $existing = \App\Models\HostApplication::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'An application is already pending.',
                'status' => 'already_pending',
                'application' => $existing,
                'user' => $user->fresh(),
            ], 200);
        }

        // Create a host application record so admin can review the details
        try {
            $app = HostApplication::create([
                'user_id' => $user->id,
                'phone' => $data['phone'] ?? null,
                'city' => $data['city'] ?? null,
                'inventory' => $data['inventory'] ?? null,
                'experience' => $data['experience'] ?? null,
                'message' => $data['message'] ?? null,
                'preferred_contact' => $data['phone'] ?? null,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating HostApplication: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'data' => $data,
                'exception' => $e,
            ]);
            return response()->json([
                'message' => 'Failed to submit host request due to an internal error.',
                'error' => $e->getMessage(),
            ], 500);
        }

        $user->forceFill([
            'host_status' => 'pending',
        ])->save();

        return response()->json([
            'message' => 'Host request submitted.',
            'status' => 'created',
            'application' => $app->fresh(),
            'user' => $user->fresh(),
        ]);
    }
}
