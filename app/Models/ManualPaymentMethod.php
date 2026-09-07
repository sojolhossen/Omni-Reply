<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ManualPaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'account_type',
        'account_number',
        'account_name',
        'branch_name',
        'routing_number',
        'instruction',
        'qr_code_url',
        'enabled',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function requests(): HasMany
    {
        return $this->hasMany(ManualPaymentRequest::class);
    }
}
