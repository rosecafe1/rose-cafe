import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center">
                <p className="text-6xl mb-4">😕</p>
                <h1 className="text-2xl font-bold text-cafe-300 mb-2">
                    الصفحة غير موجودة
                </h1>
                <p className="text-gray-400 mb-6">
                    رقم الطاولة غير صحيح أو غير موجود
                </p>
                <Link
                    href="/"
                    className="bg-cafe-600 text-white px-6 py-3 rounded-xl hover:bg-cafe-500 transition-colors"
                >
                    العودة للرئيسية
                </Link>
            </div>
        </div>
    );
}
