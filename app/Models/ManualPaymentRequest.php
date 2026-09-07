<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManualPaymentRequest extends Model
{
    protected $fillable = [
        'user_id',
        'plan_id',
        'billing_cycle',
        'manual_payment_method_id',
        'method_name',
        'amount_cents',
        'currency_code',
        'sender_number',
        'transaction_id',
        'receipt_path',
        'customer_notes',
        'admin_notes',
        'status',
        'processed_by_admin_id',
        'approved_at',
        'rejected_at',
    ];

    protected $appends = ['receipt_url'];

    protected function casts(): array
    {
        return [
            'amount_cents' => 'integer',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    public function getReceiptUrlAttribute(): ?string
    {
        if (empty($this->receipt_path)) {
            return null;
        }

        if (str_starts_with($this->receipt_path, 'http://') || str_starts_with($this->receipt_path, 'https://')) {
            return $this->receipt_path;
        }

        return route('admin.payments.manual-requests.receipt', $this->id);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function method(): BelongsTo
    {
        return $this->belongsTo(ManualPaymentMethod::class, 'manual_payment_method_id');
    }

    public function manualPaymentMethod(): BelongsTo
    {
        return $this->belongsTo(ManualPaymentMethod::class, 'manual_payment_method_id');
    }

    public function processedByAdmin(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'processed_by_admin_id');
    }
}
