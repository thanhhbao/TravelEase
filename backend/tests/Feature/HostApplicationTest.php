<?php

namespace Tests\Feature;

use App\Models\HostApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HostApplicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_host_application()
    {
        $user = User::factory()->create();

        $payload = [
            'phone' => '0901234567',
            'city' => 'Da Nang',
            'inventory' => '2 - 3 listings',
            'experience' => 'Managed homestay',
            'message' => 'I would like to become a host',
        ];

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/user/host/request', $payload)
            ->assertStatus(200)
            ->assertJsonFragment(['status' => 'created']);

        $this->assertDatabaseHas('host_applications', [
            'user_id' => $user->id,
            'status' => 'pending',
            'city' => 'Da Nang',
        ]);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'host_status' => 'pending']);
    }

    public function test_admin_can_list_and_update_applications()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $app = HostApplication::create([
            'user_id' => $user->id,
            'phone' => '0900',
            'city' => 'Hanoi',
            'message' => 'Please approve',
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        // list
        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/host-applications')
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'per_page', 'total']);

        // approve
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/host-applications/{$app->id}/status", ['status' => 'approved'])
            ->assertStatus(200)
            ->assertJsonPath('application.status', 'approved');

        $this->assertDatabaseHas('host_applications', ['id' => $app->id, 'status' => 'approved']);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'host_status' => 'approved', 'role' => 'host']);
    }

    public function test_non_admin_cannot_access_host_applications()
    {
        $user = User::factory()->create(['role' => 'traveler']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/host-applications')
            ->assertStatus(403);
    }
}
