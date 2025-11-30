<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HotelController extends Controller
{
    /**
     * Get all hotels with optional filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Hotel::query();

        // Filter by city
        if ($request->has('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        // Filter by country
        if ($request->has('country')) {
            $query->where('country', 'like', '%' . $request->country . '%');
        }

        // Filter by stars
        if ($request->has('stars')) {
            $query->where('stars', '>=', $request->stars);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price_per_night', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price_per_night', '<=', $request->max_price);
        }

        // Filter by name
        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $hotels = $query->orderBy('price_per_night', 'asc')
            ->paginate($request->get('per_page', 10));

        return response()->json($hotels);
    }

    /**
     * Get specific hotel details
     */
    public function show($id): JsonResponse
    {
        $hotel = Hotel::with('rooms')->find($id);

        if (!$hotel) {
            return response()->json(['message' => 'Hotel not found'], 404);
        }

        return response()->json($hotel);
    }
}
