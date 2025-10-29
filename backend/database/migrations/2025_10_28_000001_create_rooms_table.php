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
        Schema::create('rooms', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('hotel_id');
            $table->unsignedBigInteger('external_id')->nullable();
            $table->string('name');
            $table->string('beds')->nullable();
            $table->integer('max_guests')->nullable();
            $table->decimal('price', 10, 2);
            $table->timestamps();

            $table->index('hotel_id', 'rooms_hotel_id_index');
            $table->foreign('hotel_id', 'rooms_hotel_id_foreign')
                ->references('id')->on('hotels')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropForeign('rooms_hotel_id_foreign');
        });

        Schema::dropIfExists('rooms');
    }
};
