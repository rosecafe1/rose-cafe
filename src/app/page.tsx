export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md">
                <img
                    src="/images/logo.png"
                    alt="Rose Cafe"
                    className="w-40 h-40 mx-auto mb-6 drop-shadow-2xl"
                />
                <h1 className="text-4xl font-bold mb-1 text-cafe-300">
                    Rose Cafe
                </h1>
                <p className="text-lg text-gray-500 mb-6">روز كافيه</p>
                <p className="text-xl text-gray-400 mb-8">
                    امسح رمز QR على طاولتك لتصفح القائمة والطلب
                </p>
                <div className="bg-cafe-800/50 rounded-2xl p-6 border border-cafe-700/30">
                    <p className="text-cafe-200 text-lg">
                        نظام طلبات الطاولة الرقمي
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        v1.0.0
                    </p>
                </div>
            </div>
        </main>
    );
}
