import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Download, FileText, ImageIcon, X, Loader2, ZoomIn, ZoomOut, Lock } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { loadRazorpay } from '../../lib/razorpay';
import { useScrollLock } from '../../hooks/useScrollLock';
import { HandwrittenWord } from '../HandwrittenWord';
import { CameraOverlay } from '../CameraOverlay';
import { getFontFamilyCss, getEffectiveFontSize, type WordToken } from '../../utils/humanErrorEngine';
import { computePagePhoneShadow } from '../../utils/cameraShadowEngine';
import type { LightingMode, PaperCrease, PageEffectOverrides, CorrectionColor } from '../../types';

interface DocumentLine {
    tokens: WordToken[];
    text: string;
    type: 'text' | 'bullet' | 'number' | 'empty' | 'comparison' | string;
    indent: number;
    charIndex: number;
    dir?: 'ltr' | 'rtl';
    marginIndex?: string;
    leftTokens?: WordToken[];
    rightTokens?: WordToken[];
}

interface DocumentPage {
    lines: DocumentLine[];
    index: number;
}

interface PaperDefinition {
    id: string;
    name: string;
    css: string;
    lineHeight: number;
    hasRedMargin: boolean;
    style: React.CSSProperties;
}

const paymentIntentStorageKey = 'text2handwriting_payment_intent';
const paymentRecoveryStorageKey = 'text2handwriting_payment_recovery_v1';
const paymentRecoveryMaxAgeMs = 24 * 60 * 60 * 1000;
const automaticVerificationDelaysMs = [0, 1500, 4000] as const;
const checkoutRequestTimeoutMs = 12_000;

function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error(message)), checkoutRequestTimeoutMs)),
    ]);
}

interface PendingPaymentIntent {
    purchaseId: string;
    pageCount: number;
}

interface PaymentRecovery {
    userId: string;
    purchaseId: string;
    pageCount: number;
    fileName: string;
    format: 'pdf' | 'zip';
    createdAt: number;
    lastAttemptAt?: number;
    checkout: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    };
}

function readPaymentRecovery(userId: string, pageCount: number): PaymentRecovery | null {
    try {
        const value = JSON.parse(localStorage.getItem(paymentRecoveryStorageKey) || 'null') as PaymentRecovery | null;
        const valid = value?.userId === userId && value.pageCount === pageCount &&
            typeof value.purchaseId === 'string' && typeof value.createdAt === 'number' &&
            Date.now() - value.createdAt <= paymentRecoveryMaxAgeMs &&
            typeof value.checkout?.razorpay_order_id === 'string' &&
            typeof value.checkout?.razorpay_payment_id === 'string' &&
            typeof value.checkout?.razorpay_signature === 'string';
        if (valid) return value;
        if (value && (value.userId === userId || Date.now() - Number(value.createdAt) > paymentRecoveryMaxAgeMs)) {
            localStorage.removeItem(paymentRecoveryStorageKey);
        }
    } catch {
        // Recovery remains unavailable when browser storage is blocked/corrupt.
    }
    return null;
}

function writePaymentRecovery(value: PaymentRecovery | null) {
    try {
        if (value) localStorage.setItem(paymentRecoveryStorageKey, JSON.stringify(value));
        else localStorage.removeItem(paymentRecoveryStorageKey);
    } catch {
        // The immediate verification attempt still works without local storage.
    }
}

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (name: string, format: 'pdf' | 'zip') => void;
    format: 'pdf' | 'zip';
    onFormatChange?: (format: 'pdf' | 'zip') => void;
    progress: number;
    status: 'idle' | 'processing' | 'complete' | 'error';
    initialFileName: string;

    // Document Data for Multi-Page Scrollable Preview
    pages?: DocumentPage[];
    paper?: PaperDefinition;
    font?: string;
    fontSize?: number;
    color?: string;
    correctionColor?: CorrectionColor;
    baseline?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    showHeader?: boolean;
    headerText?: string;
    showPageNumbers?: boolean;
    jitter?: number;
    charJitter?: number;
    fatigue?: number;
    pressure?: number;
    smudge?: number;
    phoneShadow?: boolean;
    phoneShadowAngle?: number;
    phoneShadowIntensity?: number;
    phoneShadowVariation?: boolean;
    lightingMode?: LightingMode;
    lightingWarmth?: number;
    paperCrease?: PaperCrease;
    sensorNoise?: number;
    perspectiveWarp?: boolean;
    tiltX?: number;
    tiltY?: number;
    randomTilt?: boolean;
    smartMarginIndexing?: boolean;
    pageEffectOverrides?: Record<number, PageEffectOverrides>;
    lowInkFade?: boolean;
    lowInkStart?: number;
    lowInkIntensity?: number;
    showNotebookHeaderBox?: boolean;
    notebookDate?: string;
    spiralBinding?: boolean;
    inkBleedThrough?: boolean;
    inkBleedIntensity?: number;
    notebookBrand?: string;
    notebookDayCircle?: boolean;
    randomSeed?: number;
    wordCount?: number;
}

export default function ExportModal({ 
    isOpen, 
    onClose, 
    onStart, 
    format, 
    onFormatChange,
    progress, 
    status, 
    initialFileName,
    pages = [],
    paper = { id: 'college', name: 'College Ruled', css: 'bg-white', lineHeight: 32, hasRedMargin: true, style: {} },
    font = 'Handwriting 1',
    fontSize = 24,
    color = '#1e40af',
    correctionColor = 'match',
    baseline = 6,
    textAlign = 'left',
    marginTop = 50,
    marginBottom = 50,
    marginLeft = 90,
    marginRight = 50,
    showHeader = false,
    headerText = '',
    showPageNumbers = true,
    jitter = 1.0,
    charJitter = 0.5,
    fatigue = 0.3,
    pressure = 1.0,
    smudge = 0,
    lowInkFade = false,
    lowInkStart = 45,
    lowInkIntensity = 0.65,
    phoneShadow = false,
    phoneShadowAngle = 120,
    phoneShadowIntensity = 0.3,
    phoneShadowVariation = true,
    lightingMode = 'warm-lamp' as LightingMode,
    lightingWarmth = 0.25,
    paperCrease = 'none' as PaperCrease,
    sensorNoise = 0.05,
    perspectiveWarp = false,
    tiltX = 0,
    tiltY = 0,
    randomTilt = false,
    smartMarginIndexing = true,
    pageEffectOverrides = {},
    showNotebookHeaderBox = false,
    notebookDate = '',
    spiralBinding = false,
    inkBleedThrough = true,
    inkBleedIntensity = 0.12,
    notebookBrand = 'YOUVA',
    notebookDayCircle = true,
    randomSeed = 0,
    wordCount = 0,
}: ExportModalProps) {
    const [fileName, setFileName] = useState(initialFileName);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [checkoutStage, setCheckoutStage] = useState<'idle' | 'creating' | 'opening' | 'verifying'>('idle');
    const [pendingPaymentIntent, setPendingPaymentIntent] = useState<PendingPaymentIntent | null>(() => {
        try {
            const intent = JSON.parse(sessionStorage.getItem(paymentIntentStorageKey) || 'null');
            return typeof intent?.purchaseId === 'string' && intent?.pageCount === pages.length
                ? { purchaseId: intent.purchaseId, pageCount: intent.pageCount }
                : null;
        } catch {
            return null;
        }
    });
    const [paidPurchaseId, setPaidPurchaseId] = useState<string | null>(() => {
        try {
            const pending = JSON.parse(sessionStorage.getItem('text2handwriting_pending_export') || 'null');
            return pending?.pageCount === pages.length ? pending.purchaseId || null : null;
        } catch {
            return null;
        }
    });
    const [paidPurchaseVerified, setPaidPurchaseVerified] = useState(false);
    const [purchaseCheckError, setPurchaseCheckError] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [paymentRecovery, setPaymentRecovery] = useState<PaymentRecovery | null>(null);
    const [recoveryError, setRecoveryError] = useState(false);
    const recoveryRunRef = useRef<string | null>(null);
    const checkoutAttemptRef = useRef(0);
    const onStartRef = useRef(onStart);
    
    const totalPrice = 10 + (pages.length * 2);

    const handleExportPaymentAndStart = async () => {
        if (!isAuthenticated || !user) {
            // Preserve only the local UI intent, never document content, so the
            // user returns to the exact review step after secure sign-in.
            sessionStorage.setItem('text2handwriting_resume_export', JSON.stringify({ format }));
            onClose();
            navigate('/auth?redirect=%2Feditor');
            return;
        }

        const checkoutAttempt = ++checkoutAttemptRef.current;
        const isCurrentAttempt = () => checkoutAttempt === checkoutAttemptRef.current;
        try {
            setIsProcessingPayment(true);
            setCheckoutStage('creating');
            setCheckoutError(null);
            if (!supabase) throw new Error('Supabase is not configured.');

            // Keep one UUID for this checkout attempt. The order function uses it
            // as its idempotency/retry key, including after a Razorpay dismissal.
            const intent = pendingPaymentIntent?.pageCount === pages.length
                ? pendingPaymentIntent
                : { purchaseId: crypto.randomUUID(), pageCount: pages.length };
            if (intent !== pendingPaymentIntent) {
                setPendingPaymentIntent(intent);
                try {
                    sessionStorage.setItem(paymentIntentStorageKey, JSON.stringify(intent));
                } catch {
                    // In-memory retry remains available if browser storage is blocked.
                }
            }

            const { data: orderData, error: orderError } = await withTimeout(
                supabase.functions.invoke('create-razorpay-order', {
                    body: { pageCount: pages.length, purchaseId: intent.purchaseId },
                }),
                'Checkout took too long to start. Check your connection and try again.'
            );
            if (!isCurrentAttempt()) return;
            if (orderError || !orderData) throw new Error(orderError?.message || 'Failed to create order');

            setCheckoutStage('opening');
            const res = await withTimeout(loadRazorpay(), 'The payment window did not load. Disable ad blockers and try again.');
            if (!isCurrentAttempt()) return;
            if (!res) throw new Error('Razorpay SDK failed to load. Are you online?');

            if (!import.meta.env.VITE_RAZORPAY_KEY_ID) throw new Error('Checkout is not configured yet. Please contact support before trying again.');

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'text2handwriting.me Export',
                description: 'Export ' + pages.length + ' Pages',
                order_id: orderData.id,
                handler: async function (response: Record<string, string>) {
                    const recovery: PaymentRecovery = {
                        userId: user.id,
                        purchaseId: intent.purchaseId,
                        pageCount: pages.length,
                        fileName,
                        format: activeFormat,
                        createdAt: Date.now(),
                        checkout: {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        },
                    };
                    // Persist the signed checkout result before the network call. It contains no
                    // merchant/API secret and expires locally after 24 hours.
                    writePaymentRecovery(recovery);
                    setPaymentRecovery(recovery);
                    setRecoveryError(false);
                    setCheckoutStage('verifying');
                    setIsProcessingPayment(true);
                },
                prefill: { name: user.name, email: user.email },
                theme: { color: '#000000' },
                modal: { ondismiss: () => { setCheckoutStage('idle'); setIsProcessingPayment(false); } }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on('payment.failed', function (response: Record<string, Record<string, string>>) {
                alert('Payment failed: ' + response.error.description);
                // Razorpay reported a terminal failure, so a later checkout must
                // reserve a fresh order rather than revive this failed attempt.
                setPendingPaymentIntent(null);
                try {
                    sessionStorage.removeItem(paymentIntentStorageKey);
                } catch {
                    // Ignore storage restrictions.
                }
                setCheckoutStage('idle');
                setIsProcessingPayment(false);
            });
            paymentObject.open();
        } catch (err: unknown) {
            if (!isCurrentAttempt()) return;
            setCheckoutError(err instanceof Error ? err.message : 'Checkout could not start. Please try again.');
            setCheckoutStage('idle');
            setIsProcessingPayment(false);
        }
    };
    const cancelCheckout = () => {
        checkoutAttemptRef.current += 1;
        setCheckoutStage('idle');
        setIsProcessingPayment(false);
        setCheckoutError(null);
    };
    const [activeFormat, setActiveFormat] = useState<'pdf' | 'zip'>(format);
    const [previewScale, setPreviewScale] = useState(0.62);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useScrollLock(isOpen);

    useEffect(() => {
        onStartRef.current = onStart;
    }, [onStart]);

    useEffect(() => {
        if (!isOpen || !isAuthenticated || !user) return;
        const recovered = readPaymentRecovery(user.id, pages.length);
        setPaymentRecovery(recovered);
        if (!recovered) recoveryRunRef.current = null;
    }, [isOpen, isAuthenticated, user, pages.length]);

    useEffect(() => {
        if (!isOpen || !isAuthenticated || !user || !paymentRecovery || !supabase) return;
        const recoveryKey = `${paymentRecovery.checkout.razorpay_order_id}:${paymentRecovery.checkout.razorpay_payment_id}`;
        if (recoveryRunRef.current === recoveryKey) return;
        recoveryRunRef.current = recoveryKey;
        const client = supabase;
        let cancelled = false;

        const verify = async () => {
            setIsProcessingPayment(true);
            setCheckoutStage('verifying');
            setRecoveryError(false);
            for (const delay of automaticVerificationDelaysMs) {
                if (delay) await new Promise((resolve) => window.setTimeout(resolve, delay));
                if (cancelled) return;
                const attempted = { ...paymentRecovery, lastAttemptAt: Date.now() };
                writePaymentRecovery(attempted);
                const { data, error } = await client.functions.invoke('verify-razorpay-payment', {
                    body: paymentRecovery.checkout,
                });
                if (!error && data?.success) {
                    if (cancelled) return;
                    const purchaseId = String(data.purchase_id || paymentRecovery.purchaseId);
                    setPaidPurchaseId(purchaseId);
                    setPaidPurchaseVerified(true);
                    setPaymentRecovery(null);
                    writePaymentRecovery(null);
                    try {
                        sessionStorage.setItem('text2handwriting_pending_export', JSON.stringify({
                            purchaseId,
                            pageCount: paymentRecovery.pageCount,
                            fileName: paymentRecovery.fileName,
                            format: paymentRecovery.format,
                            paidAt: Date.now(),
                        }));
                    } catch {
                        // The in-memory paid entitlement is still usable.
                    }
                    setFileName(paymentRecovery.fileName);
                    setActiveFormat(paymentRecovery.format);
                    setCheckoutStage('idle');
                    setIsProcessingPayment(false);
                    onStartRef.current(paymentRecovery.fileName, paymentRecovery.format);
                    return;
                }
            }
            if (!cancelled) {
                setRecoveryError(true);
                setCheckoutStage('idle');
                setIsProcessingPayment(false);
            }
        };
        void verify();
        return () => {
            cancelled = true;
            // Allows a fresh bounded cycle after a close/reopen and keeps the
            // development StrictMode setup/cleanup replay from suppressing it.
            if (recoveryRunRef.current === recoveryKey) recoveryRunRef.current = null;
        };
    }, [isOpen, isAuthenticated, user, paymentRecovery]);

    useEffect(() => {
        if (!isOpen || !isAuthenticated || !paidPurchaseId || paidPurchaseVerified || !supabase) return;
        const client = supabase;
        let cancelled = false;
        const verifyPendingPurchase = async () => {
            try {
                const { data, error } = await client.functions.invoke('verify-razorpay-payment', { method: 'GET' });
                if (cancelled) return;
                if (error) throw error;
                const matches = Array.isArray(data?.purchases) && data.purchases.some(
                    (purchase: { purchase_id: string; page_count: number }) =>
                        purchase.purchase_id === paidPurchaseId && purchase.page_count === pages.length
                );
                setPaidPurchaseVerified(matches);
                if (!matches) {
                    setPaidPurchaseId(null);
                    sessionStorage.removeItem('text2handwriting_pending_export');
                }
            } catch {
                if (!cancelled) setPurchaseCheckError(true);
            }
        };
        void verifyPendingPurchase();
        return () => { cancelled = true; };
    }, [isOpen, isAuthenticated, paidPurchaseId, paidPurchaseVerified, pages.length]);

    useEffect(() => {
        if (status !== 'complete') return;
        setPaidPurchaseId(null);
        setPaidPurchaseVerified(false);
        setPendingPaymentIntent(null);
        try {
            sessionStorage.removeItem('text2handwriting_pending_export');
            sessionStorage.removeItem(paymentIntentStorageKey);
        } catch {
            // Ignore storage restrictions after a successful download.
        }
    }, [status]);

    const handleRetryPaidExport = () => {
        setIsProcessingPayment(false);
        onStart(fileName, activeFormat);
    };

    const handleRetryPaymentVerification = () => {
        if (!paymentRecovery || isProcessingPayment) return;
        // A manual click starts one bounded three-attempt cycle; it never opens
        // checkout again or creates another order.
        recoveryRunRef.current = null;
        setRecoveryError(false);
        setPaymentRecovery({ ...paymentRecovery });
    };
    const effectiveFontSize = getEffectiveFontSize(font, fontSize);

    const handleFormatSwitch = (newFormat: 'pdf' | 'zip') => {
        setActiveFormat(newFormat);
        if (onFormatChange) onFormatChange(newFormat);
    };

    const getStatusMessage = () => {
        if (status === 'complete') return 'Your document is ready!';
        if (status === 'error') return 'Export failed. Please try again.';
        if (status === 'idle') return activeFormat === 'pdf' ? 'Ready to compile multi-page PDF' : 'Ready to archive high-res images';
        if (progress < 30) return activeFormat === 'pdf' ? 'Rendering document pages...' : 'Capturing canvases...';
        if (progress < 60) return activeFormat === 'pdf' ? 'Simulating high-DPI ink...' : 'Optimizing pixel quality...';
        if (progress < 90) return activeFormat === 'pdf' ? 'Compiling PDF document...' : 'Packaging ZIP archive...';
        return 'Finalizing export...';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-md">
                    {/* BACKDROP */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                        onClick={() => status !== 'processing' && onClose()}
                    />

                    {/* MODAL CONTAINER */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.96, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 15 }}
                        transition={{ type: "spring", damping: 26, stiffness: 320 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="export-preview-heading"
                        className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl w-full max-w-[88rem] h-[min(96dvh,1040px)] relative flex flex-col border border-neutral-200/80 z-10"
                    >
                        <div className="min-h-14 px-3 sm:px-6 border-b border-neutral-100 flex items-center justify-between gap-2 bg-white shrink-0">
                            <div className="flex items-center gap-3.5">
                                <h2 id="export-preview-heading" className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-2">
                                    <span>Review your export</span>
                                    <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                                        {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
                                    </span>
                                </h2>
                            </div>

                            {/* Center Preview Zoom Controls */}
                            <div className="hidden sm:flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200/80 text-xs">
                                <button 
                                    onClick={() => setPreviewScale(s => Math.max(0.4, s - 0.1))} 
                                    title="Zoom Out Preview"
                                    className="p-1 hover:bg-white rounded text-neutral-600 transition-colors"
                                >
                                    <ZoomOut size={13} />
                                </button>
                                <span className="font-mono font-bold text-neutral-700 min-w-[38px] text-center">
                                    {Math.round(previewScale * 100)}%
                                </span>
                                <button 
                                    onClick={() => setPreviewScale(s => Math.min(1.0, s + 0.1))} 
                                    title="Zoom In Preview"
                                    className="p-1 hover:bg-white rounded text-neutral-600 transition-colors"
                                >
                                    <ZoomIn size={13} />
                                </button>
                                <button 
                                    onClick={() => setPreviewScale(0.62)} 
                                    title="Reset to Normal Preview Fit"
                                    className="px-2 py-0.5 text-[10px] font-bold text-neutral-600 hover:text-neutral-900 hover:bg-white rounded transition-colors"
                                >
                                    Fit
                                </button>
                            </div>

                            {/* Close Button */}
                            {status !== 'processing' ? (
                                <button 
                                    onClick={onClose}
                                    aria-label="Close export preview"
                                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
                                >
                                    <X size={18} />
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                                    <Loader2 size={15} className="animate-spin" />
                                    <span>Exporting...</span>
                                </div>
                            )}
                        </div>

                        {/* MAIN SPLIT WORKSPACE */}
                        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
                            
                            {/* 1. SCROLLABLE MULTI-PAGE PREVIEW GALLERY (Left / Center) */}
                            <div 
                                ref={scrollContainerRef}
                                className="min-h-[220px] max-h-[42dvh] lg:max-h-none lg:flex-1 lg:min-h-0 overflow-y-auto bg-[#F2F4F7] p-3 sm:p-8 flex flex-col items-center gap-8 relative custom-scrollbar"
                            >
                                {/* Blueprint grid background */}
                                <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60" />

                                {pages.map((page, pIdx) => {
                                    const pageOverrides = pageEffectOverrides[pIdx] || {};
                                    const effectiveCrease = pageOverrides.paperCrease !== undefined ? pageOverrides.paperCrease : paperCrease;
                                    const effectivePerspective = pageOverrides.perspectiveWarp !== undefined ? pageOverrides.perspectiveWarp : perspectiveWarp;
                                    const baseTiltX = pageOverrides.tiltX !== undefined ? pageOverrides.tiltX : tiltX;
                                    const baseTiltY = pageOverrides.tiltY !== undefined ? pageOverrides.tiltY : tiltY;
                                    const pageTiltX = (effectivePerspective && randomTilt)
                                        ? baseTiltX + Math.sin((pIdx + 1) * 7.91 + (randomSeed || 1)) * 3.5
                                        : baseTiltX;
                                    const pageTiltY = (effectivePerspective && randomTilt)
                                        ? baseTiltY + Math.cos((pIdx + 1) * 6.33 + (randomSeed || 1)) * 3.5
                                        : baseTiltY;
                                    const effectiveLighting = pageOverrides.lightingMode !== undefined ? pageOverrides.lightingMode : lightingMode;
                                    const effectiveWarmth = pageOverrides.lightingWarmth !== undefined ? pageOverrides.lightingWarmth : lightingWarmth;
                                    const effectiveNoise = pageOverrides.sensorNoise !== undefined ? pageOverrides.sensorNoise : sensorNoise;
                                    const pageShadow = computePagePhoneShadow(
                                        pIdx,
                                        phoneShadow,
                                        phoneShadowAngle,
                                        phoneShadowIntensity,
                                        randomSeed,
                                        phoneShadowVariation,
                                        pageOverrides
                                    );

                                    const isSpiralActive = Boolean(spiralBinding);
                                    const isLeftSpiral = isSpiralActive; // always left
                                    const redMarginLeft = isLeftSpiral ? 104 : 78;
                                    const effectivePageMarginLeft = Math.max(marginLeft, isLeftSpiral ? 118 : paper.hasRedMargin ? 100 : 20);
                                    const effectivePageMarginRight = marginRight;
                                    const effectivePageMarginTop = (paper.hasRedMargin || paper.id === 'youva-spiral' || showNotebookHeaderBox)
                                        ? Math.max(marginTop, 80)
                                        : marginTop;

                                    return (
                                        <div 
                                            key={pIdx} 
                                            className="relative flex flex-col items-center shrink-0 transition-all"
                                            style={{
                                                width: 800 * previewScale,
                                                height: 1131 * previewScale,
                                            }}
                                        >
                                            {/* Page Label Badge */}
                                            <div className="absolute -top-6 left-2 flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                                                <span>Page {pIdx + 1} of {pages.length}</span>
                                            </div>

                                            {/* Rendered A4 Sheet at Preview Scale */}
                                            <div 
                                                className="absolute top-0 left-0 w-[800px] h-[1131px] bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] rounded-xs overflow-hidden origin-top-left"
                                                style={{
                                                    transform: effectivePerspective 
                                                        ? `scale(${previewScale}) perspective(1000px) rotateX(${pageTiltX}deg) rotateY(${pageTiltY}deg)` 
                                                        : `scale(${previewScale})`,
                                                    transformOrigin: 'top left',
                                                }}
                                            >
                                            <div className={`w-full h-full relative ${paper.css}`} style={paper.style}>
                                                
                                                {/* Clean Top Margin Header Zone Mask (Clears any background ruled lines above double red rule) */}
                                                {(paper.hasRedMargin || paper.id === 'youva-spiral' || showNotebookHeaderBox) && (
                                                    <div 
                                                        className="absolute top-0 left-0 right-0 h-[72px] pointer-events-none z-[5]"
                                                        style={{
                                                            backgroundColor: paper.style.backgroundColor || (paper.id === 'vintage' ? '#fef3c7' : '#ffffff'),
                                                        }}
                                                    />
                                                )}

                                                {/* Red Margin Line (Full height top-to-bottom) */}
                                                {paper.hasRedMargin && (
                                                    <div 
                                                        className="absolute top-0 bottom-0 w-[2px] bg-rose-400 opacity-60 pointer-events-none z-10 transition-all" 
                                                        style={{ left: `${redMarginLeft}px` }}
                                                    />
                                                )}

                                                {/* Double Red Top Header Rule (Classic Indian Student Notebook Style) */}
                                                {(paper.hasRedMargin || paper.id === 'youva-spiral' || showNotebookHeaderBox) && (
                                                    <div className="absolute left-0 right-0 top-[72px] pointer-events-none z-10">
                                                        <div className="w-full h-[1.5px] bg-rose-400 opacity-65" />
                                                        <div className="w-full h-[1.5px] bg-rose-400 opacity-65 mt-[3px]" />
                                                    </div>
                                                )}



                                                {/* Standardized Student Notebook Date & Page No. Box (Matching Real Youva/Classmate) */}
                                                {showNotebookHeaderBox && (
                                                    <div 
                                                        className="absolute top-[12px] z-10 pointer-events-none select-none text-left"
                                                        style={{
                                                            right: '24px',
                                                            width: '168px',
                                                            height: '52px',
                                                            border: '1.2px solid rgba(225, 29, 72, 0.65)',
                                                            borderRadius: '4px',
                                                            backgroundColor: 'transparent',
                                                            boxShadow: 'none',
                                                            display: 'flex',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {/* Left Section: 3 Rows (Days Tracker, Page No, Date) */}
                                                        <div className="flex-1 flex flex-col justify-between" style={{ width: '110px' }}>
                                                            {/* Row 1: M T W T F S S Day Tracker */}
                                                            <div className="h-[17px] border-b border-rose-400/45 flex items-center justify-around px-1 text-[7.5px] font-mono font-bold text-rose-500/80 select-none">
                                                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => {
                                                                    const isToday = dIdx === ((new Date().getDay() + 6) % 7);
                                                                    return (
                                                                        <span key={dIdx} className="relative inline-flex items-center justify-center w-3 h-3">
                                                                            <span className={isToday && notebookDayCircle ? 'text-blue-700 font-black' : 'text-neutral-500'}>
                                                                                {day}
                                                                            </span>
                                                                            {isToday && notebookDayCircle && (
                                                                                <svg 
                                                                                    className="absolute -inset-0.5 w-3.5 h-3.5 pointer-events-none overflow-visible"
                                                                                    viewBox="0 0 20 20"
                                                                                >
                                                                                    <ellipse 
                                                                                        cx="10" 
                                                                                        cy="10" 
                                                                                        rx="7.5" 
                                                                                        ry="7" 
                                                                                        fill="none" 
                                                                                        stroke={color} 
                                                                                        strokeWidth="1.5" 
                                                                                        strokeDasharray="40" 
                                                                                        strokeDashoffset="1" 
                                                                                        transform="rotate(-8 10 10)" 
                                                                                        opacity="0.9"
                                                                                    />
                                                                                </svg>
                                                                            )}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* Row 2: Page No. */}
                                                            <div className="h-[17px] border-b border-rose-400/45 flex items-center justify-between px-1.5 leading-none">
                                                                <span className="text-[8px] font-mono font-bold tracking-tight text-rose-500/85">
                                                                    Page No. :
                                                                </span>
                                                                <span 
                                                                    style={{
                                                                        fontFamily: getFontFamilyCss(font),
                                                                        fontSize: Math.max(13, fontSize * 0.8),
                                                                        color: color,
                                                                        lineHeight: 1,
                                                                    }}
                                                                >
                                                                    {String(pIdx + 1).padStart(2, '0')}
                                                                </span>
                                                            </div>

                                                            {/* Row 3: Date */}
                                                            <div className="h-[17px] flex items-center justify-between px-1.5 leading-none">
                                                                <span className="text-[8px] font-mono font-bold tracking-tight text-rose-500/85">
                                                                    Date :
                                                                </span>
                                                                <span 
                                                                    style={{
                                                                        fontFamily: getFontFamilyCss(font),
                                                                        fontSize: Math.max(12, fontSize * 0.75),
                                                                        color: color,
                                                                        lineHeight: 1,
                                                                    }}
                                                                >
                                                                    {notebookDate || new Date().toLocaleDateString('en-GB')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Right Section: Brand Badge Compartment */}
                                                        <div 
                                                            className="w-[58px] border-l border-rose-400/45 flex flex-col items-center justify-center p-1 select-none bg-rose-500/5 overflow-hidden text-center"
                                                        >
                                                            {(!notebookBrand || notebookBrand === 'YOUVA') && (
                                                                <div className="flex flex-col items-center justify-center w-full select-none">
                                                                    <span className="text-[10px] font-black tracking-wider text-rose-600/90 leading-none">
                                                                        YOUVA
                                                                    </span>
                                                                    <span className="text-[6px] font-extrabold tracking-widest text-rose-400/80 mt-0.5 uppercase">
                                                                        SPELLAR
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {notebookBrand === 'CLASSMATE' && (
                                                                <div className="flex flex-col items-center justify-center w-full select-none">
                                                                    <span className="text-[10px] font-black tracking-tight text-rose-600/90 italic leading-none font-serif">
                                                                        classmate
                                                                    </span>
                                                                    <span className="text-[5px] font-bold tracking-[0.2em] text-rose-400/75 mt-0.5 uppercase">
                                                                        BY ITC
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {notebookBrand === 'SPELLAR' && (
                                                                <div className="flex flex-col items-center justify-center w-full select-none">
                                                                    <span className="text-[9px] font-black tracking-wider text-rose-600/90 leading-none">
                                                                        SPELLAR
                                                                    </span>
                                                                    <span className="text-[5.5px] font-bold tracking-[0.16em] text-rose-400/75 mt-0.5 uppercase">
                                                                        NAVNEET
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {notebookBrand === 'SUNDARAM' && (
                                                                <div className="flex flex-col items-center justify-center w-full px-0.5 select-none">
                                                                    {/* Decorative notebook-style seal emblem */}
                                                                    <div className="flex items-center justify-center gap-1 mb-0.5">
                                                                        <svg className="w-3.5 h-3.5 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" fill="rgba(244, 63, 94, 0.08)" />
                                                                            <path d="M15 9.5c-.8-.8-2-1.2-3-1.2-1.7 0-3 1-3 2.5 0 2.8 6 1.8 6 4.5 0 1.5-1.3 2.7-3 2.7-1.4 0-2.6-.6-3.2-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                        </svg>
                                                                        <span className="text-[7.5px] font-black tracking-normal text-rose-600/90 leading-none">
                                                                            Sundaram
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[5px] font-bold tracking-[0.18em] text-rose-400/80 uppercase scale-95">
                                                                        CLASSIC
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Document Header (Page 1) */}
                                                {showHeader && pIdx === 0 && headerText.trim() && (
                                                    <div 
                                                        className="absolute z-10 leading-tight whitespace-pre-wrap"
                                                        style={{
                                                            top: effectivePageMarginTop,
                                                            left: effectivePageMarginLeft,
                                                            right: effectivePageMarginRight,
                                                            fontFamily: getFontFamilyCss(font),
                                                            fontSize: fontSize * 1.05,
                                                            color: color,
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {headerText}
                                                    </div>
                                                )}

                                                {/* Handwritten Lines */}
                                                <div 
                                                    className="w-full h-full relative select-none"
                                                    style={{
                                                        paddingTop: (pIdx === 0 && showHeader && headerText.trim())
                                                            ? effectivePageMarginTop + (headerText.split('\n').length + 1) * paper.lineHeight
                                                            : effectivePageMarginTop,
                                                        paddingBottom: marginBottom,
                                                        paddingLeft: effectivePageMarginLeft,
                                                        paddingRight: effectivePageMarginRight
                                                    }}
                                                >
                                                    {page.lines.map((line, lIdx) => (
                                                        <div 
                                                            key={lIdx} 
                                                            dir={line.dir}
                                                            style={{
                                                                fontFamily: getFontFamilyCss(font), 
                                                                fontSize: effectiveFontSize, 
                                                                color, 
                                                                height: paper.lineHeight, 
                                                                lineHeight: `${paper.lineHeight}px`, 
                                                                transform: `translateY(${baseline}px)`, 
                                                                textAlign: line.dir === 'rtl' ? (textAlign === 'left' ? 'right' : textAlign === 'right' ? 'left' : textAlign) : textAlign, 
                                                                paddingLeft: line.indent ? line.indent * (effectiveFontSize * 0.4) : 0,
                                                            }} 
                                                            className="w-full whitespace-nowrap relative"
                                                        >
                                                            {(smartMarginIndexing || line.marginIndex) && line.marginIndex && (
                                                                <span 
                                                                    className="absolute text-center font-bold select-none pointer-events-none"
                                                                    style={{
                                                                        left: `-${effectivePageMarginLeft - (isLeftSpiral ? 48 : 0)}px`,
                                                                        width: `${isLeftSpiral ? (redMarginLeft - 48) : (redMarginLeft - 4)}px`,
                                                                        textAlign: 'center',
                                                                        color: color,
                                                                        fontFamily: getFontFamilyCss(font),
                                                                        fontSize: (line.marginIndex.length > 3) 
                                                                            ? Math.min(effectiveFontSize * 0.85, 14) 
                                                                            : Math.min(effectiveFontSize * 0.95, 17),
                                                                        opacity: 0.88,
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                    }}
                                                                >
                                                                    {line.marginIndex}
                                                                </span>
                                                            )}
                                                            {line.type === 'comparison' && line.leftTokens && line.rightTokens ? (
                                                                <div className="w-full flex items-center h-full relative">
                                                                    {/* Left Column (50%) */}
                                                                    <div className="w-1/2 pr-3 overflow-hidden flex items-center whitespace-nowrap">
                                                                        {line.leftTokens.map((tok, tIdx) => {
                                                                            const totalPages = pages.length;
                                                                            const docProgress = totalPages > 0 ? (pIdx + (page.lines.length > 0 ? lIdx / page.lines.length : 0)) / totalPages : 0;
                                                                            return (
                                                                                <HandwrittenWord 
                                                                                    key={`left-${tIdx}`}
                                                                                    token={tok}
                                                                                    pageIndex={pIdx}
                                                                                    lineIndex={lIdx}
                                                                                    wordIndex={tIdx}
                                                                                    totalLines={page.lines.length}
                                                                                    randomSeed={String(randomSeed)}
                                                                                    fontFamily={font}
                                                                                    fontSize={effectiveFontSize}
                                                                                    color={color}
                                                                                    correctionColor={correctionColor}
                                                                                    jitter={jitter}
                                                                                    charJitter={charJitter}
                                                                                    fatigue={fatigue}
                                                                                    pressure={pressure}
                                                                                    smudge={smudge}
                                                                                    lowInkFade={lowInkFade}
                                                                                    lowInkStart={lowInkStart}
                                                                                    lowInkIntensity={lowInkIntensity}
                                                                                    docProgress={docProgress}
                                                                                />
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    {/* Center Pen-Drawn Vertical Divider */}
                                                                    <div 
                                                                        className="absolute left-1/2 -top-0.5 bottom-0 -translate-x-1/2 w-[1.5px] pointer-events-none opacity-60"
                                                                        style={{
                                                                            backgroundColor: color,
                                                                            transform: `rotate(${((lIdx % 3) - 1) * 0.2}deg)`,
                                                                        }}
                                                                    />

                                                                    {/* Right Column (50%) */}
                                                                    <div className="w-1/2 pl-3 overflow-hidden flex items-center whitespace-nowrap">
                                                                        {line.rightTokens.map((tok, tIdx) => {
                                                                            const totalPages = pages.length;
                                                                            const docProgress = totalPages > 0 ? (pIdx + (page.lines.length > 0 ? lIdx / page.lines.length : 0)) / totalPages : 0;
                                                                            return (
                                                                                <HandwrittenWord 
                                                                                    key={`right-${tIdx}`}
                                                                                    token={tok}
                                                                                    pageIndex={pIdx}
                                                                                    lineIndex={lIdx}
                                                                                    wordIndex={tIdx + 100}
                                                                                    totalLines={page.lines.length}
                                                                                    randomSeed={String(randomSeed)}
                                                                                    fontFamily={font}
                                                                                    fontSize={effectiveFontSize}
                                                                                    color={color}
                                                                                    correctionColor={correctionColor}
                                                                                    jitter={jitter}
                                                                                    charJitter={charJitter}
                                                                                    fatigue={fatigue}
                                                                                    pressure={pressure}
                                                                                    smudge={smudge}
                                                                                    lowInkFade={lowInkFade}
                                                                                    lowInkStart={lowInkStart}
                                                                                    lowInkIntensity={lowInkIntensity}
                                                                                    docProgress={docProgress}
                                                                                />
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                line.tokens.map((tok, tIdx) => {
                                                                    const totalPages = pages.length;
                                                                    const docProgress = totalPages > 0 ? (pIdx + (page.lines.length > 0 ? lIdx / page.lines.length : 0)) / totalPages : 0;
                                                                    return (
                                                                        <HandwrittenWord 
                                                                            key={tIdx}
                                                                            token={tok}
                                                                            pageIndex={pIdx}
                                                                            lineIndex={lIdx}
                                                                            wordIndex={tIdx}
                                                                            totalLines={page.lines.length}
                                                                            randomSeed={String(randomSeed)}
                                                                            fontFamily={font}
                                                                            fontSize={effectiveFontSize}
                                                                            color={color}
                                                                            correctionColor={correctionColor}
                                                                            jitter={jitter}
                                                                            charJitter={charJitter}
                                                                            fatigue={fatigue}
                                                                            pressure={pressure}
                                                                            smudge={smudge}
                                                                            lowInkFade={lowInkFade}
                                                                            lowInkStart={lowInkStart}
                                                                            lowInkIntensity={lowInkIntensity}
                                                                            docProgress={docProgress}
                                                                        />
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Page Number */}
                                                {showPageNumbers && (
                                                    <div 
                                                        className="absolute bottom-5 left-0 right-0 text-center font-sans text-[11px] opacity-40 font-mono tracking-widest pointer-events-none"
                                                        style={{ color }}
                                                    >
                                                        — {pIdx + 1} —
                                                    </div>
                                                )}

                                                {/* Physical Camera & Environment Overlay (Topmost layer covering page, text, and header box) */}
                                                <CameraOverlay
                                                    phoneShadow={pageShadow.enabled}
                                                    phoneShadowAngle={pageShadow.angle}
                                                    phoneShadowIntensity={pageShadow.intensity}
                                                    phoneShadowX={pageShadow.shadowX}
                                                    phoneShadowY={pageShadow.shadowY}
                                                    phoneShadowWidth={pageShadow.width}
                                                    phoneShadowHeight={pageShadow.height}
                                                    phoneShadowPenumbra={pageShadow.penumbra}
                                                    lightingMode={effectiveLighting}
                                                    lightingWarmth={effectiveWarmth}
                                                    paperCrease={effectiveCrease}
                                                    sensorNoise={effectiveNoise}
                                                    pageIndex={pIdx}
                                                    spiralBinding={spiralBinding}
                                                    inkBleedThrough={inkBleedThrough}
                                                    inkBleedIntensity={inkBleedIntensity}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>

                            {/* 2. EXPORT CONTROLS SIDEBAR (Right) */}
                            <div className="w-full lg:w-[22rem] xl:w-[24rem] min-h-0 bg-white border-t lg:border-t-0 lg:border-l border-neutral-100 flex flex-col shrink-0 p-4 sm:p-5 lg:p-5 gap-4 overflow-y-auto lg:overflow-y-hidden">
                                <div className="space-y-4 lg:space-y-3.5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:-mr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    
                                    {/* Format Selector Tabs */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2.5 block">
                                            Export Format
                                        </label>
                                        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200/70">
                                            <button 
                                                type="button"
                                                onClick={() => handleFormatSwitch('pdf')}
                                                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                                    activeFormat === 'pdf' 
                                                        ? 'bg-white text-neutral-900 shadow-sm' 
                                                        : 'text-neutral-500 hover:text-neutral-800'
                                                }`}
                                            >
                                                <FileText size={15} />
                                                <span>PDF Doc</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleFormatSwitch('zip')}
                                                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                                    activeFormat === 'zip' 
                                                        ? 'bg-white text-neutral-900 shadow-sm' 
                                                        : 'text-neutral-500 hover:text-neutral-800'
                                                }`}
                                            >
                                                <ImageIcon size={15} />
                                                <span>Images ZIP</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* File Name Input */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">
                                            Document Name
                                        </label>
                                        <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10 transition-all">
                                            <input 
                                                type="text" 
                                                value={fileName}
                                                onChange={(e) => setFileName(e.target.value)}
                                                className="bg-transparent border-none focus:outline-none text-xs font-bold text-neutral-900 flex-1"
                                                placeholder="handwritten-document"
                                            />
                                            <span className="text-neutral-400 text-xs font-mono font-bold">.{activeFormat}</span>
                                        </div>
                                    </div>

                                    {/* Document Summary Card */}
                                    <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/70 space-y-2.5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                                            Document Stats
                                        </span>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="p-2.5 bg-white rounded-xl border border-neutral-100 shadow-2xs">
                                                <div className="text-[10px] text-neutral-400 font-bold uppercase">Total Pages</div>
                                                <div className="text-sm font-black text-neutral-900">{pages.length}</div>
                                            </div>
                                            <div className="p-2.5 bg-white rounded-xl border border-neutral-100 shadow-2xs">
                                                <div className="text-[10px] text-neutral-400 font-bold uppercase">Word Count</div>
                                                <div className="text-sm font-black text-neutral-900">{wordCount}</div>
                                            </div>
                                            <div className="p-2.5 bg-white rounded-xl border border-neutral-100 shadow-2xs col-span-2">
                                                <div className="text-[10px] text-neutral-400 font-bold uppercase">Paper Material</div>
                                                <div className="text-xs font-bold text-neutral-800 truncate">{paper.name}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Export Quality Tag */}
                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span>High-resolution page image capture</span>
                                    </div>

                                    <div className="rounded-2xl border border-stone-200/90 bg-stone-50/80 p-3.5 text-xs text-stone-600 space-y-2" aria-label="Export price breakdown">
                                        <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                                            <p className="font-black text-stone-950">Order summary</p>
                                            <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-stone-500 ring-1 ring-stone-200">Pay once</span>
                                        </div>
                                        <div className="flex justify-between"><span>Document fee</span><span className="font-mono text-stone-800">₹10</span></div>
                                        <div className="flex justify-between"><span>{pages.length} {pages.length === 1 ? 'page' : 'pages'} × ₹2</span><span className="font-mono text-stone-800">₹{pages.length * 2}</span></div>
                                        <div className="flex justify-between border-t border-stone-200 pt-2.5 text-sm font-black text-stone-950"><span>Total</span><span className="font-mono text-violet-700">₹{totalPrice}</span></div>
                                    </div>
                                </div>

                                {/* BOTTOM ACTION AREA */}
                                <div className="space-y-2.5 pt-4 border-t border-neutral-100 shrink-0">
                                    {/* Status Message */}
                                    {!isProcessingPayment && (
                                    <div className="text-center">
                                        <p className="text-xs font-medium text-neutral-500">
                                            {getStatusMessage()}
                                        </p>
                                    </div>
                                    )}

                                    {isProcessingPayment && status !== 'processing' && (
                                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-violet-200/90 bg-[linear-gradient(135deg,rgba(245,243,255,.94),rgba(255,255,255,.92))] p-4 shadow-[inset_0_1px_0_white,0_8px_24px_rgba(91,33,182,.08)]" role="status" aria-live="polite">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/20"><Loader2 size={17} className="animate-spin" /></div>
                                                <div className="min-w-0 flex-1"><p className="text-sm font-black text-neutral-900">{checkoutStage === 'creating' ? 'Preparing checkout…' : checkoutStage === 'opening' ? 'Opening Razorpay…' : 'Confirming payment…'}</p><p className="mt-0.5 text-xs text-neutral-600">{checkoutStage === 'verifying' ? 'Keep this window open; export follows automatically.' : 'Checking your export details before payment.'}</p></div>
                                                {checkoutStage !== 'verifying' && <button type="button" onClick={cancelCheckout} className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold text-stone-500 transition hover:bg-white hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-violet-700">Cancel</button>}
                                            </div>
                                            <div className="mt-4 grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                                                {[
                                                    { id: 'creating', label: '1 · Setup' },
                                                    { id: 'opening', label: '2 · Pay' },
                                                    { id: 'verifying', label: '3 · Export' },
                                                ].map((step) => {
                                                    const active = checkoutStage === step.id;
                                                    const complete = (step.id === 'creating' && checkoutStage !== 'creating') || (step.id === 'opening' && checkoutStage === 'verifying');
                                                    return <span key={step.id} className={`rounded-md px-2 py-1.5 text-center ${active ? 'bg-violet-600 text-white shadow-sm' : complete ? 'bg-emerald-100 text-emerald-800' : 'bg-white/70 text-stone-400 ring-1 ring-stone-200/80'}`}>{step.label}</span>;
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    {checkoutError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium leading-relaxed text-rose-800">{checkoutError}</p>}

                                    {/* Animated Progress Bar when Processing */}
                                    {status === 'processing' && (
                                        <div className="space-y-1.5">
                                            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                                <motion.div 
                                                    className="h-full bg-neutral-900 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                                                <span>Exporting</span>
                                                <span className="font-bold text-neutral-800">{progress}%</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Button States */}
                                    {purchaseCheckError && paidPurchaseId && !paidPurchaseVerified && (
                                        <p role="alert" className="text-xs text-amber-800">We could not confirm your earlier payment. Please contact support instead of paying again.</p>
                                    )}
                                    {paymentRecovery && recoveryError && (
                                        <div className="space-y-2" role="alert">
                                            <p className="text-xs text-amber-800">Your payment was received, but verification is temporarily unavailable. Do not pay again.</p>
                                            <button
                                                type="button"
                                                onClick={handleRetryPaymentVerification}
                                                disabled={isProcessingPayment}
                                                className="w-full py-3 border border-amber-300 text-amber-900 rounded-xl text-sm font-bold hover:bg-amber-50 disabled:opacity-50"
                                            >
                                                Retry payment verification
                                            </button>
                                        </div>
                                    )}
                                    {(status === 'error' || status === 'idle') && paidPurchaseId && paidPurchaseVerified ? (
                                        <button
                                            onClick={handleRetryPaidExport}
                                            className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                                        >
                                            <Download size={16} /><span>Retry paid export — no repayment</span>
                                        </button>
                                    ) : status === 'idle' || status === 'error' ? (
                                        <button
                                            onClick={handleExportPaymentAndStart}
                                            disabled={isProcessingPayment || Boolean(paidPurchaseId) || Boolean(paymentRecovery)}
                                            className="w-full py-4 bg-neutral-900 hover:bg-black text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-neutral-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {paymentRecovery ? (
                                                <><Loader2 size={16} className={isProcessingPayment ? 'animate-spin' : ''} /><span>{isProcessingPayment ? 'Verifying previous payment...' : 'Payment verification required'}</span></>
                                            ) : paidPurchaseId ? (
                                                <><Loader2 size={16} className="animate-spin" /><span>Checking previous payment...</span></>
                                            ) : isProcessingPayment ? (
                                                <><Loader2 size={16} className="animate-spin" /><span>Processing Checkout...</span></>
                                            ) : (
                                                <><Lock size={16} /><span>{!isAuthenticated ? 'Sign in to export' : `Pay ₹${totalPrice} & Download ${activeFormat.toUpperCase()}`}</span></>
                                            )}
                                        </button>
                                    ) : status === 'complete' ? (
                                        <button
                                            onClick={onClose}
                                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                                        >
                                            <CheckCircle2 size={18} />
                                            <span>Export Complete — Close</span>
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full py-4 bg-neutral-100 text-neutral-400 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                                        >
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Generating Document...</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
