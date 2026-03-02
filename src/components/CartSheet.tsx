"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, X, Minus, Plus, Trash2, MessageSquare, CheckCircle, Sparkles, Send } from "lucide-react";

interface Props {
    tableNumber: number;
}

export default function CartSheet({ tableNumber }: Props) {
    const { items, totalItems, totalAmount, removeItem, updateQuantity, clearCart } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [orderNotes, setOrderNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [orderResult, setOrderResult] = useState<{ orderNumber: string } | null>(null);
    const [error, setError] = useState("");

    if (totalItems === 0 && !orderResult) return null;

    // Success screen
    if (orderResult) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FDF6F0, #FCEEE8)' }}>
                <div className="text-center p-8 max-w-sm animate-scale-in">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-warm-lg animate-bounce-in" style={{ background: 'linear-gradient(135deg, #34d399, #10b981)' }}>
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#3D2214' }}>تم إرسال طلبك!</h2>
                    <p className="text-sm mb-1" style={{ color: '#B08A75' }}>رقم الطلب</p>
                    <p className="text-3xl font-bold font-mono tracking-wider mb-6 px-6 py-3 rounded-2xl animate-fade-in" style={{ color: '#3D2214', backgroundColor: 'rgba(196,136,109,0.08)' }}>
                        {orderResult.orderNumber.slice(-6).toUpperCase()}
                    </p>
                    <div className="rounded-2xl p-4 mb-6 shadow-warm-sm" style={{ backgroundColor: 'white', border: '1px solid rgba(196,136,109,0.08)' }}>
                        <div className="flex items-center gap-2 justify-center">
                            <Sparkles className="w-4 h-4" style={{ color: '#34d399' }} />
                            <p className="text-sm font-medium" style={{ color: '#3D2214' }}>
                                الحالة: <span className="font-bold px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#DCFCE7', color: '#16a34a' }}>جديد</span>
                            </p>
                        </div>
                        <p className="text-xs mt-2" style={{ color: '#B08A75' }}>سيتم تحضير طلبك قريباً</p>
                    </div>
                    <button
                        onClick={() => { setOrderResult(null); window.location.reload(); }}
                        className="w-full text-white px-8 py-4 rounded-xl font-bold transition-all shadow-warm-lg active:scale-[0.98]"
                        style={{ background: 'linear-gradient(135deg, #C4886D, #D4A76A)' }}
                    >
                        طلب جديد
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async () => {
        if (submitting || totalItems === 0) return;
        setSubmitting(true);
        setError("");
        const idempotencyKey = `${tableNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tableNumber,
                    notes: orderNotes || undefined,
                    idempotencyKey,
                    items: items.map((item) => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        notes: item.notes || undefined,
                        optionIds: item.options.map((o) => o.optionId),
                    })),
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "فشل إرسال الطلب"); setSubmitting(false); return; }
            clearCart();
            setOrderNotes("");
            setOrderResult({ orderNumber: data.order.orderNumber });
        } catch { setError("خطأ في الاتصال — حاول مرة أخرى"); }
        setSubmitting(false);
    };

    return (
        <>
            {/* Floating cart button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 active:scale-95 transition-all w-11/12 max-w-[380px] justify-between animate-slide-up"
                    style={{ background: 'linear-gradient(135deg, #C4886D, #D4A76A)', boxShadow: '0 8px 32px rgba(196,136,109,0.35)' }}
                >
                    <div className="flex items-center gap-3">
                        <span className="bg-white/20 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center font-bold backdrop-blur-sm">
                            {totalItems}
                        </span>
                        <span className="font-bold text-base flex items-center gap-1.5">
                            <ShoppingBag className="w-4 h-4" />
                            عرض السلة
                        </span>
                    </div>
                    <span className="font-bold text-base bg-white/15 px-3.5 py-1 rounded-xl backdrop-blur-sm">{totalAmount.toFixed(0)} ₪</span>
                </button>
            )}

            {/* Cart sheet */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setIsOpen(false)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
                    <div
                        className="relative w-full max-w-[420px] rounded-t-[2rem] max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl"
                        style={{ background: 'linear-gradient(180deg, #FFFFFF, #FFF8F4)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Handle bar */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(196,136,109,0.2)' }} />
                        </div>

                        {/* Header */}
                        <div className="px-5 pb-3 flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#3D2214' }}>
                                <ShoppingBag className="w-5 h-5" style={{ color: '#C4886D' }} />
                                السلة ({totalItems})
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-cafe-100 transition-colors" style={{ color: '#B08A75' }}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-5 space-y-2.5 pb-4">
                            {items.map((item) => {
                                const optExtra = item.options.reduce((s, o) => s + o.extraPrice, 0);
                                const itemTotal = (item.basePrice + optExtra) * item.quantity;
                                return (
                                    <div key={item.id} className="card-premium p-4" style={{ padding: '1rem' }}>
                                        <div className="flex justify-between items-start mb-2.5">
                                            <div className="flex-1 pl-2">
                                                <h3 className="font-bold text-sm leading-tight" style={{ color: '#3D2214' }}>{item.nameAr}</h3>
                                                {item.options.length > 0 && (
                                                    <p className="text-xs mt-0.5" style={{ color: '#B08A75' }}>
                                                        {item.options.map((o) => o.nameAr).join("، ")}
                                                    </p>
                                                )}
                                                {item.notes && (
                                                    <p className="text-xs mt-1 p-1.5 rounded-lg inline-block" style={{ backgroundColor: '#FFF5EE', color: '#C4886D' }}>
                                                        <MessageSquare className="w-3 h-3 inline ml-1" /> {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-sm font-bold whitespace-nowrap px-2.5 py-1 rounded-lg" style={{ backgroundColor: '#FFF5EE', color: '#C4886D' }}>
                                                {itemTotal.toFixed(0)} ₪
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2.5" style={{ borderTop: '1px solid rgba(196,136,109,0.06)' }}>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                                style={{ color: '#ef4444' }}
                                            >
                                                <Trash2 className="w-3 h-3" /> حذف
                                            </button>
                                            <div className="flex items-center gap-2 rounded-full px-1.5 py-1" style={{ backgroundColor: '#FFF5EE', border: '1px solid rgba(196,136,109,0.1)' }}>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                                                    style={{ backgroundColor: 'white', color: '#C4886D', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="font-bold text-sm w-5 text-center" style={{ color: '#3D2214' }}>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 rounded-full text-white flex items-center justify-center transition-all active:scale-90 shadow-sm"
                                                    style={{ background: 'linear-gradient(135deg, #C4886D, #D4A76A)' }}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <textarea
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                placeholder="ملاحظات للطلب (اختياري)"
                                className="w-full rounded-xl px-4 py-3 text-sm placeholder-cafe-300/30 focus:outline-none focus:ring-2 focus:ring-cafe-300/20 resize-none h-16 transition-all shadow-warm-sm"
                                style={{ backgroundColor: 'white', border: '1px solid rgba(196,136,109,0.08)', color: '#3D2214' }}
                            />

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-500 text-sm text-center animate-scale-in">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="sticky bottom-0 p-4 space-y-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.03)]" style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(196,136,109,0.06)' }}>
                            <div className="flex justify-between items-center px-1">
                                <span className="font-bold text-sm" style={{ color: '#8B6F5E' }}>المجموع الإجمالي</span>
                                <span className="font-bold text-2xl" style={{ color: '#3D2214' }}>{totalAmount.toFixed(0)} ₪</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${submitting
                                    ? "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                                    : "text-white shadow-warm-lg active:scale-[0.98]"
                                    }`}
                                style={!submitting ? { background: 'linear-gradient(135deg, #C4886D, #D4A76A)' } : {}}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-400 rounded-full animate-spin" />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        تأكيد الطلب ✓
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
