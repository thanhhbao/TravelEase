<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Booking;

class AdminAnalyticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $totalRoomRevenue = Booking::whereNotNull('hotel_id')
            ->sum('total_price');

        $totalRoomOrders = Booking::whereNotNull('hotel_id')
            ->count();

        $totalTicketRevenue = Booking::whereNotNull('flight_id')
            ->sum('total_price');

        $totalTicketOrders = Booking::whereNotNull('flight_id')
            ->count();

        return response()->json([
            'totalRoomRevenue' => $totalRoomRevenue,
            'totalTicketRevenue' => $totalTicketRevenue,
            'totalRoomOrders' => $totalRoomOrders,
            'totalTicketOrders' => $totalTicketOrders,
            'totalRevenue' => $totalRoomRevenue + $totalTicketRevenue,
        ]);
    }
}
