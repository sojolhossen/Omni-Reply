import { useState } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    CreditCard,
    Package,
    Download,
    Clock,
    CheckCircle2,
    XCircle,
    Copy,
    Check,
    FileText,
    ExternalLink,
    Sparkles,
    ShieldCheck,
    ArrowRight,
    RefreshCw,
    X,
} from 'lucide-react';
import { formatDateTz, formatInTz } from '@/Utils/datetime';

function formatAmount(cents, currency = 'USD') {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency || 'USD',
    }).format((cents || 0) / 100);
}

export default function BillingIndex({ transactions, subscription, manual_requests = [] }) {
    const { t } = useTranslation();
    const { timezone, flash } = usePage().props;
    const { url } = usePage();
    const userTz = timezone || 'Asia/Dhaka';
    const formatDate = (iso) => formatDateTz(iso, userTz);
    const hasCheckoutSuccess = url.includes('checkout=success');

    const [copiedId, setCopiedId] = useState(null);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const pendingRequests = manual_requests.filter((r) => r.status === 'pending');
    const processedRequests = manual_requests.filter((r) => r.status !== 'pending');

    return (
        <ClientLayout title={t('subscription.billing') || 'Billing & Subscriptions'}>
            <Head title={t('subscription.billing') || 'Billing & Subscriptions'} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                            <CreditCard className="w-7 h-7 text-brand-500" />
                            {t('subscription.billing') || 'Billing & Subscriptions'}
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {t('client.billing_history') || 'Manage your active plan, manual payment proofs, and invoices.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('client.pricing')}
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                        >
                            <Sparkles className="h-4 w-4" />
                            {t('client.view_plans') || 'Upgrade / View Plans'}
                        </Link>
                    </div>
                </div>

                {/* Flash success / checkout success */}
                {(flash?.success || hasCheckoutSuccess) && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                        <span>{flash?.success || t('subscription.checkout_success')}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                        <XCircle className="w-5 h-5 shrink-0 text-red-600" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Active Plan Overview Card */}
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/60 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-200 dark:border-brand-800">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                        {subscription?.plan?.name || 'Free Tier'}
                                    </h2>
                                    {subscription?.status === 'active' && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Active Plan
                                        </span>
                                    )}
                                    {subscription?.status === 'trialing' && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                            <Clock className="w-3.5 h-3.5" /> Free Trial
                                        </span>
                                    )}
                                    {(!subscription || subscription?.status === 'canceled') && (
                                        <span className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-700 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                            No Active Subscription
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                    {subscription?.billing_cycle && (
                                        <span className="capitalize font-medium text-neutral-700 dark:text-neutral-300">
                                            Billing Cycle: {subscription.billing_cycle}ly
                                        </span>
                                    )}
                                    {subscription?.ends_at && (
                                        <span className="ml-3">
                                            Valid until: <strong>{formatDate(subscription.ends_at)}</strong>
                                        </span>
                                    )}
                                    {subscription?.gateway && (
                                        <span className="ml-3 text-xs uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-mono">
                                            Gateway: {subscription.gateway}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href={route('client.subscription.show')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Manage Subscription
                            </Link>
                            <Link
                                href={route('client.pricing')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-sm transition"
                            >
                                Change Plan
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Pending Manual Payment Verification Alert/Card */}
                {pendingRequests.length > 0 && (
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/40 dark:to-orange-950/20 p-5 shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                                <Clock className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-amber-900 dark:text-amber-100">
                                    Manual Payment Verification in Progress ({pendingRequests.length})
                                </h3>
                                <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
                                    Your manual payment proof has been submitted. Our admin team will verify the transaction and activate your plan shortly.
                                </p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                            {pendingRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                                            {req.plan?.name || 'Subscription Plan'}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                            <Clock className="w-3 h-3 animate-spin" /> Pending Review
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-neutral-600 dark:text-neutral-400">
                                        <div className="flex justify-between">
                                            <span>Method:</span>
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{req.method_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Amount:</span>
                                            <span className="font-bold text-emerald-600">
                                                {(req.amount_cents / 100).toFixed(2)} {req.currency_code} ({req.billing_cycle})
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Sender:</span>
                                            <span className="font-mono">{req.sender_number}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 p-1.5 rounded border border-neutral-200 dark:border-neutral-700">
                                            <span className="text-[10px] uppercase font-bold text-neutral-500">TrxID:</span>
                                            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 select-all">
                                                {req.transaction_id}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400">
                                        <span>Submitted: {req.created_at && formatInTz(req.created_at, userTz)}</span>
                                        {req.receipt_url && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedReceipt(req)}
                                                className="text-brand-600 dark:text-brand-400 hover:underline font-medium inline-flex items-center gap-1"
                                            >
                                                <FileText className="w-3 h-3" /> Proof
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Manual Payment Requests History (if any rejected or previous) */}
                {processedRequests.length > 0 && (
                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-brand-500" />
                                Manual Payment Proofs History
                            </h3>
                            <span className="text-xs text-neutral-500">{processedRequests.length} submissions</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                                <thead>
                                    <tr className="border-b border-neutral-200 dark:border-neutral-700 text-left text-[11px] uppercase font-semibold text-neutral-500 dark:text-neutral-400">
                                        <th className="py-2.5 px-3">Date</th>
                                        <th className="py-2.5 px-3">Plan</th>
                                        <th className="py-2.5 px-3">Method & Sender</th>
                                        <th className="py-2.5 px-3">Transaction ID</th>
                                        <th className="py-2.5 px-3">Amount</th>
                                        <th className="py-2.5 px-3">Status / Admin Note</th>
                                        <th className="py-2.5 px-3 text-right">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {processedRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                                            <td className="py-3 px-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                                                {req.created_at && formatInTz(req.created_at, userTz)}
                                            </td>
                                            <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                                                {req.plan?.name || 'Subscription'}
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="font-medium text-neutral-800 dark:text-neutral-200">{req.method_name}</div>
                                                <div className="text-[11px] font-mono text-neutral-500">{req.sender_number}</div>
                                            </td>
                                            <td className="py-3 px-3 font-mono font-bold text-neutral-800 dark:text-neutral-200">
                                                {req.transaction_id}
                                            </td>
                                            <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                                                {(req.amount_cents / 100).toFixed(2)} {req.currency_code}
                                            </td>
                                            <td className="py-3 px-3">
                                                {req.status === 'approved' && (
                                                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                        <CheckCircle2 className="w-3 h-3" /> Approved
                                                    </span>
                                                )}
                                                {req.status === 'rejected' && (
                                                    <div>
                                                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                                                            <XCircle className="w-3 h-3" /> Rejected
                                                        </span>
                                                        {req.admin_notes && (
                                                            <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 italic">
                                                                "{req.admin_notes}"
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                {req.receipt_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedReceipt(req)}
                                                        className="inline-flex items-center gap-1 text-brand-600 hover:underline font-medium"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" /> View
                                                    </button>
                                                ) : (
                                                    <span className="text-neutral-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Paid Transactions & Invoices Table */}
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                                {t('subscription.billing_history') || 'Paid Invoices & Transaction History'}
                            </h3>
                            <p className="text-xs text-neutral-500">Official billing records and downloadable PDF tax invoices.</p>
                        </div>
                    </div>

                    {transactions.data?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700 text-sm">
                                <thead className="bg-neutral-50 dark:bg-neutral-800">
                                    <tr>
                                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                                            {t('client.date') || 'Date'}
                                        </th>
                                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                                            Payment Method
                                        </th>
                                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                                            {t('client.plan') || 'Plan'}
                                        </th>
                                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                                            {t('client.amount') || 'Amount'}
                                        </th>
                                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                                            {t('client.status') || 'Status'}
                                        </th>
                                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                                            {t('client.invoice') || 'Invoice'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {transactions.data.map((tx) => (
                                        <tr key={tx.id} className="bg-white dark:bg-neutral-800/30 hover:bg-neutral-50/50 transition">
                                            <td className="px-4 py-3.5 text-sm text-neutral-900 dark:text-white whitespace-nowrap">
                                                {formatDate(tx.created_at)}
                                            </td>
                                            <td className="px-4 py-3.5 text-sm">
                                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                                    {tx.method_name || (tx.gateway === 'manual' ? 'Manual Payment' : ucfirst(tx.gateway))}
                                                </span>
                                                {tx.transaction_id && (
                                                    <div className="text-xs font-mono text-neutral-500 flex items-center gap-1 mt-0.5">
                                                        <span>TrxID: {tx.transaction_id}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(tx.transaction_id, tx.id)}
                                                            className="text-neutral-400 hover:text-brand-600 transition"
                                                            title="Copy TrxID"
                                                        >
                                                            {copiedId === tx.id ? (
                                                                <Check className="w-3 h-3 text-emerald-500" />
                                                            ) : (
                                                                <Copy className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                                                {tx.plan?.name ?? '–'}
                                            </td>
                                            <td className="px-4 py-3.5 text-sm font-bold text-neutral-900 dark:text-white">
                                                {formatAmount(tx.amount_cents, tx.currency_code)}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                        tx.status === 'completed' || tx.status === 'succeeded' || tx.status === 'paid'
                                                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                                                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                                                    }`}
                                                >
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <a
                                                    href={route('client.subscription.invoice', tx.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition shadow-sm"
                                                >
                                                    <Download className="h-3.5 w-3.5 text-brand-600" />
                                                    PDF
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                            <Package className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
                            <p className="font-medium">{t('client.no_payments') || 'No paid invoices yet'}</p>
                            <p className="text-xs text-neutral-400 mt-1">Once your payment is approved, your official invoice will appear here.</p>
                            <Link
                                href={route('client.pricing')}
                                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                            >
                                {t('client.view_plans') || 'View plans'} <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    )}
                </div>

                {transactions.data?.length > 0 && transactions.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {transactions.prev_page_url && (
                            <Link
                                href={transactions.prev_page_url}
                                className="rounded-lg border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700"
                            >
                                {t('pagination.previous') || 'Previous'}
                            </Link>
                        )}
                        {transactions.next_page_url && (
                            <Link
                                href={transactions.next_page_url}
                                className="rounded-lg border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700"
                            >
                                {t('pagination.next') || 'Next'}
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                            <div>
                                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-brand-500" />
                                    Attached Payment Proof
                                </h3>
                                <p className="text-xs text-neutral-500">Method: {selectedReceipt.method_name} · TrxID: {selectedReceipt.transaction_id}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedReceipt(null)}
                                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 p-2 flex justify-center max-h-80">
                            {selectedReceipt.receipt_url?.toLowerCase().endsWith('.pdf') ? (
                                <div className="py-8 text-center">
                                    <FileText className="w-12 h-12 mx-auto text-red-500 mb-2" />
                                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">PDF Document</p>
                                    <a
                                        href={selectedReceipt.receipt_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-block mt-2 text-xs font-semibold text-brand-600 underline"
                                    >
                                        Click to view PDF in new tab
                                    </a>
                                </div>
                            ) : (
                                <img
                                    src={selectedReceipt.receipt_url}
                                    alt="Payment Receipt"
                                    className="object-contain max-h-72 rounded-lg"
                                />
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                            <a
                                href={selectedReceipt.receipt_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Open original file
                            </a>
                            <button
                                type="button"
                                onClick={() => setSelectedReceipt(null)}
                                className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
}

function ucfirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
