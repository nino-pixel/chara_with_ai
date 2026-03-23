<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deals', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('client_id', 64)->index();
            $table->string('property_id', 64)->index();
            $table->string('status', 64);
            $table->string('amount')->nullable();
            $table->date('closing_date')->nullable();
            $table->json('extra')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
