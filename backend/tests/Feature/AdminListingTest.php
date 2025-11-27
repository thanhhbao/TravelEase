<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_listings()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        Listing::create([
            'user_id' => $user->id,
            'title' => 'Test Listing',
            'city' => 'Hanoi',
            'nightly_rate' => 100,
            'occupancy' => 2,
            'status' => 'pending_review',
            'images' => json_encode([]),
            'description' => 'desc',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/listings')
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'per_page', 'total']);
    }

    public function test_admin_can_update_listing_status_and_activity_is_logged()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $listing = Listing::create([
            'user_id' => $user->id,
            'title' => 'Test Listing 2',
            'city' => 'Hanoi',
            'nightly_rate' => 100,
            'occupancy' => 2,
            'status' => 'pending_review',
            'images' => json_encode([]),
            'description' => 'desc',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/listings/{$listing->id}/status", ['status' => 'published'])
            ->assertStatus(200)
            ->assertJsonPath('listing.status', 'published');

        $this->assertDatabaseHas('activity_logs', ['type' => 'listing', 'title' => 'Listing status changed']);
    }
}
