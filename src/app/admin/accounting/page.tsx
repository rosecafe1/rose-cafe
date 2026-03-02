"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Package, DollarSign, Trophy, Flame, FolderOpen, CalendarDays, ArrowLeft, XCircle } from "lucide-react";

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
        <div className="admin-page min-h-screen" dir="rtl">
            {/* Header */}
            <header className="sticky top-0 z-40 glass-dark" style={{ borderBottom: '1px solid rgba(196,136,109,0.1)' }}>
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cafe-500 to-gold-500 flex items-center justify-center shadow-lg shadow-cafe-500/20">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white">المحاسبة</h1>
                            <p className="text-xs text-white/30">تقارير المبيعات</p>
                        </div>
                    </div>
                    <button onClick={() => router.push("/admin/orders")} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                        الطلبات
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-4 space-y-4">
                {/* Period Filter */}
                <div className="card-admin p-3">
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
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${period === p.key
                                    ? "text-white shadow-lg"
                                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                    }`}
                                style={period === p.key ? { background: 'linear-gradient(135deg, #C4886D, #D4A76A)' } : {}}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    {period === "custom" && (
                        <div className="flex gap-2 items-center mt-2">
                            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cafe-400/50 transition-all" />
                            <span className="text-white/20">→</span>
                            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cafe-400/50 transition-all" />
                            <button onClick={applyCustom} className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #C4886D, #D4A76A)' }}>
                                بحث
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin w-10 h-10 border-3 border-cafe-500/30 border-t-cafe-400 rounded-full mx-auto mb-4"></div>
                        <p className="text-white/30 text-sm">جاري التحميل...</p>
                    </div>
                ) : data ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="card-admin p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                        <DollarSign className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <span className="text-xs text-white/40 font-bold">إجمالي المبيعات</span>
                                </div>
                                <p className="text-2xl font-bold text-emerald-400">{data.totalRevenue.toFixed(0)} <span className="text-sm text-emerald-400/60">₪</span></p>
                            </div>
                            <div className="card-admin p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                                        <Package className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <span className="text-xs text-white/40 font-bold">عدد الطلبات</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-400">{data.orderCount}</p>
                                {data.cancelledCount > 0 && (
                                    <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><XCircle className="w-3 h-3" /> {data.cancelledCount} ملغي</p>
                                )}
                            </div>
                            <div className="card-admin p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <span className="text-xs text-white/40 font-bold">متوسط الطلب</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-400">{data.avgOrder.toFixed(0)} <span className="text-sm text-purple-400/60">₪</span></p>
                            </div>
                            <div className="card-admin p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                                        <Trophy className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <span className="text-xs text-white/40 font-bold">الأكثر مبيعاً</span>
                                </div>
                                <p className="text-lg font-bold text-amber-300 truncate">
                                    {data.topItems.length > 0 ? data.topItems[0].name : "—"}
                                </p>
                            </div>
                        </div>

                        {/* Top Selling Items */}
                        <div className="card-admin p-4">
                            <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-white/60">
                                <Flame className="w-4 h-4 text-orange-400" />
                                أكثر الأصناف مبيعاً
                            </h2>
                            {data.topItems.length === 0 ? (
                                <p className="text-white/20 text-sm text-center py-4">لا توجد بيانات</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {data.topItems.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] transition-all">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-500/20 text-amber-400" :
                                                    i === 1 ? "bg-gray-400/20 text-gray-400" :
                                                        i === 2 ? "bg-orange-500/20 text-orange-400" :
                                                            "bg-white/5 text-white/30"
                                                    }`}>
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-white/80">{item.name}</p>
                                                    <p className="text-white/20 text-xs">{item.quantity} وحدة</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-sm text-cafe-300">{item.revenue.toFixed(0)} ₪</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sales by Category */}
                        <div className="card-admin p-4">
                            <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-white/60">
                                <FolderOpen className="w-4 h-4 text-blue-400" />
                                المبيعات حسب التصنيف
                            </h2>
                            {data.salesByCategory.length === 0 ? (
                                <p className="text-white/20 text-sm text-center py-4">لا توجد بيانات</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {data.salesByCategory.map((cat, i) => {
                                        const maxRevenue = data.salesByCategory[0]?.revenue || 1;
                                        const widthPercent = (cat.revenue / maxRevenue) * 100;
                                        return (
                                            <div key={i} className="relative">
                                                <div className="flex items-center justify-between rounded-xl px-3 py-2.5 relative overflow-hidden bg-white/[0.03]">
                                                    <div
                                                        className="absolute inset-y-0 right-0 bg-cafe-500/8 rounded-xl"
                                                        style={{ width: `${widthPercent}%` }}
                                                    />
                                                    <div className="relative flex items-center gap-2">
                                                        <p className="text-sm font-medium text-white/80">{cat.name}</p>
                                                        <span className="text-white/20 text-xs">({cat.count} وحدة)</span>
                                                    </div>
                                                    <span className="relative font-bold text-sm text-cafe-300">{cat.revenue.toFixed(0)} ₪</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Daily Sales Table */}
                        <div className="card-admin p-4">
                            <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-white/60">
                                <CalendarDays className="w-4 h-4 text-cyan-400" />
                                المبيعات اليومية
                            </h2>
                            {data.dailySales.length === 0 ? (
                                <p className="text-white/20 text-sm text-center py-4">لا توجد بيانات</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-white/30" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <th className="text-right py-2 px-3 font-bold">التاريخ</th>
                                                <th className="text-center py-2 px-3 font-bold">الطلبات</th>
                                                <th className="text-left py-2 px-3 font-bold">الإيراد</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.dailySales.map((day, i) => (
                                                <tr key={i} className="hover:bg-white/[0.03] transition-all" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <td className="py-2.5 px-3 text-white/70">{formatDate(day.date)}</td>
                                                    <td className="py-2.5 px-3 text-center text-blue-400">{day.count}</td>
                                                    <td className="py-2.5 px-3 text-left text-emerald-400 font-bold">{day.revenue.toFixed(0)} ₪</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="font-bold" style={{ borderTop: '2px solid rgba(196,136,109,0.15)' }}>
                                                <td className="py-2.5 px-3 text-cafe-300">المجموع</td>
                                                <td className="py-2.5 px-3 text-center text-blue-300">{data.dailySales.reduce((s, d) => s + d.count, 0)}</td>
                                                <td className="py-2.5 px-3 text-left text-emerald-300">{data.dailySales.reduce((s, d) => s + d.revenue, 0).toFixed(0)} ₪</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <p className="text-center text-white/30 py-8">حدث خطأ في تحميل البيانات</p>
                )}
            </div>
        </div>
    );
}
