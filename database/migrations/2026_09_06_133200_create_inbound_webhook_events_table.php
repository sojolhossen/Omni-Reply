<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('inbound_webhook_events')) {
            Schema::create('inbound_webhook_events', function (Blueprint $table) {
                $table->id();
                $table->string('provider', 64);
                $table->string('event_id', 255);
                $table->timestamp('received_at')->nullable();
                $table->timestamps();

                $table->unique(['provider', 'event_id']);
                $table->index('created_at');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('inbound_webhook_events');
    }
};
