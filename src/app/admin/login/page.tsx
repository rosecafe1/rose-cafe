"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-cafe-300 mb-2">☕ روز كافيه</h1>
                    <p className="text-gray-500">لوحة التحكم</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#1e2a45] rounded-2xl p-6 border border-cafe-800/20 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">اسم المستخدم</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                            className="w-full bg-[#16213e] border border-cafe-800/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cafe-400"
                            placeholder="admin"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">كلمة المرور</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-[#16213e] border border-cafe-800/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cafe-400"
                            placeholder="••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${loading
                                ? "bg-gray-700 text-gray-500"
                                : "bg-cafe-500 text-white hover:bg-cafe-400 active:scale-[0.98]"
                            }`}
                    >
                        {loading ? "جاري الدخول..." : "تسجيل الدخول"}
                    </button>
                </form>
            </div>
        </div>
    );
}
