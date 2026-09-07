<?php

namespace App\Http\Controllers\Admin;

use App\Events\SubscriptionStarted;
use App\Http\Controllers\Controller;
use App\Models\ManualPaymentRequest;
use App\Models\PaymentTransaction;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminManualPaymentRequestController extends Controller
{
    public function __construct(
        private AuditLogService $auditLog
    ) {}

    public function index(Request $request): Response
    {
        $status = $request->query('status', 'all');
        $search = $request->query('search', '');

        $query = ManualPaymentRequest::with([
            'user:id,name,email',
            'plan:id,name,currency_code',
            'manualPaymentMethod:id,name,account_type,account_number',
            'processedByAdmin:id,name,email',
        ]);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                    ->orWhere('sender_number', 'like', "%{$search}%")
                    ->orWhere('method_name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $requests = $query->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $counts = [
            'all' => ManualPaymentRequest::count(),
            'pending' => ManualPaymentRequest::where('status', 'pending')->count(),
            'approved' => ManualPaymentRequest::where('status', 'approved')->count(),
            'rejected' => ManualPaymentRequest::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Payments/ManualRequests', [
            'requests' => $requests,
            'counts' => $counts,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    public function approve(Request $request, ManualPaymentRequest $manualRequest): RedirectResponse
    {
        if ($manualRequest->status !== 'pending') {
            return back()->with('error', __('This request has already been processed.'));
        }

        $user = $manualRequest->user;
        $plan = $manualRequest->plan ?? Plan::find($manualRequest->plan_id);

        if (! $user || ! $plan) {
            return back()->with('error', __('User or Plan associated with this request could not be found.'));
        }

        $cycle = in_array($manualRequest->billing_cycle, ['year', 'month'], true)
            ? $manualRequest->billing_cycle
            : 'month';

        $startsAt = now();
        $endsAt = $cycle === 'year' ? now()->addYear() : now()->addMonth();

        // Cancel previous active/trialing subscriptions
        Subscription::where('user_id', $user->id)
            ->whereIn('status', ['active', 'trialing'])
            ->update(['status' => 'canceled', 'ends_at' => now()]);

        // Create new active subscription
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'billing_cycle' => $cycle,
            'status' => 'active',
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'gateway' => 'manual',
            'gateway_subscription_id' => 'MANUAL-REQ-'.$manualRequest->id,
        ]);

        // Record paid transaction
        PaymentTransaction::create([
            'subscription_id' => $subscription->id,
            'user_id' => $user->id,
            'gateway' => 'manual',
            'gateway_transaction_id' => $manualRequest->transaction_id ?: ('MANUAL-TX-'.$manualRequest->id),
            'amount_cents' => (int) $manualRequest->amount_cents,
            'currency_code' => $manualRequest->currency_code ?: 'BDT',
            'status' => 'paid',
            'payload' => [
                'method_name' => $manualRequest->method_name,
                'sender_number' => $manualRequest->sender_number,
                'transaction_id' => $manualRequest->transaction_id,
                'customer_notes' => $manualRequest->customer_notes,
                'receipt_path' => $manualRequest->receipt_path,
                'manual_request_id' => $manualRequest->id,
            ],
        ]);

        // Update manual payment request
        $manualRequest->update([
            'status' => 'approved',
            'processed_by_admin_id' => $request->user()?->id,
            'approved_at' => now(),
            'admin_notes' => $request->input('admin_notes'),
        ]);

        $this->auditLog->logAdmin('manual_payment.approved', ManualPaymentRequest::class, (int) $manualRequest->id, [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'amount_cents' => $manualRequest->amount_cents,
            'method_name' => $manualRequest->method_name,
            'transaction_id' => $manualRequest->transaction_id,
        ]);

        SubscriptionStarted::dispatch($user, $subscription, $plan);

        return back()->with('success', __('Manual payment approved and subscription activated.'));
    }

    public function reject(Request $request, ManualPaymentRequest $manualRequest): RedirectResponse
    {
        if ($manualRequest->status !== 'pending') {
            return back()->with('error', __('This request has already been processed.'));
        }

        $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $manualRequest->update([
            'status' => 'rejected',
            'processed_by_admin_id' => $request->user()?->id,
            'rejected_at' => now(),
            'admin_notes' => $request->input('admin_notes', 'Payment verification failed.'),
        ]);

        $this->auditLog->logAdmin('manual_payment.rejected', ManualPaymentRequest::class, (int) $manualRequest->id, [
            'user_id' => $manualRequest->user_id,
            'reason' => $manualRequest->admin_notes,
        ]);

        return back()->with('success', __('Manual payment request has been rejected.'));
    }

    public function receipt(ManualPaymentRequest $manualRequest)
    {
        $raw = $manualRequest->receipt_path;
        if (empty($raw)) {
            abort(404, 'Receipt not found');
        }

        $clean = preg_replace('#^/?(storage/)?#', '', $raw);

        if (Storage::disk('public')->exists($clean)) {
            return Storage::disk('public')->response($clean);
        }

        $basename = basename($raw);
        if (Storage::disk('public')->exists('manual-receipts/'.$basename)) {
            return Storage::disk('public')->response('manual-receipts/'.$basename);
        }

        abort(404, 'Receipt file not found on disk');
    }
}
