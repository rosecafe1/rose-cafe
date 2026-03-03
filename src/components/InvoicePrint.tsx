import { Clock } from "lucide-react";

interface OrderItemOption {
    id: string;
    optionNameAr: string;
    extraPrice: string;
}

interface OrderItem {
    id: string;
    itemNameAr: string;
    quantity: number;
    unitPrice: string;
    notes: string | null;
    options: OrderItemOption[];
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    notes: string | null;
    totalAmount: string;
    createdAt: string;
    table: { number: number };
    items: OrderItem[];
}

interface InvoicePrintProps {
    order: Order | null;
}

export default function InvoicePrint({ order }: InvoicePrintProps) {
    if (!order) return null;

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return new Intl.DateTimeFormat('ar-EG', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(d);
    };

    return (
        <div className="hidden print:block print:w-full print:bg-white print:text-black print:absolute print:top-0 print:left-0 print:right-0 print:z-50 p-4 print:p-12" dir="rtl">
            {/* Header */}
            <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-4">
                <img src="/images/logo.png" alt="Rose Cafe" className="w-16 h-16 mx-auto mb-2 grayscale" />
                <h1 className="text-xl font-bold">Rose Cafe - روز كافيه</h1>
                <p className="text-sm text-gray-600">اطلب من طاولتك</p>
                <div className="mt-4 flex justify-between items-center text-sm font-bold bg-gray-100 p-2 rounded">
                    <span>رقم الطلب: #{order.orderNumber.slice(-6).toUpperCase()}</span>
                    <span>طاولة: {order.table.number}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(order.createdAt)}
                </div>
            </div>

            {/* Items */}
            <div className="mb-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-300 text-right">
                            <th className="py-2">الصنف</th>
                            <th className="py-2 text-center w-12">الكمية</th>
                            <th className="py-2 text-left w-20">السعر</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {order.items.map((item) => (
                            <tr key={item.id}>
                                <td className="py-3">
                                    <div className="font-bold">{item.itemNameAr}</div>
                                    {item.options.length > 0 && (
                                        <div className="text-xs text-gray-600 mt-1">
                                            {item.options.map(o => o.optionNameAr).join('، ')}
                                        </div>
                                    )}
                                    {item.notes && (
                                        <div className="text-xs text-gray-500 mt-1">ملاحظة: {item.notes}</div>
                                    )}
                                </td>
                                <td className="py-3 text-center align-top">{item.quantity}</td>
                                <td className="py-3 text-left align-top font-mono">
                                    {((parseFloat(item.unitPrice) + item.options.reduce((sum, o) => sum + parseFloat(o.extraPrice || "0"), 0)) * item.quantity).toFixed(0)} ₪
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {order.notes && (
                <div className="mb-6 p-3 border border-gray-200 rounded text-sm bg-gray-50">
                    <strong>ملاحظات الطلب:</strong> {order.notes}
                </div>
            )}

            {/* Totals */}
            <div className="border-t-2 border-black pt-2 flex justify-between items-center text-lg font-bold">
                <span>المجموع الكلي:</span>
                <span className="font-mono">{parseFloat(order.totalAmount).toFixed(0)} ₪</span>
            </div>

            <div className="text-center mt-8 text-xs text-gray-500">
                <p>شكراً لزيارتكم روز كافيه!</p>
                <p className="mt-1">Thanks for visiting Rose Cafe!</p>
            </div>
        </div>
    );
}
