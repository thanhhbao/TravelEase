<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ListingApprovalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $search = $request->query('search');
        $query = Listing::with('user')->latest();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"));
            });
        }

        $listings = $query->paginate($request->integer('per_page', 20));

        return response()->json($listings);
    }

    public function update(Request $request, Listing $listing): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending_review', 'published', 'rejected'])],
        ]);

        $listing->update([
            'status' => $data['status'],
        ]);

        return response()->json([
            'message' => 'Listing status updated.',
            'listing' => $listing->fresh('user'),
        ]);
    }
}
