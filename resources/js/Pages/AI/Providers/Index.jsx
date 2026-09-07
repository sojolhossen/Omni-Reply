import { Head, useForm, usePage } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import EmptyState from '@/Components/EmptyState';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, CheckCircle, Bot, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const SETUP_GUIDES = {
    openai: {
        steps: [
            'ai.guide_openai_step1',
            'ai.guide_openai_step2',
            'ai.guide_openai_step3',
            'ai.guide_openai_step4',
            'ai.guide_openai_step5',
        ],
        link: 'https://platform.openai.com/api-keys',
        linkLabelKey: 'ai.guide_openai_link',
    },
    anthropic: {
        steps: [
            'ai.guide_anthropic_step1',
            'ai.guide_anthropic_step2',
            'ai.guide_anthropic_step3',
            'ai.guide_anthropic_step4',
            'ai.guide_anthropic_step5',
        ],
        link: 'https://console.anthropic.com/keys',
        linkLabelKey: 'ai.guide_anthropic_link',
    },
    gemini: {
        steps: [
            'ai.guide_gemini_step1',
            'ai.guide_gemini_step2',
            'ai.guide_gemini_step3',
            'ai.guide_gemini_step4',
        ],
        link: 'https://aistudio.google.com/app/apikey',
        linkLabelKey: 'ai.guide_gemini_link',
    },
    nvidia: {
        steps: [
            'ai.guide_nvidia_step1',
            'ai.guide_nvidia_step2',
            'ai.guide_nvidia_step3',
            'ai.guide_nvidia_step4',
        ],
        link: 'https://build.nvidia.com/',
        linkLabelKey: 'ai.guide_nvidia_link',
    },
};

function SetupGuide({ providerKey }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const guide = SETUP_GUIDES[providerKey];
    if (!guide) return null;
    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium transition w-full text-left"
            >
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                {t('ai.setup_guide')}
                {open ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
            </button>
            {open && (
                <div className="mt-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 px-3 py-2.5 space-y-2">
                    <ol className="space-y-1">
                        {guide.steps.map((stepKey, i) => (
                            <li key={i} className="flex gap-2 text-xs text-blue-700 dark:text-blue-400">
                                <span className="shrink-0 font-medium text-blue-500">{i + 1}.</span>
                                <span>{t(stepKey)}</span>
                            </li>
                        ))}
                    </ol>
                    <a href={guide.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        {t(guide.linkLabelKey)} →
                    </a>
                </div>
            )}
        </div>
    );
}

const OpenAILogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.843-3.372L15.115 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.403-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" fill="currentColor"/>
    </svg>
);

const AnthropicLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-3.654 0H6.57L0 20h3.603l1.357-3.415h6.85l1.356 3.415h3.604L10.173 3.52zm-4.17 10.222 2.444-6.317 2.444 6.317H5.997z" fill="currentColor"/>
    </svg>
);

const GeminiLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 24A14.304 14.304 0 0 0 0 12 14.304 14.304 0 0 0 12 0a14.304 14.304 0 0 0 12 12 14.304 14.304 0 0 0-12 12z" fill="url(#gemini-gradient)"/>
        <defs>
            <linearGradient id="gemini-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4285F4"/>
                <stop offset="50%" stopColor="#9B72CB"/>
                <stop offset="100%" stopColor="#D96570"/>
            </linearGradient>
        </defs>
    </svg>
);

const NvidiaLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.897 6.425C8.01 6.84 5.926 8.358 4.75 10.155c-1.35 2.062-1.636 4.394-.78 6.353.792 1.808 2.502 2.872 4.908 3.053 1.096.082 2.766-.084 3.796-.379 1.838-.526 3.633-1.634 4.887-3.016 1.03-1.135 1.576-2.128 1.942-3.523.232-.882.261-2.02.073-2.905-.333-1.57-1.282-3.055-2.613-4.088-1.543-1.198-3.551-1.898-5.59-1.93-1.344-.022-2.152.093-3.486.536l-.373.124.08.384c.045.212.107.388.138.393.03.004.47-.11.977-.253 1.815-.512 3.82-.416 5.485.263 1.344.548 2.457 1.535 3.054 2.709.689 1.353.714 2.923.072 4.298-.679 1.455-1.976 2.656-3.535 3.27-1.385.545-3.078.647-4.484.27-1.554-.416-2.822-1.465-3.425-2.831-.476-1.077-.442-2.455.088-3.626.541-1.196 1.633-2.228 2.959-2.793.856-.364 1.769-.533 2.72-.503 1.258.04 2.279.418 3.124 1.154.59.513 1.002 1.163 1.226 1.931.138.472.158 1.119.047 1.57-.179.73-.623 1.358-1.255 1.777-.73.483-1.666.697-2.607.595-.756-.082-1.364-.383-1.782-.88-.415-.494-.528-1.082-.338-1.758.125-.444.437-.84.857-1.09.431-.257.904-.33 1.428-.22.428.09.774.34.989.715.116.202.14.316.14.664 0 .426-.06.593-.274.767-.323.262-.77.242-1.086-.048-.13-.119-.176-.232-.176-.431 0-.317.202-.53.518-.544.17-.008.277.05.344.187.039.08.04.148.006.241-.048.132-.191.196-.328.146l-.088-.032.034-.078c.038-.088.026-.144-.042-.196-.109-.083-.284-.047-.367.075-.084.123-.058.286.06.39.16.14.417.151.62.028.188-.114.286-.296.286-.532 0-.279-.115-.492-.35-.648-.31-.205-.729-.214-1.077-.023-.42.23-.68.618-.735 1.098-.063.553.11 1.096.48 1.503.407.447.962.705 1.636.76.848.069 1.685-.125 2.336-.541.677-.433 1.139-1.087 1.282-1.815.097-.492.057-1.18-.097-1.666-.277-.876-.807-1.637-1.54-2.21-1.054-.823-2.348-1.233-3.778-1.195-1.191.032-2.316.353-3.327.949-1.468.864-2.583 2.193-3.075 3.665-.487 1.458-.456 3.09.087 4.548.749 2.012 2.378 3.52 4.496 4.159 1.536.463 3.329.479 4.88.043 1.62-.455 3.095-1.402 4.225-2.716 1.168-1.358 1.874-2.923 2.147-4.757.214-1.439.096-2.96-.341-4.398C20.697 5.75 19.349 3.86 17.39 2.457 15.337.986 12.83.208 10.308.257 8.528.291 7.234.615 5.59 1.442l-.46.232.124.373c.092.277.135.372.164.364.024-.007.412-.196.862-.42 1.472-.733 2.894-1.086 4.41-.109 2.29.034 4.537.778 6.36 2.106 1.762 1.284 2.996 3.003 3.559 4.954.402 1.393.484 2.768.253 4.197-.247 1.53-.87 2.96-1.837 4.213-1.01 1.309-2.36 2.288-3.882 2.817-1.392.484-3.04.57-4.482.235-1.928-.448-3.483-1.696-4.275-3.435-.745-1.637-.629-3.614.306-5.228 1.013-1.748 2.77-3.08 4.795-3.633.723-.197 1.838-.28 2.502-.187l.39.055-.02-.387c-.02-.382-.03-.39-.373-.424-.555-.055-1.625.02-2.355.165z" fill="#76B900"/>
    </svg>
);

const PROVIDER_INFO = {
    openai:    { label: 'OpenAI',     Icon: OpenAILogo,    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
    anthropic: { label: 'Anthropic',  Icon: AnthropicLogo, models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'] },
    gemini:    { label: 'Gemini',     Icon: GeminiLogo,    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'] },
    nvidia:    {
        label: 'NVIDIA NIM',
        Icon: NvidiaLogo,
        models: [
            'meta/llama-3.3-70b-instruct',
            'deepseek-ai/deepseek-r1',
            'deepseek-ai/deepseek-v3',
            'meta/llama-3.1-405b-instruct',
            'meta/llama-3.1-70b-instruct',
            'meta/llama-3.1-8b-instruct',
            'mistralai/mistral-large-2-instruct',
            'mistralai/mixtral-8x22b-instruct-v0.1',
            'nvidia/nemotron-4-340b-instruct',
            'qwen/qwen2.5-72b-instruct',
            'custom',
        ],
    },
};

function ProviderCard({ provider }) {
    const { t } = useTranslation();
    const [showKey, setShowKey] = useState(false);
    const info = PROVIDER_INFO[provider.provider] ?? {};

    const isNvidia = provider.provider === 'nvidia';
    const knownModels = (info.models || []).filter(m => m !== 'custom');
    const currentModel = provider.default_model_chat || (info.models?.[0] !== 'custom' ? info.models?.[0] : '') || '';
    const isCustomModel = isNvidia && !knownModels.includes(currentModel) && currentModel !== '';

    const [selectedModel, setSelectedModel] = useState(isCustomModel ? 'custom' : (currentModel || knownModels[0] || ''));
    const [customModelText, setCustomModelText] = useState(isCustomModel ? currentModel : '');

    const { data, setData, put, processing, errors } = useForm({
        api_key:             '',
        base_url:            provider.base_url || '',
        default_model_chat:  currentModel || (knownModels[0] || ''),
        enabled:             provider.enabled,
    });

    const handleModelChange = (val) => {
        setSelectedModel(val);
        if (val === 'custom') {
            setData('default_model_chat', customModelText || 'meta/llama-3.3-70b-instruct');
        } else {
            setData('default_model_chat', val);
        }
    };

    const handleCustomModelTextChange = (val) => {
        setCustomModelText(val);
        setData('default_model_chat', val);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('client.ai.providers.update', provider.provider), { preserveScroll: true });
    };

    return (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {info.Icon && <span className="text-neutral-800 dark:text-neutral-200"><info.Icon /></span>}
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{info.label}</h3>
                </div>
                {provider.configured && <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><CheckCircle className="h-3.5 w-3.5" /> {t('ai.configured')}</span>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{t('ai.api_key')}</label>
                    <div className="relative mt-1">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={data.api_key}
                            onChange={e => setData('api_key', e.target.value)}
                            placeholder={provider.configured ? t('ai.api_key_encrypted_placeholder') : (isNvidia ? 'nvapi-…' : 'sk-…')}
                            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 pr-10 text-sm"
                        />
                        <button type="button" onClick={() => setShowKey(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {isNvidia && (
                    <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{t('ai.base_url_optional') || 'Base URL (Optional)'}</label>
                        <input
                            type="text"
                            value={data.base_url}
                            onChange={e => setData('base_url', e.target.value)}
                            placeholder="https://integrate.api.nvidia.com/v1"
                            className="mt-1 w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                        />
                    </div>
                )}

                <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{t('ai.default_chat_model')}</label>
                    <select
                        value={selectedModel}
                        onChange={e => handleModelChange(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                    >
                        {info.models?.map(m => (
                            <option key={m} value={m}>
                                {m === 'custom' ? (t('ai.custom_model') || 'Custom Model…') : m}
                            </option>
                        ))}
                    </select>
                </div>

                {isNvidia && selectedModel === 'custom' && (
                    <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{t('ai.custom_model') || 'Model Identifier'}</label>
                        <input
                            type="text"
                            value={customModelText}
                            onChange={e => handleCustomModelTextChange(e.target.value)}
                            placeholder="e.g. meta/llama-3.3-70b-instruct"
                            className="mt-1 w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                        />
                    </div>
                )}

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={data.enabled} onChange={e => setData('enabled', e.target.checked)} className="rounded" />
                    {t('common.enabled')}
                </label>
                {(
                    <button type="submit" disabled={processing} className="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 transition">
                        {processing ? t('ai.saving') : t('common.save')}
                    </button>
                )}
            </form>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <SetupGuide providerKey={provider.provider} />
            </div>
        </div>
    );
}

export default function AiProvidersIndex({ providers }) {
    const { t } = useTranslation();
    const { props } = usePage();
    const flash = props.flash ?? {};

    return (
        <ClientLayout title={t('ai.providers_title')}>
            <Head title={t('ai.providers_title')} />
            <div className="space-y-5">
                <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{t('ai.provider_settings')}</h2>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t('ai.provider_settings_subtitle')}</p>
                </div>
                {flash.success && <div className="rounded-lg bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 text-sm">{flash.success}</div>}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {providers.length === 0 ? (
                        <div className="col-span-full">
                            <EmptyState
                                icon={<Bot className="h-8 w-8" />}
                                title={t('ai.no_providers_title')}
                                description={t('ai.no_providers_description')}
                            />
                        </div>
                    ) : (
                        providers.map(p => <ProviderCard key={p.provider} provider={p} />)
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}
