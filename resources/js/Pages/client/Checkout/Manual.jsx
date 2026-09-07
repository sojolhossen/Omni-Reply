import { useState } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Button, Card } from '@/Components/ui';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Check,
    Copy,
    CreditCard,
    Smartphone,
    Building2,
    Wallet,
    QrCode,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    UploadCloud,
    Clock,
    HelpCircle,
    Sparkles
} from 'lucide-react';

export default function ManualCheckout({
    plan = {},
    billing_cycle = 'month',
    methods = [],
    pending_requests = [],
    pricing_url = '/app/pricing',
    billing_url = '/app/billing',
}) {
    const { t } = useTranslation();
    const [selectedMethodId, setSelectedMethodId] = useState(methods[0]?.id || null);
    const [copiedNumber, setCopiedNumber] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const selectedMethod = methods.find((m) => m.id === selectedMethodId) || methods[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        plan_id: plan.id,
        billing_cycle: billing_cycle,
        manual_payment_method_id: selectedMethod?.id || '',
        sender_number: '',
        transaction_id: '',
        receipt: null,
        customer_notes: '',
    });

    const handleMethodSelect = (method) => {
        setSelectedMethodId(method.id);
        setData('manual_payment_method_id', method.id);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedNumber(true);
        setTimeout(() => setCopiedNumber(false), 2500);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('receipt', file);
        if (file && file.type.startsWith('image/')) {
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setPreviewImage(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('client.checkout.manual.submit'), {
            preserveScroll: true,
        });
    };

    const getMethodIcon = (slug = '', name = '') => {
        const key = (slug + ' ' + name).toLowerCase();
        if (key.includes('bank') || key.includes('islami')) return <Building2 className="w-5 h-5 text-emerald-500" />;
        if (key.includes('binance') || key.includes('crypto') || key.includes('usdt')) return <Wallet className="w-5 h-5 text-amber-500" />;
        if (key.includes('bkash')) return <Smartphone className="w-5 h-5 text-pink-500" />;
        if (key.includes('nagad')) return <Smartphone className="w-5 h-5 text-orange-500" />;
        if (key.includes('rocket')) return <Smartphone className="w-5 h-5 text-purple-500" />;
        if (key.includes('cellfin')) return <Smartphone className="w-5 h-5 text-cyan-500" />;
        if (key.includes('redoypay')) return <Smartphone className="w-5 h-5 text-rose-500" />;
        return <CreditCard className="w-5 h-5 text-brand-500" />;
    };

    return (
        <ClientLayout title="Manual / Local Payment Checkout">
            <Head title={`Checkout · ${plan.name}`} />

            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                {/* Back Link */}
                <div className="flex items-center justify-between">
                    <Link
                        href={pricing_url}
                        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Pricing Plans</span>
                    </Link>
                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Secure Manual Verification
                    </span>
                </div>

                {/* Pending requests notice */}
                {pending_requests.length > 0 && (
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-4 text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3">
                        <Clock className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5 animate-pulse" />
                        <div>
                            <p className="font-semibold">You have {pending_requests.length} pending payment verification in progress.</p>
                            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                                Our admin team is verifying your previous submission (TrxID: {pending_requests[0].transaction_id}). You will be notified as soon as it is approved.
                            </p>
                        </div>
                    </div>
                )}

                {/* Plan Summary Bar */}
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <span className="text-xs uppercase font-bold tracking-wider text-brand-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Selected Plan
                        </span>
                        <h2 className="text-2xl font-black mt-1">{plan.name}</h2>
                        <p className="text-xs text-neutral-300 mt-0.5">
                            Billing Cycle: <span className="capitalize font-semibold text-white">{billing_cycle}ly</span>
                        </p>
                    </div>

                    <div className="text-right">
                        <span className="text-xs text-neutral-400 block">Total Amount to Pay</span>
                        <div className="text-3xl font-extrabold text-white">
                            {plan.price_display}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-12 gap-6">
                    {/* Left Column: Method Selector & Details */}
                    <div className="md:col-span-7 space-y-5">
                        {/* Step 1: Choose Payment Method */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                                Select Payment Method
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {methods.map((method) => {
                                    const isSelected = selectedMethod?.id === method.id;
                                    return (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => handleMethodSelect(method)}
                                            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                                                isSelected
                                                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/30 shadow-sm'
                                                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                {getMethodIcon(method.slug, method.name)}
                                                {isSelected && (
                                                    <span className="w-2 h-2 rounded-full bg-brand-600" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100 line-clamp-1">
                                                    {method.name}
                                                </div>
                                                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                                    {method.account_type || 'Manual'}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2: Payment Instructions & Account Info */}
                        {selectedMethod && (
                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-4 shadow-sm">
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                            {getMethodIcon(selectedMethod.slug, selectedMethod.name)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                                                {selectedMethod.name}
                                            </h4>
                                            <span className="text-xs text-neutral-500">
                                                Type: {selectedMethod.account_type}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        Active
                                    </span>
                                </div>

                                {/* Account Number Box with Copy */}
                                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 space-y-2">
                                    <div className="text-xs text-neutral-500">Send money / deposit to this number / account:</div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-mono text-base sm:text-lg font-bold text-neutral-900 dark:text-white select-all">
                                            {selectedMethod.account_number}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(selectedMethod.account_number)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
                                        >
                                            {copiedNumber ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" /> Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" /> Copy
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {selectedMethod.account_name && (
                                        <div className="text-xs text-neutral-600 dark:text-neutral-400 pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60 flex justify-between">
                                            <span>Account Name:</span>
                                            <strong className="text-neutral-800 dark:text-neutral-200">{selectedMethod.account_name}</strong>
                                        </div>
                                    )}

                                    {selectedMethod.branch_name && (
                                        <div className="text-xs text-neutral-600 dark:text-neutral-400 flex justify-between">
                                            <span>Branch:</span>
                                            <strong className="text-neutral-800 dark:text-neutral-200">{selectedMethod.branch_name}</strong>
                                        </div>
                                    )}

                                    {selectedMethod.routing_number && (
                                        <div className="text-xs text-neutral-600 dark:text-neutral-400 flex justify-between">
                                            <span>Routing Number:</span>
                                            <strong className="font-mono text-neutral-800 dark:text-neutral-200">{selectedMethod.routing_number}</strong>
                                        </div>
                                    )}
                                </div>

                                {/* Custom Instructions */}
                                {selectedMethod.instruction ? (
                                    <div className="text-xs text-neutral-600 dark:text-neutral-400 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-1">
                                        <span className="font-semibold text-blue-900 dark:text-blue-300 block">Instructions:</span>
                                        <p className="whitespace-pre-line leading-relaxed">{selectedMethod.instruction}</p>
                                    </div>
                                ) : (
                                    <div className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-xl">
                                        <p>1. Send the exact amount (<strong>{plan.price_display}</strong>) to the account number above.</p>
                                        <p>2. Copy the Transaction ID (TrxID) or Hash received.</p>
                                        <p>3. Fill out the form on the right and submit your proof.</p>
                                    </div>
                                )}

                                {/* QR Code preview if attached */}
                                {selectedMethod.qr_code_url && (
                                    <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-4">
                                        <div className="text-xs">
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">Scan QR Code</span>
                                            <span className="text-neutral-500">Scan from your mobile banking app</span>
                                        </div>
                                        <img
                                            src={selectedMethod.qr_code_url}
                                            alt="QR Code"
                                            className="w-16 h-16 rounded-lg object-contain bg-white p-1 border"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Submission Form */}
                    <div className="md:col-span-5">
                        <div className="sticky top-6">
                            <form
                                onSubmit={handleSubmit}
                                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-4 shadow-sm"
                            >
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                                    Submit Payment Proof
                                </h3>

                                {/* Sender Number / Account / Binance UID */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                                        Your Sender Number / Account <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 01712345678 or Binance UID"
                                        value={data.sender_number}
                                        onChange={(e) => setData('sender_number', e.target.value)}
                                        required
                                        className="w-full font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                    />
                                    {errors.sender_number && (
                                        <p className="text-xs text-red-600 mt-1">{errors.sender_number}</p>
                                    )}
                                </div>

                                {/* Transaction ID / TrxID */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                                        Transaction ID / TrxID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 9K28DF10XZ or TxHash"
                                        value={data.transaction_id}
                                        onChange={(e) => setData('transaction_id', e.target.value)}
                                        required
                                        className="w-full font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                    />
                                    {errors.transaction_id && (
                                        <p className="text-xs text-red-600 mt-1">{errors.transaction_id}</p>
                                    )}
                                </div>

                                {/* Receipt / Screenshot */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                                        Receipt / Screenshot (Recommended)
                                    </label>
                                    <div className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-center hover:border-brand-500 transition bg-neutral-50 dark:bg-neutral-800/50">
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <UploadCloud className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                                            {data.receipt ? data.receipt.name : 'Click to upload screenshot / receipt'}
                                        </span>
                                        <span className="text-[10px] text-neutral-400">PNG, JPG, WEBP, PDF up to 5MB</span>
                                    </div>
                                    {previewImage && (
                                        <div className="mt-2 rounded-lg overflow-hidden border max-h-32 flex justify-center bg-neutral-100">
                                            <img src={previewImage} alt="Preview" className="object-contain h-32" />
                                        </div>
                                    )}
                                </div>

                                {/* Customer Notes */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Any additional details or reference..."
                                        value={data.customer_notes}
                                        onChange={(e) => setData('customer_notes', e.target.value)}
                                        className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={processing}
                                    className="w-full justify-center shadow-lg shadow-brand-500/20 font-bold"
                                >
                                    {processing ? 'Submitting Proof...' : 'Submit Payment Proof'}
                                </Button>

                                <p className="text-[11px] text-neutral-500 text-center">
                                    Our team will verify your transaction and activate your plan typically within 5-30 minutes.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
