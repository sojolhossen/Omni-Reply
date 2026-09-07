<?php

namespace App\Modules\Inbox\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\AI\Models\AiChatbot;
use App\Modules\Integrations\Services\CredentialResolver;
use App\Modules\Shared\Models\ChannelAccount;
use App\Modules\Whatsapp\Models\WhatsappBusinessAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class InboxSetupController extends Controller
{
    public function index(Request $request): Response
    {
        $workspaceId = $request->user()->current_workspace_id ?? $request->user()->workspace_id;

        // WhatsApp WABAs
        $wabas = WhatsappBusinessAccount::where('workspace_id', $workspaceId)
            ->with('phoneNumbers')
            ->get();

        $whatsappChannelAccounts = ChannelAccount::where('workspace_id', $workspaceId)
            ->where('channel', 'whatsapp')
            ->whereNotNull('phone_number_id')
            ->get(['id', 'phone_number_id', 'display_name', 'status', 'meta_json', 'business_account_id']);

        $webhookTokensByWaba = [];
        $channelAccountPhoneIdsByWaba = [];
        $channelAccountsByWaba = [];
        foreach ($wabas as $waba) {
            $webhookTokensByWaba[$waba->id] = $waba->makeVisible('webhook_verify_token')->webhook_verify_token;
            $accounts = $whatsappChannelAccounts->where('business_account_id', $waba->waba_id)->values();
            $channelAccountPhoneIdsByWaba[$waba->id] = $accounts->pluck('phone_number_id')->all();
            $channelAccountsByWaba[$waba->id] = $accounts->map(fn ($a) => [
                'id'              => $a->id,
                'phone_number_id' => $a->phone_number_id,
                'display_name'    => $a->display_name,
                'status'          => $a->status,
                'ai_chatbot_id'   => $a->meta_json['ai_chatbot_id'] ?? null,
            ])->all();
        }

        // Instagram / Messenger
        $instagramAccounts = ChannelAccount::where('workspace_id', $workspaceId)
            ->where('channel', 'instagram')
            ->get(['id', 'display_name', 'status', 'meta_json', 'created_at'])
            ->map(fn ($a) => array_merge($a->toArray(), ['ai_chatbot_id' => $a->meta_json['ai_chatbot_id'] ?? null]));

        $messengerAccounts = ChannelAccount::where('workspace_id', $workspaceId)
            ->where('channel', 'messenger')
            ->get(['id', 'display_name', 'status', 'meta_json', 'created_at'])
            ->map(fn ($a) => array_merge($a->toArray(), ['ai_chatbot_id' => $a->meta_json['ai_chatbot_id'] ?? null]));

        $chatbots = AiChatbot::where('workspace_id', $workspaceId)
            ->where('enabled', true)
            ->get(['id', 'name']);

        $meta = CredentialResolver::system()->meta();
        $metaWebhookUrl = $meta ? url('/webhooks/meta/'.$meta->verifyToken()) : null;

        $metaCreds = CredentialResolver::system()->meta();

        return Inertia::render('Inbox/Setup', [
            'wabas'                        => $wabas,
            'whatsappWebhookUrl'           => url('/webhooks/whatsapp'),
            'whatsappWebhookGlobalUrl'     => route('webhooks.whatsapp.global.receive'),
            'webhookTokensByWaba'          => $webhookTokensByWaba,
            'channelAccountPhoneIdsByWaba' => $channelAccountPhoneIdsByWaba,
            'channelAccountsByWaba'        => $channelAccountsByWaba,
            'instagramAccounts'            => $instagramAccounts,
            'messengerAccounts'            => $messengerAccounts,
            'chatbots'                     => $chatbots,
            'metaWebhookUrl'               => $metaWebhookUrl,
            'metaAppId'                    => $metaCreds?->appId() ?: null,
            'metaConfigIdWhatsapp'         => $metaCreds?->configIdWhatsapp() ?: null,
            'metaConfigIdSocial'           => $metaCreds?->configIdSocial() ?: null,
        ]);
    }

    public function oauthRedirect(Request $request, string $channel): RedirectResponse
    {
        abort_unless(in_array($channel, ['messenger', 'instagram'], true), 404);

        $meta = CredentialResolver::system()->meta();
        if (! $meta?->appId()) {
            return redirect()->route('client.inbox.setup')
                ->with('error', 'Meta App credentials are not configured. Please ask your administrator to configure them in Admin → Integrations → Meta App.');
        }

        $workspaceId = $request->user()->current_workspace_id ?? $request->user()->workspace_id;
        session(['inbox_oauth_workspace' => $workspaceId, 'inbox_oauth_channel' => $channel]);

        $callbackUrl = route('client.inbox.setup.oauth.callback', ['channel' => $channel]);
        $scope = 'pages_show_list,pages_messaging,pages_manage_metadata,instagram_basic,instagram_manage_messages';

        $query = [
            'client_id'     => $meta->appId(),
            'redirect_uri'  => $callbackUrl,
            'scope'         => $scope,
            'response_type' => 'code',
            'state'         => csrf_token(),
        ];

        $url = 'https://www.facebook.com/v20.0/dialog/oauth?' . http_build_query($query);

        return redirect()->away($url);
    }

    public function oauthCallback(Request $request, string $channel): RedirectResponse
    {
        abort_unless(in_array($channel, ['messenger', 'instagram'], true), 404);

        $code = $request->query('code');
        if (! $code) {
            $err = $request->query('error_description') ?? $request->query('error') ?? 'Authorization was cancelled.';
            return redirect()->route('client.inbox.setup')->with('error', $err);
        }

        $workspaceId = session('inbox_oauth_workspace') ?? ($request->user()->current_workspace_id ?? $request->user()->workspace_id);
        $callbackUrl = route('client.inbox.setup.oauth.callback', ['channel' => $channel]);

        $meta = CredentialResolver::system()->meta();
        if (! $meta?->appId() || ! $meta?->appSecret()) {
            return redirect()->route('client.inbox.setup')->with('error', 'Meta credentials are not configured.');
        }

        $res = Http::get('https://graph.facebook.com/v20.0/oauth/access_token', [
            'client_id'     => $meta->appId(),
            'client_secret' => $meta->appSecret(),
            'code'          => $code,
            'redirect_uri'  => $callbackUrl,
        ]);

        if (! $res->successful() || ! $res->json('access_token')) {
            Log::error('Meta direct OAuth callback: code exchange failed', [
                'status'   => $res->status(),
                'response' => $res->json(),
                'callback' => $callbackUrl,
            ]);
            return redirect()->route('client.inbox.setup')->with('error', 'Failed to connect with Meta: ' . ($res->json('error.message') ?? 'Unknown error'));
        }

        $accessToken = $res->json('access_token');
        $longToken = $this->exchangeForLongLivedToken($accessToken);

        if ($channel === 'messenger') {
            $this->registerMessengerAppWebhook();
            $result = $this->connectMessengerWithToken($longToken, (int) $workspaceId);
        } else {
            $this->registerInstagramAppWebhook();
            $result = $this->connectInstagramWithToken($longToken, (int) $workspaceId);
        }

        if (isset($result['error'])) {
            return redirect()->route('client.inbox.setup')->with('error', $result['error']);
        }

        $count = $result['connected'] ?? 0;
        return redirect()->route('client.inbox.setup')->with('success', "Successfully connected {$count} account(s)!");
    }

    public function embeddedSignupInstagram(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'         => ['nullable', 'string', 'max:2048'],
            'access_token' => ['nullable', 'string', 'max:2048'],
            'redirect_uri' => ['nullable', 'string', 'max:1024'],
        ]);

        $workspaceId = (int) ($request->user()->current_workspace_id ?? $request->user()->workspace_id);

        if (! CredentialResolver::system()->meta()?->appId()) {
            return response()->json(['message' => 'Meta App credentials are not configured. Please ask your administrator to configure them in Admin → Integrations → Meta App.'], 422);
        }

        $this->registerInstagramAppWebhook();

        $accessToken = !empty($validated['access_token'])
            ? $validated['access_token']
            : ($validated['code'] ? $this->exchangeCodeForToken($validated['code'], $validated['redirect_uri'] ?? null) : null);

        if (! $accessToken) {
            return response()->json(['message' => 'Failed to exchange authorization code with Meta.'], 422);
        }

        $longToken = $this->exchangeForLongLivedToken($accessToken);
        $result = $this->connectInstagramWithToken($longToken, $workspaceId);

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']], 422);
        }

        return response()->json(['success' => true, 'connected' => $result['connected'] ?? 0]);
    }

    public function connectInstagramWithToken(string $longToken, int $workspaceId): array
    {
        $pagesRes = Http::withToken($longToken)
            ->get('https://graph.facebook.com/v20.0/me/accounts', [
                'fields' => 'id,name,access_token,instagram_business_account{id,name,username}',
                'limit'  => 50,
            ]);

        if (! $pagesRes->successful()) {
            Log::warning('Instagram signup: pages fetch failed', [
                'workspace_id' => $workspaceId,
                'response'     => $pagesRes->json(),
            ]);

            return ['error' => 'Could not fetch your Facebook pages: ' . ($pagesRes->json('error.message') ?? 'unknown error')];
        }

        $pages = $pagesRes->json('data', []);
        $connected = 0;

        foreach ($pages as $page) {
            $igAccount = $page['instagram_business_account'] ?? null;
            if (! $igAccount || empty($igAccount['id'])) {
                continue;
            }

            $pageToken = $page['access_token'] ?? $longToken;
            $pageId    = (string) ($page['id'] ?? '');
            $igId      = (string) $igAccount['id'];
            $name      = $igAccount['username'] ?? $igAccount['name'] ?? $page['name'] ?? $igId;

            $this->subscribePageToInstagram($pageId, $pageToken);

            $credentials = ['access_token' => $pageToken, 'instagram_account_id' => $igId];
            $metaJson    = [
                'instagram_page_id'    => $igId,
                'instagram_account_id' => $igId,
                'facebook_page_id'     => $pageId,
            ];

            $existing = ChannelAccount::where('workspace_id', $workspaceId)
                ->where('channel', 'instagram')
                ->whereJsonContains('meta_json->instagram_page_id', $igId)
                ->first();

            if ($existing) {
                $existing->update([
                    'credentials' => $credentials,
                    'meta_json'   => array_merge($existing->meta_json ?? [], $metaJson),
                    'status'      => 'active',
                ]);
            } else {
                ChannelAccount::create([
                    'workspace_id' => $workspaceId,
                    'channel'      => 'instagram',
                    'provider'     => 'meta',
                    'display_name' => mb_substr((string) $name, 0, 128),
                    'credentials'  => $credentials,
                    'meta_json'    => $metaJson,
                    'status'       => 'active',
                ]);
            }

            $connected++;
        }

        if ($connected === 0) {
            $pageCount = count($pages);
            $message = $pageCount === 0
                ? 'No Facebook Pages were returned. Make sure you granted page access during authorization and your Meta App has the pages_show_list permission in its Social config.'
                : 'No Instagram Business accounts were found on your ' . $pageCount . ' authorized page(s). To fix this: (1) Go to Meta Business Suite → your Facebook Page → Linked Accounts → link your Instagram account. (2) Make sure your Instagram is a Professional (Business or Creator) account. (3) Ensure your Social config includes the instagram_basic permission.';

            return ['error' => $message];
        }

        return ['success' => true, 'connected' => $connected];
    }

    public function embeddedSignupMessenger(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'         => ['nullable', 'string', 'max:2048'],
            'access_token' => ['nullable', 'string', 'max:2048'],
            'redirect_uri' => ['nullable', 'string', 'max:1024'],
        ]);

        $workspaceId = (int) ($request->user()->current_workspace_id ?? $request->user()->workspace_id);

        if (! CredentialResolver::system()->meta()?->appId()) {
            return response()->json(['message' => 'Meta App credentials are not configured. Please ask your administrator to configure them in Admin → Integrations → Meta App.'], 422);
        }

        $this->registerMessengerAppWebhook();

        $accessToken = !empty($validated['access_token'])
            ? $validated['access_token']
            : ($validated['code'] ? $this->exchangeCodeForToken($validated['code'], $validated['redirect_uri'] ?? null) : null);

        if (! $accessToken) {
            return response()->json(['message' => 'Failed to exchange authorization code with Meta.'], 422);
        }

        $longToken = $this->exchangeForLongLivedToken($accessToken);
        $result = $this->connectMessengerWithToken($longToken, $workspaceId);

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']], 422);
        }

        return response()->json(['success' => true, 'connected' => $result['connected'] ?? 0]);
    }

    public function connectMessengerWithToken(string $longToken, int $workspaceId): array
    {
        $pagesRes = Http::withToken($longToken)
            ->get('https://graph.facebook.com/v20.0/me/accounts', [
                'fields' => 'id,name,access_token',
                'limit'  => 50,
            ]);

        if (! $pagesRes->successful()) {
            Log::warning('Messenger signup: pages fetch failed', [
                'workspace_id' => $workspaceId,
                'response'     => $pagesRes->json(),
            ]);

            return ['error' => 'Could not fetch your Facebook pages: ' . ($pagesRes->json('error.message') ?? 'unknown error')];
        }

        $pages     = $pagesRes->json('data', []);
        $connected = 0;

        foreach ($pages as $page) {
            $pageId    = (string) ($page['id'] ?? '');
            $pageName  = $page['name'] ?? $pageId;
            $pageToken = $page['access_token'] ?? null;

            if (! $pageId) {
                continue;
            }

            if (! $pageToken) {
                $tokenRes  = Http::withToken($longToken)
                    ->get("https://graph.facebook.com/v20.0/{$pageId}", ['fields' => 'access_token']);
                $pageToken = $tokenRes->json('access_token');
            }

            if (! $pageToken) {
                Log::warning('Messenger signup: no page access token — page skipped', [
                    'workspace_id' => $workspaceId,
                    'page_id'      => $pageId,
                    'page_name'    => $pageName,
                ]);

                continue;
            }

            $this->subscribePageToMessenger($pageId, $pageToken);

            $existing = ChannelAccount::where('workspace_id', $workspaceId)
                ->where('channel', 'messenger')
                ->whereJsonContains('meta_json->page_id', $pageId)
                ->first();

            if ($existing) {
                $existing->update([
                    'credentials' => ['page_access_token' => $pageToken],
                    'meta_json'   => array_merge($existing->meta_json ?? [], ['page_id' => $pageId]),
                    'status'      => 'active',
                ]);
            } else {
                ChannelAccount::create([
                    'workspace_id' => $workspaceId,
                    'channel'      => 'messenger',
                    'provider'     => 'meta',
                    'display_name' => mb_substr((string) $pageName, 0, 128),
                    'credentials'  => ['page_access_token' => $pageToken],
                    'meta_json'    => ['page_id' => $pageId],
                    'status'       => 'active',
                ]);
            }

            $connected++;
        }

        if ($connected === 0) {
            return ['error' => 'No Facebook Pages found on your account. Make sure you manage at least one Facebook Page.'];
        }

        return ['success' => true, 'connected' => $connected];
    }

    private function exchangeCodeForToken(string $code, ?string $redirectUri = null): ?string
    {
        $meta = CredentialResolver::system()->meta();
        if (! $meta?->appId() || ! $meta?->appSecret()) {
            return null;
        }

        $appUrl = rtrim((string) config('app.url'), '/');
        $candidates = array_unique(array_filter([
            '', // Meta JS SDK FB.login default
            $redirectUri,
            $appUrl,
            $appUrl . '/app/inbox/setup',
            $appUrl . '/auth/facebook/callback',
            'https://localhost',
            'http://localhost',
        ], fn($c) => $c !== null));

        $res = null;

        // Try without redirect_uri key in array first
        $res = Http::get('https://graph.facebook.com/v20.0/oauth/access_token', [
            'client_id'     => $meta->appId(),
            'client_secret' => $meta->appSecret(),
            'code'          => $code,
        ]);

        if ($res->successful() && $res->json('access_token')) {
            return $res->json('access_token');
        }

        // Then try each candidate redirect_uri
        foreach ($candidates as $candidate) {
            $res = Http::get('https://graph.facebook.com/v20.0/oauth/access_token', [
                'client_id'     => $meta->appId(),
                'client_secret' => $meta->appSecret(),
                'code'          => $code,
                'redirect_uri'  => $candidate,
            ]);

            if ($res->successful() && $res->json('access_token')) {
                return $res->json('access_token');
            }
        }

        if (! $res || ! $res->successful() || ! $res->json('access_token')) {
            Log::error('Meta embedded signup: code exchange failed', [
                'status'   => $res?->status(),
                'response' => $res?->json(),
            ]);
            return null;
        }

        return $res->json('access_token');
    }

    private function exchangeForLongLivedToken(string $shortToken): string
    {
        $meta = CredentialResolver::system()->meta();
        if (! $meta?->appId() || ! $meta?->appSecret()) {
            return $shortToken;
        }

        $res = Http::get('https://graph.facebook.com/v20.0/oauth/access_token', [
            'grant_type'        => 'fb_exchange_token',
            'client_id'         => $meta->appId(),
            'client_secret'     => $meta->appSecret(),
            'fb_exchange_token' => $shortToken,
        ]);

        return ($res->successful() && $res->json('access_token')) ? $res->json('access_token') : $shortToken;
    }

    /**
     * Register the app-level `page` (Messenger) webhook subscription so Meta knows
     * which callback URL to deliver Messenger events to. Uses the App Access Token
     * ({app_id}|{app_secret}) and points at our /webhooks/meta/{verify_token}
     * endpoint. Idempotent: re-registering the same URL/fields is a no-op on Meta.
     * Mirrors registerInstagramAppWebhook() — without it inbound Messenger messages
     * never reach the server (no app-level callback for the page object).
     */
    private function registerMessengerAppWebhook(): void
    {
        $meta        = CredentialResolver::system()->meta();
        $appId       = $meta?->appId();
        $appSecret   = $meta?->appSecret();
        $verifyToken = $meta?->verifyToken();

        if (! $appId || ! $appSecret || ! $verifyToken) {
            Log::warning('Messenger embedded signup: cannot register app webhook — missing app id/secret/verify token', [
                'has_app_id'       => (bool) $appId,
                'has_app_secret'   => (bool) $appSecret,
                'has_verify_token' => (bool) $verifyToken,
            ]);

            return;
        }

        $callbackUrl = route('webhooks.meta.receive', ['token' => $verifyToken]);

        try {
            $res = Http::post("https://graph.facebook.com/v20.0/{$appId}/subscriptions", [
                'access_token' => $appId . '|' . $appSecret,
                'object'       => 'page',
                'callback_url' => $callbackUrl,
                'verify_token' => $verifyToken,
                'fields'       => 'messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads',
            ]);

            if (! $res->successful()) {
                Log::warning('Messenger embedded signup: app webhook registration failed', [
                    'callback_url' => $callbackUrl,
                    'status'       => $res->status(),
                    'response'     => $res->json(),
                ]);

                return;
            }

            Log::info('Messenger embedded signup: app webhook registered', [
                'callback_url' => $callbackUrl,
                'response'     => $res->json(),
            ]);

            // Read back what Meta actually stored so we can confirm the page object
            // has our callback URL and is marked active.
            $check = Http::get("https://graph.facebook.com/v20.0/{$appId}/subscriptions", [
                'access_token' => $appId . '|' . $appSecret,
            ]);
            Log::info('Messenger embedded signup: app subscriptions snapshot', [
                'status'   => $check->status(),
                'response' => $check->json(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Messenger embedded signup: app webhook registration exception', [
                'callback_url' => $callbackUrl,
                'error'        => $e->getMessage(),
            ]);
        }
    }

    private function subscribePageToMessenger(string $pageId, string $pageToken): void
    {
        if ($pageId === '') {
            Log::warning('Messenger embedded signup: cannot subscribe — empty page id');

            return;
        }

        try {
            $res = Http::withToken($pageToken)
                ->post("https://graph.facebook.com/v20.0/{$pageId}/subscribed_apps", [
                    'subscribed_fields' => 'messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads',
                ]);

            if (! $res->successful()) {
                Log::warning('Messenger embedded signup: page subscription failed', [
                    'page_id'  => $pageId,
                    'status'   => $res->status(),
                    'response' => $res->json(),
                ]);

                return;
            }

            Log::info('Messenger embedded signup: page subscribed for messaging', [
                'page_id'  => $pageId,
                'response' => $res->json(),
            ]);

            // Read back the page's subscribed_apps so we can confirm which fields
            // (must include "messages") are actually active for our app.
            $check = Http::withToken($pageToken)
                ->get("https://graph.facebook.com/v20.0/{$pageId}/subscribed_apps");
            Log::info('Messenger embedded signup: page subscribed_apps snapshot', [
                'page_id'  => $pageId,
                'status'   => $check->status(),
                'response' => $check->json(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Messenger embedded signup: page subscription exception', [
                'page_id' => $pageId,
                'error'   => $e->getMessage(),
            ]);
        }
    }

    /**
     * Register the app-level `instagram` webhook subscription so Meta knows which
     * callback URL to deliver Instagram events to. Uses the App Access Token
     * ({app_id}|{app_secret}) and points at our /webhooks/meta/{verify_token}
     * endpoint. Idempotent: re-registering the same URL/fields is a no-op on Meta.
     */
    private function registerInstagramAppWebhook(): void
    {
        $meta        = CredentialResolver::system()->meta();
        $appId       = $meta?->appId();
        $appSecret   = $meta?->appSecret();
        $verifyToken = $meta?->verifyToken();

        if (! $appId || ! $appSecret || ! $verifyToken) {
            Log::warning('Instagram embedded signup: cannot register app webhook — missing app id/secret/verify token', [
                'has_app_id'       => (bool) $appId,
                'has_app_secret'   => (bool) $appSecret,
                'has_verify_token' => (bool) $verifyToken,
            ]);

            return;
        }

        $callbackUrl = route('webhooks.meta.receive', ['token' => $verifyToken]);

        try {
            $res = Http::post("https://graph.facebook.com/v20.0/{$appId}/subscriptions", [
                'access_token' => $appId . '|' . $appSecret,
                'object'       => 'instagram',
                'callback_url' => $callbackUrl,
                'verify_token' => $verifyToken,
                'fields'       => 'messages,messaging_postbacks,message_reactions',
            ]);

            if (! $res->successful()) {
                Log::warning('Instagram embedded signup: app webhook registration failed', [
                    'callback_url' => $callbackUrl,
                    'status'       => $res->status(),
                    'response'     => $res->json(),
                ]);

                return;
            }

            Log::info('Instagram embedded signup: app webhook registered', [
                'callback_url' => $callbackUrl,
                'response'     => $res->json(),
            ]);

            // Read back what Meta actually stored so we can confirm the instagram
            // object has our callback URL and is marked active.
            $check = Http::get("https://graph.facebook.com/v20.0/{$appId}/subscriptions", [
                'access_token' => $appId . '|' . $appSecret,
            ]);
            Log::info('Instagram embedded signup: app subscriptions snapshot', [
                'status'   => $check->status(),
                'response' => $check->json(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Instagram embedded signup: app webhook registration exception', [
                'callback_url' => $callbackUrl,
                'error'        => $e->getMessage(),
            ]);
        }
    }

    /**
     * Subscribe the Facebook Page (linked to an Instagram professional account) to
     * Instagram messaging webhooks. This is required for Meta to deliver inbound
     * Instagram messages — the connect flow previously skipped it, so no messages
     * ever reached /webhooks/meta.
     */
    private function subscribePageToInstagram(string $pageId, string $pageToken): void
    {
        if ($pageId === '') {
            Log::warning('Instagram embedded signup: cannot subscribe — empty page id');

            return;
        }

        try {
            $res = Http::withToken($pageToken)
                ->post("https://graph.facebook.com/v20.0/{$pageId}/subscribed_apps", [
                    'subscribed_fields' => 'messages,messaging_postbacks,message_reactions,message_reads',
                ]);

            if (! $res->successful()) {
                Log::warning('Instagram embedded signup: page subscription failed', [
                    'page_id'  => $pageId,
                    'status'   => $res->status(),
                    'response' => $res->json(),
                ]);

                return;
            }

            Log::info('Instagram embedded signup: page subscribed for messaging', [
                'page_id'  => $pageId,
                'response' => $res->json(),
            ]);

            // Read back the page's subscribed_apps so we can confirm which fields
            // (must include "messages") are actually active for our app.
            $check = Http::withToken($pageToken)
                ->get("https://graph.facebook.com/v20.0/{$pageId}/subscribed_apps");
            Log::info('Instagram embedded signup: page subscribed_apps snapshot', [
                'page_id'  => $pageId,
                'status'   => $check->status(),
                'response' => $check->json(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Instagram embedded signup: page subscription exception', [
                'page_id' => $pageId,
                'error'   => $e->getMessage(),
            ]);
        }
    }

    public function assignChatbot(Request $request, ChannelAccount $channelAccount): RedirectResponse
    {
        $workspaceId = $request->user()->current_workspace_id ?? $request->user()->workspace_id;
        abort_unless((int) $channelAccount->workspace_id === (int) $workspaceId, 403);

        $validated = $request->validate([
            'chatbot_id' => ['nullable', 'integer'],
        ]);

        $chatbotId = $validated['chatbot_id'] ?? null;

        if ($chatbotId !== null) {
            $exists = AiChatbot::where('id', $chatbotId)
                ->where('workspace_id', $workspaceId)
                ->where('enabled', true)
                ->exists();
            abort_unless($exists, 422, 'Chatbot not found or not enabled.');
        }

        $meta = $channelAccount->meta_json ?? [];
        if ($chatbotId === null) {
            unset($meta['ai_chatbot_id']);
        } else {
            $meta['ai_chatbot_id'] = $chatbotId;
        }
        $channelAccount->update(['meta_json' => $meta]);

        $label = $chatbotId ? 'Chatbot assigned.' : 'Chatbot removed.';

        return back()->with('success', $label);
    }

    public function destroy(Request $request, ChannelAccount $channelAccount): RedirectResponse
    {
        $workspaceId = $request->user()->current_workspace_id ?? $request->user()->workspace_id;

        abort_unless((int) $channelAccount->workspace_id === (int) $workspaceId, 403);
        abort_unless(in_array($channelAccount->channel, ['instagram', 'messenger'], true), 403);

        $channelAccount->delete();

        return back()->with('success', 'Account disconnected.');
    }
}
