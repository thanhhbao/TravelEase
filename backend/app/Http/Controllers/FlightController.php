<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FlightController extends Controller
{
    /**
     * Get all flights with optional filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Flight::query();

        // Filter by from_city
        if ($request->has('from_city')) {
            $query->where('from_city', 'like', '%' . $request->from_city . '%');
        }

        // Filter by to_city
        if ($request->has('to_city')) {
            $query->where('to_city', 'like', '%' . $request->to_city . '%');
        }

        // Filter by airline
        if ($request->has('airline')) {
            $query->where('airline', 'like', '%' . $request->airline . '%');
        }

        // Filter by class
        if ($request->has('class')) {
            $query->where('class', $request->class);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $flights = $query->orderBy('price', 'asc')
            ->paginate($request->get('per_page', 10));

        return response()->json($flights);
    }

    /**
     * Get specific flight details
     */
    public function show($id): JsonResponse
    {
        $flight = Flight::find($id);

        if (!$flight) {
            return response()->json(['message' => 'Flight not found'], 404);
        }

        return response()->json($flight);
    }
}
