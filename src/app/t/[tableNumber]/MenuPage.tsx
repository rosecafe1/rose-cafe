"use client";

import { useState, useEffect } from "react";
import { CartProvider, useCart } from "@/lib/cart-context";
import ItemDetailModal from "@/components/ItemDetailModal";
import CartSheet from "@/components/CartSheet";

interface MenuOption {
    id: number;
    nameAr: string;
    nameEn: string;
    extraPrice: string;
    isDefault: boolean;
}

interface MenuOptionGroup {
    id: number;
    nameAr: string;
    nameEn: string;
    isRequired: boolean;
    isMultiple: boolean;
    options: MenuOption[];
}

interface MenuItem {
    id: number;
    nameAr: string;
    nameEn: string;
    descriptionAr: string | null;
    price: string;
    image: string | null;
    isAvailable: boolean;
    optionGroups: MenuOptionGroup[];
}

interface Category {
    id: number;
    nameAr: string;
    nameEn: string;
    image: string | null;
    items: MenuItem[];
}

export default function MenuPage({ tableNumber }: { tableNumber: number }) {
    return (
        <CartProvider>
            <MenuContent tableNumber={tableNumber} />
        </CartProvider>
    );
}

function MenuContent({ tableNumber }: { tableNumber: number }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    useEffect(() => {
        fetch("/api/menu")
            .then((r) => r.json())
            .then((data) => {
                setCategories(data.categories);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredCategories = categories
        .map((cat) => ({
            ...cat,
            items: cat.items.filter(
                (item) =>
                    item.nameAr.includes(search) ||
                    item.nameEn.toLowerCase().includes(search.toLowerCase())
            ),
        }))
        .filter((cat) => cat.items.length > 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-cafe-300 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">جاري تحميل القائمة...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center" style={{ backgroundColor: '#FCEEE8', backgroundImage: 'url(/images/menu-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
            <div className="w-full max-w-[600px] min-h-screen pb-24 relative shadow-2xl" style={{ backgroundColor: 'rgba(252,238,232,0.55)', borderLeft: '1px solid #F0D1C4', borderRight: '1px solid #F0D1C4' }}>

                {/* Header */}
                <header className="sticky top-0 z-40 backdrop-blur-md" style={{ backgroundColor: 'rgba(252,238,232,0.92)', borderBottom: '1px solid #F0D1C4' }}>
                    <div className="px-4 pt-4 pb-3">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <img src="/images/logo.jpg" alt="Rose Cafe" className="w-10 h-10 rounded-full" />
                                <div>
                                    <h1 className="text-lg font-bold text-cafe-600">Rose Cafe</h1>
                                    <p className="text-[10px] text-gray-500">روز كافيه · اطلب من طاولتك</p>
                                </div>
                            </div>
                            <div className="text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md" style={{ backgroundColor: '#C4886D', boxShadow: '0 4px 14px rgba(196,136,109,0.3)' }}>
                                طاولة {tableNumber}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="🔍 ابحث عن صنف..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all shadow-sm"
                                style={{ backgroundColor: '#FFF5F0', border: '1px solid #F0D1C4', outlineColor: '#C4886D' }}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cafe-500"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Categories with Items */}
                <div className="px-3 mt-4 space-y-6 relative z-10">
                    {filteredCategories.map((cat) => (
                        <section key={cat.id} id={`cat-${cat.id}`}>
                            {/* Category Header */}
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <span className="text-xl">{cat.image}</span>
                                <h2 className="text-base font-bold text-cafe-800">{cat.nameAr}</h2>
                                <span className="text-xs text-gray-500">({cat.items.length})</span>
                                <div className="flex-1 h-[1px] mr-2" style={{ backgroundColor: '#EDCABC' }}></div>
                            </div>

                            {/* Items Grid - 3 columns */}
                            <div className="grid grid-cols-3 gap-2">
                                {cat.items.map((item) => (
                                    <ProductCard
                                        key={item.id}
                                        item={item}
                                        onTap={() => setSelectedItem(item)}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-4xl mb-3">🔍</p>
                            <p className="text-gray-400">لا توجد نتائج لـ &quot;{search}&quot;</p>
                        </div>
                    )}
                </div>

                {/* Item Detail Modal */}
                {selectedItem && (
                    <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
                )}

                {/* Cart Sheet */}
                <CartSheet tableNumber={tableNumber} />
            </div>
        </div>
    );
}

function ProductCard({ item, onTap }: { item: MenuItem; onTap: () => void }) {
    const { addItem, items: cartItems, updateQuantity, removeItem } = useCart();

    const cartEntry = cartItems.find((ci) => ci.menuItemId === item.id);
    const cartQty = cartEntry?.quantity || 0;
    const hasOptions = item.optionGroups.length > 0;

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasOptions) {
            onTap();
            return;
        }
        addItem({
            menuItemId: item.id,
            nameAr: item.nameAr,
            basePrice: parseFloat(item.price),
            quantity: 1,
            options: [],
            notes: "",
        });
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (cartEntry) updateQuantity(cartEntry.id, cartQty + 1);
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (cartEntry && cartQty > 1) {
            updateQuantity(cartEntry.id, cartQty - 1);
        } else if (cartEntry) {
            removeItem(cartEntry.id);
        }
    };

    return (
        <div
            onClick={onTap}
            className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.97] cursor-pointer flex flex-col relative"
            style={{ backgroundColor: '#FFF8F4', border: '1px solid #F0D1C4' }}
        >
            {/* Image Area */}
            <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: '#FCEEE8' }}>
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.nameAr}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl opacity-50 grayscale">🌸</span>
                    </div>
                )}

                {/* Cart quantity badge */}
                {cartQty > 0 && (
                    <div className="absolute top-2 right-2 bg-cafe-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                        {cartQty}
                    </div>
                )}

                {/* Options badge */}
                {hasOptions && (
                    <div className="absolute top-2 left-2 backdrop-blur-sm px-1.5 py-0.5 rounded font-medium text-[9px] shadow-sm" style={{ backgroundColor: 'rgba(255,248,244,0.9)', color: '#9C6A50', border: '1px solid #F0D1C4' }}>
                        خيارات
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-2 flex-1 flex flex-col">
                <h3 className="font-bold text-cafe-900 text-xs leading-tight line-clamp-2">{item.nameAr}</h3>
                {item.descriptionAr && (
                    <p className="text-gray-500 text-[10px] mt-0.5 line-clamp-1">{item.descriptionAr}</p>
                )}

                {/* Price + Add */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-cafe-600 font-bold text-xs">
                        {parseFloat(item.price).toFixed(0)} ₪
                    </span>

                    <div onClick={(e) => e.stopPropagation()}>
                        {cartQty > 0 && !hasOptions ? (
                            <div className="flex items-center gap-1">
                                <button onClick={handleDecrement} className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] active:scale-90 font-bold" style={{ backgroundColor: '#F5D5C8', color: '#9C6A50' }}>
                                    −
                                </button>
                                <span className="text-cafe-800 font-bold text-[10px] w-3 text-center">{cartQty}</span>
                                <button onClick={handleIncrement} className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] active:scale-90 font-bold" style={{ backgroundColor: '#C4886D' }}>
                                    +
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleQuickAdd} className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold active:scale-90 transition-all shadow-md" style={{ backgroundColor: '#C4886D', boxShadow: '0 4px 10px rgba(196,136,109,0.3)' }}>
                                +
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
