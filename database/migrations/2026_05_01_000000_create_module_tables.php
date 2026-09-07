<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('contact_tags')) {
            Schema::create('contact_tags', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('name');
                $table->string('color')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('contacts')) {
            Schema::create('contacts', function (Blueprint $table) {
                $table->id();
                $table->string('uuid')->unique();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('phone_e164')->nullable()->index();
                $table->string('email')->nullable()->index();
                $table->string('first_name')->nullable();
                $table->string('last_name')->nullable();
                $table->string('avatar')->nullable();
                $table->string('country')->nullable();
                $table->string('language')->nullable();
                $table->boolean('opt_in_whatsapp')->default(false);
                $table->boolean('opt_in_sms')->default(false);
                $table->boolean('opt_in_email')->default(false);
                $table->json('custom_fields')->nullable();
                $table->timestamp('last_seen_at')->nullable();
                $table->string('source')->nullable();
                $table->unsignedBigInteger('lead_id')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (! Schema::hasTable('contact_tag_pivot')) {
            Schema::create('contact_tag_pivot', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('contact_id')->index();
                $table->unsignedBigInteger('tag_id')->index();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('segments')) {
            Schema::create('segments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('name');
                $table->string('type')->default('static');
                $table->json('rules_json')->nullable();
                $table->integer('contact_count')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('segment_contact')) {
            Schema::create('segment_contact', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('segment_id')->index();
                $table->unsignedBigInteger('contact_id')->index();
            });
        }

        if (! Schema::hasTable('channel_accounts')) {
            Schema::create('channel_accounts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('channel');
                $table->string('provider')->nullable();
                $table->text('credentials')->nullable();
                $table->string('display_name')->nullable();
                $table->string('phone_number_id')->nullable()->index();
                $table->string('business_account_id')->nullable();
                $table->string('status')->default('active');
                $table->json('meta_json')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('whatsapp_business_accounts')) {
            Schema::create('whatsapp_business_accounts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('waba_id')->index();
                $table->text('credentials')->nullable();
                $table->text('webhook_verify_token')->nullable();
                $table->string('webhook_verify_token_hash')->nullable()->index();
                $table->string('status')->default('active');
                $table->json('meta_json')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('whatsapp_phone_numbers')) {
            Schema::create('whatsapp_phone_numbers', function (Blueprint $table) {
                $table->id();
                $table->string('phone_number_id')->unique();
                $table->unsignedBigInteger('waba_id_fk')->nullable()->index();
                $table->string('display_phone')->nullable();
                $table->string('verified_name')->nullable();
                $table->string('quality_rating')->nullable();
                $table->string('messaging_limit_tier')->nullable();
                $table->string('code_verification_status')->nullable();
                $table->string('name_status')->nullable();
                $table->string('account_mode')->nullable();
                $table->string('status')->default('active');
                $table->json('meta_json')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('whatsapp_templates')) {
            Schema::create('whatsapp_templates', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('waba_id')->nullable()->index();
                $table->string('name');
                $table->string('language')->default('en');
                $table->string('category')->nullable();
                $table->string('status')->default('APPROVED');
                $table->json('components')->nullable();
                $table->string('meta_template_id')->nullable();
                $table->text('rejection_reason')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('whatsapp_auto_replies')) {
            Schema::create('whatsapp_auto_replies', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->unsignedBigInteger('channel_account_id')->nullable()->index();
                $table->string('trigger_type');
                $table->string('match_mode')->default('contains');
                $table->json('keywords')->nullable();
                $table->integer('priority')->default(1);
                $table->string('response_kind')->default('text');
                $table->json('schedule_json')->nullable();
                $table->json('payload_json')->nullable();
                $table->boolean('enabled')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('whatsapp_widgets')) {
            Schema::create('whatsapp_widgets', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('name');
                $table->string('widget_key')->nullable()->unique();
                $table->string('phone_number_id')->nullable();
                $table->string('display_phone')->nullable();
                $table->text('prefilled_message')->nullable();
                $table->text('greeting_message')->nullable();
                $table->string('agent_name')->nullable();
                $table->string('agent_avatar_color')->nullable();
                $table->string('button_color')->nullable();
                $table->string('position')->default('bottom_right');
                $table->json('allowed_domains')->nullable();
                $table->json('working_hours_json')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('inbox_canned_replies')) {
            Schema::create('inbox_canned_replies', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('shortcut');
                $table->text('body');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('inbox_labels')) {
            Schema::create('inbox_labels', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('name');
                $table->string('color')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('conversations')) {
            Schema::create('conversations', function (Blueprint $table) {
                $table->id();
                $table->string('uuid')->unique();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->unsignedBigInteger('channel_account_id')->nullable()->index();
                $table->unsignedBigInteger('contact_id')->nullable()->index();
                $table->string('external_thread_id')->nullable()->index();
                $table->string('status')->default('open');
                $table->unsignedBigInteger('assigned_user_id')->nullable()->index();
                $table->string('assigned_to')->default('bot');
                $table->timestamp('handover_at')->nullable();
                $table->timestamp('last_message_at')->nullable();
                $table->integer('unread_count')->default(0);
                $table->timestamp('first_response_at')->nullable();
                $table->timestamp('resolved_at')->nullable();
                $table->timestamp('last_inbound_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('messages')) {
            Schema::create('messages', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('conversation_id')->index();
                $table->string('direction')->default('in');
                $table->string('channel')->nullable();
                $table->string('type')->default('text');
                $table->json('payload')->nullable();
                $table->text('body')->nullable();
                $table->unsignedBigInteger('media_id')->nullable();
                $table->string('status')->default('delivered');
                $table->string('provider_message_id')->nullable()->index();
                $table->json('error_json')->nullable();
                $table->string('sent_by')->default('human');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->timestamp('sent_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('inbox_label_conversation')) {
            Schema::create('inbox_label_conversation', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('conversation_id')->index();
                $table->unsignedBigInteger('label_id')->index();
            });
        }

        if (! Schema::hasTable('automations')) {
            Schema::create('automations', function (Blueprint $table) {
                $table->id();
                $table->string('uuid')->unique();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('name');
                $table->string('status')->default('draft');
                $table->string('trigger_type')->nullable();
                $table->json('trigger_config')->nullable();
                $table->string('trigger_token')->nullable();
                $table->json('nodes')->nullable();
                $table->json('edges')->nullable();
                $table->integer('run_count')->default(0);
                $table->string('token')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('automation_runs')) {
            Schema::create('automation_runs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('automation_id')->index();
                $table->unsignedBigInteger('contact_id')->nullable()->index();
                $table->string('status')->default('pending');
                $table->json('context')->nullable();
                $table->string('current_node_id')->nullable();
                $table->string('resume_node_id')->nullable();
                $table->text('error')->nullable();
                $table->timestamp('started_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('automation_run_logs')) {
            Schema::create('automation_run_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('run_id')->index();
                $table->string('node_id')->nullable();
                $table->string('node_type')->nullable();
                $table->string('result')->default('ok');
                $table->text('message')->nullable();
                $table->json('output')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('sms_provider_configs')) {
            Schema::create('sms_provider_configs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('provider');
                $table->text('credentials')->nullable();
                $table->string('sender_id')->nullable();
                $table->boolean('default')->default(false);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('workspace_smtp_configs')) {
            Schema::create('workspace_smtp_configs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('username')->nullable();
                $table->string('host')->nullable();
                $table->integer('port')->default(587);
                $table->text('password')->nullable();
                $table->string('encryption')->nullable();
                $table->string('from_email')->nullable();
                $table->string('from_name')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('usage_meters')) {
            Schema::create('usage_meters', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('metric');
                $table->integer('period')->index();
                $table->bigInteger('value')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('campaigns')) {
            Schema::create('campaigns', function (Blueprint $table) {
                $table->id();
                $table->string('uuid')->unique();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('name');
                $table->string('channel')->default('whatsapp');
                $table->string('whatsapp_phone_number_id')->nullable();
                $table->string('audience_type')->nullable();
                $table->string('audience_ref')->nullable();
                $table->json('payload_json')->nullable();
                $table->json('template_ref')->nullable();
                $table->json('totals_json')->nullable();
                $table->timestamp('schedule_at')->nullable();
                $table->string('timezone')->nullable();
                $table->string('status')->default('draft');
                $table->unsignedBigInteger('created_by')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('campaign_recipients')) {
            Schema::create('campaign_recipients', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('campaign_id')->index();
                $table->unsignedBigInteger('contact_id')->index();
                $table->string('status')->default('queued');
                $table->string('provider_message_id')->nullable();
                $table->string('tracking_token')->nullable()->index();
                $table->string('unsubscribe_token')->nullable()->index();
                $table->timestamp('sent_at')->nullable();
                $table->timestamp('delivered_at')->nullable();
                $table->timestamp('read_at')->nullable();
                $table->timestamp('clicked_at')->nullable();
                $table->timestamp('opted_out_at')->nullable();
                $table->text('failed_reason')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('lead_scrape_jobs')) {
            Schema::create('lead_scrape_jobs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('keyword')->nullable();
                $table->string('location')->nullable();
                $table->integer('radius_meters')->default(5000);
                $table->string('status')->default('pending');
                $table->integer('leads_found')->default(0);
                $table->text('error')->nullable();
                $table->timestamp('started_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('leads')) {
            Schema::create('leads', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('name')->nullable();
                $table->string('phone')->nullable();
                $table->string('email')->nullable();
                $table->string('website')->nullable();
                $table->string('address')->nullable();
                $table->string('city')->nullable();
                $table->string('country')->nullable();
                $table->decimal('lat', 10, 7)->nullable();
                $table->decimal('lng', 10, 7)->nullable();
                $table->string('category')->nullable();
                $table->decimal('rating', 3, 1)->nullable();
                $table->integer('review_count')->default(0);
                $table->string('google_place_id')->nullable();
                $table->string('whatsapp_status')->default('unknown');
                $table->boolean('pushed_to_contacts')->default(false);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('social_media_accounts')) {
            Schema::create('social_media_accounts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('network');
                $table->string('account_id');
                $table->string('name')->nullable();
                $table->string('picture_url')->nullable();
                $table->text('access_token')->nullable();
                $table->text('refresh_token')->nullable();
                $table->timestamp('token_expires_at')->nullable();
                $table->json('scopes')->nullable();
                $table->json('meta')->nullable();
                $table->boolean('active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('social_media_posts')) {
            Schema::create('social_media_posts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('title')->nullable();
                $table->text('body')->nullable();
                $table->json('media_urls')->nullable();
                $table->json('target_accounts')->nullable();
                $table->string('status')->default('draft');
                $table->timestamp('scheduled_at')->nullable();
                $table->string('timezone')->nullable();
                $table->timestamp('published_at')->nullable();
                $table->string('provider_post_id')->nullable();
                $table->string('post_url')->nullable();
                $table->json('publish_results')->nullable();
                $table->boolean('ai_generated')->default(false);
                $table->text('ai_prompt')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('social_media_post_accounts')) {
            Schema::create('social_media_post_accounts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('post_id')->index();
                $table->unsignedBigInteger('social_account_id')->index();
                $table->string('status')->default('pending');
                $table->string('platform_post_id')->nullable();
                $table->text('error')->nullable();
                $table->timestamp('published_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('ecommerce_stores')) {
            Schema::create('ecommerce_stores', function (Blueprint $table) {
                $table->id();
                $table->string('uuid')->unique();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->string('platform');
                $table->string('domain');
                $table->string('name')->nullable();
                $table->text('credentials')->nullable();
                $table->string('status')->default('connected');
                $table->json('external_meta')->nullable();
                $table->string('webhook_secret')->nullable();
                $table->timestamp('last_tested_at')->nullable();
                $table->string('last_test_status')->nullable();
                $table->text('last_test_message')->nullable();
                $table->timestamp('customers_synced_at')->nullable();
                $table->timestamp('orders_synced_at')->nullable();
                $table->timestamp('products_synced_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('ecommerce_products')) {
            Schema::create('ecommerce_products', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->unsignedBigInteger('store_id')->index();
                $table->string('external_id')->nullable();
                $table->string('platform')->nullable();
                $table->string('name')->nullable();
                $table->string('sku')->nullable();
                $table->decimal('price', 10, 2)->default(0);
                $table->integer('inventory_quantity')->default(0);
                $table->string('status')->default('active');
                $table->string('image_url')->nullable();
                $table->json('raw')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('ecommerce_carts')) {
            Schema::create('ecommerce_carts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->unsignedBigInteger('store_id')->index();
                $table->unsignedBigInteger('contact_id')->nullable()->index();
                $table->string('external_id')->nullable();
                $table->decimal('total', 10, 2)->default(0);
                $table->string('currency')->default('USD');
                $table->json('line_items')->nullable();
                $table->string('recovery_url')->nullable();
                $table->timestamp('abandoned_at')->nullable();
                $table->timestamp('recovery_triggered_at')->nullable();
                $table->timestamp('recovered_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('ecommerce_orders')) {
            Schema::create('ecommerce_orders', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workspace_id')->index();
                $table->unsignedBigInteger('store_id')->index();
                $table->unsignedBigInteger('contact_id')->nullable()->index();
                $table->string('external_order_id')->nullable();
                $table->string('platform')->nullable();
                $table->string('number')->nullable();
                $table->string('status')->default('open');
                $table->string('financial_status')->default('pending');
                $table->string('fulfillment_status')->default('unfulfilled');
                $table->string('currency')->default('USD');
                $table->decimal('total', 10, 2)->default(0);
                $table->json('line_items')->nullable();
                $table->string('tracking_number')->nullable();
                $table->string('tracking_url')->nullable();
                $table->timestamp('placed_at')->nullable();
                $table->json('raw')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('integration_configs')) {
            Schema::create('integration_configs', function (Blueprint $table) {
                $table->id();
                $table->string('provider')->unique();
                $table->string('label')->nullable();
                $table->string('mode')->default('live');
                $table->boolean('enabled')->default(false);
                $table->boolean('is_default')->default(false);
                $table->text('credentials')->nullable();
                $table->string('webhook_secret')->nullable();
                $table->json('meta_json')->nullable();
                $table->json('settings')->nullable();
                $table->unsignedBigInteger('updated_by_admin_id')->nullable();
                $table->timestamp('last_tested_at')->nullable();
                $table->string('last_test_status')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('integration_audit_logs')) {
            Schema::create('integration_audit_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('integration_config_id')->nullable()->index();
                $table->unsignedBigInteger('admin_user_id')->nullable()->index();
                $table->string('action')->nullable();
                $table->string('provider')->nullable();
                $table->json('diff_json')->nullable();
                $table->string('ip')->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('created_at')->nullable();
            });
        }

        if (! Schema::hasTable('payment_gateway_configs')) {
            Schema::create('payment_gateway_configs', function (Blueprint $table) {
                $table->id();
                $table->string('gateway')->unique();
                $table->boolean('test_mode')->default(false);
                $table->boolean('enabled')->default(false);
                $table->text('credentials')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('notification_preferences')) {
            Schema::create('notification_preferences', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('channel');
                $table->string('event');
                $table->boolean('enabled')->default(true);
                $table->timestamps();
                $table->unique(['user_id', 'channel', 'event']);
            });
        }
    }

    public function down(): void
    {
        // Keep down clean
    }
};
