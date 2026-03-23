<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Remove data-URL floor plans from `properties.extra` (they caused max_allowed_packet errors).
 * Re-upload floor plans via admin as file uploads after migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        $rows = DB::table('properties')->select('id', 'extra')->whereNotNull('extra')->get();

        foreach ($rows as $row) {
            $extra = json_decode($row->extra, true);
            if (! is_array($extra)) {
                continue;
            }
            if (! isset($extra['floorPlan']) || ! is_string($extra['floorPlan'])) {
                continue;
            }
            if (! str_starts_with($extra['floorPlan'], 'data:')) {
                continue;
            }
            unset($extra['floorPlan']);
            DB::table('properties')->where('id', $row->id)->update([
                'extra' => json_encode($extra),
            ]);
        }
    }

    public function down(): void
    {
        // Irreversible — data URLs were not migrated to files.
    }
};
