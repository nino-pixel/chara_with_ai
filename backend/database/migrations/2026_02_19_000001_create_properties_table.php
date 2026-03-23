<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('title');
            $table->string('location');
            $table->string('price');
            $table->string('type', 64);
            $table->string('status', 64);
            $table->unsignedInteger('beds')->default(0);
            $table->unsignedInteger('baths')->default(0);
            $table->string('area')->nullable();
            $table->string('image')->nullable();
            $table->boolean('show_on_website')->default(true);
            $table->boolean('archived')->default(false);
            /** Full frontend Property payload for fields beyond core columns */
            $table->json('extra')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
