import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "لوحة التحكم — روز كافيه",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#FCEEE8',
                backgroundImage: 'url(/images/menu-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
            }}
        >
            {children}
        </div>
    );
}
