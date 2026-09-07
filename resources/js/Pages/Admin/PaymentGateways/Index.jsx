import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button, Card, Modal, Toggle } from '@/Components/ui';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Wallet, Clock, Settings2 } from 'lucide-react';

export default function AdminPaymentGatewaysIndex({ gateways = [], pending_manual_count = 0, flash = {} }) {
    const { t } = useTranslation();
    const { props } = usePage();
    const validationErrors = props.errors ?? {};
    const [editGateway, setEditGateway] = useState(null);
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const openEdit = async (gatewayKey) => {
        setEditGateway(gatewayKey);
        setFetchError(null);
        setFormData(null);
        setLoading(true);
        try {
            const { data } = await axios.get(route('admin.payment-gateways.show', gatewayKey));
            setFormData(data);
        } catch (e) {
            setFetchError(e?.response?.data?.message || t('admin.gateway_load_failed'));
        } finally {
            setLoading(false);
        }
    };

    const closeEdit = () => {
        setEditGateway(null);
        setFormData(null);
        setFetchError(null);
    };

    return (
        <AdminLayout title={t('admin.payment_gateways')}>
            <Head title={`${t('admin.payment_gateways')} · Admin`} />
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{t('admin.payment_gateways')}</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {t('admin.payment_gateways_desc')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.payments.manual-requests.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition"
                        >
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Manual Proofs</span>
                            {pending_manual_count > 0 && (
                                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                                    {pending_manual_count}
                                </span>
                            )}
                        </Link>
                        <Link
                            href={route('admin.payment-gateways.manual.methods')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 hover:bg-brand-100 transition"
                        >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>Manual Methods</span>
                        </Link>
                        <Link
                            href={route('admin.payments.index')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 transition"
                        >
                            {t('admin.view_payments')}
                        </Link>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-2.5 text-sm">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {gateways.map((g) => (
                        <Card key={g.gateway} className={g.gateway === 'manual' ? 'border-brand-300 dark:border-brand-800 ring-1 ring-brand-500/20' : ''}>
                            <Card.Body className="flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                            {g.gateway === 'manual' && <Wallet className="w-4 h-4 text-brand-500" />}
                                            {g.name}
                                        </h3>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                g.configured
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                                                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                                            }`}
                                        >
                                            {g.configured ? t('admin.configured') : t('admin.not_configured')}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                        {g.enabled ? t('common.enabled') : t('admin.disabled')} · {g.gateway === 'manual' ? 'Offline / Direct' : (g.test_mode ? t('admin.test_mode') : t('admin.live_mode'))}
                                    </p>
                                </div>

                                {g.gateway === 'manual' ? (
                                    <Link
                                        href={route('admin.payment-gateways.manual.methods')}
                                        className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm"
                                    >
                                        <Settings2 className="w-3.5 h-3.5" />
                                        Configure Accounts (bKash, Nagad, etc.)
                                    </Link>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={() => openEdit(g.gateway)}
                                    >
                                        {t('admin.edit_payment_gateway')}
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>
                    ))}
                </div>
                <EditGatewayModal
                    show={!!editGateway}
                    gatewayKey={editGateway}
                    initialData={formData}
                    loading={loading}
                    error={fetchError}
                    validationErrors={validationErrors}
                    onClose={closeEdit}
                    onSaved={() => {
                        closeEdit();
                        router.reload();
                    }}
                />
            </div>
        </AdminLayout>
    );
}

function EditGatewayModal({ show, gatewayKey, initialData, loading, error, validationErrors = {}, onClose, onSaved }) {
    const { t } = useTranslation();
    const { data, setData, put, processing } = useForm({
        test_mode: true,
        enabled: false,
        test_publishable_key: '',
        test_secret_key: '',
        test_webhook_secret: '',
        live_publishable_key: '',
        live_secret_key: '',
        live_webhook_secret: '',
    });

    useEffect(() => {
        if (!initialData || initialData.gateway !== gatewayKey) return;
        setData({
            test_mode: initialData.test_mode,
            enabled: initialData.enabled,
            test_publishable_key: initialData.test_publishable_key ?? '',
            test_secret_key: initialData.test_secret_key ?? '',
            test_webhook_secret: initialData.test_webhook_secret ?? '',
            live_publishable_key: initialData.live_publishable_key ?? '',
            live_secret_key: initialData.live_secret_key ?? '',
            live_webhook_secret: initialData.live_webhook_secret ?? '',
        });
    }, [gatewayKey, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.payment-gateways.update', gatewayKey), {
            preserveScroll: true,
            onSuccess: () => onSaved(),
        });
    };

    // Gateway-specific guidance. The stored credential keys are always publishable_key /
    // secret_key / webhook_secret; these hints explain what each holds per gateway.
    const GATEWAY_HINTS = {
        razorpay: {
            publishable: 'Razorpay Key ID (rzp_test_… / rzp_live_…).',
            secret: 'Razorpay Key Secret.',
            webhook: 'Webhook secret set in Razorpay Dashboard → Webhooks. Endpoint: /webhooks/razorpay',
            note: 'Razorpay uses native Subscriptions (auto-renewing). Map: Publishable Key = Key ID, Secret Key = Key Secret.',
        },
        cashfree: {
            publishable: 'Cashfree App ID (x-client-id).',
            secret: 'Cashfree Secret Key (x-client-secret). Also used to verify webhook signatures.',
            webhook: 'Not required — Cashfree webhooks are verified with the Secret Key. Endpoint: /webhooks/cashfree',
            note: 'Cashfree uses native Subscriptions (auto-renewing) via its JS SDK. Map: Publishable Key = App ID, Secret Key = Secret Key. Leave Webhook Secret blank.',
        },
        tap: {
            publishable: 'Not required for Tap — leave blank.',
            secret: 'Tap Secret API Key (sk_test_… / sk_live_…). Also verifies the webhook hashstring.',
            webhook: 'Not required — Tap webhooks are verified with the Secret Key. Endpoint: /webhooks/tap',
            note: 'Tap has no hosted auto-renew; renewals are merchant-initiated against the saved card by the billing:charge-recurring scheduler. Only the Secret Key is needed.',
        },
        mollie: {
            publishable: 'Not required for Mollie — leave blank.',
            secret: 'Mollie API Key (test_… / live_…). The prefix selects test or live mode.',
            webhook: 'Not required — Mollie webhooks are verified by re-fetching the payment from the API. Endpoint: /webhooks/mollie',
            note: 'Mollie uses native Customers + Subscriptions (auto-renewing). Only the API Key is needed; its test_/live_ prefix decides the environment.',
        },
        square: {
            publishable: 'Square Location ID (from Dashboard → Locations).',
            secret: 'Square Access Token (sandbox or production).',
            webhook: 'Square Webhook Signature Key (Dashboard → Webhooks). Endpoint: /webhooks/square',
            note: 'Square uses native Catalog + Subscriptions billed via emailed invoices (auto-renewing). Map: Publishable Key = Location ID, Secret Key = Access Token. Toggle Test Mode for the sandbox. Refunds are issued from the Square Dashboard.',
        },
        mercadopago: {
            publishable: 'Not required for Mercado Pago — leave blank.',
            secret: 'Mercado Pago Access Token (TEST-… / APP_USR-…).',
            webhook: 'Optional signing secret from Dashboard → Webhooks (verifies the x-signature header). Endpoint: /webhooks/mercadopago',
            note: 'Mercado Pago uses native Preapproval subscriptions (auto-renewing). Only the Access Token is required; add the signing secret to verify webhook signatures.',
        },
    };
    const isStripe = gatewayKey === 'stripe';
    const custom = GATEWAY_HINTS[gatewayKey];
    const publishableHint = custom?.publishable ?? (isStripe ? t('admin.stripe_pk_hint') : t('admin.publishable_key_hint'));
    const secretHint = custom?.secret ?? (isStripe ? t('admin.stripe_sk_hint') : t('admin.secret_key_hint'));
    const webhookHint = custom?.webhook ?? (isStripe ? t('admin.stripe_webhook_hint') : t('admin.webhook_hint'));
    const gatewayNote = custom?.note ?? t('admin.gateway_credentials_note');

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <Modal.Header title={t('admin.edit_payment_gateway')} onClose={onClose} />
            <form onSubmit={handleSubmit}>
                <Modal.Body className="space-y-6">
                    {loading && (
                        <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">{t('common.loading')}</div>
                    )}
                    {error && (
                        <div className="rounded-soft-lg border border-coral-200 bg-coral-50 dark:bg-coral-900/20 dark:border-coral-800 px-4 py-2 text-sm text-coral-800 dark:text-coral-200">
                            {error}
                        </div>
                    )}
                    {!loading && initialData && (
                        <>
                            <div>
                                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{t('admin.test_mode')}</h4>
                                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                                    {t('admin.test_mode_desc')}
                                </p>
                                <Toggle
                                    checked={data.test_mode}
                                    onChange={(v) => setData('test_mode', v)}
                                    label={data.test_mode ? t('admin.toggle_on') : t('admin.toggle_off')}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">{t('admin.test_credentials')}</h4>
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            {t('admin.publishable_key')} <span className="text-coral-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.test_publishable_key}
                                            onChange={(e) => setData('test_publishable_key', e.target.value)}
                                            placeholder={t('admin.stripe_pk_placeholder')}
                                            className="mt-1 w-full rounded-soft border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                        />
                                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{publishableHint}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            {t('admin.secret_key')} <span className="text-coral-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={data.test_secret_key}
                                            onChange={(e) => setData('test_secret_key', e.target.value)}
                                            placeholder={t('admin.stripe_sk_placeholder')}
                                            className={`mt-1 w-full rounded-soft border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                                                validationErrors.test_secret_key
                                                    ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/10 dark:border-coral-600'
                                                    : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
                                            } text-neutral-900 dark:text-neutral-100`}
                                        />
                                        {validationErrors.test_secret_key && (
                                            <p className="mt-0.5 text-xs text-coral-600 dark:text-coral-400">{validationErrors.test_secret_key}</p>
                                        )}
                                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{secretHint}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('admin.webhook_secret')}</label>
                                        <input
                                            type="password"
                                            value={data.test_webhook_secret}
                                            onChange={(e) => setData('test_webhook_secret', e.target.value)}
                                            placeholder={t('admin.webhook_secret_placeholder')}
                                            className="mt-1 w-full rounded-soft border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                        />
                                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{webhookHint}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">{t('admin.live_credentials')}</h4>
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('admin.publishable_key')}</label>
                                        <input
                                            type="text"
                                            value={data.live_publishable_key}
                                            onChange={(e) => setData('live_publishable_key', e.target.value)}
                                            placeholder={t('admin.stripe_pk_live_placeholder')}
                                            className="mt-1 w-full rounded-soft border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('admin.secret_key')}</label>
                                        <input
                                            type="password"
                                            value={data.live_secret_key}
                                            onChange={(e) => setData('live_secret_key', e.target.value)}
                                            placeholder={t('admin.stripe_sk_live_placeholder')}
                                            className={`mt-1 w-full rounded-soft border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                                                validationErrors.live_secret_key
                                                    ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/10 dark:border-coral-600'
                                                    : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
                                            } text-neutral-900 dark:text-neutral-100`}
                                        />
                                        {validationErrors.live_secret_key && (
                                            <p className="mt-0.5 text-xs text-coral-600 dark:text-coral-400">{validationErrors.live_secret_key}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('admin.webhook_secret')}</label>
                                        <input
                                            type="password"
                                            value={data.live_webhook_secret}
                                            onChange={(e) => setData('live_webhook_secret', e.target.value)}
                                            placeholder={t('admin.webhook_secret_placeholder')}
                                            className="mt-1 w-full rounded-soft border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-soft-lg border border-brand-100 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-800 px-4 py-3 text-sm text-brand-800 dark:text-brand-200">
                                <strong>{t('admin.note_label')}:</strong> {gatewayNote}
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{t('common.enabled')}</h4>
                                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                                    {t('admin.gateway_enable_desc')}
                                </p>
                                <Toggle
                                    checked={data.enabled}
                                    onChange={(v) => setData('enabled', v)}
                                    label={data.enabled ? t('common.enabled') : t('admin.disabled')}
                                    className="mt-2"
                                />
                            </div>
                        </>
                    )}
                </Modal.Body>
                {!loading && initialData && (
                    <Modal.Footer>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" variant="primary" disabled={processing}>
                            {t('common.save')}
                        </Button>
                    </Modal.Footer>
                )}
            </form>
        </Modal>
    );
}
