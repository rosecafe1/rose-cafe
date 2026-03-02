"use client";

import { Coffee, Search, LogOut, Edit2, Trash2, Power, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Category {
    id: string;
    nameAr: string;
    nameEn: string;
    image: string | null;
    isActive: boolean;
    _count: { items: number };
}

interface MenuItem {
    id: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string | null;
    price: string;
    image: string | null;
    isAvailable: boolean;
    categoryId: string;
    category: { nameAr: string };
}

export default function MenuManager() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showCatModal, setShowCatModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editCat, setEditCat] = useState<Category | null>(null);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);

    // Form
    const [catForm, setCatForm] = useState({ nameAr: "", nameEn: "", image: "" });
    const [itemForm, setItemForm] = useState({ nameAr: "", nameEn: "", descriptionAr: "", price: "", categoryId: "", image: "" });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (activeCategory) fetchItems(activeCategory);
    }, [activeCategory]);

    const fetchCategories = async () => {
        const res = await fetch("/api/admin/categories");
        if (res.status === 401) { router.push("/admin/login"); return; }
        const data = await res.json();
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !activeCategory) {
            setActiveCategory(data.categories[0].id);
        }
        setLoading(false);
    };

    const fetchItems = async (catId: string) => {
        const res = await fetch(`/api/admin/items?categoryId=${catId}`);
        const data = await res.json();
        setItems(data.items || []);
    };

    // Image upload
    const handleImageUpload = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.url) {
                setItemForm((prev) => ({ ...prev, image: data.url }));
            }
        } catch (err) {
            console.error("Upload failed:", err);
        }
        setUploading(false);
    };

    // Category CRUD
    const openAddCategory = () => {
        setEditCat(null);
        setCatForm({ nameAr: "", nameEn: "", image: "" });
        setShowCatModal(true);
    };

    const openEditCategory = (cat: Category) => {
        setEditCat(cat);
        setCatForm({ nameAr: cat.nameAr, nameEn: cat.nameEn, image: cat.image || "" });
        setShowCatModal(true);
    };

    const saveCategory = async () => {
        if (!catForm.nameAr) return;
        if (editCat) {
            await fetch(`/api/admin/categories/${editCat.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(catForm),
            });
        } else {
            await fetch("/api/admin/categories", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(catForm),
            });
        }
        setShowCatModal(false);
        fetchCategories();
    };

    const toggleCategory = async (cat: Category) => {
        await fetch(`/api/admin/categories/${cat.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !cat.isActive }),
        });
        fetchCategories();
    };

    const deleteCategory = async (cat: Category) => {
        if (cat._count.items > 0) {
            alert(`لا يمكن حذف تصنيف "${cat.nameAr}" لأنه يحتوي على ${cat._count.items} أصناف. يرجى حذف الأصناف أولاً.`);
            return;
        }

        if (!window.confirm(`هل أنت متأكد من حذف تصنيف "${cat.nameAr}" نهائياً؟`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
            if (res.ok) {
                if (activeCategory === cat.id) setActiveCategory(null);
                fetchCategories();
            } else {
                const data = await res.json().catch(() => ({}));
                alert(`حدث خطأ أثناء الحذف: ${data.error || "غير معروف"}`);
            }
        } catch (error: any) {
            console.error(error);
            alert(`حدث خطأ في الاتصال: ${error.message || ""}`);
        }
    };

    // Item CRUD
    const openAddItem = () => {
        setEditItem(null);
        setItemForm({ nameAr: "", nameEn: "", descriptionAr: "", price: "", categoryId: activeCategory || "", image: "" });
        setShowItemModal(true);
    };

    const openEditItem = (item: MenuItem) => {
        setEditItem(item);
        setItemForm({
            nameAr: item.nameAr, nameEn: item.nameEn,
            descriptionAr: item.descriptionAr || "", price: item.price,
            categoryId: item.categoryId, image: item.image || "",
        });
        setShowItemModal(true);
    };

    const saveItem = async () => {
        if (!itemForm.nameAr || !itemForm.price) {
            alert("الاسم والسعر مطلوبين");
            return;
        }
        try {
            let res;
            if (editItem) {
                res = await fetch(`/api/admin/items/${editItem.id}`, {
                    method: "PATCH", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(itemForm),
                });
            } else {
                res = await fetch("/api/admin/items", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...itemForm, categoryId: activeCategory }),
                });
            }
            if (!res.ok) {
                const err = await res.json();
                alert(`خطأ: ${err.error || res.statusText}`);
                return;
            }
            setShowItemModal(false);
            if (activeCategory) fetchItems(activeCategory);
        } catch (error: any) {
            console.error("SaveItem error:", error);
            alert(`خطأ في الاتصال: ${error.message}`);
        }
    };

    const toggleItemAvailability = async (item: MenuItem) => {
        await fetch(`/api/admin/items/${item.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isAvailable: !item.isAvailable }),
        });
        if (activeCategory) fetchItems(activeCategory);
    };

    const deleteItem = async (item: MenuItem) => {
        await fetch(`/api/admin/items/${item.id}`, { method: "DELETE" });
        if (activeCategory) fetchItems(activeCategory);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-cafe-300 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-8">
            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-md" style={{ backgroundColor: 'rgba(255,248,244,0.95)', borderBottom: '1px solid #F0D1C4' }}>
                <div className="px-4 py-3 flex items-center justify-between">
                    <h1 className="text-lg font-bold" style={{ color: '#9C6A50' }}>🍽️ إدارة القائمة</h1>
                    <div className="flex gap-2">
                        <button onClick={() => router.push("/admin/accounting")} className="text-sm px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#9C6A50' }}>
                            📊 المحاسبة
                        </button>
                        <button onClick={() => router.push("/admin/orders")} className="text-sm px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#9C6A50' }}>
                            📋 الطلبات
                        </button>
                    </div>
                </div>
            </header>

            <div className="px-4 mt-4 space-y-6">
                {/* Categories Section */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold" style={{ color: '#5A3D2E' }}>التصنيفات</h2>
                        <button onClick={openAddCategory} className="text-white text-sm px-4 py-2 rounded-xl active:scale-95 transition-all" style={{ backgroundColor: '#C4886D', boxShadow: '0 4px 10px rgba(196,136,109,0.2)' }}>
                            + إضافة
                        </button>
                    </div>

                    <div className="grid gap-2">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${activeCategory === cat.id
                                    ? "bg-cafe-600/20 border-cafe-500/40"
                                    : "bg-white/60 border-[#F0D1C4] hover:border-[#C4886D]"
                                    } ${!cat.isActive ? "opacity-50" : ""}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {cat.image && (cat.image.startsWith('http') || cat.image.startsWith('/')) ? (
                                        <img src={cat.image} alt={cat.nameAr} className="w-10 h-10 rounded-full object-cover border border-[#F0D1C4]" />
                                    ) : (
                                        <span className="text-2xl">{cat.image || "📁"}</span>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-base font-bold" style={{ color: '#5A3D2E' }}>{cat.nameAr}</span>
                                        {cat.nameEn && <span className="text-gray-500 text-xs mt-0.5">{cat.nameEn}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => toggleCategory(cat)} className={`text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg font-bold transition-all ${cat.isActive ? "text-green-600 bg-green-500/20" : "text-red-500 bg-red-500/20"}`}>
                                        {cat.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        {cat.isActive ? "فعال" : "معطل"}
                                    </button>
                                    <button onClick={() => openEditCategory(cat)} title="تعديل" className="text-gray-500 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-500/10 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteCategory(cat)} title="حذف" className="text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Items Section */}
                {activeCategory && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-bold" style={{ color: '#5A3D2E' }}>
                                الأصناف — {categories.find((c) => c.id === activeCategory)?.nameAr}
                            </h2>
                            <button onClick={openAddItem} className="text-white text-sm px-4 py-2 rounded-xl active:scale-95 transition-all" style={{ backgroundColor: '#C4886D', boxShadow: '0 4px 10px rgba(196,136,109,0.2)' }}>
                                + إضافة
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500">لا توجد أصناف في هذا التصنيف</p>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`bg-white/60 rounded-xl border border-[#F0D1C4] p-3 ${!item.isAvailable ? "opacity-50" : ""}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Item image thumbnail */}
                                            {item.image ? (
                                                <img src={item.image} alt={item.nameAr} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800'; }} />
                                            ) : (
                                                <div className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: '#FCEEE8' }}>
                                                    📷
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <span className="text-base font-bold" style={{ color: '#5A3D2E' }}>{item.nameAr}</span>
                                                {item.nameEn && <span className="text-gray-500 text-xs mt-0.5 mb-1">{item.nameEn}</span>}
                                                {item.descriptionAr && (
                                                    <p className="text-gray-600 text-xs truncate">{item.descriptionAr}</p>
                                                )}
                                            </div>
                                            <span className="font-bold text-sm" style={{ color: '#C4886D' }}>
                                                {parseFloat(item.price).toFixed(0)} ₪
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2">
                                            <button onClick={() => toggleItemAvailability(item)} className={`text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg font-bold transition-all ${item.isAvailable ? "text-green-600 bg-green-500/20" : "text-gray-500 bg-gray-500/20"}`}>
                                                <Power className="w-3.5 h-3.5" />
                                                {item.isAvailable ? "متوفر" : "غير متوفر"}
                                            </button>
                                            <button onClick={() => openEditItem(item)} title="تعديل" className="text-gray-500 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-500/10 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => deleteItem(item)} title="حذف" className="text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>

            {/* Category Modal */}
            {showCatModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowCatModal(false)}>
                    <div className="w-full max-w-md rounded-t-2xl p-6 animate-slide-up" style={{ backgroundColor: '#FFF8F4' }} onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-bold mb-4" style={{ color: '#5A3D2E' }}>{editCat ? "تعديل تصنيف" : "إضافة تصنيف"}</h3>
                        <div className="space-y-3">
                            <input placeholder="الاسم بالعربي *" value={catForm.nameAr} onChange={(e) => setCatForm({ ...catForm, nameAr: e.target.value })} className="w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #F0D1C4', color: '#5A3D2E' }} />
                            <input placeholder="الاسم بالإنجليزي" value={catForm.nameEn} onChange={(e) => setCatForm({ ...catForm, nameEn: e.target.value })} className="w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #F0D1C4', color: '#5A3D2E' }} />
                            <input placeholder="إيموجي (اختياري) مثل ☕" value={catForm.image} onChange={(e) => setCatForm({ ...catForm, image: e.target.value })} className="w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #F0D1C4', color: '#5A3D2E' }} />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={saveCategory} className="flex-1 text-white py-3 rounded-xl font-bold active:scale-95" style={{ backgroundColor: '#C4886D' }}>
                                {editCat ? "حفظ" : "إضافة"}
                            </button>
                            <button onClick={() => setShowCatModal(false)} className="flex-1 py-3 rounded-xl font-bold active:scale-95" style={{ backgroundColor: 'transparent', border: '1px solid #F0D1C4', color: '#9C6A50' }}>
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Item Modal with Image Upload */}
            {showItemModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowItemModal(false)}>
                    <div className="w-full max-w-md rounded-t-2xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto" style={{ backgroundColor: '#FFF8F4' }} onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-bold mb-4" style={{ color: '#5A3D2E' }}>{editItem ? "تعديل صنف" : "إضافة صنف"}</h3>
                        <div className="space-y-3">
                            {/* Image Upload */}
                            <div>
                                <label className="text-gray-400 text-xs mb-1 block">صورة الصنف</label>
                                <div className="w-full relative">
                                    {itemForm.image ? (
                                        <div className="relative">
                                            <img src={itemForm.image} alt="preview" className="w-20 h-20 rounded-xl object-cover" />
                                            <button
                                                onClick={() => setItemForm({ ...itemForm, image: "" })}
                                                className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                                            >×</button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition-colors" style={{ borderColor: '#F0D1C4', backgroundColor: 'rgba(255,255,255,0.7)' }}>
                                            {uploading ? (
                                                <div className="animate-spin w-5 h-5 border-2 border-cafe-300 border-t-transparent rounded-full"></div>
                                            ) : (
                                                <>
                                                    <span className="text-3xl mb-2 opacity-60">📸</span>
                                                    <span className="text-sm" style={{ color: '#9C6A50' }}>انقر لرفع صورة</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                                    }}
                                />
                            </div>

                            <input placeholder="الاسم بالعربي *" value={itemForm.nameAr} onChange={(e) => setItemForm({ ...itemForm, nameAr: e.target.value })} className="w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #F0D1C4', color: '#5A3D2E' }} />
                            <input placeholder="الاسم بالإنجليزي" value={itemForm.nameEn} onChange={(e) => setItemForm({ ...itemForm, nameEn: e.target.value })} className="w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #F0D1C4', color: '#5A3D2E' }} />
                            <input placeholder="الوصف (اختياري)" value={itemForm.descriptionAr} onChange={(e) => setItemForm({ ...itemForm, descriptionAr: e.target.value })} className="w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #F0D1C4', color: '#5A3D2E' }} />
                            <input type="number" placeholder="السعر (₪) *" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} className="w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #F0D1C4', color: '#5A3D2E' }} />
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={saveItem} className="flex-1 text-white py-3 rounded-xl font-bold active:scale-95" style={{ backgroundColor: '#C4886D' }}>
                                {editItem ? "حفظ" : "إضافة"}
                            </button>
                            <button onClick={() => setShowItemModal(false)} className="flex-1 py-3 rounded-xl font-bold active:scale-95" style={{ backgroundColor: 'transparent', border: '1px solid #F0D1C4', color: '#9C6A50' }}>
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
