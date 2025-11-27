<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_activity_logs()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        ActivityLog::create(['type' => 'test', 'title' => 't', 'description' => 'd', 'actor' => 'joe', 'meta' => json_encode(['a'=>1]), 'created_at' => now()]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/activity')
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'per_page', 'total']);
    }

    public function test_non_admin_cannot_view_activity_logs()
    {
        $user = User::factory()->create(['role' => 'traveler']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/activity')
            ->assertStatus(403);
    }
}
