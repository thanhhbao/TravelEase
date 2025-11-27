<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $city = $request->query('city');
        $search = $request->query('search');

        $query = Listing::where('status', 'published')
            ->latest();

        if ($city) {
            $query->where('city', 'like', "%{$city}%");
        }

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        $listings = $query->get();

        return response()->json([
            'data' => $listings,
        ]);
    }
}
