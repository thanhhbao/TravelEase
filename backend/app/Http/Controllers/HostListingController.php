<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HostListingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $listings = Listing::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $listings,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'nightly_rate' => ['required', 'integer', 'min:100000', 'max:100000000'],
            'occupancy' => ['required', 'integer', 'min:1', 'max:20'],
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['required', 'string'],
            'description' => ['nullable', 'string'],
        ]);

        $listing = Listing::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'city' => $validated['city'],
            'nightly_rate' => $validated['nightly_rate'],
            'occupancy' => $validated['occupancy'],
            'images' => $validated['images'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending_review',
        ]);

        return response()->json([
            'message' => 'Listing submitted for review.',
            'listing' => $listing,
        ], 201);
    }

    public function update(Request $request, Listing $listing): JsonResponse
    {
        $user = $request->user();
        if ($listing->user_id !== $user->id) {
            return response()->json(['message' => 'You do not have permission to edit this listing.'], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'city' => ['sometimes', 'required', 'string', 'max:255'],
            'nightly_rate' => ['sometimes', 'required', 'integer', 'min:100000', 'max:100000000'],
            'occupancy' => ['sometimes', 'required', 'integer', 'min:1', 'max:20'],
            'images' => ['sometimes', 'required', 'array', 'min:1'],
            'images.*' => ['required_with:images', 'string'],
            'description' => ['nullable', 'string'],
        ]);

        $listing->update([
            'title' => $validated['title'] ?? $listing->title,
            'city' => $validated['city'] ?? $listing->city,
            'nightly_rate' => $validated['nightly_rate'] ?? $listing->nightly_rate,
            'occupancy' => $validated['occupancy'] ?? $listing->occupancy,
            'images' => $validated['images'] ?? $listing->images,
            'description' => array_key_exists('description', $validated) ? $validated['description'] : $listing->description,
        ]);

        return response()->json([
            'message' => 'Listing updated successfully.',
            'listing' => $listing->fresh(),
        ]);
    }

    public function destroy(Request $request, Listing $listing): JsonResponse
    {
        $user = $request->user();
        if ($listing->user_id !== $user->id) {
            return response()->json(['message' => 'You do not have permission to delete this listing.'], 403);
        }

        $listing->delete();

        return response()->json([
            'message' => 'Listing deleted successfully.',
        ]);
    }
}
