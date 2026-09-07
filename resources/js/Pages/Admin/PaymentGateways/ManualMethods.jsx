import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button, Card, Modal, Toggle } from '@/Components/ui';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    Plus,
    Pencil,
    Trash2,
    Check,
    Copy,
    ArrowLeft,
    QrCode,
    CreditCard,
    Wallet,
    Building2,
    Smartphone,
    Globe,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText
} from 'lucide-react';

export default function ManualMethods({ methods = [], flash = {} }) {
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [methodToDelete, setMethodToDelete] = useState(null);

    const openAddModal = () => {
        setEditingMethod(null);
        setModalOpen(true);
    };

    const openEditModal = (method) => {
        setEditingMethod(method);
        setModalOpen(true);
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleToggle = (method) => {
        router.post(route('admin.payment-gateways.manual.methods.toggle', method.id), {}, {
            preserveScroll: true,
        });
    };

    const confirmDelete = (method) => {
        setMethodToDelete(method);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!methodToDelete) return;
        router.delete(route('admin.payment-gateways.manual.methods.destroy', methodToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setMethodToDelete(null);
            },
        });
    };

    const getMethodIcon = (slug = '', name = '') => {
        const key = (slug + ' ' + name).toLowerCase();
        if (key.includes('bank') || key.includes('islami')) return <Building2 className="w-5 h-5 text-emerald-500" />;
        if (key.includes('binance') || key.includes('crypto') || key.includes('usdt')) return <Wallet className="w-5 h-5 text-amber-500" />;
        if (key.includes('bkash')) return <Smartphone className="w-5 h-5 text-pink-500" />;
        if (key.includes('nagad')) return <Smartphone className="w-5 h-5 text-orange-500" />;
        if (key.includes('rocket')) return <Smartphone className="w-5 h-5 text-purple-500" />;
        if (key.includes('cellfin')) return <Smartphone className="w-5 h-5 text-blue-500" />;
        if (key.includes('redoypay')) return <Smartphone className="w-5 h-5 text-rose-500" />;
        return <CreditCard className="w-5 h-5 text-brand-500" />;
    };

    const getMethodBadgeClass = (slug = '', name = '') => {
        const key = (slug + ' ' + name).toLowerCase();
        if (key.includes('bkash')) return 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800';
        if (key.includes('nagad')) return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800';
        if (key.includes('rocket')) return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800';
        if (key.includes('cellfin')) return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800';
        if (key.includes('redoypay')) return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800';
        if (key.includes('islami') || key.includes('bank')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800';
        if (key.includes('binance')) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800';
        return 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/30 dark:text-brand-400 dark:border-brand-800';
    };

    return (
        <AdminLayout title={t('admin.manual_payment_methods', 'Manual Payment Methods')}>
            <Head title={`${t('admin.manual_payment_methods', 'Manual Payment Methods')} · Admin`} />

            <div className="space-y-6">
                {/* Header with Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.payment-gateways.index')}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                <Wallet className="w-6 h-6 text-brand-500" />
                                {t('admin.manual_payment_methods', 'Manual Payment Methods')}
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {t('admin.manual_payment_desc', 'Configure local & offline payment accounts (bKash, Nagad, Rocket, Bank Transfer, Binance, Cellfin, etc.)')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.payments.manual-requests.index')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition"
                        >
                            <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                            {t('admin.pending_manual_requests', 'Review Payment Proofs')}
                        </Link>
                        <Button type="button" variant="primary" size="sm" onClick={openAddModal} className="flex items-center gap-1.5 shadow-sm">
                            <Plus className="w-4 h-4" />
                            {t('admin.add_payment_method', 'Add Payment Method')}
                        </Button>
                    </div>
                </div>

                {/* Flash message */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Methods Grid */}
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {methods.map((m) => (
                        <div
                            key={m.id}
                            className={`flex flex-col justify-between rounded-2xl border transition-all duration-200 bg-white dark:bg-neutral-900 p-5 ${
                                m.enabled
                                    ? 'border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md'
                                    : 'border-neutral-200 dark:border-neutral-800 opacity-65 bg-neutral-50/50 dark:bg-neutral-900/50'
                            }`}
                        >
                            <div className="space-y-4">
                                {/* Top bar with Icon, Name, and Status Toggle */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                            {getMethodIcon(m.slug, m.name)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                                {m.name}
                                            </h3>
                                            <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-md border ${getMethodBadgeClass(m.slug, m.name)}`}>
                                                {m.account_type || 'Account'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(m)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                m.enabled ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'
                                            }`}
                                            title={m.enabled ? 'Click to Disable' : 'Click to Enable'}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                    m.enabled ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Account Details Box */}
                                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-2 text-sm">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                            {t('admin.account_number', 'Account / Number')}:
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 select-all">
                                                {m.account_number}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(m.account_number, m.id)}
                                                className="p-1 rounded text-neutral-400 hover:text-brand-600 transition"
                                                title="Copy"
                                            >
                                                {copiedId === m.id ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {m.account_name && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-neutral-500 dark:text-neutral-400">{t('admin.account_name', 'Account Name')}:</span>
                                            <span className="font-medium text-neutral-800 dark:text-neutral-200">{m.account_name}</span>
                                        </div>
                                    )}

                                    {m.branch_name && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-neutral-500 dark:text-neutral-400">{t('admin.branch', 'Branch')}:</span>
                                            <span className="font-medium text-neutral-800 dark:text-neutral-200">{m.branch_name}</span>
                                        </div>
                                    )}

                                    {m.routing_number && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-neutral-500 dark:text-neutral-400">{t('admin.routing', 'Routing')}:</span>
                                            <span className="font-mono text-neutral-800 dark:text-neutral-200">{m.routing_number}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Instruction snippet */}
                                {m.instruction && (
                                    <div className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 bg-neutral-50/50 dark:bg-neutral-800/30 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">Guide: </span>
                                        {m.instruction}
                                    </div>
                                )}

                                {/* QR Code preview if exists */}
                                {m.qr_code_url && (
                                    <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30 p-2 rounded-lg border border-brand-100 dark:border-brand-900">
                                        <QrCode className="w-4 h-4 shrink-0" />
                                        <span>QR Code Attached</span>
                                    </div>
                                )}
                            </div>

                            {/* Card Footer Actions */}
                            <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                <span className="text-xs text-neutral-400">Order: {m.sort_order}</span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(m)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                                    >
                                        <Pencil className="w-3.5 h-3.5 text-neutral-500" />
                                        {t('common.edit', 'Edit')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => confirmDelete(m)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        {t('common.delete', 'Delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {methods.length === 0 && (
                        <div className="col-span-full py-12 text-center rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 p-6">
                            <Wallet className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
                            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">No Manual Payment Methods Configured</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                                Add your first payment method (such as bKash, Nagad, Islami Bank, Binance Pay, etc.) to start accepting manual payments.
                            </p>
                            <Button type="button" variant="primary" size="sm" onClick={openAddModal} className="mt-4">
                                <Plus className="w-4 h-4 mr-1" /> Add Payment Method
                            </Button>
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                <MethodFormModal
                    show={modalOpen}
                    method={editingMethod}
                    onClose={() => setModalOpen(false)}
                />

                {/* Delete Confirmation Modal */}
                {deleteModalOpen && (
                    <Modal show={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="sm">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                    Delete Payment Method
                                </h3>
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                Are you sure you want to delete <strong>{methodToDelete?.name}</strong>? Customers will no longer be able to select this payment method.
                            </p>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="button" variant="danger" size="sm" onClick={handleDelete}>
                                    Delete Method
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </AdminLayout>
    );
}

function MethodFormModal({ show, method, onClose }) {
    const isEdit = !!method;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        account_type: 'Personal',
        account_number: '',
        account_name: '',
        branch_name: '',
        routing_number: '',
        instruction: '',
        qr_code: null,
        qr_code_url: '',
        enabled: true,
        sort_order: 0,
        _method: isEdit ? 'PUT' : 'POST',
    });

    // Populate data when editing
    useState(() => {
        if (method) {
            setData({
                name: method.name || '',
                slug: method.slug || '',
                account_type: method.account_type || 'Personal',
                account_number: method.account_number || '',
                account_name: method.account_name || '',
                branch_name: method.branch_name || '',
                routing_number: method.routing_number || '',
                instruction: method.instruction || '',
                qr_code: null,
                qr_code_url: method.qr_code_url || '',
                enabled: method.enabled ?? true,
                sort_order: method.sort_order ?? 0,
                _method: 'PUT',
            });
        }
    }, [method]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isEdit
            ? route('admin.payment-gateways.manual.methods.update', method.id)
            : route('admin.payment-gateways.manual.methods.store');

        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-brand-500" />
                        {isEdit ? 'Edit Payment Method' : 'Add New Manual Payment Method'}
                    </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {/* Method Name */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                            Method Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. bKash Personal, Nagad Merchant, Islami Bank, Binance Pay"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    {/* Account Type */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                            Account Type
                        </label>
                        <select
                            value={data.account_type}
                            onChange={(e) => setData('account_type', e.target.value)}
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        >
                            <option value="Personal">Personal</option>
                            <option value="Merchant">Merchant</option>
                            <option value="Agent">Agent</option>
                            <option value="Bank Account">Bank Account</option>
                            <option value="Binance Pay UID">Binance Pay UID</option>
                            <option value="USDT (TRC20 / BEP20)">USDT (TRC20 / BEP20)</option>
                            <option value="Cellfin Account">Cellfin Account</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Account Number / Wallet ID */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                            Account Number / Wallet <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 01700000000 or Account No or Pay UID"
                            value={data.account_number}
                            onChange={(e) => setData('account_number', e.target.value)}
                            required
                            className="w-full font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                        {errors.account_number && <p className="text-xs text-red-600 mt-1">{errors.account_number}</p>}
                    </div>

                    {/* Account Name / Beneficiary */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                            Account / Beneficiary Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Omni AI Solutions or John Doe"
                            value={data.account_name}
                            onChange={(e) => setData('account_name', e.target.value)}
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                    </div>

                    {/* Branch Name */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                            Branch Name (If Bank)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Gulshan Branch, Dhaka"
                            value={data.branch_name}
                            onChange={(e) => setData('branch_name', e.target.value)}
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                    </div>

                    {/* Routing Number */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                            Routing Number / Swift Code
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 125272844"
                            value={data.routing_number}
                            onChange={(e) => setData('routing_number', e.target.value)}
                            className="w-full font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                            Display Order (Sort Order)
                        </label>
                        <input
                            type="number"
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                    </div>

                    {/* Instructions for Customer */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                            Instructions for Customer
                        </label>
                        <textarea
                            rows={3}
                            placeholder="e.g. Please send the exact amount using Send Money option. Put your email in the reference and submit the Transaction ID below."
                            value={data.instruction}
                            onChange={(e) => setData('instruction', e.target.value)}
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-sm text-neutral-900 dark:text-neutral-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                    </div>

                    {/* QR Code Upload */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                            QR Code Image (Optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('qr_code', e.target.files[0])}
                            className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-950 dark:file:text-brand-300"
                        />
                        {data.qr_code_url && !data.qr_code && (
                            <p className="text-xs text-neutral-500 mt-1">Current QR: <a href={data.qr_code_url} target="_blank" rel="noreferrer" className="text-brand-600 underline">View file</a></p>
                        )}
                    </div>

                    {/* Enabled toggle */}
                    <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="method_enabled"
                            checked={data.enabled}
                            onChange={(e) => setData('enabled', e.target.checked)}
                            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-neutral-300 dark:border-neutral-700"
                        />
                        <label htmlFor="method_enabled" className="text-sm font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer">
                            Enable this payment method for customers on checkout
                        </label>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={processing}>
                        {processing ? 'Saving...' : isEdit ? 'Update Method' : 'Create Method'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
