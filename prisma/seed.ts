import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// دالة مساعدة لتوليد معرفات (IDs) فريدة وثابتة بحجم 24 حرف (بصيغة ObjectID لـ MongoDB)
const genId = (prefix: string, num: number) => {
    return prefix + String(num).padStart(24 - prefix.length, '0');
};

async function main() {
    console.log("🌱 بدء تغذية البيانات...");

    // مسح البيانات القديمة (التي كانت تحتوي على ID مكرر بسبب الخطأ الماضي) لتجنب التكرار
    console.log("🧹 تنظيف القائمة القديمة...");
    await prisma.menuOption.deleteMany();
    await prisma.menuOptionGroup.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();

    // ─── 1. الطاولات (1..20) ───
    console.log("📋 إنشاء/تحديث الطاولات...");
    for (let i = 1; i <= 20; i++) {
        await prisma.table.upsert({
            where: { number: i },
            update: {},
            create: { number: i },
        });
    }

    // ─── 2. التصنيفات ───
    console.log("📂 إنشاء التصنيفات...");
    const categories = [
        { id: genId('a', 1), nameAr: "قهوة ساخنة", nameEn: "Hot Coffee", sortOrder: 1, image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800" },
        { id: genId('a', 2), nameAr: "قهوة باردة", nameEn: "Iced Coffee", sortOrder: 2, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800" },
        { id: genId('a', 3), nameAr: "مشروبات طازجة", nameEn: "Fresh Drinks", sortOrder: 3, image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=800" },
        { id: genId('a', 4), nameAr: "شاي", nameEn: "Tea", sortOrder: 4, image: "https://images.unsplash.com/photo-1544787219-7f47cc41ce8e?auto=format&fit=crop&q=80&w=800" },
        { id: genId('a', 5), nameAr: "حلويات", nameEn: "Desserts", sortOrder: 5, image: "https://images.unsplash.com/photo-1551024506-0cb4a1cb48cb?auto=format&fit=crop&q=80&w=800" },
        { id: genId('a', 6), nameAr: "سناكات", nameEn: "Snacks", sortOrder: 6, image: "https://images.unsplash.com/photo-1623366302587-bca232cb9fa2?auto=format&fit=crop&q=80&w=800" },
    ];

    for (const cat of categories) {
        await prisma.category.create({ data: cat });
    }

    // ─── 3. عناصر القائمة ───
    console.log("🍽️ إنشاء عناصر القائمة...");
    const items = [
        // === قهوة ساخنة ===
        { id: genId('b', 1), nameAr: "إسبريسو", nameEn: "Espresso", descriptionAr: "قهوة إسبريسو غنية ومركزة", price: 12, categoryId: genId('a', 1), sortOrder: 1, image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 2), nameAr: "لاتيه", nameEn: "Latte", descriptionAr: "إسبريسو مع حليب مبخر ناعم", price: 18, categoryId: genId('a', 1), sortOrder: 2, image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 3), nameAr: "كابتشينو", nameEn: "Cappuccino", descriptionAr: "إسبريسو مع رغوة حليب كثيفة", price: 18, categoryId: genId('a', 1), sortOrder: 3, image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 4), nameAr: "أمريكانو", nameEn: "Americano", descriptionAr: "إسبريسو مع ماء ساخن", price: 14, categoryId: genId('a', 1), sortOrder: 4, image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 5), nameAr: "موكا", nameEn: "Mocha", descriptionAr: "إسبريسو مع شوكولاتة وحليب", price: 22, categoryId: genId('a', 1), sortOrder: 5, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 6), nameAr: "قهوة تركية", nameEn: "Turkish Coffee", descriptionAr: "قهوة تركية أصلية مع هيل", price: 10, categoryId: genId('a', 1), sortOrder: 6, image: "https://images.unsplash.com/photo-1541595188804-9a4f47842e61?auto=format&fit=crop&q=80&w=800" },

        // === قهوة باردة ===
        { id: genId('b', 11), nameAr: "آيس لاتيه", nameEn: "Iced Latte", descriptionAr: "لاتيه بارد منعش", price: 20, categoryId: genId('a', 2), sortOrder: 1, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 12), nameAr: "آيس أمريكانو", nameEn: "Iced Americano", descriptionAr: "أمريكانو بارد مع ثلج", price: 16, categoryId: genId('a', 2), sortOrder: 2, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 13), nameAr: "كولد برو", nameEn: "Cold Brew", descriptionAr: "قهوة باردة مخمرة ببطء", price: 22, categoryId: genId('a', 2), sortOrder: 3, image: "https://images.unsplash.com/photo-1517701550927-30cfce07d0d3?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 14), nameAr: "فرابيه", nameEn: "Frappé", descriptionAr: "قهوة مثلجة كريمية", price: 24, categoryId: genId('a', 2), sortOrder: 4, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800" },

        // === مشروبات طازجة ===
        { id: genId('b', 21), nameAr: "عصير برتقال", nameEn: "Fresh Orange", descriptionAr: "عصير برتقال طبيعي", price: 15, categoryId: genId('a', 3), sortOrder: 1, image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 22), nameAr: "ليموناضة", nameEn: "Lemonade", descriptionAr: "ليمون طازج مع نعناع", price: 14, categoryId: genId('a', 3), sortOrder: 2, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 23), nameAr: "موهيتو", nameEn: "Mojito", descriptionAr: "نعناع مع ليمون وصودا", price: 18, categoryId: genId('a', 3), sortOrder: 3, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800" },

        // === شاي ===
        { id: genId('b', 31), nameAr: "شاي أحمر", nameEn: "Black Tea", descriptionAr: "شاي أحمر كلاسيكي", price: 8, categoryId: genId('a', 4), sortOrder: 1, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 32), nameAr: "شاي أخضر", nameEn: "Green Tea", descriptionAr: "شاي أخضر ياباني", price: 10, categoryId: genId('a', 4), sortOrder: 2, image: "https://images.unsplash.com/photo-1627492275504-ce52e2518e15?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 33), nameAr: "تشاي لاتيه", nameEn: "Chai Latte", descriptionAr: "شاي مبخر مع توابل", price: 16, categoryId: genId('a', 4), sortOrder: 3, image: "https://images.unsplash.com/photo-1544787219-7f47cc41ce8e?auto=format&fit=crop&q=80&w=800" },

        // === حلويات ===
        { id: genId('b', 41), nameAr: "تشيز كيك", nameEn: "Cheesecake", descriptionAr: "تشيز كيك كلاسيكي", price: 25, categoryId: genId('a', 5), sortOrder: 1, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 42), nameAr: "براوني", nameEn: "Brownie", descriptionAr: "براوني شوكولاتة دافئ", price: 20, categoryId: genId('a', 5), sortOrder: 2, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800" },

        // === سناكات ===
        { id: genId('b', 51), nameAr: "كرواسان", nameEn: "Croissant", descriptionAr: "كرواسان زبدة فرنسي", price: 12, categoryId: genId('a', 6), sortOrder: 1, image: "https://images.unsplash.com/photo-1623366302587-bca232cb9fa2?auto=format&fit=crop&q=80&w=800" },
        { id: genId('b', 52), nameAr: "كلوب ساندويتش", nameEn: "Club Sandwich", descriptionAr: "ساندويتش دجاج بخضار", price: 28, categoryId: genId('a', 6), sortOrder: 2, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800" },
    ];

    for (const item of items) {
        await prisma.menuItem.create({ data: item });
    }

    // ─── 4. مجموعات الخيارات ───
    console.log("⚙️ إنشاء خيارات القائمة...");

    // خيار الحجم — للاتيه والكابتشينو والموكا والآيس لاتيه
    for (const itemId of [2, 3, 5, 11]) {
        const groupId = genId('c', itemId * 10 + 1);
        await prisma.menuOptionGroup.create({
            data: { id: groupId, nameAr: "الحجم", nameEn: "Size", isRequired: true, isMultiple: false, menuItemId: genId('b', itemId), sortOrder: 1 }
        });
        await prisma.menuOption.createMany({
            data: [
                { id: genId('d', itemId * 100 + 1), nameAr: "صغير", nameEn: "Small", extraPrice: 0, isDefault: true, optionGroupId: groupId, sortOrder: 1 },
                { id: genId('d', itemId * 100 + 2), nameAr: "وسط", nameEn: "Medium", extraPrice: 3, optionGroupId: groupId, sortOrder: 2 },
                { id: genId('d', itemId * 100 + 3), nameAr: "كبير", nameEn: "Large", extraPrice: 6, optionGroupId: groupId, sortOrder: 3 },
            ]
        });
    }

    // خيار السكر
    for (const itemId of [1, 2, 3, 4, 5, 6, 11, 12]) {
        const groupId = genId('c', itemId * 10 + 2);
        await prisma.menuOptionGroup.create({
            data: { id: groupId, nameAr: "السكر", nameEn: "Sugar", isRequired: false, isMultiple: false, menuItemId: genId('b', itemId), sortOrder: 2 }
        });
        await prisma.menuOption.createMany({
            data: [
                { id: genId('d', itemId * 100 + 10), nameAr: "بدون سكر", nameEn: "No Sugar", extraPrice: 0, optionGroupId: groupId, sortOrder: 1 },
                { id: genId('d', itemId * 100 + 11), nameAr: "سكر قليل", nameEn: "Less Sugar", extraPrice: 0, optionGroupId: groupId, sortOrder: 2 },
                { id: genId('d', itemId * 100 + 12), nameAr: "سكر عادي", nameEn: "Normal Sugar", extraPrice: 0, isDefault: true, optionGroupId: groupId, sortOrder: 3 },
            ]
        });
    }

    // ─── 5. أدمن افتراضي ───
    console.log("👤 إنشاء حساب الأدمن...");
    const hash = await bcrypt.hash("admin123", 12);
    await prisma.adminUser.upsert({
        where: { username: "admin" },
        update: {},
        create: { username: "admin", passwordHash: hash, displayName: "مدير النظام" },
    });

    // ─── ملخص ───
    const tableCount = await prisma.table.count();
    const catCount = await prisma.category.count();
    const itemCount = await prisma.menuItem.count();

    console.log(`\n✅ تم تغذية البيانات بنجاح!`);
    console.log(`   📋 طاولات: ${tableCount}`);
    console.log(`   📂 تصنيفات: ${catCount}`);
    console.log(`   🍽️ عناصر: ${itemCount}`);
}

main()
    .catch((e) => {
        console.error("❌ خطأ:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
