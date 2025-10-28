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
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->string('airline');
            $table->string('flight_number');
            $table->string('logo')->nullable();
            $table->string('from_city');
            $table->string('to_city');
            $table->string('departure_time');
            $table->string('arrival_time');
            $table->string('duration');
            $table->string('stops');
            $table->decimal('price', 10, 2);
            $table->string('class');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flights');
    }
};
