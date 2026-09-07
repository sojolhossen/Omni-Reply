<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('manual_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. bKash, Nagad, Rocket, Islami Bank, RedoyPay, Binance, Cellfin
            $table->string('slug')->unique(); // e.g. bkash, nagad, rocket, islami_bank, redoypay, binance, cellfin
            $table->string('account_type')->default('Personal'); // Personal, Agent, Merchant, Bank Account, Crypto
            $table->string('account_number'); // Phone number, Bank account no, Crypto address/UID
            $table->string('account_name')->nullable(); // Name of account holder
            $table->string('branch_name')->nullable(); // Bank branch if applicable
            $table->string('routing_number')->nullable(); // Routing / Swift / Network if applicable
            $table->text('instruction')->nullable(); // Steps & instructions for the customer
            $table->string('qr_code_url')->nullable(); // QR code image URL or path
            $table->boolean('enabled')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('manual_payment_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            $table->string('billing_cycle')->default('month'); // month, year
            $table->foreignId('manual_payment_method_id')->nullable()->constrained('manual_payment_methods')->nullOnDelete();
            $table->string('method_name'); // Snapshot of method name (bKash, Nagad, etc.)
            $table->unsignedBigInteger('amount_cents'); // Price in cents/paisa
            $table->string('currency_code', 10)->default('BDT');
            $table->string('sender_number')->nullable(); // Customer's paying phone number or bank sender name
            $table->string('transaction_id'); // TrxID / Reference ID / Hash entered by customer
            $table->string('receipt_path')->nullable(); // Uploaded payment proof screenshot
            $table->text('customer_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('processed_by_admin_id')->nullable()->constrained('admin_users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manual_payment_requests');
        Schema::dropIfExists('manual_payment_methods');
    }
};
