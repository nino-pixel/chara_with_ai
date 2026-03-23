<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('property_id', 64)->nullable()->index();
            $table->text('property_title')->nullable();
            $table->text('message');
            $table->string('status', 32)->default('new');
            $table->string('priority', 32)->nullable();
            $table->string('budget_range')->nullable();
            $table->string('buying_timeline')->nullable();
            $table->string('financing_method')->nullable();
            $table->string('employment_status')->nullable();
            $table->decimal('estimated_monthly', 14, 2)->nullable();
            $table->text('downpayment')->nullable();
            $table->unsignedInteger('loan_term')->nullable();
            $table->decimal('interest_rate', 8, 4)->nullable();
            $table->date('next_follow_up_at')->nullable();
            $table->timestamp('last_contacted_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
