<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserRoleController extends Controller
{
    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'role' => ['required', 'string', 'in:admin,traveler,host'],
            'host_status' => ['nullable', 'string', 'in:not_registered,pending,approved,rejected'],
        ]);

        $role = $data['role'];
        $hostStatus = $data['host_status'] ?? null;

        if ($role === 'host' && $hostStatus === null) {
            $hostStatus = 'approved';
        }

        if ($role !== 'host' && $hostStatus === null) {
            $hostStatus = $user->host_status === 'approved' ? 'not_registered' : $user->host_status;
        }

        $user->forceFill([
            'role' => $role,
            'host_status' => $hostStatus,
        ])->save();

        return response()->json([
            'message' => 'Role updated successfully.',
            'user' => $user->fresh(),
        ]);
    }
}
