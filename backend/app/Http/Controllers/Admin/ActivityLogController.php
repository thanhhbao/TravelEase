<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 30);
        $query = ActivityLog::orderBy('created_at', 'desc');

        $results = $query->paginate(max(1, min(500, $perPage)));

        return response()->json($results);
    }
}
