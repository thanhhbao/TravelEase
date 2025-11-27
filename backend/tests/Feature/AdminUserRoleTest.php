<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_user_role_and_log_activity()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'traveler']);

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/users/{$user->id}/role", ['role' => 'host', 'host_status' => 'approved'])
            ->assertStatus(200)
            ->assertJsonPath('user.role', 'host');

        $this->assertDatabaseHas('activity_logs', ['type' => 'role_update']);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => 'host', 'host_status' => 'approved']);
    }

    public function test_non_admin_cannot_update_user_role()
    {
        $user = User::factory()->create(['role' => 'traveler']);
        $target = User::factory()->create(['role' => 'traveler']);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/admin/users/{$target->id}/role", ['role' => 'host'])
            ->assertStatus(403);
    }
}
