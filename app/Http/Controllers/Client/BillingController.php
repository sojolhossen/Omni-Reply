<?php

namespace App\Http\Controllers\Client;

use App\Contracts\BillingGatewayInterface;
use App\Http\Controllers\Controller;
use App\Models\ManualPaymentRequest;
use App\Models\PaymentTransaction;
use App\Models\Subscription;
use App\Services\Billing\BillingGatewayRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function __construct(
        private BillingGatewayRegistry $gateways
    ) {}

    /**
     * Attempt gateway-specific checkout fulfilment on the success redirect.
     * Each gateway uses a different query param; all are safe to call concurrently
     * with the webhook because duplicate handling is guarded at the DB level.
     */
    private function tryFulfil(Request $request, int $userId): void
    {
        // Stripe: ?session_id=cs_...
        $sessionId = $request->query('session_id');
        if ($sessionId) {
            $this->callFulfil('stripe', $sessionId, $userId);
        }

        // MyFatoorah: ?paymentId=<id>
        $paymentId = $request->query('paymentId');
        if ($paymentId) {
            $this->callFulfil('myfatoorah', $paymentId, $userId);
        }
    }

    private function callFulfil(string $gatewayKey, string $sessionId, int $userId): void
    {
        $gateway = $this->gateways->get($gatewayKey);
        if (! $gateway instanceof BillingGatewayInterface) {
            return;
        }
        try {
            $gateway->fulfillCheckoutSession($sessionId);
        } catch (\Throwable $e) {
            Log::warning('Billing: checkout fulfilment skipped', [
                'gateway' => $gatewayKey,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        // When returning from a gateway success URL, attempt to fulfil the checkout session.
        // Guarded: the webhook may fulfil concurrently; unique DB constraints prevent duplicates.
        if ($user) {
            $this->tryFulfil($request, $user->id);
        }

        // Active subscription for user
        $effectiveSub = $user->effectiveSubscription()
            ?? Subscription::with('plan:id,name,slug,currency_code')
                ->where('user_id', $user->id)
                ->whereIn('status', ['active', 'trialing'])
                ->latest('id')
                ->first();

        $subscriptionData = null;
        if ($effectiveSub) {
            $subscriptionData = [
                'id' => $effectiveSub->id,
                'plan' => $effectiveSub->plan ? [
                    'id' => $effectiveSub->plan->id,
                    'name' => $effectiveSub->plan->name,
                    'slug' => $effectiveSub->plan->slug,
                ] : null,
                'billing_cycle' => $effectiveSub->billing_cycle,
                'status' => $effectiveSub->status,
                'gateway' => $effectiveSub->gateway,
                'starts_at' => $effectiveSub->starts_at?->toIso8601String(),
                'ends_at' => $effectiveSub->ends_at?->toIso8601String(),
                'trial_ends_at' => $effectiveSub->trial_ends_at?->toIso8601String(),
                'renews_at' => $effectiveSub->renews_at?->toIso8601String(),
            ];
        }

        // Manual payment requests submitted by this customer
        $manualRequests = ManualPaymentRequest::where('user_id', $user->id)
            ->with(['plan:id,name,currency_code'])
            ->orderByDesc('id')
            ->get()
            ->map(function ($mr) {
                return [
                    'id' => $mr->id,
                    'method_name' => $mr->method_name,
                    'sender_number' => $mr->sender_number,
                    'transaction_id' => $mr->transaction_id,
                    'amount_cents' => $mr->amount_cents,
                    'currency_code' => $mr->currency_code,
                    'billing_cycle' => $mr->billing_cycle,
                    'status' => $mr->status,
                    'customer_notes' => $mr->customer_notes,
                    'admin_notes' => $mr->admin_notes,
                    'receipt_url' => $mr->receipt_url,
                    'created_at' => $mr->created_at?->toIso8601String(),
                    'approved_at' => $mr->approved_at?->toIso8601String(),
                    'rejected_at' => $mr->rejected_at?->toIso8601String(),
                    'plan' => $mr->plan ? [
                        'id' => $mr->plan->id,
                        'name' => $mr->plan->name,
                    ] : null,
                ];
            });

        $query = PaymentTransaction::where('user_id', $user->id)
            ->with(['subscription.plan:id,name,slug'])
            ->orderByDesc('created_at');

        $transactions = $query->paginate(20)->withQueryString()->through(function ($t) {
            $payload = is_array($t->payload) ? $t->payload : (json_decode($t->payload ?? '{}', true) ?: []);
            $methodName = $payload['method_name'] ?? ($t->gateway === 'manual' ? 'Manual Payment' : ucfirst($t->gateway ?? 'Payment'));
            $trxId = $t->gateway_transaction_id ?: ($payload['transaction_id'] ?? null);

            return [
                'id' => $t->id,
                'amount_cents' => $t->amount_cents,
                'currency_code' => $t->currency_code,
                'status' => $t->status,
                'gateway' => $t->gateway,
                'method_name' => $methodName,
                'transaction_id' => $trxId,
                'created_at' => $t->created_at->toIso8601String(),
                'plan' => $t->subscription?->plan ? [
                    'name' => $t->subscription->plan->name,
                ] : null,
            ];
        });

        return Inertia::render('client/Billing/Index', [
            'transactions' => $transactions,
            'subscription' => $subscriptionData,
            'manual_requests' => $manualRequests,
        ]);
    }
}
