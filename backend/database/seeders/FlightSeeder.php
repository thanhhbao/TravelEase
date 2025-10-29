<?php

namespace Database\Seeders;

use App\Models\Flight;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FlightSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Flight::create([
            'airline' => 'American Airlines',
            'flight_number' => 'AA1234',
            'from_airport' => 'JFK',
            'logo' => null,
            'from_city' => 'New York',
            'to_airport' => 'LAX',
            'to_city' => 'Los Angeles',
            'departure_time' => '2024-12-15T08:30:00Z',
            'arrival_time' => '2024-12-15T11:45:00Z',
            'duration' => '3h 15m',
            'stops' => 'Non-stop',
            'price' => 299.00,
            'class' => 'Economy',
        ]);

        Flight::create([
            'airline' => 'Southwest Airlines',
            'flight_number' => 'WN3456',
            'from_airport' => 'LGA',
            'logo' => null,
            'from_city' => 'New York',
            'to_airport' => 'MIA',
            'to_city' => 'Miami',
            'departure_time' => '2024-12-15T10:30:00Z',
            'arrival_time' => '2024-12-15T13:45:00Z',
            'duration' => '2h 15m',
            'stops' => 'Non-stop',
            'price' => 189.00,
            'class' => 'Economy',
        ]);
    }
}
