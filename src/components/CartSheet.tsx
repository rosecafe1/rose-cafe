"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-50">
                <div className="text-center p-8 max-w-sm bg-white rounded-3xl shadow-2xl border border-rose-100">
                    <div className="text-7xl mb-6 animate-bounce">✅</div>
                    <h2 className="text-2xl font-bold text-cafe-600 mb-3">تم إرسال طلبك!</h2>
                    <p className="text-gray-500 mb-2">رقم الطلب</p>
                    <p className="text-3xl font-bold text-cafe-900 mb-6 font-mono tracking-wider bg-rose-50 py-2 rounded-xl">
                        {orderResult.orderNumber.slice(-6).toUpperCase()}
                    </p>
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-6">
                        <p className="text-cafe-800 text-sm font-medium">الحالة: <span className="text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">جديد</span></p>
                        <p className="text-gray-500 text-xs mt-2">سيتم تحضير طلبك قريباً</p>
                    </div>
                    <button
                        onClick={() => {
                            setOrderResult(null);
                            window.location.reload();
                        }}
                        className="w-full bg-cafe-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-cafe-600 transition-colors shadow-md shadow-cafe-200"
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

            if (!res.ok) {
                setError(data.error || "فشل إرسال الطلب");
                setSubmitting(false);
                return;
            }

            clearCart();
            setOrderNotes("");
            setOrderResult({ orderNumber: data.order.orderNumber });
        } catch {
            setError("خطأ في الاتصال — حاول مرة أخرى");
        }
        setSubmitting(false);
    };

    return (
        <>
            {/* Floating cart button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-cafe-500 text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-cafe-300 flex items-center gap-3 hover:bg-cafe-600 active:scale-95 transition-all w-11/12 max-w-[360px] justify-between border border-cafe-400"
                >
                    <div className="flex items-center gap-3">
                        <span className="bg-white text-cafe-600 text-sm w-7 h-7 rounded-full flex items-center justify-center font-bold shadow-sm">
                            {totalItems}
                        </span>
                        <span className="font-bold text-lg">عرض السلة</span>
                    </div>
                    <span className="font-bold text-lg bg-cafe-600/50 px-3 py-1 rounded-xl">{totalAmount.toFixed(0)} ₪</span>
                </button>
            )}

            {/* Cart sheet */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setIsOpen(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div
                        className="relative bg-rose-50 w-full max-w-[400px] rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-4 border-b border-rose-100 flex items-center justify-between z-10 rounded-t-3xl">
                            <h2 className="text-lg font-bold text-cafe-900">🛒 السلة ({totalItems})</h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-cafe-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50 transition-colors">✕</button>
                        </div>

                        <div className="p-4 space-y-3">
                            {/* Cart items */}
                            {items.map((item) => {
                                const optExtra = item.options.reduce((s, o) => s + o.extraPrice, 0);
                                const itemTotal = (item.basePrice + optExtra) * item.quantity;
                                return (
                                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 pr-2">
                                                <h3 className="text-cafe-900 font-bold text-sm leading-tight">{item.nameAr}</h3>
                                                {item.options.length > 0 && (
                                                    <p className="text-gray-500 text-xs mt-1 leading-snug">
                                                        {item.options.map((o) => o.nameAr).join("، ")}
                                                    </p>
                                                )}
                                                {item.notes && (
                                                    <p className="text-cafe-600 text-xs mt-1.5 bg-rose-50 p-2 rounded-lg inline-block">📝 {item.notes}</p>
                                                )}
                                            </div>
                                            <span className="text-cafe-600 font-bold text-sm whitespace-nowrap bg-rose-50 px-2 py-1 rounded-lg">{itemTotal.toFixed(0)} ₪</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-rose-50">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 text-xs hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors font-medium flex items-center gap-1"
                                            >
                                                🗑 حذف
                                            </button>
                                            <div className="flex items-center gap-3 bg-rose-50 rounded-full px-1 py-1 border border-rose-100">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-7 h-7 rounded-full bg-white text-cafe-600 flex items-center justify-center text-sm shadow-sm hover:bg-rose-100 font-bold"
                                                >
                                                    −
                                                </button>
                                                <span className="text-cafe-900 font-bold text-sm w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 rounded-full bg-cafe-500 text-white flex items-center justify-center text-sm shadow-sm hover:bg-cafe-600 font-bold"
                                                >
                                                    +
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
                                className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 text-sm text-cafe-900 placeholder-gray-400 focus:outline-none focus:border-cafe-400 focus:ring-2 focus:ring-cafe-100 resize-none h-16 shadow-sm transition-all"
                            />

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="sticky bottom-0 p-4 bg-white border-t border-rose-100 space-y-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] rounded-b-3xl">
                            <div className="flex justify-between items-center text-sm text-gray-600 px-2">
                                <span className="font-bold">المجموع الإجمالي</span>
                                <span className="text-cafe-700 font-bold text-2xl">{totalAmount.toFixed(0)} ₪</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${submitting
                                    ? "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                                    : "bg-cafe-500 text-white hover:bg-cafe-600 active:scale-[0.98] shadow-cafe-200"
                                    }`}
                            >
                                {submitting ? "جاري الإرسال..." : "تأكيد الطلب ✓"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
