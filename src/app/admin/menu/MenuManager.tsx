"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, ChevronDown, ChefHat, Eye, EyeOff, Package, Layers, Settings2, ArrowLeft } from "lucide-react";

interface Category {
    id: string;
    nameAr: string;
    nameEn: string;
    image: string | null;
    _count: { items: number };
}

interface MenuOption {
    id?: string;
    nameAr: string;
    nameEn: string;
    extraPrice: string | number;
    isDefault: boolean;
    isAvailable: boolean;
}

interface MenuOptionGroup {
    id?: string;
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
    categoryId: string;
    category: { nameAr: string };
    optionGroups?: MenuOptionGroup[];
}

export default function MenuManager() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showCatModal, setShowCatModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editCat, setEditCat] = useState<Category | null>(null);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);

    // Form
    const [catForm, setCatForm] = useState({ nameAr: "", nameEn: "", image: "" });
    const [itemForm, setItemForm] = useState<{
        nameAr: string; nameEn: string; descriptionAr: string; price: string;
        categoryId: string; image: string; optionGroups: MenuOptionGroup[];
        sizes: { name: string; price: string; pieces: string }[];
    }>({
        nameAr: "", nameEn: "", descriptionAr: "", price: "", categoryId: "", image: "", optionGroups: [],
        sizes: [
            { name: "صغير", price: "", pieces: "" },
            { name: "وسط", price: "", pieces: "" },
            { name: "كبير", price: "", pieces: "" }
        ]
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const catFileInputRef = useRef<HTMLInputElement>(null);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        const res = await fetch("/api/admin/categories");
        if (res.status === 401) { router.push("/admin/login"); return; }
        const data = await res.json();
        setCategories(data.categories || []);
        setLoading(false);
    }, [router]);

    // Fetch items for active category
    const fetchItems = useCallback(async () => {
        if (!activeCategory) { setItems([]); return; }
        const res = await fetch(`/api/admin/items?categoryId=${activeCategory}`);
        const data = await res.json();
        setItems(data.items || []);
    }, [activeCategory]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);
    useEffect(() => { fetchItems(); }, [fetchItems]);

    // Image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "category" | "item") => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.url) {
                if (target === "category") setCatForm(prev => ({ ...prev, image: data.url }));
                else setItemForm(prev => ({ ...prev, image: data.url }));
            }
        } catch (err) { console.error("Upload failed:", err); }
        setUploading(false);
    };

    // Category CRUD
    const openAddCat = () => { setEditCat(null); setCatForm({ nameAr: "", nameEn: "", image: "" }); setShowCatModal(true); };
    const openEditCat = (cat: Category) => {
        setEditCat(cat);
        setCatForm({ nameAr: cat.nameAr, nameEn: cat.nameEn, image: cat.image || "" });
        setShowCatModal(true);
    };

    const saveCat = async () => {
        if (!catForm.nameAr.trim()) return;
        if (editCat) {
            await fetch(`/api/admin/categories/${editCat.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(catForm),
            });
        } else {
            await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(catForm),
            });
        }
        setShowCatModal(false);
        fetchCategories();
    };

    const deleteCat = async (id: string) => {
        if (!confirm("حذف هذا التصنيف وجميع أصنافه؟")) return;
        await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        if (activeCategory === id) setActiveCategory(null);
        fetchCategories();
    };

    // Item CRUD
    const openAddItem = () => {
        setEditItem(null);
        setItemForm({
            nameAr: "", nameEn: "", descriptionAr: "", price: "", categoryId: activeCategory || "", image: "", optionGroups: [],
            sizes: [
                { name: "صغير", price: "", pieces: "" },
                { name: "وسط", price: "", pieces: "" },
                { name: "كبير", price: "", pieces: "" }
            ]
        });
        setShowItemModal(true);
    };

    const openEditItem = (item: MenuItem) => {
        setEditItem(item);

        let sizes = [
            { name: "صغير", price: "", pieces: "" },
            { name: "وسط", price: "", pieces: "" },
            { name: "كبير", price: "", pieces: "" }
        ];
        let filteredOptionGroups = [...(item.optionGroups || [])];
        const sizeGroupIndex = filteredOptionGroups.findIndex(g => g.nameAr === "الحجم" || g.nameAr === "الأحجام" || g.nameEn === "Size" || g.nameEn === "Sizes");

        if (sizeGroupIndex !== -1) {
            const extractPieces = (name: string) => {
                const match = name.match(/ \((.*?) حبة\)/) || name.match(/ \((.*?) حبات\)/);
                if (match) return { baseName: name.replace(match[0], ''), pieces: match[1] };
                return { baseName: name, pieces: "" };
            };

            const sizeGroup = filteredOptionGroups[sizeGroupIndex];
            sizes = [0, 1, 2].map(i => {
                const opt = sizeGroup.options[i];
                if (!opt) return sizes[i];
                const extracted = extractPieces(opt.nameAr);
                return { name: extracted.baseName || sizes[i].name, price: opt.extraPrice?.toString() || "", pieces: extracted.pieces };
            });
            filteredOptionGroups.splice(sizeGroupIndex, 1);
        }

        setItemForm({
            nameAr: item.nameAr, nameEn: item.nameEn,
            descriptionAr: item.descriptionAr || "", price: item.price.toString(),
            categoryId: item.categoryId, image: item.image || "",
            optionGroups: filteredOptionGroups,
            sizes
        });
        setShowItemModal(true);
    };

    const saveItem = async () => {
        const filledSizes = itemForm.sizes.filter(sz => sz.price !== "");
        let finalPrice = itemForm.price;
        if (!finalPrice && filledSizes.length > 0) finalPrice = "0";

        if (!itemForm.nameAr.trim() || !finalPrice || !itemForm.categoryId) {
            alert("يرجى إدخال اسم الصنف والسعر والتصنيف");
            return;
        }

        const finalOptionGroups = [...itemForm.optionGroups];
        if (filledSizes.length > 0) {
            finalOptionGroups.unshift({
                nameAr: "الحجم",
                nameEn: "Size",
                isRequired: true,
                isMultiple: false,
                options: filledSizes.map((sz, i) => {
                    const piecesText = sz.pieces.trim() ? ` (${sz.pieces} ${parseInt(sz.pieces) > 10 || parseInt(sz.pieces) == 1 || parseInt(sz.pieces) == 2 ? 'حبة' : 'حبات'})` : '';
                    return {
                        nameAr: (sz.name || `حجم ${i + 1}`) + piecesText,
                        nameEn: (sz.name || `Size ${i + 1}`) + piecesText,
                        extraPrice: sz.price,
                        isDefault: i === 0,
                        isAvailable: true
                    };
                })
            });
        }

        const payload = { ...itemForm, price: finalPrice, optionGroups: finalOptionGroups };
        delete (payload as any).sizes;

        if (editItem) {
            await fetch(`/api/admin/items/${editItem.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        } else {
            await fetch("/api/admin/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        }
        setShowItemModal(false);
        fetchItems();
        fetchCategories();
    };

    const deleteItem = async (id: string) => {
        if (!confirm("حذف هذا الصنف؟")) return;
        await fetch(`/api/admin/items/${id}`, { method: "DELETE" });
        fetchItems();
        fetchCategories();
    };

    const toggleAvailability = async (item: MenuItem) => {
        await fetch(`/api/admin/items/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isAvailable: !item.isAvailable }),
        });
        fetchItems();
    };

    if (loading) {
        return (
            <div className="admin-page flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-3 border-cafe-500/30 border-t-cafe-400 rounded-full mx-auto mb-4"></div>
                    <p className="text-white/30 text-sm">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 glass-dark" style={{ borderBottom: '1px solid rgba(196,136,109,0.1)' }}>
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cafe-500 to-gold-500 flex items-center justify-center shadow-lg shadow-cafe-500/20">
                            <ChefHat className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white">إدارة القائمة</h1>
                            <p className="text-xs text-white/30">{categories.length} تصنيف</p>
                        </div>
                    </div>
                    <button onClick={() => router.push("/admin/orders")} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                        الطلبات
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 mt-4 pb-8">
                {/* Categories Section */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white/50 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        التصنيفات
                    </h2>
                    <button onClick={openAddCat} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl text-cafe-300 bg-cafe-500/10 hover:bg-cafe-500/20 transition-all font-bold border border-cafe-500/20">
                        <Plus className="w-3.5 h-3.5" />
                        تصنيف جديد
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className={`flex-shrink-0 group cursor-pointer rounded-xl px-4 py-3 transition-all border ${activeCategory === cat.id
                                ? "bg-gradient-to-r from-cafe-500/20 to-gold-500/20 border-cafe-500/30 shadow-lg shadow-cafe-500/10"
                                : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/8"
                                }`}
                            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {cat.image && (cat.image.startsWith('http') || cat.image.startsWith('/')) ? (
                                    <img src={cat.image} alt={cat.nameAr} className="w-6 h-6 rounded-full object-cover" />
                                ) : (
                                    <span className="text-sm">{cat.image || "📁"}</span>
                                )}
                                <span className={`text-sm font-bold ${activeCategory === cat.id ? "text-cafe-300" : "text-white/70"}`}>{cat.nameAr}</span>
                                <span className="text-[10px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded-full">{cat._count.items}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                                <button onClick={(e) => { e.stopPropagation(); openEditCat(cat); }} className="text-white/30 hover:text-cafe-300 p-1 rounded">
                                    <Pencil className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); deleteCat(cat.id); }} className="text-white/30 hover:text-red-400 p-1 rounded">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Items Section */}
                {activeCategory && (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-white/50 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                الأصناف ({items.length})
                            </h2>
                            <button onClick={openAddItem} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all font-bold border border-emerald-500/20">
                                <Plus className="w-3.5 h-3.5" />
                                صنف جديد
                            </button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            {items.map((item) => (
                                <div key={item.id} className={`card-admin overflow-hidden animate-fade-in ${!item.isAvailable ? "opacity-50" : ""}`}>
                                    <div className="flex gap-3 p-3">
                                        {/* Image */}
                                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                                            {item.image ? (
                                                <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-white/10" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white/90 font-bold text-sm truncate">{item.nameAr}</h3>
                                            {item.nameEn && <p className="text-white/30 text-xs truncate">{item.nameEn}</p>}
                                            {item.descriptionAr && <p className="text-white/20 text-xs mt-0.5 truncate">{item.descriptionAr}</p>}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-cafe-300 font-bold text-sm">{parseFloat(item.price).toFixed(0)} ₪</span>
                                                {item.optionGroups && item.optionGroups.length > 0 && (
                                                    <span className="text-[10px] text-amber-400/60 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/10">
                                                        <Settings2 className="w-2.5 h-2.5 inline ml-0.5" />{item.optionGroups.length} خيار
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex border-t border-white/5">
                                        <button onClick={() => toggleAvailability(item)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-all hover:bg-white/5" style={{ color: item.isAvailable ? '#34d399' : '#f87171' }}>
                                            {item.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                            {item.isAvailable ? "متوفر" : "مخفي"}
                                        </button>
                                        <button onClick={() => openEditItem(item)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-white/40 hover:text-cafe-300 hover:bg-white/5 transition-all border-x border-white/5">
                                            <Pencil className="w-3.5 h-3.5" />
                                            تعديل
                                        </button>
                                        <button onClick={() => deleteItem(item.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-white/40 hover:text-red-400 hover:bg-white/5 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {items.length === 0 && (
                            <div className="text-center py-16">
                                <Package className="w-12 h-12 text-white/10 mx-auto mb-3" />
                                <p className="text-white/30 text-sm">لا توجد أصناف — أضف صنفاً جديداً</p>
                            </div>
                        )}
                    </>
                )}

                {!activeCategory && (
                    <div className="text-center py-16">
                        <Layers className="w-12 h-12 text-white/10 mx-auto mb-3" />
                        <p className="text-white/30 text-sm">اختر تصنيفاً لعرض أصنافه</p>
                    </div>
                )}
            </div>

            {/* ── Category Modal ── */}
            {showCatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCatModal(false)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="relative w-full max-w-sm card-admin p-5 space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold">{editCat ? "تعديل تصنيف" : "تصنيف جديد"}</h3>
                            <button onClick={() => setShowCatModal(false)} className="text-white/30 hover:text-white p-1"><X className="w-5 h-5" /></button>
                        </div>
                        {/* Image upload for category */}
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                {catForm.image && (catForm.image.startsWith('http') || catForm.image.startsWith('/')) ? (
                                    <img src={catForm.image} alt="" className="w-full h-full object-cover" />
                                ) : catForm.image ? (
                                    <span className="text-2xl">{catForm.image}</span>
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-white/15" />
                                )}
                            </div>
                            <div>
                                <input ref={catFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "category")} />
                                <button onClick={() => catFileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg text-cafe-300 bg-cafe-500/10 hover:bg-cafe-500/20 transition-all border border-cafe-500/20">
                                    <Upload className="w-3.5 h-3.5" />
                                    {uploading ? "جاري الرفع..." : "رفع صورة"}
                                </button>
                                {catForm.image && (catForm.image.startsWith('http') || catForm.image.startsWith('/')) && (
                                    <button onClick={() => setCatForm({ ...catForm, image: "" })} className="text-red-400/60 text-[10px] mt-1 block hover:text-red-400">إزالة الصورة</button>
                                )}
                            </div>
                        </div>

                        <input placeholder="الاسم بالعربي *" value={catForm.nameAr} onChange={(e) => setCatForm({ ...catForm, nameAr: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 transition-all" autoFocus />
                        <input placeholder="الاسم بالإنجليزي" value={catForm.nameEn} onChange={(e) => setCatForm({ ...catForm, nameEn: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 transition-all" />
                        <input placeholder="إيموجي (اختياري — إذا لم ترفع صورة)" value={catForm.image && !(catForm.image.startsWith('http') || catForm.image.startsWith('/')) ? catForm.image : ''} onChange={(e) => setCatForm({ ...catForm, image: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 transition-all" />
                        <div className="flex gap-2 pt-2">
                            <button onClick={saveCat} className="flex-1 bg-gradient-to-r from-cafe-500 to-gold-500 text-white py-3 rounded-xl font-bold text-sm active:scale-[0.97] transition-all shadow-lg shadow-cafe-500/20">حفظ</button>
                            <button onClick={() => setShowCatModal(false)} className="px-6 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Item Modal ── */}
            {showItemModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowItemModal(false)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="relative w-full max-w-md card-admin max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-scale-in rounded-t-3xl sm:rounded-3xl" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 z-10 glass-dark p-4 flex items-center justify-between rounded-t-3xl" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 className="text-white font-bold">{editItem ? "تعديل صنف" : "صنف جديد"}</h3>
                            <button onClick={() => setShowItemModal(false)} className="text-white/30 hover:text-white p-1"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-4 space-y-3">
                            {/* Image upload */}
                            <div className="flex items-center gap-3">
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                    {itemForm.image ? (
                                        <img src={itemForm.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-white/15" />
                                    )}
                                </div>
                                <div>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "item")} />
                                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg text-cafe-300 bg-cafe-500/10 hover:bg-cafe-500/20 transition-all border border-cafe-500/20">
                                        <Upload className="w-3.5 h-3.5" />
                                        {uploading ? "جاري الرفع..." : "رفع صورة"}
                                    </button>
                                    {itemForm.image && (
                                        <button onClick={() => setItemForm({ ...itemForm, image: "" })} className="text-red-400/60 text-[10px] mt-1 block hover:text-red-400">إزالة الصورة</button>
                                    )}
                                </div>
                            </div>

                            {/* Category selector */}
                            <div className="relative">
                                <select
                                    value={itemForm.categoryId}
                                    onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-cafe-400/50 transition-all"
                                >
                                    <option value="" className="bg-gray-900">اختر التصنيف *</option>
                                    {categories.map((c) => <option key={c.id} value={c.id} className="bg-gray-900">{c.nameAr}</option>)}
                                </select>
                                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                            </div>

                            <input placeholder="الاسم بالعربي *" value={itemForm.nameAr} onChange={(e) => setItemForm({ ...itemForm, nameAr: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 transition-all" />
                            <input placeholder="الاسم بالإنجليزي" value={itemForm.nameEn} onChange={(e) => setItemForm({ ...itemForm, nameEn: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 transition-all" />
                            <input placeholder="الوصف (اختياري)" value={itemForm.descriptionAr} onChange={(e) => setItemForm({ ...itemForm, descriptionAr: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 transition-all" />
                            <input type="number" placeholder={itemForm.sizes.some(s => s.price) ? "السعر الأساسي (₪) - اختياري لأنك اخترت أحجام" : "السعر الأساسي (₪) *"} value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} className={`w-full bg-white/5 border ${itemForm.sizes.some(s => s.price) && !itemForm.price ? 'border-white/5 dashed' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 transition-all`} />

                            {/* ── Quick Sizes ── */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3 mt-4">
                                <h4 className="text-white/50 text-xs font-bold mb-1 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> الأحجام والأسعار الإضافية (اختياري)</h4>
                                <p className="text-white/30 text-[10px] mb-2 leading-relaxed">أضف حبات أو سعر لأي حجم ليتم اعتماده. إذا أضفت حجماً، يمكنك ترك "السعر الأساسي" فارغاً وسيتم اعتماد أسعار الأحجام.</p>
                                <div className="space-y-2">
                                    {itemForm.sizes.map((sz, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                placeholder="الحجم"
                                                value={sz.name}
                                                onChange={(e) => {
                                                    const newSizes = [...itemForm.sizes];
                                                    newSizes[idx].name = e.target.value;
                                                    setItemForm({ ...itemForm, sizes: newSizes });
                                                }}
                                                className="w-1/3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 transition-all"
                                            />
                                            <input
                                                type="number"
                                                placeholder="الحبات (اختياري)"
                                                value={sz.pieces}
                                                onChange={(e) => {
                                                    const newSizes = [...itemForm.sizes];
                                                    newSizes[idx].pieces = e.target.value;
                                                    setItemForm({ ...itemForm, sizes: newSizes });
                                                }}
                                                className="w-1/3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 transition-all"
                                            />
                                            <input
                                                type="number"
                                                placeholder="السعر (₪)"
                                                value={sz.price}
                                                onChange={(e) => {
                                                    const newSizes = [...itemForm.sizes];
                                                    newSizes[idx].price = e.target.value;
                                                    setItemForm({ ...itemForm, sizes: newSizes });
                                                }}
                                                className="w-1/3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cafe-400/50 transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Advanced Options ── */}
                            <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-xs text-white/40 flex items-center gap-1.5">
                                        <Settings2 className="w-3.5 h-3.5" />
                                        الخيارات الإضافية
                                    </h4>
                                    <button
                                        onClick={() => setItemForm({
                                            ...itemForm,
                                            optionGroups: [...itemForm.optionGroups, { nameAr: "", nameEn: "", isRequired: false, isMultiple: false, options: [] }]
                                        })}
                                        className="text-[11px] px-2.5 py-1.5 rounded-lg text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-all border border-amber-500/15 font-bold flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> مجموعة جديدة
                                    </button>
                                </div>

                                {itemForm.optionGroups.map((group, groupIndex) => (
                                    <div key={groupIndex} className="p-3 rounded-xl mb-3 border border-dashed border-white/10 bg-white/[0.02]">
                                        <div className="flex items-center justify-between mb-2">
                                            <input
                                                placeholder="اسم المجموعة (مثل: الحجم)"
                                                value={group.nameAr}
                                                onChange={(e) => {
                                                    const g = [...itemForm.optionGroups]; g[groupIndex].nameAr = e.target.value;
                                                    setItemForm({ ...itemForm, optionGroups: g });
                                                }}
                                                className="flex-1 bg-transparent text-sm font-bold text-white focus:outline-none placeholder-white/20"
                                                autoFocus
                                            />
                                            <button onClick={() => { const g = itemForm.optionGroups.filter((_, i) => i !== groupIndex); setItemForm({ ...itemForm, optionGroups: g }); }}
                                                className="text-red-400/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex gap-4 mb-3 text-[11px] text-white/30">
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input type="checkbox" checked={group.isRequired} onChange={(e) => { const g = [...itemForm.optionGroups]; g[groupIndex].isRequired = e.target.checked; setItemForm({ ...itemForm, optionGroups: g }); }}
                                                    className="accent-cafe-400" /> إجباري؟
                                            </label>
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input type="checkbox" checked={group.isMultiple} onChange={(e) => { const g = [...itemForm.optionGroups]; g[groupIndex].isMultiple = e.target.checked; setItemForm({ ...itemForm, optionGroups: g }); }}
                                                    className="accent-cafe-400" /> متعدد؟
                                            </label>
                                        </div>

                                        <div className="space-y-1.5">
                                            {group.options.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-2">
                                                    <input placeholder="اسم الخيار" value={opt.nameAr}
                                                        onChange={(e) => { const g = [...itemForm.optionGroups]; g[groupIndex].options[optIndex].nameAr = e.target.value; setItemForm({ ...itemForm, optionGroups: g }); }}
                                                        className="bg-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white border border-white/5 focus:outline-none focus:border-cafe-400/30 transition-all"
                                                        style={{ flex: 2 }}
                                                    />
                                                    <div className="flex items-center rounded-lg border border-white/5 px-1.5 bg-white/5" style={{ flex: 1 }}>
                                                        <span className="text-[10px] text-white/20">+₪</span>
                                                        <input type="number" placeholder="0" value={opt.extraPrice}
                                                            onChange={(e) => { const g = [...itemForm.optionGroups]; g[groupIndex].options[optIndex].extraPrice = e.target.value; setItemForm({ ...itemForm, optionGroups: g }); }}
                                                            className="w-full bg-transparent py-1.5 text-xs text-white focus:outline-none text-center"
                                                        />
                                                    </div>
                                                    <button onClick={() => { const g = [...itemForm.optionGroups]; g[groupIndex].options = g[groupIndex].options.filter((_, i) => i !== optIndex); setItemForm({ ...itemForm, optionGroups: g }); }}
                                                        className="text-white/15 hover:text-red-400 p-0.5 transition-all">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => { const g = [...itemForm.optionGroups]; g[groupIndex].options.push({ nameAr: "", nameEn: "", extraPrice: "0", isDefault: false, isAvailable: true }); setItemForm({ ...itemForm, optionGroups: g }); }}
                                                className="text-[11px] flex items-center gap-1 mt-1.5 font-bold px-2 py-1 rounded text-cafe-300/60 hover:text-cafe-300 transition-all"
                                            >
                                                <Plus className="w-3 h-3" /> خيار جديد
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 p-4 glass-dark" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="flex gap-2">
                                <button onClick={saveItem} className="flex-1 bg-gradient-to-r from-cafe-500 to-gold-500 text-white py-3 rounded-xl font-bold text-sm active:scale-[0.97] transition-all shadow-lg shadow-cafe-500/20">
                                    {editItem ? "حفظ التعديلات" : "إضافة الصنف"}
                                </button>
                                <button onClick={() => setShowItemModal(false)} className="px-5 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm">إلغاء</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
