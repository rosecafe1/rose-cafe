"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Clock, CheckCircle2, XCircle, Utensils, LogOut, BarChart3, QrCode, Bell, BellRing, X, Menu, Printer } from "lucide-react";
import InvoicePrint from "@/components/InvoicePrint";

interface OrderItemOption {
    id: string;
    optionNameAr: string;
    extraPrice: string;
}

interface OrderItem {
    id: string;
    itemNameAr: string;
    quantity: number;
    unitPrice: string;
    notes: string | null;
    options: OrderItemOption[];
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    notes: string | null;
    totalAmount: string;
    statusChangedBy: string | null;
    createdAt: string;
    table: { number: number };
    items: OrderItem[];
}

interface Toast {
    id: string;
    message: string;
    tableNumber: number;
    exiting: boolean;
}

const TABS = [
    { key: "NEW", label: "جديد", icon: BellRing, gradient: "from-red-500 to-rose-500" },
    { key: "PREPARING", label: "تحضير", icon: ChefHat, gradient: "from-amber-500 to-yellow-500" },
    { key: "READY", label: "جاهز", icon: CheckCircle2, gradient: "from-emerald-500 to-green-500" },
    { key: "SERVED", label: "مقدم", icon: Utensils, gradient: "from-blue-500 to-cyan-500" },
    { key: "ALL", label: "الكل", icon: Menu, gradient: "from-gray-500 to-slate-500" },
];

const STATUS_FLOW: Record<string, string[]> = {
    NEW: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY", "CANCELLED"],
    READY: ["SERVED"],
    SERVED: [],
    CANCELLED: [],
};

const STATUS_LABELS: Record<string, string> = {
    NEW: "جديد", PREPARING: "تحضير", READY: "جاهز", SERVED: "مقدم", CANCELLED: "ملغي",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    NEW: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/25", glow: "shadow-red-500/10" },
    PREPARING: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/25", glow: "shadow-amber-500/10" },
    READY: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25", glow: "shadow-emerald-500/10" },
    SERVED: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25", glow: "shadow-blue-500/10" },
    CANCELLED: { bg: "bg-gray-500/15", text: "text-gray-400", border: "border-gray-500/25", glow: "shadow-gray-500/10" },
};

const ACTION_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
    PREPARING: { label: "بدء التحضير", icon: "🔥", className: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40" },
    READY: { label: "جاهز للتقديم", icon: "✅", className: "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40" },
    SERVED: { label: "تم التقديم", icon: "🍽️", className: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40" },
    CANCELLED: { label: "إلغاء", icon: "❌", className: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20" },
};

interface Props {
    user: { username: string; displayName: string };
}

export default function OrdersDashboard({ user }: Props) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("NEW");
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
    const toastTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

    // Request notification permission on mount
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/orders?status=${activeTab}`);
            if (res.status === 401) { router.push("/admin/login"); return; }
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        }
        setLoading(false);
    }, [activeTab, router]);

    useEffect(() => {
        setLoading(true);
        fetchOrders();
    }, [fetchOrders]);

    // Show toast notification
    const showToast = useCallback((message: string, tableNumber: number) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, tableNumber, exiting: false }]);

        // Auto-dismiss after 5s
        toastTimeouts.current[id] = setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
        }, 5000);
    }, []);

    const dismissToast = (id: string) => {
        if (toastTimeouts.current[id]) clearTimeout(toastTimeouts.current[id]);
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
    };

    // Play premium notification sound
    const playNotificationSound = useCallback(() => {
        try {
            const ctx = new AudioContext();
            const now = ctx.currentTime;

            // First note (higher)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1); gain1.connect(ctx.destination);
            osc1.frequency.value = 880;
            osc1.type = "sine";
            gain1.gain.setValueAtTime(0.25, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc1.start(now);
            osc1.stop(now + 0.3);

            // Second note (lower, slight delay)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2); gain2.connect(ctx.destination);
            osc2.frequency.value = 660;
            osc2.type = "sine";
            gain2.gain.setValueAtTime(0, now + 0.15);
            gain2.gain.linearRampToValueAtTime(0.2, now + 0.2);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc2.start(now + 0.15);
            osc2.stop(now + 0.6);
        } catch { }
    }, []);

    // SSE for realtime updates
    useEffect(() => {
        const eventSource = new EventSource("/api/admin/events");
        eventSource.onopen = () => setConnected(true);
        eventSource.onerror = () => setConnected(false);

        eventSource.addEventListener("new_order", (e) => {
            playNotificationSound();

            // Parse order data for table number
            let tableNum = 0;
            try {
                const data = JSON.parse(e.data);
                tableNum = data.tableNumber || 0;
            } catch { }

            // Desktop notification
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("🔔 طلب جديد!", {
                    body: tableNum ? `طاولة ${tableNum} أرسلت طلباً جديداً` : "تم استلام طلب جديد",
                    icon: "/images/logo.png",
                    tag: "new-order",
                    requireInteraction: true,
                });
            }

            // In-app toast
            showToast("طلب جديد!", tableNum);

            fetchOrders();
        });

        eventSource.addEventListener("status_change", () => {
            fetchOrders();
        });

        return () => eventSource.close();
    }, [fetchOrders, playNotificationSound, showToast]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) fetchOrders();
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    };

    const handlePrint = (order: Order) => {
        setPrintingOrder(order);
        setTimeout(() => {
            window.print();
            // Clear after printing to avoid showing it later accidentally
            setTimeout(() => setPrintingOrder(null), 1000);
        }, 100);
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "الآن";
        if (mins < 60) return `${mins} د`;
        const hrs = Math.floor(mins / 60);
        return `${hrs} س ${mins % 60} د`;
    };

    return (
        <div className="admin-page">
            {/* Hidden Printable Invoice */}
            <InvoicePrint order={printingOrder} />

            {/* Toast Notifications */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md px-4">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 ${toast.exiting ? 'animate-toast-exit' : 'animate-toast'}`}
                        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                            <BellRing className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-bold text-sm">{toast.message}</p>
                            {toast.tableNumber > 0 && (
                                <p className="text-emerald-100 text-xs">طاولة {toast.tableNumber}</p>
                            )}
                        </div>
                        <button onClick={() => dismissToast(toast.id)} className="text-white/60 hover:text-white p-1">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 glass-dark" style={{ borderBottom: '1px solid rgba(196,136,109,0.1)' }}>
                <div className="max-w-5xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cafe-500 to-gold-500 flex items-center justify-center shadow-lg shadow-cafe-500/20">
                                <Utensils className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-white flex items-center gap-2">
                                    إدارة الطلبات
                                    <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                                </h1>
                                <p className="text-xs text-white/50">مرحباً {user.displayName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => router.push("/admin/accounting")} className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all" title="المحاسبة">
                                <BarChart3 className="w-5 h-5" />
                            </button>
                            <button onClick={() => router.push("/admin/menu")} className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all" title="القائمة">
                                <ChefHat className="w-5 h-5" />
                            </button>
                            <button onClick={() => router.push("/admin/tables")} className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all" title="QR">
                                <QrCode className="w-5 h-5" />
                            </button>
                            <button onClick={handleLogout} className="p-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all" title="خروج">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-hide pb-1">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive
                                        ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Orders Grid */}
            <div className="max-w-5xl mx-auto px-4 mt-4 pb-8">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-10 h-10 border-3 border-cafe-500/30 border-t-cafe-400 rounded-full mx-auto mb-4"></div>
                        <p className="text-white/30 text-sm">جاري التحميل...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-white/30 text-sm">لا توجد طلبات {STATUS_LABELS[activeTab] || ""}</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {orders.map((order, i) => {
                            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.NEW;
                            return (
                                <div
                                    key={order.id}
                                    className={`card-admin animate-fade-in overflow-hidden ${sc.glow}`}
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    {/* Order Header */}
                                    <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gradient-to-br from-cafe-500/20 to-gold-500/20 text-cafe-300 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 border border-cafe-500/20">
                                                <Utensils className="w-3.5 h-3.5" />
                                                طاولة {order.table.number}
                                            </div>
                                            <div>
                                                <span className="text-white/80 text-sm font-mono">
                                                    #{order.orderNumber.slice(-6).toUpperCase()}
                                                </span>
                                                <p className="text-white/30 text-xs flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {timeAgo(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <button
                                                onClick={() => handlePrint(order)}
                                                className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                                title="طباعة الفاتورة"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                                                {STATUS_LABELS[order.status]}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-4 space-y-2.5">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-start text-sm">
                                                <div className="flex-1">
                                                    <span className="text-white/90 font-medium">
                                                        <span className="text-cafe-400 font-bold ml-1">{item.quantity}×</span>
                                                        {item.itemNameAr}
                                                    </span>
                                                    {item.options.length > 0 && (
                                                        <p className="text-white/30 text-xs mt-0.5">
                                                            {item.options.map((o) => o.optionNameAr).join("، ")}
                                                        </p>
                                                    )}
                                                    {item.notes && (
                                                        <p className="text-amber-400/60 text-xs mt-0.5">📝 {item.notes}</p>
                                                    )}
                                                </div>
                                                <span className="text-white/40 text-xs font-mono">
                                                    {(parseFloat(item.unitPrice) * item.quantity).toFixed(0)} ₪
                                                </span>
                                            </div>
                                        ))}

                                        {order.notes && (
                                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 mt-2">
                                                <p className="text-amber-300/80 text-xs">📝 {order.notes}</p>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center pt-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span className="text-white/20 text-xs">
                                                {order.statusChangedBy && `تحديث: ${order.statusChangedBy}`}
                                            </span>
                                            <span className="text-cafe-300 font-bold text-lg">
                                                {parseFloat(order.totalAmount).toFixed(0)} ₪
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {STATUS_FLOW[order.status]?.length > 0 && (
                                        <div className="px-4 pb-4 flex gap-2">
                                            {STATUS_FLOW[order.status].map((nextStatus) => {
                                                const cfg = ACTION_CONFIG[nextStatus];
                                                return (
                                                    <button
                                                        key={nextStatus}
                                                        onClick={() => handleStatusChange(order.id, nextStatus)}
                                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] ${cfg?.className || ""}`}
                                                    >
                                                        {cfg?.icon} {cfg?.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
