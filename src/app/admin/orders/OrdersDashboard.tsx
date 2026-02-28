"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface OrderItemOption {
    id: number;
    optionNameAr: string;
    extraPrice: string;
}

interface OrderItem {
    id: number;
    itemNameAr: string;
    quantity: number;
    unitPrice: string;
    notes: string | null;
    options: OrderItemOption[];
}

interface Order {
    id: number;
    orderNumber: string;
    status: string;
    notes: string | null;
    totalAmount: string;
    statusChangedBy: string | null;
    createdAt: string;
    table: { number: number };
    items: OrderItem[];
}

const TABS = [
    { key: "NEW", label: "جديد", emoji: "🔴", color: "bg-red-500" },
    { key: "PREPARING", label: "تحضير", emoji: "🟡", color: "bg-yellow-500" },
    { key: "READY", label: "جاهز", emoji: "🟢", color: "bg-green-500" },
    { key: "SERVED", label: "مقدم", emoji: "✅", color: "bg-blue-500" },
    { key: "ALL", label: "الكل", emoji: "📋", color: "bg-gray-500" },
];

const STATUS_FLOW: Record<string, string[]> = {
    NEW: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY", "CANCELLED"],
    READY: ["SERVED"],
    SERVED: [],
    CANCELLED: [],
};

const STATUS_LABELS: Record<string, string> = {
    NEW: "جديد",
    PREPARING: "تحضير",
    READY: "جاهز",
    SERVED: "مقدم",
    CANCELLED: "ملغي",
};

const STATUS_COLORS: Record<string, string> = {
    NEW: "bg-red-500/20 text-red-400 border-red-500/30",
    PREPARING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    READY: "bg-green-500/20 text-green-400 border-green-500/30",
    SERVED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
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

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/orders?status=${activeTab}`);
            if (res.status === 401) {
                router.push("/admin/login");
                return;
            }
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

    // SSE subscription for realtime updates
    useEffect(() => {
        const eventSource = new EventSource("/api/admin/events");

        eventSource.onopen = () => setConnected(true);
        eventSource.onerror = () => setConnected(false);

        eventSource.addEventListener("new_order", () => {
            // Play notification sound
            try {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 800;
                osc.type = "sine";
                gain.gain.value = 0.3;
                osc.start();
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.stop(ctx.currentTime + 0.5);
            } catch { }
            // Refresh orders list
            fetchOrders();
        });

        eventSource.addEventListener("status_change", () => {
            fetchOrders();
        });

        return () => eventSource.close();
    }, [fetchOrders]);

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchOrders();
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
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
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-md" style={{ backgroundColor: 'rgba(255,248,244,0.95)', borderBottom: '1px solid #F0D1C4' }}>
                <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: '#9C6A50' }}>
                            📋 إدارة الطلبات
                            <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"} animate-pulse`} title={connected ? "متصل" : "غير متصل"} />
                        </h1>
                        <p className="text-xs" style={{ color: '#B08A75' }}>مرحباً {user.displayName}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => router.push("/admin/accounting")} className="text-sm px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#9C6A50', backgroundColor: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(196,136,109,0.1)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            📊 المحاسبة
                        </button>
                        <button onClick={() => router.push("/admin/menu")} className="text-sm px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#9C6A50' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(196,136,109,0.1)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            🍽️ القائمة
                        </button>
                        <button onClick={() => router.push("/admin/tables")} className="text-sm px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#9C6A50' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(196,136,109,0.1)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            📱 QR
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-sm px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#C4886D' }}
                        >
                            خروج
                        </button>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex overflow-x-auto gap-1 px-4 pb-3 scrollbar-hide">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key
                                ? `${tab.color} text-white shadow-lg`
                                : "text-gray-600 hover:text-gray-800"
                                }`}
                            style={activeTab !== tab.key ? { backgroundColor: 'rgba(255,255,255,0.5)' } : {}}
                        >
                            {tab.emoji} {tab.label}
                        </button>
                    ))}
                </div>
            </header >

            {/* Orders */}
            < div className="px-4 mt-4 space-y-3 pb-8" >
                {
                    loading ? (
                        <div className="text-center py-16" >
                            <div className="animate-spin w-10 h-10 border-4 border-cafe-300 border-t-transparent rounded-full mx-auto mb-3"></div>
                            <p className="text-gray-500 text-sm">جاري التحميل...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-4xl mb-3">📭</p>
                            <p className="text-gray-500">لا توجد طلبات {STATUS_LABELS[activeTab] || ""}</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #F0D1C4' }}
                            >
                                {/* Order Header */}
                                <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F0D1C4' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-cafe-100 text-cafe-800 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm">
                                            <span>🍽️</span>
                                            طاولة {order.table.number}
                                        </div>
                                        <div>
                                            <span className="text-white text-sm font-mono">
                                                #{order.orderNumber.slice(-6).toUpperCase()}
                                            </span>
                                            <p className="text-gray-600 text-xs">
                                                {timeAgo(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status]}`}>
                                        {STATUS_LABELS[order.status]}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-4 space-y-2">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start text-sm">
                                            <div className="flex-1">
                                                <span className="text-white">
                                                    {item.quantity}× {item.itemNameAr}
                                                </span>
                                                {item.options.length > 0 && (
                                                    <p className="text-gray-600 text-xs">
                                                        {item.options.map((o) => o.optionNameAr).join("، ")}
                                                    </p>
                                                )}
                                                {item.notes && (
                                                    <p className="text-cafe-400 text-xs">📝 {item.notes}</p>
                                                )}
                                            </div>
                                            <span className="text-gray-500 text-xs">
                                                {(parseFloat(item.unitPrice) * item.quantity).toFixed(0)} ₪
                                            </span>
                                        </div>
                                    ))}

                                    {order.notes && (
                                        <div className="bg-cafe-800/20 rounded-lg p-2 mt-2">
                                            <p className="text-cafe-300 text-xs">📝 {order.notes}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-2 border-t border-cafe-800/20">
                                        <span className="text-gray-500 text-xs">
                                            {order.statusChangedBy && `تحديث: ${order.statusChangedBy}`}
                                        </span>
                                        <span className="text-cafe-300 font-bold">
                                            {parseFloat(order.totalAmount).toFixed(0)} ₪
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {STATUS_FLOW[order.status]?.length > 0 && (
                                    <div className="px-4 pb-4 flex gap-2">
                                        {STATUS_FLOW[order.status].map((nextStatus) => (
                                            <button
                                                key={nextStatus}
                                                onClick={() => handleStatusChange(order.id, nextStatus)}
                                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] ${nextStatus === "CANCELLED"
                                                    ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                                                    : "bg-cafe-500 text-white hover:bg-cafe-400"
                                                    }`}
                                            >
                                                {nextStatus === "PREPARING" && "🔥 بدء التحضير"}
                                                {nextStatus === "READY" && "✅ جاهز"}
                                                {nextStatus === "SERVED" && "🍽️ تم التقديم"}
                                                {nextStatus === "CANCELLED" && "❌ إلغاء"}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )
                }
            </div >
        </div >
    );
}
