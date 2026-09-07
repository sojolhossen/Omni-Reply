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
        if (Schema::hasTable('integration_configs') && !Schema::hasColumn('integration_configs', 'last_test_message')) {
            Schema::table('integration_configs', function (Blueprint $table) {
                $table->text('last_test_message')->nullable()->after('last_test_status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('integration_configs') && Schema::hasColumn('integration_configs', 'last_test_message')) {
            Schema::table('integration_configs', function (Blueprint $table) {
                $table->dropColumn('last_test_message');
            });
        }
    }
};
