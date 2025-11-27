<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Use updateOrCreate so running db:seed multiple times doesn't fail
        \App\Models\User::updateOrCreate(
            ['email' => 'admin@travelease.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'host_status' => 'approved',
            ]
        );

        \App\Models\User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test Traveler',
                'password' => bcrypt('password'),
                'role' => 'traveler',
                'host_status' => 'not_registered',
            ]
        );

        $this->call([
            HotelSeeder::class,
            FlightSeeder::class,
            TicketSeeder::class,
        ]);
    }
}
