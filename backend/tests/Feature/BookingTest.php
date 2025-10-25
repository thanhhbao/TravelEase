<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $booking;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test user manually (since factory might not be available)
        $this->user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        
        $this->booking = Booking::create([
            'user_id' => $this->user->id,
            'hotel_id' => null, // Skip foreign keys for now
            'room_id' => null,
            'flight_id' => null,
            'check_in' => now()->addDays(1)->toDateString(),
            'check_out' => now()->addDays(3)->toDateString(),
            'guests' => 2,
            'total_price' => 300.00,
            'status' => 'confirmed',
            'created_at' => now(),
        ]);
    }

    /** @test */
    public function authenticated_user_can_view_their_bookings()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/my-bookings');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'user_id',
                            'hotel_id',
                            'room_id',
                            'check_in',
                            'check_out',
                            'guests',
                            'total_price',
                            'status',
                            'created_at',
                        ]
                    ],
                    'current_page',
                    'last_page',
                    'per_page',
                    'total'
                ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_view_bookings()
    {
        $response = $this->getJson('/api/my-bookings');

        $response->assertStatus(401);
    }

    /** @test */
    public function user_can_filter_bookings_by_status()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/my-bookings?status=confirmed');

        $response->assertStatus(200)
                ->assertJsonCount(1, 'data');
    }

    /** @test */
    public function user_can_filter_bookings_by_type()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/my-bookings?type=hotel');

        $response->assertStatus(200);
    }

    /** @test */
    public function user_can_cancel_booking()
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson("/api/my-bookings/{$this->booking->id}/cancel");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Booking cancelled successfully'
                ]);

        $this->assertDatabaseHas('bookings', [
            'id' => $this->booking->id,
            'status' => 'cancelled'
        ]);
    }

    /** @test */
    public function user_cannot_cancel_already_cancelled_booking()
    {
        $this->booking->update(['status' => 'cancelled']);
        Sanctum::actingAs($this->user);

        $response = $this->postJson("/api/my-bookings/{$this->booking->id}/cancel");

        $response->assertStatus(400)
                ->assertJson([
                    'message' => 'Booking is already cancelled'
                ]);
    }

    /** @test */
    public function user_cannot_cancel_another_users_booking()
    {
        $anotherUser = User::create([
            'name' => 'Another User',
            'email' => 'another@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        Sanctum::actingAs($anotherUser);

        $response = $this->postJson("/api/my-bookings/{$this->booking->id}/cancel");

        $response->assertStatus(404);
    }

    /** @test */
    public function user_can_generate_otp_for_booking()
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson("/api/my-bookings/{$this->booking->id}/otp");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'otp',
                        'expires_at',
                    ]
                ]);
    }

    /** @test */
    public function user_can_generate_otp_for_booking_with_custom_code()
    {
        Sanctum::actingAs($this->user);

        $otpService = new \App\Services\OtpService();

        $rawCode = $otpService->createEmailVerificationCode('phucvu1470@gmail.com', 10);

        $response = $this->postJson("/api/my-bookings/{$this->booking->id}/otp");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'otp',
                        'expires_at',
                    ]
                ]);
    }
}
