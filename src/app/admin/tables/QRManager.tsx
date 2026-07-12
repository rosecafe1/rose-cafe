"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { QrCode, Printer, Download, ChefHat } from "lucide-react";

const SITE_URL = "https://www.rosecafe.store/";

export default function QRManager() {
    const router = useRouter();
    const [qrImage, setQrImage] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const generateQR = async () => {
            const qrDataUrl = await QRCode.toDataURL(SITE_URL, {
                width: 1000, margin: 2,
                color: { dark: "#be185d", light: "#FFF1F2" },
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
                logo.src = "/images/logo.png";
                await new Promise((resolve, reject) => { logo.onload = resolve; logo.onerror = reject; });
                const logoSize = 320;
                const x = (1000 - logoSize) / 2;
                const y = (1000 - logoSize) / 2;
                ctx.beginPath();
                ctx.arc(500, 500, logoSize / 2 + 15, 0, Math.PI * 2);
                ctx.fillStyle = "#FFF1F2";
                ctx.fill();
                ctx.strokeStyle = "#be185d";
                ctx.lineWidth = 6;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(500, 500, logoSize / 2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(logo, x, y, logoSize, logoSize);
                setQrImage(canvas.toDataURL("image/png"));
            } catch {
                setQrImage(qrDataUrl);
            }
            setLoading(false);
        };
        generateQR();
    }, []);

    const handleDownload = () => {
        if (!qrImage) return;
        const link = document.createElement("a");
        link.href = qrImage;
        link.download = "Rose_Cafe_Menu_QR.png";
        link.click();
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = "Rose_Cafe_Menu_QR";
        window.print();
        document.title = originalTitle;
    };

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
                                <h1 className="text-base font-bold text-white">QR المنيو</h1>
                                <p className="text-xs text-white/30">رمز واحد للقائمة</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => router.push("/admin/menu")} className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all" title="القائمة">
                                <ChefHat className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="max-w-md mx-auto px-4 mt-8">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin w-10 h-10 border-3 border-cafe-500/30 border-t-cafe-400 rounded-full mx-auto mb-4"></div>
                            <p className="text-white/30 text-sm">جاري إنشاء الرمز...</p>
                        </div>
                    ) : (
                        <div className="card-admin text-center p-6 animate-fade-in">
                            {qrImage && (
                                <div className="bg-white/[0.03] p-4 rounded-2xl inline-block mb-4 border border-white/5">
                                    <img src={qrImage} alt="QR المنيو" className="w-56 h-56 md:w-64 md:h-64 object-contain mx-auto" />
                                </div>
                            )}
                            <p className="font-bold text-white/90">امسح لعرض القائمة</p>
                            <p className="text-white/30 text-xs mt-1 font-mono break-all" dir="ltr">{SITE_URL}</p>

                            <div className="flex gap-2 mt-6">
                                <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1.5 text-sm px-4 py-3 rounded-xl font-bold transition-all active:scale-95 text-white shadow-lg shadow-cafe-500/20" style={{ background: 'linear-gradient(135deg, #C4886D, #D4A76A)' }}>
                                    <Download className="w-4 h-4" />
                                    تنزيل PNG
                                </button>
                                <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-1.5 text-sm px-4 py-3 rounded-xl font-bold transition-all active:scale-95 text-white/50 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5">
                                    <Printer className="w-4 h-4" />
                                    طباعة
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Print view */}
            <div className="hidden print:block">
                <style>{`
                    @media print {
                        @page { margin: 0; }
                        body { background: white !important; color: black !important; padding: 10mm; }
                    }
                `}</style>
                <div style={{ textAlign: "center", padding: "20mm 5mm" }}>
                    <p style={{ fontSize: "32px", fontWeight: "bold", color: "#be185d", marginBottom: "4mm", letterSpacing: "1px" }}>منـــيـــو</p>
                    {qrImage && (
                        <img src={qrImage} alt="" style={{ width: "100%", maxWidth: "300px", margin: "0 auto" }} />
                    )}
                    <p style={{ fontSize: "32px", fontWeight: "bold", color: "#be185d", marginTop: "4mm", letterSpacing: "1px" }}>Menu</p>
                    <p style={{ fontSize: "20px", fontWeight: "bold", color: "#3D2214", marginTop: "6mm" }}>Rose Cafe · روز كافيه</p>
                </div>
            </div>
        </>
    );
}
