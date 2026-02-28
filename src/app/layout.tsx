import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Rose Cafe — روز كافيه",
    description: "اطلب من طاولتك مباشرة — قائمة طعام رقمية",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body className="antialiased">{children}</body>
        </html>
    );
}
