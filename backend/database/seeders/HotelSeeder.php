<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class HotelSeeder extends Seeder
{
    /**
     * Seed hotels and rooms based on the frontend mock data.
     */
    public function run(): void
    {
        $possiblePaths = [
            base_path('../frontend/public/mock/hotels.json'),
            base_path('frontend/public/mock/hotels.json'),
            base_path('public/mock/hotels.json'),
        ];

        $jsonPath = null;
        foreach ($possiblePaths as $path) {
            if (File::exists($path)) {
                $jsonPath = $path;
                break;
            }
        }

        if (!$jsonPath) {
            $this->command?->warn('HotelSeeder: unable to locate mock data (expected ../frontend/public/mock/hotels.json)');
            return;
        }

        $contents = File::get($jsonPath);
        $hotels = json_decode($contents, true);

        if (!is_array($hotels)) {
            $this->command?->error('HotelSeeder: failed to decode hotels.json');
            return;
        }

        DB::transaction(function () use ($hotels) {
            foreach ($hotels as $hotel) {
                $hotelId = $hotel['id'] ?? null;
                $now = now();

                $hotelPayload = [
                    'name' => $hotel['name'] ?? 'Unknown Hotel',
                    'description' => $hotel['description'] ?? null,
                    'address' => $hotel['address'] ?? ($hotel['city'] ?? 'Unknown City'),
                    'city' => $hotel['city'] ?? 'Unknown City',
                    'country' => $hotel['country'] ?? 'Unknown Country',
                    'stars' => $hotel['stars'] ?? 0,
                    'price_per_night' => $hotel['pricePerNight'] ?? $hotel['price_per_night'] ?? 0,
                    'amenities' => isset($hotel['amenities']) ? json_encode($hotel['amenities']) : json_encode([]),
                    'images' => isset($hotel['images']) ? json_encode($hotel['images']) : json_encode([]),
                    'thumbnail' => $hotel['thumbnail'] ?? null,
                    'updated_at' => $now,
                ];

                if ($hotelId !== null) {
                    $hotelPayload['id'] = $hotelId;
                }

                // Preserve existing created_at when record already exists
                $existingHotel = $hotelId !== null
                    ? DB::table('hotels')->where('id', $hotelId)->first()
                    : null;

                if ($existingHotel) {
                    $hotelPayload['created_at'] = $existingHotel->created_at;
                } else {
                    $hotelPayload['created_at'] = $now;
                }

                DB::table('hotels')->updateOrInsert(
                    ['id' => $hotelPayload['id'] ?? null],
                    $hotelPayload
                );

                if (!empty($hotel['rooms']) && is_array($hotel['rooms'])) {
                    foreach ($hotel['rooms'] as $room) {
                        $externalId = $room['id'] ?? null;
                        $roomPayload = [
                            'hotel_id' => $hotelPayload['id'] ?? ($hotelId ?? null),
                            'external_id' => $externalId,
                            'name' => $room['name'] ?? 'Room',
                            'beds' => $room['beds'] ?? null,
                            'max_guests' => $room['maxGuests'] ?? null,
                            'price' => $room['price'] ?? 0,
                            'images' => isset($room['images']) ? json_encode($room['images']) : json_encode([]),
                            'updated_at' => $now,
                        ];

                        $lookup = [
                            'hotel_id' => $roomPayload['hotel_id'],
                            'external_id' => $roomPayload['external_id'],
                        ];

                        $existingRoom = DB::table('rooms')->where($lookup)->first();

                        if ($existingRoom) {
                            $roomPayload['created_at'] = $existingRoom->created_at;
                        } else {
                            $roomPayload['created_at'] = $now;
                        }

                        DB::table('rooms')->updateOrInsert(
                            $lookup,
                            $roomPayload
                        );
                    }
                }
            }
        });
    }
}
