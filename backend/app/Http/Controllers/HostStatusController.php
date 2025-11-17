<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $request->validate([
            'phone' => ['nullable', 'string', 'max:30'],
            'city' => ['nullable', 'string', 'max:255'],
            'inventory' => ['nullable', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $user->forceFill([
            'host_status' => 'pending',
        ])->save();

        return response()->json([
            'message' => 'Host request submitted.',
            'user' => $user->fresh(),
        ]);
    }
}
