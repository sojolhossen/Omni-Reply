<?php

namespace Database\Seeders;

use App\Models\ManualPaymentMethod;
use App\Models\PaymentGatewayConfig;
use Illuminate\Database\Seeder;

class ManualPaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        // Enable manual payment gateway config if not present
        PaymentGatewayConfig::firstOrCreate(
            ['gateway' => 'manual'],
            [
                'test_mode' => false,
                'enabled' => true,
                'credentials' => [
                    'test' => ['publishable_key' => '', 'secret_key' => 'manual_active', 'webhook_secret' => ''],
                    'live' => ['publishable_key' => '', 'secret_key' => 'manual_active', 'webhook_secret' => ''],
                ],
            ]
        );

        $defaultMethods = [
            [
                'name' => 'bKash',
                'slug' => 'bkash',
                'account_type' => 'Personal (Send Money)',
                'account_number' => '01700000000',
                'account_name' => 'Omni AI Services',
                'instruction' => "1. Go to your bKash app or dial *247#\n2. Select \"Send Money\"\n3. Enter the account number and the exact amount\n4. Use your Omni AI account email as Reference\n5. Enter your bKash PIN to confirm\n6. Copy the TrxID and enter it in the form below.",
                'enabled' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Nagad',
                'slug' => 'nagad',
                'account_type' => 'Personal (Send Money)',
                'account_number' => '01700000000',
                'account_name' => 'Omni AI Services',
                'instruction' => "1. Go to your Nagad app or dial *167#\n2. Select \"Send Money\"\n3. Enter the Nagad number and exact amount\n4. Put your account email as reference\n5. Complete transaction and submit TrxID below.",
                'enabled' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Rocket',
                'slug' => 'rocket',
                'account_type' => 'Personal (Send Money)',
                'account_number' => '01700000000-0',
                'account_name' => 'Omni AI Services',
                'instruction' => "1. Open Rocket App or dial *322#\n2. Select Send Money\n3. Enter the 12-digit Rocket account number\n4. Complete the transfer and copy Transaction ID.",
                'enabled' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Islami Bank Bangladesh (IBBL)',
                'slug' => 'islami_bank',
                'account_type' => 'Bank Account (NPSB / BEFTN / Cellfin)',
                'account_number' => '2050XXXXXXXXXXXXX',
                'account_name' => 'Omni AI Services',
                'branch_name' => 'Principal Branch, Dhaka',
                'routing_number' => '125272847',
                'instruction' => "1. Transfer the amount via iBanking, Cellfin, or any Bank's NPSB/BEFTN\n2. Account Name: Omni AI Services\n3. Enter the payment reference\n4. Submit Sender Bank/Account Name and Transaction Reference ID below.",
                'enabled' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Cellfin',
                'slug' => 'cellfin',
                'account_type' => 'Cellfin Number / ID',
                'account_number' => '01700000000',
                'account_name' => 'Omni AI Services',
                'instruction' => "1. Open your Cellfin app\n2. Go to \"Fund Transfer\" → \"Cellfin\"\n3. Enter our Cellfin number\n4. Complete transfer and enter the Transaction ID below.",
                'enabled' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'RedoyPay',
                'slug' => 'redoypay',
                'account_type' => 'RedoyPay Wallet',
                'account_number' => '01700000000',
                'account_name' => 'Omni AI Services',
                'instruction' => "1. Transfer using RedoyPay App\n2. Send exact amount to our RedoyPay ID/Number\n3. Submit Transaction ID / Payment reference below.",
                'enabled' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'Binance (Crypto Pay / USDT)',
                'slug' => 'binance',
                'account_type' => 'Binance Pay UID / USDT (TRC20 / BEP20)',
                'account_number' => 'Pay UID: 123456789 | USDT (TRC20): TXXXXXXXXXXXXXXXXXXXXXXXXX',
                'account_name' => 'Omni AI Binance',
                'instruction' => "1. Open Binance App → Pay → Send (Enter Pay UID)\n2. Or transfer USDT (TRC20/BEP20) to the address provided\n3. Submit your Binance Order ID / TxHash below.",
                'enabled' => true,
                'sort_order' => 7,
            ],
        ];

        foreach ($defaultMethods as $method) {
            ManualPaymentMethod::updateOrCreate(
                ['slug' => $method['slug']],
                $method
            );
        }
    }
}
