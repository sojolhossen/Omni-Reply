<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            DB::statement('CREATE TABLE ai_provider_configs_temp (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                workspace_id INTEGER NOT NULL,
                provider VARCHAR(64) NOT NULL,
                credentials TEXT,
                default_model_chat VARCHAR(128),
                default_model_embed VARCHAR(128),
                enabled TINYINT(1) NOT NULL DEFAULT 1,
                created_at DATETIME,
                updated_at DATETIME,
                UNIQUE(workspace_id, provider)
            )');

            DB::statement('INSERT INTO ai_provider_configs_temp SELECT id, workspace_id, provider, credentials, default_model_chat, default_model_embed, enabled, created_at, updated_at FROM ai_provider_configs');

            DB::statement('DROP TABLE ai_provider_configs');

            DB::statement('ALTER TABLE ai_provider_configs_temp RENAME TO ai_provider_configs');
        } elseif ($driver === 'mysql') {
            DB::statement("ALTER TABLE ai_provider_configs MODIFY COLUMN provider VARCHAR(64) NOT NULL");
        } elseif ($driver === 'pgsql') {
            DB::statement("ALTER TABLE ai_provider_configs ALTER COLUMN provider TYPE VARCHAR(64)");
        }
    }

    public function down(): void
    {
        // No-op
    }
};
