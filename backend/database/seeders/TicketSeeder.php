<?php

namespace Database\Seeders;

use App\Models\Ticket;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Ticket::create([
            'user_id' => 1,
            'flight_id' => 1,
            'passengers' => [
                [
                    'name' => 'John Doe',
                    'dateOfBirth' => '1985-06-15',
                    'passportNumber' => 'AB1234567'
                ]
            ],
            'contact_email' => 'john.doe@email.com',
            'contact_phone' => '+1-555-0123',
            'total_price' => 299.00,
            'status' => 'confirmed',
        ]);

        Ticket::create([
            'user_id' => 1,
            'flight_id' => 2,
            'passengers' => [
                [
                    'name' => 'John Doe',
                    'dateOfBirth' => '1985-06-15',
                    'passportNumber' => 'AB1234567'
                ],
                [
                    'name' => 'Jane Doe',
                    'dateOfBirth' => '1987-03-22',
                    'passportNumber' => 'CD7890123'
                ]
            ],
            'contact_email' => 'john.doe@email.com',
            'contact_phone' => '+1-555-0123',
            'total_price' => 378.00,
            'status' => 'pending',
        ]);
    }
}
