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

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@travelease.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'host_status' => 'approved',
        ]);

        User::factory()->create([
            'name' => 'Test Traveler',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'traveler',
            'host_status' => 'not_registered',
        ]);

        $this->call([
            HotelSeeder::class,
            FlightSeeder::class,
            TicketSeeder::class,
        ]);
    }
}
