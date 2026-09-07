import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button, Card, Modal, Pagination } from '@/Components/ui';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { formatInTz } from '@/Utils/datetime';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Eye,
    Check,
    X,
    Copy,
    ArrowLeft,
    FileText,
    ExternalLink,
    Wallet,
    ShieldCheck,
    AlertCircle,
    Filter
} from 'lucide-react';

export default function ManualRequests({ requests, counts = {}, filters = {} }) {
    const { t } = useTranslation();
    const adminTz = usePage().props.timezone || 'Asia/Dhaka';
    const flash = usePage().props.flash || {};

    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejecting, reset: resetReject } = useForm({
        admin_notes: 'Payment verification could not be confirmed. Invalid transaction ID or receipt.',
    });

    const { data: approveData, setData: setApproveData, post: postApprove, processing: approving, reset: resetApprove } = useForm({
        admin_notes: '',
    });

    const handleFilterChange = (status) => {
        setStatusFilter(status);
        router.get(route('admin.payments.manual-requests.index'), {
            status,
            search: searchTerm,
        }, { preserveState: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('admin.payments.manual-requests.index'), {
            status: statusFilter,
            search: searchTerm,
        }, { preserveState: true });
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const openApproveModal = (req) => {
        setSelectedRequest(req);
        setApproveData('admin_notes', 'Verified and approved.');
        setApproveModalOpen(true);
    };

    const openRejectModal = (req) => {
        setSelectedRequest(req);
        setRejectModalOpen(true);
    };

    const openReceiptModal = (req) => {
        setSelectedRequest(req);
        setReceiptModalOpen(true);
    };

    const submitApprove = (e) => {
        e.preventDefault();
        if (!selectedRequest) return;
        postApprove(route('admin.payments.manual-requests.approve', selectedRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setApproveModalOpen(false);
                setSelectedRequest(null);
                resetApprove();
            },
        });
    };

    const submitReject = (e) => {
        e.preventDefault();
        if (!selectedRequest) return;
        postReject(route('admin.payments.manual-requests.reject', selectedRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setRejectModalOpen(false);
                setSelectedRequest(null);
                resetReject();
            },
        });
    };

    return (
        <AdminLayout title="Manual Payment Requests">
            <Head title="Manual Payment Requests · Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.payments.index')}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                <Clock className="w-6 h-6 text-brand-500" />
                                Manual Payment Proofs & Verification
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Review submitted transaction IDs / receipts from bKash, Nagad, Islami Bank, Binance, etc. and activate subscriptions.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.payment-gateways.manual.methods')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition shadow-sm"
                        >
                            <Wallet className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                            Manage Payment Methods
                        </Link>
                    </div>
                </div>

                {/* Flash message */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Counts / Metric summary tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                        type="button"
                        onClick={() => handleFilterChange('pending')}
                        className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                            statusFilter === 'pending'
                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/30'
                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                        }`}
                    >
                        <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                            <span>Pending Review</span>
                            <Clock className="w-4 h-4 animate-pulse" />
                        </div>
                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
                            {counts.pending || 0}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleFilterChange('approved')}
                        className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                            statusFilter === 'approved'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-400/30'
                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                        }`}
                    >
                        <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <span>Approved</span>
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
                            {counts.approved || 0}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleFilterChange('rejected')}
                        className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                            statusFilter === 'rejected'
                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 ring-2 ring-rose-400/30'
                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                        }`}
                    >
                        <div className="flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
                            <span>Rejected</span>
                            <XCircle className="w-4 h-4" />
                        </div>
                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
                            {counts.rejected || 0}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleFilterChange('all')}
                        className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                            statusFilter === 'all'
                                ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 ring-2 ring-brand-400/30'
                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                        }`}
                    >
                        <div className="flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                            <span>All Requests</span>
                            <Filter className="w-4 h-4" />
                        </div>
                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
                            {counts.all || 0}
                        </span>
                    </button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search by customer name, email, TrxID, or sender number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                    </div>
                    <Button type="submit" variant="outline" size="sm">
                        Filter
                    </Button>
                </form>

                {/* Table Card */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-700 text-left text-xs uppercase font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider">
                                    <th className="py-3.5 px-4">User / Customer</th>
                                    <th className="py-3.5 px-4">Plan & Amount</th>
                                    <th className="py-3.5 px-4">Method & Sender</th>
                                    <th className="py-3.5 px-4">Transaction ID / Trx</th>
                                    <th className="py-3.5 px-4">Receipt Proof</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Submitted At</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                                {requests.data?.map((req) => (
                                    <tr key={req.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition">
                                        {/* User */}
                                        <td className="py-3.5 px-4">
                                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                {req.user?.name || 'Unknown User'}
                                            </div>
                                            <div className="text-xs text-neutral-500 font-mono">
                                                {req.user?.email || '—'}
                                            </div>
                                        </td>

                                        {/* Plan & Amount */}
                                        <td className="py-3.5 px-4">
                                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                {req.plan?.name || 'Subscription Plan'}
                                            </div>
                                            <div className="text-xs text-neutral-500">
                                                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                                    {(req.amount_cents / 100).toFixed(2)} {req.currency_code}
                                                </span>{' '}
                                                / {req.billing_cycle === 'year' ? 'Yearly' : 'Monthly'}
                                            </div>
                                        </td>

                                        {/* Method & Sender */}
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                                                {req.method_name}
                                            </span>
                                            <div className="text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 mt-1">
                                                From: {req.sender_number}
                                            </div>
                                        </td>

                                        {/* TrxID */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 bg-neutral-100/70 dark:bg-neutral-800/70 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 w-fit select-all">
                                                <span>{req.transaction_id}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(req.transaction_id, req.id)}
                                                    className="text-neutral-400 hover:text-brand-600 transition"
                                                    title="Copy TrxID"
                                                >
                                                    {copiedId === req.id ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                            {req.customer_notes && (
                                                <p className="text-xs text-neutral-500 italic mt-1 line-clamp-1" title={req.customer_notes}>
                                                    "{req.customer_notes}"
                                                </p>
                                            )}
                                        </td>

                                        {/* Receipt */}
                                        <td className="py-3.5 px-4">
                                            {req.receipt_path ? (
                                                <button
                                                    type="button"
                                                    onClick={() => openReceiptModal(req)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900 transition"
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                    <span>View Proof</span>
                                                </button>
                                            ) : (
                                                <span className="text-xs text-neutral-400">No file</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="py-3.5 px-4">
                                            {req.status === 'pending' && (
                                                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                    <Clock className="w-3 h-3 animate-pulse" /> Pending
                                                </span>
                                            )}
                                            {req.status === 'approved' && (
                                                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                    <CheckCircle2 className="w-3 h-3" /> Approved
                                                </span>
                                            )}
                                            {req.status === 'rejected' && (
                                                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                                    <XCircle className="w-3 h-3" /> Rejected
                                                </span>
                                            )}
                                        </td>

                                        {/* Date */}
                                        <td className="py-3.5 px-4 text-xs text-neutral-500 dark:text-neutral-400">
                                            {req.created_at && formatInTz(req.created_at, adminTz)}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-4 text-right">
                                            {req.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        type="button"
                                                        variant="primary"
                                                        size="xs"
                                                        onClick={() => openApproveModal(req)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1"
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Approve
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        size="xs"
                                                        onClick={() => openRejectModal(req)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <X className="w-3.5 h-3.5" /> Reject
                                                    </Button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => openReceiptModal(req)}
                                                    className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline"
                                                >
                                                    Details
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {requests.data?.length === 0 && (
                        <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                            <Clock className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
                            <p className="font-medium text-neutral-700 dark:text-neutral-300">No payment requests found</p>
                            <p className="text-xs text-neutral-500 mt-0.5">When customers submit manual payment details, they will appear here for verification.</p>
                        </div>
                    )}

                    <Pagination data={requests} />
                </Card>

                {/* Approve Modal */}
                {approveModalOpen && (
                    <Modal show={approveModalOpen} onClose={() => setApproveModalOpen(false)} maxWidth="md">
                        <form onSubmit={submitApprove} className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-emerald-600">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                        Approve Payment & Activate Plan
                                    </h3>
                                    <p className="text-xs text-neutral-500">
                                        Customer: {selectedRequest?.user?.name} ({selectedRequest?.user?.email})
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Plan to Activate:</span>
                                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{selectedRequest?.plan?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Billing Cycle:</span>
                                    <span className="capitalize font-medium">{selectedRequest?.billing_cycle}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Amount Paid:</span>
                                    <span className="font-bold text-emerald-600">
                                        {(selectedRequest?.amount_cents / 100).toFixed(2)} {selectedRequest?.currency_code}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Payment Method:</span>
                                    <span className="font-semibold">{selectedRequest?.method_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Transaction ID:</span>
                                    <span className="font-mono font-bold select-all">{selectedRequest?.transaction_id}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                    Admin Note (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={approveData.admin_notes}
                                    onChange={(e) => setApproveData('admin_notes', e.target.value)}
                                    placeholder="e.g. Transaction verified on bKash merchant app"
                                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                                <Button type="button" variant="outline" size="sm" onClick={() => setApproveModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" disabled={approving} className="bg-emerald-600 hover:bg-emerald-700">
                                    {approving ? 'Activating...' : 'Confirm & Activate Plan'}
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Reject Modal */}
                {rejectModalOpen && (
                    <Modal show={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="md">
                        <form onSubmit={submitReject} className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
                                    <XCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                        Reject Payment Request
                                    </h3>
                                    <p className="text-xs text-neutral-500">
                                        Customer: {selectedRequest?.user?.name}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={rejectData.admin_notes}
                                    onChange={(e) => setRejectData('admin_notes', e.target.value)}
                                    required
                                    placeholder="Explain why the payment proof was rejected (e.g. TrxID not found, wrong amount, etc.)"
                                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                                <Button type="button" variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="danger" size="sm" disabled={rejecting}>
                                    {rejecting ? 'Rejecting...' : 'Reject Request'}
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Receipt & Details Modal */}
                {receiptModalOpen && selectedRequest && (
                    <Modal show={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} maxWidth="lg">
                        <div className="p-6 space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-brand-500" />
                                        Payment Verification Details
                                    </h3>
                                    <p className="text-xs text-neutral-500">Request ID #{selectedRequest.id}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setReceiptModalOpen(false)}
                                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                                    <div className="text-xs font-semibold uppercase text-neutral-500">Customer Info</div>
                                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{selectedRequest.user?.name}</div>
                                    <div className="text-xs text-neutral-500">{selectedRequest.user?.email}</div>
                                </div>

                                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                                    <div className="text-xs font-semibold uppercase text-neutral-500">Plan & Amount</div>
                                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{selectedRequest.plan?.name}</div>
                                    <div className="text-xs text-emerald-600 font-bold">
                                        {(selectedRequest.amount_cents / 100).toFixed(2)} {selectedRequest.currency_code} ({selectedRequest.billing_cycle})
                                    </div>
                                </div>

                                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5 sm:col-span-2">
                                    <div className="text-xs font-semibold uppercase text-neutral-500">Transaction Details</div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>Method: <strong>{selectedRequest.method_name}</strong></div>
                                        <div>Sender Number: <strong className="font-mono">{selectedRequest.sender_number}</strong></div>
                                    </div>
                                    <div className="text-xs font-mono font-bold bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 select-all">
                                        TrxID: {selectedRequest.transaction_id}
                                    </div>
                                    {selectedRequest.customer_notes && (
                                        <div className="text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                                            <strong>Customer Note:</strong> {selectedRequest.customer_notes}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Receipt Image / PDF */}
                            {(selectedRequest.receipt_url || selectedRequest.receipt_path) ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold uppercase text-neutral-500">
                                        <span>Attached Receipt / Screenshot</span>
                                        <a
                                            href={selectedRequest.receipt_url || selectedRequest.receipt_path}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-brand-600 hover:underline font-semibold"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" /> Open / Download File
                                        </a>
                                    </div>
                                    <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 p-2 flex justify-center max-h-96">
                                        {selectedRequest.receipt_path?.toLowerCase().endsWith('.pdf') ? (
                                            <div className="py-8 text-center">
                                                <FileText className="w-12 h-12 mx-auto text-red-500 mb-2" />
                                                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">PDF Document Attached</p>
                                                <a
                                                    href={selectedRequest.receipt_url || selectedRequest.receipt_path}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-block mt-2 text-xs font-semibold text-brand-600 underline"
                                                >
                                                    Click to view PDF in new tab
                                                </a>
                                            </div>
                                        ) : (
                                            <img
                                                src={selectedRequest.receipt_url || selectedRequest.receipt_path}
                                                alt="Receipt Proof"
                                                className="object-contain max-h-80 rounded-lg"
                                            />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-400 italic">No receipt image attached.</p>
                            )}

                            {selectedRequest.admin_notes && (
                                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300">
                                    <strong>Admin Notes:</strong> {selectedRequest.admin_notes}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                <span className="text-xs text-neutral-400">
                                    Status: <strong className="uppercase">{selectedRequest.status}</strong>
                                </span>
                                <div className="flex gap-2">
                                    {selectedRequest.status === 'pending' && (
                                        <>
                                            <Button
                                                type="button"
                                                variant="danger"
                                                size="sm"
                                                onClick={() => {
                                                    setReceiptModalOpen(false);
                                                    openRejectModal(selectedRequest);
                                                }}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="primary"
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                                onClick={() => {
                                                    setReceiptModalOpen(false);
                                                    openApproveModal(selectedRequest);
                                                }}
                                            >
                                                Approve Plan
                                            </Button>
                                        </>
                                    )}
                                    <Button type="button" variant="outline" size="sm" onClick={() => setReceiptModalOpen(false)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </AdminLayout>
    );
}
