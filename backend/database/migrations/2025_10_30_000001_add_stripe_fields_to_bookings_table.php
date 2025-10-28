<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('currency', 3)->default('usd')->after('total_price');
            $table->string('stripe_payment_intent_id')->nullable()->after('status');
            $table->string('payment_status')->default('unpaid')->after('stripe_payment_intent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['currency', 'stripe_payment_intent_id', 'payment_status']);
        });
    }
};

