<?php

namespace App\Modules\AI\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\AI\Models\AiProviderConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiProviderController extends Controller
{
    public function index(Request $request): Response
    {
        $workspaceId = $request->user()->current_workspace_id ?? $request->user()->workspace_id;
        $configs = AiProviderConfig::where('workspace_id', $workspaceId)->get()->keyBy('provider');

        $providers = ['openai', 'anthropic', 'gemini', 'nvidia'];
        $list = collect($providers)->map(fn ($p) => [
            'provider' => $p,
            'enabled' => $configs->get($p)?->enabled ?? false,
            'configured' => ! empty($configs->get($p)?->credentials),
            'default_model_chat' => $configs->get($p)?->default_model_chat ?? '',
            'base_url' => $configs->get($p)?->credentials['base_url'] ?? '',
        ]);

        return Inertia::render('AI/Providers/Index', ['providers' => $list]);
    }

    public function update(Request $request, string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, ['openai', 'anthropic', 'gemini', 'nvidia'], true), 404);
        $workspaceId = $request->user()->current_workspace_id ?? $request->user()->workspace_id;

        $validated = $request->validate([
            'api_key' => ['nullable', 'string', 'max:512'],
            'base_url' => ['nullable', 'string', 'max:512'],
            'default_model_chat' => ['nullable', 'string', 'max:128'],
            'default_model_embed' => ['nullable', 'string', 'max:128'],
            'enabled' => ['boolean'],
        ]);

        $config = AiProviderConfig::firstOrNew(['workspace_id' => $workspaceId, 'provider' => $provider]);
        $creds = $config->credentials ?? [];

        if (! empty($validated['api_key']) && ! preg_match('/^•+/', $validated['api_key'])) {
            $creds['api_key'] = $validated['api_key'];
        }

        if (array_key_exists('base_url', $validated)) {
            $creds['base_url'] = $validated['base_url'];
        }

        $config->fill([
            'credentials' => $creds,
            'default_model_chat' => $validated['default_model_chat'] ?? $config->default_model_chat,
            'default_model_embed' => $validated['default_model_embed'] ?? $config->default_model_embed,
            'enabled' => (bool) $validated['enabled'],
        ])->save();

        return back()->with('success', ucfirst($provider).' configuration saved.');
    }
}
