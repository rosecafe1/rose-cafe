"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { QrCode, Plus, Printer, Trash2, Eye, EyeOff, X, ArrowLeft, ChefHat, ClipboardList } from "lucide-react";

interface Table {
    id: string;
    number: number;
    label: string;
    isActive: boolean;
}

export default function QRManager() {
    const router = useRouter();
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrImages, setQrImages] = useState<Record<number, string>>({});
    const [baseUrl, setBaseUrl] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTableNum, setNewTableNum] = useState("");
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setBaseUrl(window.location.origin);
        fetchTables();
    }, []);

    const fetchTables = async () => {
        const res = await fetch("/api/admin/tables");
        if (res.status === 401) { router.push("/admin/login"); return; }
        const data = await res.json();
        setTables(data.tables || []);
        setLoading(false);
    };

    useEffect(() => {
        if (!baseUrl || tables.length === 0) return;
        const generateQRs = async () => {
            const images: Record<number, string> = {};
            for (const table of tables) {
                const url = `${baseUrl}/t/${table.number}`;
                const qrDataUrl = await QRCode.toDataURL(url, {
                    width: 1000, margin: 2,
                    color: { dark: "#C4886D", light: "#FFF8F4" },
                    errorCorrectionLevel: "H",
                });
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = 1000; canvas.height = 1000;
                    const ctx = canvas.getContext("2d")!;
                    const qrImg = new Image();
                    qrImg.src = qrDataUrl;
                    await new Promise((resolve) => { qrImg.onload = resolve; });
                    ctx.drawImage(qrImg, 0, 0, 1000, 1000);
                    const logo = new Image();
                    logo.src = "/images/logo.jpg";
                    await new Promise((resolve, reject) => { logo.onload = resolve; logo.onerror = reject; });
                    const logoSize = 250;
                    const x = (1000 - logoSize) / 2;
                    const y = (1000 - logoSize) / 2;
                    ctx.beginPath();
                    ctx.arc(500, 500, logoSize / 2 + 15, 0, Math.PI * 2);
                    ctx.fillStyle = "#FFF8F4";
                    ctx.fill();
                    ctx.strokeStyle = "#C4886D";
                    ctx.lineWidth = 6;
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(500, 500, logoSize / 2, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(logo, x, y, logoSize, logoSize);
                    images[table.number] = canvas.toDataURL("image/png");
                } catch {
                    images[table.number] = qrDataUrl;
                }
            }
            setQrImages(images);
        };
        generateQRs();
    }, [tables, baseUrl]);

    const addTable = async () => {
        const num = parseInt(newTableNum);
        if (!num || num < 1) return;
        await fetch("/api/admin/tables", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ number: num }),
        });
        setShowAddModal(false);
        setNewTableNum("");
        fetchTables();
    };

    const toggleTable = async (table: Table) => {
        await fetch(`/api/admin/tables/${table.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !table.isActive }),
        });
        fetchTables();
    };

    const deleteTable = async (table: Table) => {
        if (!confirm(`حذف طاولة ${table.number}؟`)) return;
        await fetch(`/api/admin/tables/${table.id}`, { method: "DELETE" });
        fetchTables();
    };

    const handlePrint = () => { window.print(); };

    if (loading) {
        return (
            <div className="admin-page flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-3 border-cafe-500/30 border-t-cafe-400 rounded-full mx-auto mb-4"></div>
                    <p className="text-white/30 text-sm">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Screen view */}
            <div className="admin-page min-h-screen pb-8 print:hidden">
                {/* Header */}
                <header className="sticky top-0 z-40 glass-dark" style={{ borderBottom: '1px solid rgba(196,136,109,0.1)' }}>
                    <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cafe-500 to-gold-500 flex items-center justify-center shadow-lg shadow-cafe-500/20">
                                <QrCode className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-white">QR الطاولات</h1>
                                <p className="text-xs text-white/30">{tables.length} طاولة</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => router.push("/admin/orders")} className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all" title="الطلبات">
                                <ClipboardList className="w-5 h-5" />
                            </button>
                            <button onClick={() => router.push("/admin/menu")} className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all" title="القائمة">
                                <ChefHat className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto px-4 mt-4 space-y-4">
                    {/* Actions */}
                    <div className="flex gap-2">
                        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-white shadow-lg shadow-cafe-500/20" style={{ background: 'linear-gradient(135deg, #C4886D, #D4A76A)' }}>
                            <Plus className="w-4 h-4" />
                            إضافة طاولة
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-white/50 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5">
                            <Printer className="w-4 h-4" />
                            طباعة الكل
                        </button>
                    </div>

                    {/* Tables grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {tables.map((table, i) => (
                            <div
                                key={table.id}
                                className={`card-admin text-center p-4 animate-fade-in ${!table.isActive ? "opacity-40" : ""}`}
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                {qrImages[table.number] && (
                                    <div className="bg-white/[0.03] p-2.5 rounded-xl inline-block mb-3 border border-white/5">
                                        <img src={qrImages[table.number]} alt={`QR طاولة ${table.number}`} className="w-28 h-28 md:w-36 md:h-36 object-contain mx-auto" />
                                    </div>
                                )}
                                <p className="font-bold text-sm text-white/90">طاولة {table.number}</p>
                                <p className="text-white/20 text-[10px] truncate mt-0.5 font-mono">{baseUrl}/t/{table.number}</p>
                                <div className="flex items-center justify-center gap-1.5 mt-3">
                                    <button
                                        onClick={() => toggleTable(table)}
                                        className={`text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${table.isActive
                                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 hover:bg-emerald-500/20"
                                            : "text-red-400 bg-red-500/10 border border-red-500/15 hover:bg-red-500/20"
                                            }`}
                                    >
                                        {table.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                        {table.isActive ? "فعال" : "معطل"}
                                    </button>
                                    <button
                                        onClick={() => deleteTable(table)}
                                        className="text-[11px] text-white/20 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {tables.length === 0 && (
                        <div className="text-center py-16">
                            <QrCode className="w-12 h-12 text-white/10 mx-auto mb-3" />
                            <p className="text-white/30 text-sm">لا توجد طاولات — أضف طاولة جديدة</p>
                        </div>
                    )}
                </div>

                {/* Add Table Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <div className="relative w-full max-w-sm card-admin p-5 space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-bold">إضافة طاولة</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-white/30 hover:text-white p-1"><X className="w-5 h-5" /></button>
                            </div>
                            <input
                                type="number" placeholder="رقم الطاولة" value={newTableNum}
                                onChange={(e) => setNewTableNum(e.target.value)} autoFocus
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 transition-all"
                            />
                            <div className="flex gap-2 pt-2">
                                <button onClick={addTable} className="flex-1 text-white py-3 rounded-xl font-bold text-sm active:scale-[0.97] transition-all shadow-lg shadow-cafe-500/20" style={{ background: 'linear-gradient(135deg, #C4886D, #D4A76A)' }}>
                                    إضافة
                                </button>
                                <button onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm">
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Print view */}
            <div className="hidden print:block" ref={printRef}>
                <style>{`
                    @media print {
                        @page { margin: 10mm; }
                        body { background: white !important; color: black !important; }
                    }
                `}</style>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15mm", padding: "5mm" }}>
                    {tables.filter((t) => t.isActive).map((table) => (
                        <div key={table.id} style={{ textAlign: "center", pageBreakInside: "avoid", border: "2px solid #ddd", borderRadius: "12px", padding: "8mm" }}>
                            {qrImages[table.number] && (
                                <img src={qrImages[table.number]} alt="" style={{ width: "100%", maxWidth: "180px", margin: "0 auto" }} />
                            )}
                            <img src="/images/logo.jpg" alt="Rose Cafe" style={{ width: "50px", height: "50px", margin: "0 auto 2mm", borderRadius: "50%" }} />
                            <p style={{ fontSize: "14px", fontWeight: "bold", color: "#3D2214" }}>روز كافيه</p>
                            <p style={{ fontSize: "22px", fontWeight: "bold", color: "#C4886D" }}>طاولة {table.number}</p>
                            <p style={{ fontSize: "10px", color: "#888", marginTop: "2mm" }}>امسح الكود للطلب</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
