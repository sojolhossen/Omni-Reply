<?php

namespace App\Modules\AI\Services\Llm;

use Illuminate\Support\Facades\Http;

class NvidiaNimProvider implements LlmProviderInterface
{
    private const DEFAULT_BASE = 'https://integrate.api.nvidia.com/v1';

    private string $baseUrl;

    public function __construct(
        private readonly string $apiKey,
        private readonly string $chatModel = 'meta/llama-3.3-70b-instruct',
        private readonly string $embedModel = 'nvidia/nv-embedqa-e5-v5',
        ?string $baseUrl = null,
    ) {
        $this->baseUrl = ! empty($baseUrl) ? rtrim($baseUrl, '/') : self::DEFAULT_BASE;
    }

    public function chat(array $messages, array $opts = []): LlmResponse
    {
        $start = microtime(true);
        $headers = [
            'Authorization' => 'Bearer '.$this->apiKey,
            'Accept' => 'application/json',
        ];

        $payload = [
            'model' => $opts['model'] ?? $this->chatModel,
            'messages' => $messages,
            'max_tokens' => $opts['max_tokens'] ?? 1024,
            'temperature' => $opts['temperature'] ?? 0.7,
            'top_p' => $opts['top_p'] ?? 1.0,
        ];

        $resp = Http::withHeaders($headers)
            ->retry(2, 500)
            ->timeout(60)
            ->post($this->baseUrl.'/chat/completions', $payload);

        if (! $resp->successful()) {
            $err = $resp->json()['error']['message'] ?? $resp->json()['detail'] ?? $resp->body();
            throw new \RuntimeException('NVIDIA NIM chat failed: '.$err);
        }

        $json = $resp->json();
        $latency = (int) ((microtime(true) - $start) * 1000);
        $msg = $json['choices'][0]['message'] ?? [];
        $content = $msg['content'] ?? '';

        if (empty($content) && ! empty($msg['reasoning_content'])) {
            $content = $msg['reasoning_content'];
        }
        if (empty($content) && ! empty($msg['reasoning'])) {
            $content = $msg['reasoning'];
        }

        return new LlmResponse(
            content: $content,
            promptTokens: $json['usage']['prompt_tokens'] ?? 0,
            completionTokens: $json['usage']['completion_tokens'] ?? 0,
            model: $json['model'] ?? ($opts['model'] ?? $this->chatModel),
            latencyMs: $latency,
        );
    }

    public function embed(array $texts): array
    {
        if (empty($texts)) {
            return [];
        }

        $headers = [
            'Authorization' => 'Bearer '.$this->apiKey,
            'Accept' => 'application/json',
        ];

        $resp = Http::withHeaders($headers)
            ->retry(2, 500)
            ->timeout(30)
            ->post($this->baseUrl.'/embeddings', [
                'model' => $this->embedModel,
                'input' => $texts,
                'input_type' => 'query',
                'encoding_format' => 'float',
            ]);

        if (! $resp->successful()) {
            $err = $resp->json()['error']['message'] ?? $resp->json()['detail'] ?? $resp->body();
            throw new \RuntimeException('NVIDIA NIM embed failed: '.$err);
        }

        $data = $resp->json()['data'] ?? [];
        return array_column($data, 'embedding');
    }
}
