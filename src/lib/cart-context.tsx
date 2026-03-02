"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItemOption {
    optionId: string;
    nameAr: string;
    extraPrice: number;
}

export interface CartItem {
    id: string; // unique cart item id
    menuItemId: string;
    nameAr: string;
    basePrice: number;
    quantity: number;
    options: CartItemOption[];
    notes: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "id">) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, qty: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = (item: Omit<CartItem, "id">) => {
        const id = `${item.menuItemId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setItems((prev) => [...prev, { ...item, id }]);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const updateQuantity = (id: string, qty: number) => {
        if (qty <= 0) {
            removeItem(id);
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
        );
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

    const totalAmount = items.reduce((sum, i) => {
        const optionsExtra = i.options.reduce((s, o) => s + o.extraPrice, 0);
        return sum + (i.basePrice + optionsExtra) * i.quantity;
    }, 0);

    return (
        <CartContext.Provider
            value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
