"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

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

interface Props {
    item: MenuItem;
    onClose: () => void;
}

export default function ItemDetailModal({ item, onClose }: Props) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");

    // Track selected options: groupId -> optionId[] 
    const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>(() => {
        const defaults: Record<number, number[]> = {};
        item.optionGroups.forEach((g) => {
            const defaultOpt = g.options.find((o) => o.isDefault);
            if (defaultOpt) {
                defaults[g.id] = [defaultOpt.id];
            } else if (g.isRequired && g.options.length > 0) {
                defaults[g.id] = [g.options[0].id];
            } else {
                defaults[g.id] = [];
            }
        });
        return defaults;
    });

    const handleOptionChange = (group: MenuOptionGroup, optionId: number) => {
        setSelectedOptions((prev) => {
            if (group.isMultiple) {
                const current = prev[group.id] || [];
                if (current.includes(optionId)) {
                    return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
                }
                return { ...prev, [group.id]: [...current, optionId] };
            }
            return { ...prev, [group.id]: [optionId] };
        });
    };

    // Validate required groups
    const isValid = item.optionGroups
        .filter((g) => g.isRequired)
        .every((g) => (selectedOptions[g.id] || []).length > 0);

    // Calculate total
    const basePrice = parseFloat(item.price);
    const optionsExtra = Object.entries(selectedOptions).reduce((sum, [groupId, optIds]) => {
        const group = item.optionGroups.find((g) => g.id === parseInt(groupId));
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
            const group = item.optionGroups.find((g) => g.id === parseInt(groupId));
            if (!group) return [];
            return optIds.map((optId) => {
                const opt = group.options.find((o) => o.id === optId)!;
                return {
                    optionId: opt.id,
                    nameAr: opt.nameAr,
                    extraPrice: parseFloat(opt.extraPrice),
                };
            });
        });

        addItem({
            menuItemId: item.id,
            nameAr: item.nameAr,
            basePrice,
            quantity,
            options: cartOptions,
            notes,
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative bg-white w-full max-w-[400px] rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-4 border-b border-rose-100 flex items-center justify-between z-10">
                    <h2 className="text-lg font-bold text-cafe-900">{item.nameAr}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-cafe-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50 transition-colors">
                        ✕
                    </button>
                </div>

                {/* Item Image */}
                {item.image && (
                    <div className="w-full aspect-video overflow-hidden">
                        <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="p-4 space-y-4">
                    {/* Description */}
                    {item.descriptionAr && (
                        <p className="text-gray-600 text-sm">{item.descriptionAr}</p>
                    )}

                    {/* Option Groups */}
                    {item.optionGroups.map((group) => (
                        <div key={group.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-cafe-800 text-sm">{group.nameAr}</h3>
                                {group.isRequired && (
                                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">مطلوب</span>
                                )}
                                {group.isMultiple && (
                                    <span className="text-[10px] bg-rose-100 text-cafe-600 px-2 py-0.5 rounded-full font-bold">متعدد</span>
                                )}
                            </div>
                            <div className="space-y-1">
                                {group.options.map((opt) => {
                                    const isSelected = (selectedOptions[group.id] || []).includes(opt.id);
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleOptionChange(group, opt.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all border ${isSelected
                                                ? "bg-rose-50 border-cafe-300 text-cafe-900 shadow-sm"
                                                : "bg-white border-gray-100 text-gray-600 hover:border-rose-200 hover:bg-rose-50/50"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isSelected ? "border-cafe-500 bg-cafe-500 text-white" : "border-2 border-gray-300"
                                                    }`}>
                                                    {isSelected && <span className="text-xs">✓</span>}
                                                </div>
                                                <span className={isSelected ? "font-bold" : "font-medium"}>{opt.nameAr}</span>
                                            </div>
                                            {parseFloat(opt.extraPrice) > 0 && (
                                                <span className={`text-xs ${isSelected ? "text-cafe-600 font-bold" : "text-gray-500"}`}>+{parseFloat(opt.extraPrice)} ₪</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Notes */}
                    <div>
                        <h3 className="font-bold text-cafe-800 text-sm mb-2">ملاحظات</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="أي طلب خاص؟ (اختياري)"
                            className="w-full bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm text-cafe-900 placeholder-gray-400 focus:outline-none focus:border-cafe-400 focus:ring-2 focus:ring-cafe-100 resize-none h-20 transition-all"
                        />
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between bg-white border border-rose-100 rounded-xl p-3 shadow-sm">
                        <span className="text-sm font-bold text-cafe-800">الكمية</span>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-9 h-9 rounded-full bg-rose-100 text-cafe-600 flex items-center justify-center hover:bg-rose-200 transition-colors text-lg font-bold"
                            >
                                −
                            </button>
                            <span className="text-cafe-900 font-bold text-lg w-6 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-9 h-9 rounded-full bg-cafe-500 text-white flex items-center justify-center hover:bg-cafe-600 transition-colors text-lg font-bold"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add to cart button */}
                <div className="sticky bottom-0 p-4 bg-white border-t border-rose-100 rounded-b-3xl">
                    <button
                        onClick={handleAdd}
                        disabled={!isValid}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${isValid
                            ? "bg-cafe-500 text-white hover:bg-cafe-600 shadow-cafe-200 active:scale-[0.98]"
                            : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                            }`}
                    >
                        أضف للسلة — {totalPrice.toFixed(0)} ₪
                    </button>
                </div>
            </div>
        </div>
    );
}
