"use client";

import { useState, useEffect } from "react";
import { CartProvider, useCart } from "@/lib/cart-context";
import ItemDetailModal from "@/components/ItemDetailModal";
import CartSheet from "@/components/CartSheet";
import { Search, X, Flower2 } from "lucide-react";

interface MenuOption {
    id: string;
    nameAr: string;
    nameEn: string;
    extraPrice: string;
    isDefault: boolean;
}

interface MenuOptionGroup {
    id: string;
    nameAr: string;
    nameEn: string;
    isRequired: boolean;
    isMultiple: boolean;
    options: MenuOption[];
}

interface MenuItem {
    id: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string | null;
    price: string;
    image: string | null;
    isAvailable: boolean;
    optionGroups: MenuOptionGroup[];
}

interface Category {
    id: string;
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

    // Typewriter effect for search placeholder
    const [placeholder, setPlaceholder] = useState("");
    const targetPlaceholder = "ابحث عن صنف...";
    useEffect(() => {
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < targetPlaceholder.length) {
                setPlaceholder(targetPlaceholder.slice(0, i + 1));
                i++;
            } else {
                setTimeout(() => { i = 0; setPlaceholder(""); }, 2000);
            }
        }, 150);
        return () => clearInterval(typingInterval);
    }, []);

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
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FDF6F0, #FCEEE8)' }}>
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cafe-500 to-gold-500 flex items-center justify-center mx-auto mb-4 animate-pulse shadow-warm-lg">
                        <span className="text-3xl">☕</span>
                    </div>
                    <p className="text-cafe-500/50 text-sm font-medium">جاري تحميل القائمة...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center relative" style={{ background: 'linear-gradient(180deg, #FDF6F0 0%, #FCEEE8 30%, #FFF5EE 100%)' }}>
            {/* Background Image */}
            <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'url(/images/menu-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 0.35 }} />
            <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(253,246,240,0.3) 0%, rgba(252,238,232,0.15) 40%, rgba(255,245,238,0.4) 100%)' }} />
            <div className="w-full max-w-[600px] min-h-screen pb-24 relative z-10" style={{ borderLeft: '1px solid rgba(196,136,109,0.08)', borderRight: '1px solid rgba(196,136,109,0.08)' }}>

                {/* Header */}
                <header className="sticky top-0 z-40 glass" style={{ borderBottom: '1px solid rgba(196,136,109,0.1)' }}>
                    <div className="px-4 pt-4 pb-3">
                        <div className="flex flex-col items-center justify-center mb-5 relative">
                            <div className="absolute left-0 top-0">
                                <div className="px-3 py-1.5 rounded-xl text-sm font-extrabold text-white shadow-warm" style={{ background: 'linear-gradient(135deg, #E88C9A, #C85A75)' }}>
                                    طاولة {tableNumber}
                                </div>
                            </div>

                            {/* Decorative Flowers */}
                            <div className="absolute right-4 top-4 opacity-40">
                                <Flower2 className="w-12 h-12" style={{ color: '#d1899a' }} strokeWidth={1.5} />
                            </div>
                            <div className="absolute left-4 top-16 opacity-40">
                                <Flower2 className="w-10 h-10" style={{ color: '#d1899a' }} strokeWidth={1.5} />
                            </div>

                            <div className="w-24 h-24 rounded-full overflow-hidden shadow-warm border-2 border-white/60 mb-3 relative z-10" style={{ backgroundColor: '#FFF' }}>
                                <img src="/images/logo.png" alt="Rose Cafe" className="w-full h-full object-cover" />
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-wide relative z-10" style={{ color: '#9d3b54' }}>Rose Cafe</h1>
                            <p className="text-sm font-semibold mt-1 relative z-10" style={{ color: '#d1899a' }}>روز كافيه · اطلب من طاولتك</p>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#d1899a' }} />
                            <input
                                type="text"
                                placeholder={placeholder}
                                style={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid rgba(209,137,154,0.3)', color: '#9d3b54', fontSize: '16px' /* 16px prevents iOS zoom */ }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full font-medium rounded-xl pr-10 pl-10 py-3 placeholder:text-[#d1899a] focus:outline-none focus:ring-2 focus:ring-[#d1899a]/30 transition-all appearance-none shadow-sm"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d1899a]/60 hover:text-[#9d3b54] p-1.5 rounded-full active:bg-[#d1899a]/10 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Categories with Items */}
                <div className="px-3 mt-4 space-y-6 relative z-10">
                    {filteredCategories.map((cat, catIndex) => (
                        <section key={cat.id} className="animate-fade-in" style={{ animationDelay: `${catIndex * 80}ms` }}>
                            {/* Category Header */}
                            <div className="flex items-center gap-2 mb-3 px-1">
                                {cat.image && (cat.image.startsWith('http') || cat.image.startsWith('/')) ? (
                                    <img src={cat.image} alt={cat.nameAr} className="w-8 h-8 rounded-full object-cover shadow-warm-sm border border-white/40" />
                                ) : (
                                    <span className="text-xl">{cat.image}</span>
                                )}
                                <h2 className="text-lg font-extrabold" style={{ color: '#3D2214' }}>{cat.nameAr}</h2>
                                <div className="flex-1 h-[1px] mr-2" style={{ background: 'linear-gradient(to left, transparent, rgba(196,136,109,0.2))' }}></div>
                            </div>

                            {/* Items Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                {cat.items.map((item, itemIndex) => (
                                    <ProductCard
                                        key={item.id}
                                        item={item}
                                        onTap={() => setSelectedItem(item)}
                                        delay={itemIndex * 40}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-16">
                            <Search className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(196,136,109,0.15)' }} />
                            <p className="text-sm" style={{ color: '#B08A75' }}>لا توجد نتائج لـ &quot;{search}&quot;</p>
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

function ProductCard({ item, onTap, delay }: { item: MenuItem; onTap: () => void; delay: number }) {
    const { addItem, items: cartItems, updateQuantity, removeItem } = useCart();

    const cartEntry = cartItems.find((ci) => ci.menuItemId === item.id);
    const cartQty = cartEntry?.quantity || 0;
    const hasOptions = item.optionGroups.length > 0;

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasOptions) { onTap(); return; }
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
        if (cartEntry && cartQty > 1) updateQuantity(cartEntry.id, cartQty - 1);
        else if (cartEntry) removeItem(cartEntry.id);
    };

    return (
        <div
            onClick={onTap}
            className="card-premium overflow-hidden cursor-pointer flex flex-col relative animate-fade-in"
            style={{ animationDelay: `${delay}ms`, padding: 0 }}
        >
            {/* Image Area */}
            <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: '#FDF6F0' }}>
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.nameAr}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl opacity-30 grayscale">🌸</span>
                    </div>
                )}

                {/* Cart badge */}
                {cartQty > 0 && (
                    <div className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg animate-scale-in" style={{ background: 'linear-gradient(135deg, #C4886D, #D4A76A)' }}>
                        {cartQty}
                    </div>
                )}

                {/* Options badge */}
                {hasOptions && (
                    <div className="absolute top-1.5 left-1.5 glass px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ color: '#9C6A50' }}>
                        خيارات
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-2.5 flex-1 flex flex-col">
                <h3 className="font-bold text-sm leading-tight line-clamp-2" style={{ color: '#3D2214' }}>{item.nameAr}</h3>
                {item.descriptionAr && (
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#8B6F5E' }}>{item.descriptionAr}</p>
                )}

                {/* Price + Add */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="font-extrabold text-sm" style={{ color: '#C4886D' }}>
                        {parseFloat(item.price).toFixed(0)} ₪
                    </span>

                    <div onClick={(e) => e.stopPropagation()}>
                        {cartQty > 0 && !hasOptions ? (
                            <div className="flex items-center gap-1">
                                <button onClick={handleDecrement} className="w-6 h-6 rounded-full flex items-center justify-center text-xs active:scale-90 font-bold transition-all" style={{ backgroundColor: '#FBDCE0', color: '#B35565' }}>
                                    −
                                </button>
                                <span className="font-bold text-xs w-5 text-center" style={{ color: '#3D2214' }}>{cartQty}</span>
                                <button onClick={handleIncrement} className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs active:scale-90 font-bold transition-all shadow-sm" style={{ background: 'linear-gradient(135deg, #E88C9A, #C4886D)' }}>
                                    +
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleQuickAdd} className="w-7 h-7 rounded-full text-white flex items-center justify-center text-sm font-bold active:scale-90 transition-all shadow-md animate-pulse-glow" style={{ background: 'linear-gradient(135deg, #E88C9A, #C4886D)' }}>
                                +
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
