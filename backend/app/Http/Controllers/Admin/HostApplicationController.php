<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HostApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HostApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $search = $request->query('search');
        $perPage = (int) $request->query('per_page', 20);

        $query = HostApplication::with('user')->latest();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $results = $query->paginate(max(1, min(200, $perPage)));

        return response()->json($results);
    }

    public function update(Request $request, HostApplication $application): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
        ]);

        $application->status = $data['status'];
        $application->save();

        $user = $application->user()->first();
        if ($data['status'] === 'approved') {
            $user->role = 'host';
            $user->host_status = 'approved';
        } else {
            $user->host_status = 'rejected';
            // don't force revert role if user was an admin; keep role but ensure not host
            if ($user->role === 'host') {
                $user->role = 'traveler';
            }
        }

        $user->save();

        // add activity log
        \App\Models\ActivityLog::create([
            'type' => 'host_application',
            'title' => 'Host application processed',
            'description' => "Application {$application->id} marked {$data['status']} by {$request->user()?->name}",
            'actor' => $request->user()?->name ?? 'system',
            'meta' => ['application_id' => $application->id, 'status' => $data['status']],
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Application updated',
            'application' => $application->fresh('user'),
            'user' => $user->fresh(),
        ]);
    }
}
