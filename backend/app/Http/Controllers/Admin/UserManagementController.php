<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    /**
     * Return paginated list of users for admin panel.
     * Supports: ?search=, ?role=, ?host_status=, ?page=, ?per_page=
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $role = $request->query('role');
        $host = $request->query('host_status');
        $perPage = (int) $request->query('per_page', 20);

        $query = User::query()->select(['id', 'name', 'email', 'role', 'host_status', 'created_at', 'updated_at']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role) {
            $query->where('role', $role);
        }

        if ($host) {
            $query->where('host_status', $host);
        }

        // Attach some light computed fields the admin UI expects
        $users = $query->withCount('listings')
                       ->orderBy('updated_at', 'desc')
                       ->paginate(max(1, min(200, $perPage)));

        return response()->json($users);
    }
}
