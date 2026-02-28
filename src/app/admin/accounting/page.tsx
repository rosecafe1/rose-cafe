"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AccountingData {
    totalRevenue: number;
    orderCount: number;
    avgOrder: number;
    allOrdersCount: number;
    cancelledCount: number;
    topItems: { name: string; quantity: number; revenue: number; orderCount: number }[];
    dailySales: { date: string; revenue: number; count: number }[];
    salesByCategory: { name: string; revenue: number; count: number }[];
    period: string;
    startDate: string;
    endDate: string;
}

export default function AccountingPage() {
    const router = useRouter();
    const [data, setData] = useState<AccountingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("today");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");

    const fetchData = async (p: string, from?: string, to?: string) => {
        setLoading(true);
        let url = `/api/admin/accounting?period=${p}`;
        if (from && to) url += `&from=${from}&to=${to}`;
        const res = await fetch(url);
        if (res.status === 401) { router.push("/admin/login"); return; }
        const json = await res.json();
        setData(json);
        setLoading(false);
    };

    useEffect(() => { fetchData(period); }, []);

    const changePeriod = (p: string) => {
        setPeriod(p);
        if (p !== "custom") fetchData(p);
    };

    const applyCustom = () => {
        if (customFrom && customTo) fetchData("custom", customFrom, customTo);
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("ar-SA", { weekday: "short", month: "short", day: "numeric" });
    };

    return (
        <div className="min-h-screen" dir="rtl">
            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-md" style={{ backgroundColor: 'rgba(255,248,244,0.95)', borderBottom: '1px solid #F0D1C4' }}>
                <div className="flex items-center justify-between px-4 py-3">
                    <h1 className="text-lg font-bold" style={{ color: '#9C6A50' }}>📊 المحاسبة</h1>
                    <div className="flex items-center gap-3 text-sm">
                        <button onClick={() => router.push("/admin/orders")} className="px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#9C6A50' }}>📋 الطلبات</button>
                        <button onClick={() => router.push("/admin/menu")} className="px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#9C6A50' }}>🍽 القائمة</button>
                        <button onClick={() => router.push("/admin/tables")} className="px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#9C6A50' }}>📱 QR</button>
                    </div>
                </div>
            </header>

            <div className="p-4 max-w-4xl mx-auto space-y-4">
                {/* Period Filter */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3" style={{ border: '1px solid #F0D1C4' }}>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {[
                            { key: "today", label: "اليوم" },
                            { key: "week", label: "هذا الأسبوع" },
                            { key: "month", label: "هذا الشهر" },
                            { key: "all", label: "الكل" },
                            { key: "custom", label: "مخصص" },
                        ].map((p) => (
                            <button
                                key={p.key}
                                onClick={() => changePeriod(p.key)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === p.key
                                    ? "text-white shadow-lg"
                                    : "text-gray-600"
                                    }`}
                                style={period === p.key ? { backgroundColor: '#C4886D' } : { backgroundColor: 'rgba(255,255,255,0.5)' }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    {period === "custom" && (
                        <div className="flex gap-2 items-center mt-2">
                            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                                className="rounded-xl px-3 py-2 text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #F0D1C4', color: '#5A3D2E' }} />
                            <span className="text-gray-500">→</span>
                            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                                className="rounded-xl px-3 py-2 text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #F0D1C4', color: '#5A3D2E' }} />
                            <button onClick={applyCustom} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: '#C4886D' }}>
                                بحث
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin w-8 h-8 border-2 border-cafe-300 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-gray-500">جاري التحميل...</p>
                    </div>
                ) : data ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 rounded-2xl p-4">
                                <p className="text-green-800 font-bold text-xs mb-1">💰 إجمالي المبيعات</p>
                                <p className="text-2xl font-bold text-green-700">{data.totalRevenue.toFixed(0)} <span className="text-sm">₪</span></p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
                                <p className="text-blue-800 font-bold text-xs mb-1">📦 عدد الطلبات</p>
                                <p className="text-2xl font-bold text-blue-700">{data.orderCount}</p>
                                {data.cancelledCount > 0 && (
                                    <p className="text-red-700 font-bold text-[10px] mt-1">🚫 {data.cancelledCount} ملغي</p>
                                )}
                            </div>
                            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 rounded-2xl p-4">
                                <p className="text-purple-800 font-bold text-xs mb-1">📊 متوسط الطلب</p>
                                <p className="text-2xl font-bold text-purple-700">{data.avgOrder.toFixed(0)} <span className="text-sm">₪</span></p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 rounded-2xl p-4">
                                <p className="text-amber-800 font-bold text-xs mb-1">🏆 الأكثر مبيعاً</p>
                                <p className="text-lg font-bold text-amber-700 truncate">
                                    {data.topItems.length > 0 ? data.topItems[0].name : "—"}
                                </p>
                            </div>
                        </div>

                        {/* Top Selling Items */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4" style={{ border: '1px solid #F0D1C4' }}>
                            <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#5A3D2E' }}>
                                <span>🔥</span> أكثر الأصناف مبيعاً
                            </h2>
                            {data.topItems.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">لا توجد بيانات</p>
                            ) : (
                                <div className="space-y-2">
                                    {data.topItems.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                                            <div className="flex items-center gap-3">
                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-500/20 text-amber-400" :
                                                    i === 1 ? "bg-gray-400/20 text-gray-300" :
                                                        i === 2 ? "bg-orange-500/20 text-orange-400" :
                                                            "bg-white/10 text-gray-500"
                                                    }`}>
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium" style={{ color: '#5A3D2E' }}>{item.name}</p>
                                                    <p className="text-gray-500 text-xs">{item.quantity} وحدة</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-sm" style={{ color: '#C4886D' }}>{item.revenue.toFixed(0)} ₪</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sales by Category */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4" style={{ border: '1px solid #F0D1C4' }}>
                            <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#5A3D2E' }}>
                                <span>📂</span> المبيعات حسب التصنيف
                            </h2>
                            {data.salesByCategory.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">لا توجد بيانات</p>
                            ) : (
                                <div className="space-y-2">
                                    {data.salesByCategory.map((cat, i) => {
                                        const maxRevenue = data.salesByCategory[0]?.revenue || 1;
                                        const widthPercent = (cat.revenue / maxRevenue) * 100;
                                        return (
                                            <div key={i} className="relative">
                                                <div className="flex items-center justify-between rounded-xl px-3 py-2.5 relative overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                                                    <div
                                                        className="absolute inset-y-0 right-0 bg-cafe-500/10 rounded-xl"
                                                        style={{ width: `${widthPercent}%` }}
                                                    />
                                                    <div className="relative flex items-center gap-2">
                                                        <p className="text-sm font-medium" style={{ color: '#5A3D2E' }}>{cat.name}</p>
                                                        <span className="text-gray-500 text-xs">({cat.count} وحدة)</span>
                                                    </div>
                                                    <span className="relative font-bold text-sm" style={{ color: '#C4886D' }}>{cat.revenue.toFixed(0)} ₪</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Daily Sales Table */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4" style={{ border: '1px solid #F0D1C4' }}>
                            <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#5A3D2E' }}>
                                <span>📅</span> المبيعات اليومية
                            </h2>
                            {data.dailySales.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">لا توجد بيانات</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-gray-600" style={{ borderBottom: '1px solid #F0D1C4' }}>
                                                <th className="text-right py-2 px-3">التاريخ</th>
                                                <th className="text-center py-2 px-3">الطلبات</th>
                                                <th className="text-left py-2 px-3">الإيراد</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.dailySales.map((day, i) => (
                                                <tr key={i} className="hover:bg-white/30" style={{ borderBottom: '1px solid #F0D1C4' }}>
                                                    <td className="py-2.5 px-3" style={{ color: '#5A3D2E' }}>{formatDate(day.date)}</td>
                                                    <td className="py-2.5 px-3 text-center text-blue-400">{day.count}</td>
                                                    <td className="py-2.5 px-3 text-left text-green-400 font-bold">{day.revenue.toFixed(0)} ₪</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="font-bold" style={{ borderTop: '2px solid #F0D1C4' }}>
                                                <td className="py-2.5 px-3" style={{ color: '#C4886D' }}>المجموع</td>
                                                <td className="py-2.5 px-3 text-center text-blue-300">{data.dailySales.reduce((s, d) => s + d.count, 0)}</td>
                                                <td className="py-2.5 px-3 text-left text-green-300">{data.dailySales.reduce((s, d) => s + d.revenue, 0).toFixed(0)} ₪</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-500 py-8">حدث خطأ في تحميل البيانات</p>
                )}
            </div>
        </div>
    );
}
