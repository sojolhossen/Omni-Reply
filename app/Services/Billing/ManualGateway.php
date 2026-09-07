<?php

namespace App\Services\Billing;

use App\Contracts\BillingGatewayInterface;
use App\Models\ManualPaymentMethod;
use App\Models\PaymentGatewayConfig;
use App\Models\PaymentTransaction;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ManualGateway implements BillingGatewayInterface
{
    public function name(): string
    {
        return 'Manual / Local Payment';
    }

    public function isConfigured(): bool
    {
        $config = PaymentGatewayConfig::getByGateway('manual');
        if ($config && ! $config->enabled) {
            return false;
        }

        return ManualPaymentMethod::where('enabled', true)->exists();
    }

    public function createCheckout(User $user, Plan $plan, string $billingCycle): array
    {
        if (! $this->isConfigured()) {
            return ['error' => 'Manual payment gateway is currently disabled or no payment methods are active.'];
        }

        return [
            'url' => route('client.checkout.manual', [
                'plan' => $plan->id,
                'cycle' => $billingCycle,
            ]),
        ];
    }

    public function handleWebhook(Request $request): SymfonyResponse
    {
        return response('Manual payments do not use automated webhooks.', 200);
    }

    public function cancel(Subscription $subscription): bool
    {
        $subscription->update([
            'status' => 'canceled',
            'ends_at' => now(),
        ]);

        return true;
    }

    public function sync(Subscription $subscription): bool
    {
        return true;
    }

    public function changePlan(Subscription $subscription, Plan $newPlan, string $billingCycle): array
    {
        return [
            'ok' => false,
            'error' => 'Please submit a new manual payment request for plan change.',
        ];
    }

    public function refund(PaymentTransaction $transaction, ?int $amountCents = null): array
    {
        $transaction->update([
            'status' => 'refunded',
            'refunded_at' => now(),
            'refunded_cents' => $amountCents ?? $transaction->amount_cents,
            'refund_reason' => 'Manual refund processed by admin.',
        ]);

        return ['ok' => true];
    }

    public function fulfillCheckoutSession(string $sessionId): array
    {
        return ['ok' => true, 'error' => null, 'subscription' => null];
    }
}
