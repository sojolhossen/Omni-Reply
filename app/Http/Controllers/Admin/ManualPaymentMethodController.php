<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ManualPaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ManualPaymentMethodController extends Controller
{
    public function index(): Response
    {
        $methods = ManualPaymentMethod::orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return Inertia::render('Admin/PaymentGateways/ManualMethods', [
            'methods' => $methods,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:100'],
            'account_type' => ['nullable', 'string', 'max:50'],
            'account_number' => ['required', 'string', 'max:100'],
            'account_name' => ['nullable', 'string', 'max:100'],
            'branch_name' => ['nullable', 'string', 'max:100'],
            'routing_number' => ['nullable', 'string', 'max:100'],
            'instruction' => ['nullable', 'string'],
            'qr_code' => ['nullable', 'image', 'max:2048'],
            'qr_code_url' => ['nullable', 'string', 'max:500'],
            'enabled' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        if ($request->hasFile('qr_code')) {
            $path = $request->file('qr_code')->store('payment-qrcodes', 'public');
            $validated['qr_code_url'] = Storage::url($path);
        }

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        ManualPaymentMethod::create($validated);

        return back()->with('success', __('Manual payment method created successfully.'));
    }

    public function update(Request $request, ManualPaymentMethod $method): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:100'],
            'account_type' => ['nullable', 'string', 'max:50'],
            'account_number' => ['required', 'string', 'max:100'],
            'account_name' => ['nullable', 'string', 'max:100'],
            'branch_name' => ['nullable', 'string', 'max:100'],
            'routing_number' => ['nullable', 'string', 'max:100'],
            'instruction' => ['nullable', 'string'],
            'qr_code' => ['nullable', 'image', 'max:2048'],
            'qr_code_url' => ['nullable', 'string', 'max:500'],
            'enabled' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        if ($request->hasFile('qr_code')) {
            $path = $request->file('qr_code')->store('payment-qrcodes', 'public');
            $validated['qr_code_url'] = Storage::url($path);
        }

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $method->update($validated);

        return back()->with('success', __('Manual payment method updated successfully.'));
    }

    public function toggle(ManualPaymentMethod $method): RedirectResponse
    {
        $method->update([
            'enabled' => ! $method->enabled,
        ]);

        return back()->with('success', __('Payment method status updated.'));
    }

    public function destroy(ManualPaymentMethod $method): RedirectResponse
    {
        $method->delete();

        return back()->with('success', __('Payment method deleted successfully.'));
    }
}
