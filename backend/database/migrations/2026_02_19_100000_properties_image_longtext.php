<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Cover image can be a long HTTPS URL or a data URL (full-resolution uploads).
 */
return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement('ALTER TABLE properties MODIFY image LONGTEXT NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE properties ALTER COLUMN image TYPE TEXT');
        }
        // SQLite: TEXT affinity is already unbounded for typical use.
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement('ALTER TABLE properties MODIFY image VARCHAR(255) NULL');
        }
    }
};
