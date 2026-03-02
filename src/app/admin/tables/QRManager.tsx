"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

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

    // Generate QR codes when tables or baseUrl change
    useEffect(() => {
        if (!baseUrl || tables.length === 0) return;
        const generateQRs = async () => {
            const images: Record<number, string> = {};
            for (const table of tables) {
                const url = `${baseUrl}/t/${table.number}`;
                // Generate base QR with pink color
                const qrDataUrl = await QRCode.toDataURL(url, {
                    width: 1000,
                    margin: 2,
                    color: { dark: "#C4886D", light: "#FFF8F4" },
                    errorCorrectionLevel: "H",
                });

                // Add logo overlay in center
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = 1000;
                    canvas.height = 1000;
                    const ctx = canvas.getContext("2d")!;

                    // Draw QR code
                    const qrImg = new Image();
                    qrImg.src = qrDataUrl;
                    await new Promise((resolve) => { qrImg.onload = resolve; });
                    ctx.drawImage(qrImg, 0, 0, 1000, 1000);

                    // Draw logo in center
                    const logo = new Image();
                    logo.src = "/images/logo.jpg";
                    await new Promise((resolve, reject) => { logo.onload = resolve; logo.onerror = reject; });
                    const logoSize = 250;
                    const x = (1000 - logoSize) / 2;
                    const y = (1000 - logoSize) / 2;

                    // White circle background
                    ctx.beginPath();
                    ctx.arc(500, 500, logoSize / 2 + 15, 0, Math.PI * 2);
                    ctx.fillStyle = "#FFF8F4";
                    ctx.fill();
                    ctx.strokeStyle = "#C4886D";
                    ctx.lineWidth = 6;
                    ctx.stroke();

                    // Clip to circle and draw logo
                    ctx.beginPath();
                    ctx.arc(500, 500, logoSize / 2, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(logo, x, y, logoSize, logoSize);

                    images[table.number] = canvas.toDataURL("image/png");
                } catch {
                    // Fallback: use QR without logo if logo fails to load
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
        await fetch(`/api/admin/tables/${table.id}`, { method: "DELETE" });
        fetchTables();
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-cafe-300 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <>
            {/* Screen view */}
            <div className="min-h-screen pb-8 print:hidden">
                <header className="sticky top-0 z-40 backdrop-blur-md" style={{ backgroundColor: 'rgba(255,248,244,0.95)', borderBottom: '1px solid #F0D1C4' }}>
                    <div className="px-4 py-3 flex items-center justify-between">
                        <h1 className="text-lg font-bold" style={{ color: '#9C6A50' }}>📱 QR الطاولات</h1>
                        <div className="flex gap-2">
                            <button onClick={() => router.push("/admin/accounting")} className="text-sm px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#9C6A50' }}>
                                📊 المحاسبة
                            </button>
                            <button onClick={() => router.push("/admin/orders")} className="text-sm px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#9C6A50' }}>
                                📋 الطلبات
                            </button>
                            <button onClick={() => router.push("/admin/menu")} className="text-sm px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#9C6A50' }}>
                                🍽️ القائمة
                            </button>
                        </div>
                    </div>
                </header>

                <div className="px-4 mt-4 space-y-4">
                    {/* Actions */}
                    <div className="flex gap-2">
                        <button onClick={() => setShowAddModal(true)} className="bg-cafe-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-cafe-400 active:scale-95 transition-all">
                            + إضافة طاولة
                        </button>
                        <button onClick={handlePrint} className="bg-[#1e2a45] text-cafe-300 text-sm px-4 py-2 rounded-xl border border-cafe-800/30 hover:bg-cafe-600/20 active:scale-95 transition-all">
                            🖨️ طباعة الكل
                        </button>
                    </div>

                    {/* Tables grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {tables.map((table) => (
                            <div
                                key={table.id}
                                className={`bg-white/60 rounded-2xl p-3 text-center ${!table.isActive ? "opacity-50" : ""}`}
                                style={{ border: '1px solid #F0D1C4' }}
                            >
                                {qrImages[table.number] && (
                                    <div className="bg-white p-2 rounded-xl inline-block mb-2 shadow-sm border border-[#F0D1C4]/50">
                                        <img src={qrImages[table.number]} alt={`QR طاولة ${table.number}`} className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto" />
                                    </div>
                                )}
                                <p className="font-bold text-sm" style={{ color: '#5A3D2E' }}>طاولة {table.number}</p>
                                <p className="text-gray-500 text-[10px] truncate mt-0.5">{baseUrl}/t/{table.number}</p>
                                <div className="flex items-center justify-center gap-1 mt-2">
                                    <button onClick={() => toggleTable(table)} className={`text-[10px] px-2 py-1 rounded-lg ${table.isActive ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>
                                        {table.isActive ? "فعال" : "معطل"}
                                    </button>
                                    <button onClick={() => deleteTable(table)} className="text-[10px] text-gray-500 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10">
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Table Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowAddModal(false)}>
                        <div className="w-full max-w-md rounded-t-2xl p-6 animate-slide-up" style={{ backgroundColor: '#FFF8F4' }} onClick={(e) => e.stopPropagation()}>
                            <h3 className="font-bold mb-4" style={{ color: '#5A3D2E' }}>إضافة طاولة</h3>
                            <input
                                type="number" placeholder="رقم الطاولة" value={newTableNum}
                                onChange={(e) => setNewTableNum(e.target.value)} autoFocus
                                className="w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #F0D1C4', color: '#5A3D2E' }}
                            />
                            <div className="flex gap-2 mt-4">
                                <button onClick={addTable} className="flex-1 text-white py-3 rounded-xl font-bold active:scale-95" style={{ backgroundColor: '#C4886D' }}>
                                    إضافة
                                </button>
                                <button onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl font-bold active:scale-95" style={{ backgroundColor: 'transparent', border: '1px solid #F0D1C4', color: '#9C6A50' }}>
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Print view - only visible when printing */}
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
                            <img src="/images/logo.jpg" alt="Rose Cafe" style={{ width: "50px", height: "50px", margin: "0 auto 2mm" }} />
                            <p style={{ fontSize: "14px", fontWeight: "bold", color: "#1a1a2e" }}>
                                روز كافيه
                            </p>
                            <p style={{ fontSize: "22px", fontWeight: "bold", color: "#d63d6e" }}>
                                طاولة {table.number}
                            </p>
                            <p style={{ fontSize: "10px", color: "#888", marginTop: "2mm" }}>
                                امسح الكود للطلب
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
