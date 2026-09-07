<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\ManualPaymentMethod;
use App\Models\ManualPaymentRequest;
use App\Models\Plan;
use App\Services\CurrencyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClientManualCheckoutController extends Controller
{
    public function __construct(
        private CurrencyService $currency
    ) {}

    public function show(Request $request, Plan $plan): Response|RedirectResponse
    {
        if (! $plan->enabled) {
            return redirect()->route('client.pricing')->with('error', __('This plan is currently not available.'));
        }

        $user = $request->user();
        $cycle = $request->query('cycle', $request->query('billing_cycle', 'month'));
        if (! in_array($cycle, ['month', 'year'], true)) {
            $cycle = 'month';
        }

        $priceCents = $plan->priceCentsForCycle($cycle);
        if ($priceCents === null || $priceCents === 0) {
            return redirect()->route('client.pricing')->with('error', __('Free plans do not require manual payment.'));
        }

        $displayCurrency = $user?->display_currency
            ?? $user?->workspace?->currency_code
            ?? $request->session()->get('display_currency')
            ?? Currency::defaultCode();

        $methods = ManualPaymentMethod::where('enabled', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        if ($methods->isEmpty()) {
            return redirect()->route('client.pricing')->with('error', __('No manual payment methods are currently active.'));
        }

        $pendingRequests = ManualPaymentRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('client/Checkout/Manual', [
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'currency_code' => $plan->currency_code,
                'price_cents' => $priceCents,
                'price_display' => $this->currency->formatConverted($priceCents, $plan->currency_code, $displayCurrency),
            ],
            'billing_cycle' => $cycle,
            'methods' => $methods,
            'pending_requests' => $pendingRequests,
            'pricing_url' => route('client.pricing'),
            'billing_url' => route('client.billing.index'),
        ]);
    }

    public function submit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id' => ['required', 'integer', Rule::exists('plans', 'id')],
            'billing_cycle' => ['required', 'string', Rule::in(['month', 'year'])],
            'manual_payment_method_id' => ['required', 'integer', Rule::exists('manual_payment_methods', 'id')],
            'sender_number' => ['required', 'string', 'max:100'],
            'transaction_id' => ['required', 'string', 'max:100'],
            'receipt' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp,pdf', 'max:5120'],
            'customer_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $plan = Plan::where('enabled', true)->findOrFail($validated['plan_id']);
        $method = ManualPaymentMethod::where('enabled', true)->findOrFail($validated['manual_payment_method_id']);
        $user = $request->user();

        $priceCents = $plan->priceCentsForCycle($validated['billing_cycle']);
        if ($priceCents === null) {
            $priceCents = (int) ($plan->price_cents ?? 0);
        }

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('manual-receipts', 'public');
        }

        ManualPaymentRequest::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'billing_cycle' => $validated['billing_cycle'],
            'manual_payment_method_id' => $method->id,
            'method_name' => $method->name,
            'amount_cents' => $priceCents,
            'currency_code' => $plan->currency_code ?: 'BDT',
            'sender_number' => $validated['sender_number'],
            'transaction_id' => $validated['transaction_id'],
            'receipt_path' => $receiptPath,
            'customer_notes' => $validated['customer_notes'] ?? null,
            'status' => 'pending',
        ]);

        return redirect()->route('client.billing.index')->with(
            'success',
            __('Your payment submission has been received successfully! Our admin team will verify the transaction and activate your plan shortly.')
        );
    }
}
