<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUsersTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_users()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(5)->create();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/users?per_page=10')
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'per_page', 'total']);
    }

    public function test_non_admin_cannot_access_users_list()
    {
        $user = User::factory()->create(['role' => 'traveler']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/users')
            ->assertStatus(403);
    }
}
