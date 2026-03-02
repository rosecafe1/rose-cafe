"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Minus, Plus, ShoppingBag, MessageSquare, Check, Star } from "lucide-react";

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

interface Props {
    item: MenuItem;
    onClose: () => void;
}

export default function ItemDetailModal({ item, onClose }: Props) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");

    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>(() => {
        const defaults: Record<string, string[]> = {};
        item.optionGroups.forEach((g) => {
            const defaultOpt = g.options.find((o) => o.isDefault);
            if (defaultOpt) defaults[g.id] = [defaultOpt.id];
            else if (g.isRequired && g.options.length > 0) defaults[g.id] = [g.options[0].id];
            else defaults[g.id] = [];
        });
        return defaults;
    });

    const handleOptionChange = (group: MenuOptionGroup, optionId: string) => {
        setSelectedOptions((prev) => {
            if (group.isMultiple) {
                const current = prev[group.id] || [];
                if (current.includes(optionId)) return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
                return { ...prev, [group.id]: [...current, optionId] };
            }
            return { ...prev, [group.id]: [optionId] };
        });
    };

    const isValid = item.optionGroups
        .filter((g) => g.isRequired)
        .every((g) => (selectedOptions[g.id] || []).length > 0);

    const basePrice = parseFloat(item.price);
    const optionsExtra = Object.entries(selectedOptions).reduce((sum, [groupId, optIds]) => {
        const group = item.optionGroups.find((g) => g.id === groupId);
        if (!group) return sum;
        return sum + optIds.reduce((s, optId) => {
            const opt = group.options.find((o) => o.id === optId);
            return s + (opt ? parseFloat(opt.extraPrice) : 0);
        }, 0);
    }, 0);
    const totalPrice = (basePrice + optionsExtra) * quantity;

    const handleAdd = () => {
        if (!isValid) return;
        const cartOptions = Object.entries(selectedOptions).flatMap(([groupId, optIds]) => {
            const group = item.optionGroups.find((g) => g.id === groupId);
            if (!group) return [];
            return optIds.map((optId) => {
                const opt = group.options.find((o) => o.id === optId)!;
                return { optionId: opt.id, nameAr: opt.nameAr, extraPrice: parseFloat(opt.extraPrice) };
            });
        });
        addItem({ menuItemId: item.id, nameAr: item.nameAr, basePrice, quantity, options: cartOptions, notes });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
            <div
                className="relative w-full max-w-[420px] rounded-t-[2rem] max-h-[88vh] overflow-y-auto animate-slide-up shadow-2xl"
                style={{ background: 'linear-gradient(180deg, #FFFFFF, #FFF8F4)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(196,136,109,0.2)' }} />
                </div>

                {/* Item Image */}
                {item.image && (
                    <div className="w-full aspect-[16/10] overflow-hidden relative">
                        <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(255,248,244,1) 0%, transparent 50%)' }} />
                    </div>
                )}

                {/* Header */}
                <div className="px-5 pb-2 -mt-2 relative z-10">
                    <h2 className="text-xl font-bold" style={{ color: '#3D2214' }}>{item.nameAr}</h2>
                    {item.nameEn && <p className="text-xs font-medium" style={{ color: '#B08A75' }}>{item.nameEn}</p>}
                    {item.descriptionAr && <p className="text-sm mt-1" style={{ color: '#8B6F5E' }}>{item.descriptionAr}</p>}
                    <p className="text-lg font-bold mt-1" style={{ color: '#C4886D' }}>{basePrice.toFixed(0)} ₪</p>
                </div>

                <div className="px-5 space-y-4 pb-4">
                    {/* Option Groups */}
                    {item.optionGroups.map((group) => (
                        <div key={group.id} className="animate-fade-in">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-sm" style={{ color: '#3D2214' }}>{group.nameAr}</h3>
                                {group.isRequired && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>مطلوب</span>
                                )}
                                {group.isMultiple && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#FCEEE8', color: '#C4886D' }}>متعدد</span>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                {group.options.map((opt) => {
                                    const isSelected = (selectedOptions[group.id] || []).includes(opt.id);
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleOptionChange(group, opt.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all border ${isSelected
                                                ? "shadow-warm-sm"
                                                : "hover:border-cafe-200"
                                                }`}
                                            style={{
                                                backgroundColor: isSelected ? '#FFF5EE' : 'white',
                                                borderColor: isSelected ? '#C4886D' : 'rgba(196,136,109,0.1)',
                                                color: isSelected ? '#3D2214' : '#8B6F5E'
                                            }}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="w-5 h-5 rounded-full flex items-center justify-center transition-all"
                                                    style={{
                                                        background: isSelected ? 'linear-gradient(135deg, #C4886D, #D4A76A)' : 'transparent',
                                                        border: isSelected ? 'none' : '2px solid rgba(196,136,109,0.2)'
                                                    }}
                                                >
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className={isSelected ? "font-bold" : "font-medium"}>{opt.nameAr}</span>
                                            </div>
                                            {parseFloat(opt.extraPrice) > 0 && (
                                                <span className={`text-xs ${isSelected ? "font-bold" : ""}`} style={{ color: '#C4886D' }}>
                                                    +{parseFloat(opt.extraPrice).toFixed(0)} ₪
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Notes */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <MessageSquare className="w-3.5 h-3.5" style={{ color: '#B08A75' }} />
                            <h3 className="font-bold text-sm" style={{ color: '#3D2214' }}>ملاحظات</h3>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="أي طلب خاص؟ (اختياري)"
                            className="w-full rounded-xl px-4 py-3 text-sm placeholder-cafe-300/30 focus:outline-none focus:ring-2 focus:ring-cafe-300/20 resize-none h-20 transition-all"
                            style={{ backgroundColor: '#FFF8F4', border: '1px solid rgba(196,136,109,0.1)', color: '#3D2214' }}
                        />
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between rounded-xl p-3 shadow-warm-sm" style={{ backgroundColor: 'white', border: '1px solid rgba(196,136,109,0.08)' }}>
                        <span className="text-sm font-bold" style={{ color: '#3D2214' }}>الكمية</span>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                                style={{ backgroundColor: '#FCEEE8', color: '#C4886D' }}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-lg w-6 text-center" style={{ color: '#3D2214' }}>{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-9 h-9 rounded-full text-white flex items-center justify-center transition-all active:scale-90 shadow-md"
                                style={{ background: 'linear-gradient(135deg, #C4886D, #D4A76A)' }}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add to cart */}
                <div className="sticky bottom-0 p-4 border-t shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.03)]" style={{ borderColor: 'rgba(196,136,109,0.08)', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                    <button
                        onClick={handleAdd}
                        disabled={!isValid}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${isValid
                            ? "text-white shadow-warm-lg active:scale-[0.98]"
                            : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                            }`}
                        style={isValid ? { background: 'linear-gradient(135deg, #C4886D, #D4A76A)' } : {}}
                    >
                        <ShoppingBag className="w-5 h-5" />
                        أضف للسلة — {totalPrice.toFixed(0)} ₪
                    </button>
                </div>
            </div>
        </div>
    );
}
