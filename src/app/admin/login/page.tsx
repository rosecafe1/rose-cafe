"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, User, Lock, ArrowLeft, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "فشل تسجيل الدخول");
                setLoading(false);
                return;
            }

            router.push("/admin/orders");
        } catch {
            setError("خطأ في الاتصال");
            setLoading(false);
        }
    };

    return (
        <div className="admin-page flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #C4886D, transparent)' }} />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #D4A76A, transparent)' }} />
            </div>

            <div className="w-full max-w-sm relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cafe-500 to-gold-500 flex items-center justify-center shadow-2xl shadow-cafe-500/20 animate-float">
                        <Coffee className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">روز كافيه</h1>
                    <p className="text-white/30 text-sm">لوحة التحكم</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="card-admin p-6 space-y-5 animate-scale-in">
                    <div>
                        <label className="block text-sm text-white/40 mb-2 font-medium">اسم المستخدم</label>
                        <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/20" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                                className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 focus:bg-white/8 transition-all text-sm"
                                placeholder="admin"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-white/40 mb-2 font-medium">كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/20" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 focus:bg-white/8 transition-all text-sm"
                                placeholder="••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center animate-scale-in">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${loading
                            ? "bg-white/5 text-white/20 cursor-not-allowed"
                            : "bg-gradient-to-r from-cafe-500 to-gold-500 text-white shadow-lg shadow-cafe-500/20 hover:shadow-cafe-500/40 active:scale-[0.98]"
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                جاري الدخول...
                            </>
                        ) : (
                            <>
                                <ArrowLeft className="w-4 h-4" />
                                تسجيل الدخول
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-white/10 text-xs mt-6">Rose Cafe © 2026</p>
            </div>
        </div>
    );
}
