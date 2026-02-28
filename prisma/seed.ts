import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 بدء تغذية البيانات...");

    // ─── 1. الطاولات (1..20) ───
    console.log("📋 إنشاء الطاولات...");
    for (let i = 1; i <= 20; i++) {
        await prisma.table.upsert({
            where: { number: i },
            update: {},
            create: { number: i },
        });
    }

    // ─── 2. التصنيفات ───
    console.log("📂 إنشاء التصنيفات...");
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { id: 1 },
            update: {},
            create: { id: 1, nameAr: "قهوة ساخنة", nameEn: "Hot Coffee", sortOrder: 1, image: "☕" },
        }),
        prisma.category.upsert({
            where: { id: 2 },
            update: {},
            create: { id: 2, nameAr: "قهوة باردة", nameEn: "Iced Coffee", sortOrder: 2, image: "🧊" },
        }),
        prisma.category.upsert({
            where: { id: 3 },
            update: {},
            create: { id: 3, nameAr: "مشروبات طازجة", nameEn: "Fresh Drinks", sortOrder: 3, image: "🍊" },
        }),
        prisma.category.upsert({
            where: { id: 4 },
            update: {},
            create: { id: 4, nameAr: "شاي", nameEn: "Tea", sortOrder: 4, image: "🍵" },
        }),
        prisma.category.upsert({
            where: { id: 5 },
            update: {},
            create: { id: 5, nameAr: "حلويات", nameEn: "Desserts", sortOrder: 5, image: "🍰" },
        }),
        prisma.category.upsert({
            where: { id: 6 },
            update: {},
            create: { id: 6, nameAr: "سناكات", nameEn: "Snacks", sortOrder: 6, image: "🥐" },
        }),
    ]);

    // ─── 3. عناصر القائمة مع الخيارات ───
    console.log("🍽️ إنشاء عناصر القائمة...");

    // === قهوة ساخنة ===
    const espresso = await prisma.menuItem.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            nameAr: "إسبريسو",
            nameEn: "Espresso",
            descriptionAr: "قهوة إسبريسو غنية ومركزة",
            price: 12,
            categoryId: 1,
            sortOrder: 1,
        },
    });

    const latte = await prisma.menuItem.upsert({
        where: { id: 2 },
        update: {},
        create: {
            id: 2,
            nameAr: "لاتيه",
            nameEn: "Latte",
            descriptionAr: "إسبريسو مع حليب مبخر ناعم",
            price: 18,
            categoryId: 1,
            sortOrder: 2,
        },
    });

    const cappuccino = await prisma.menuItem.upsert({
        where: { id: 3 },
        update: {},
        create: {
            id: 3,
            nameAr: "كابتشينو",
            nameEn: "Cappuccino",
            descriptionAr: "إسبريسو مع رغوة حليب كثيفة",
            price: 18,
            categoryId: 1,
            sortOrder: 3,
        },
    });

    const americano = await prisma.menuItem.upsert({
        where: { id: 4 },
        update: {},
        create: {
            id: 4,
            nameAr: "أمريكانو",
            nameEn: "Americano",
            descriptionAr: "إسبريسو مع ماء ساخن",
            price: 14,
            categoryId: 1,
            sortOrder: 4,
        },
    });

    const mocha = await prisma.menuItem.upsert({
        where: { id: 5 },
        update: {},
        create: {
            id: 5,
            nameAr: "موكا",
            nameEn: "Mocha",
            descriptionAr: "إسبريسو مع شوكولاتة وحليب",
            price: 22,
            categoryId: 1,
            sortOrder: 5,
        },
    });

    const turkishCoffee = await prisma.menuItem.upsert({
        where: { id: 6 },
        update: {},
        create: {
            id: 6,
            nameAr: "قهوة تركية",
            nameEn: "Turkish Coffee",
            descriptionAr: "قهوة تركية أصلية مع هيل",
            price: 10,
            categoryId: 1,
            sortOrder: 6,
        },
    });

    // === قهوة باردة ===
    const icedLatte = await prisma.menuItem.upsert({
        where: { id: 7 },
        update: {},
        create: {
            id: 7,
            nameAr: "آيس لاتيه",
            nameEn: "Iced Latte",
            descriptionAr: "لاتيه بارد منعش",
            price: 20,
            categoryId: 2,
            sortOrder: 1,
        },
    });

    const icedAmericano = await prisma.menuItem.upsert({
        where: { id: 8 },
        update: {},
        create: {
            id: 8,
            nameAr: "آيس أمريكانو",
            nameEn: "Iced Americano",
            descriptionAr: "أمريكانو بارد مع ثلج",
            price: 16,
            categoryId: 2,
            sortOrder: 2,
        },
    });

    const coldBrew = await prisma.menuItem.upsert({
        where: { id: 9 },
        update: {},
        create: {
            id: 9,
            nameAr: "كولد برو",
            nameEn: "Cold Brew",
            descriptionAr: "قهوة باردة مخمرة ببطء ٢٤ ساعة",
            price: 22,
            categoryId: 2,
            sortOrder: 3,
        },
    });

    const frappe = await prisma.menuItem.upsert({
        where: { id: 10 },
        update: {},
        create: {
            id: 10,
            nameAr: "فرابيه",
            nameEn: "Frappé",
            descriptionAr: "قهوة مثلجة كريمية",
            price: 24,
            categoryId: 2,
            sortOrder: 4,
        },
    });

    // === مشروبات طازجة ===
    const orangeJuice = await prisma.menuItem.upsert({
        where: { id: 11 },
        update: {},
        create: {
            id: 11,
            nameAr: "عصير برتقال طازج",
            nameEn: "Fresh Orange Juice",
            descriptionAr: "عصير برتقال طبيعي 100%",
            price: 15,
            categoryId: 3,
            sortOrder: 1,
        },
    });

    const lemonade = await prisma.menuItem.upsert({
        where: { id: 12 },
        update: {},
        create: {
            id: 12,
            nameAr: "ليموناضة",
            nameEn: "Lemonade",
            descriptionAr: "ليمون طازج مع نعناع",
            price: 14,
            categoryId: 3,
            sortOrder: 2,
        },
    });

    const mojito = await prisma.menuItem.upsert({
        where: { id: 13 },
        update: {},
        create: {
            id: 13,
            nameAr: "موهيتو",
            nameEn: "Mojito",
            descriptionAr: "نعناع مع ليمون وصودا",
            price: 18,
            categoryId: 3,
            sortOrder: 3,
        },
    });

    // === شاي ===
    const tea = await prisma.menuItem.upsert({
        where: { id: 14 },
        update: {},
        create: {
            id: 14,
            nameAr: "شاي أحمر",
            nameEn: "Black Tea",
            descriptionAr: "شاي أحمر كلاسيكي",
            price: 8,
            categoryId: 4,
            sortOrder: 1,
        },
    });

    const greenTea = await prisma.menuItem.upsert({
        where: { id: 15 },
        update: {},
        create: {
            id: 15,
            nameAr: "شاي أخضر",
            nameEn: "Green Tea",
            descriptionAr: "شاي أخضر ياباني",
            price: 10,
            categoryId: 4,
            sortOrder: 2,
        },
    });

    const chaiLatte = await prisma.menuItem.upsert({
        where: { id: 16 },
        update: {},
        create: {
            id: 16,
            nameAr: "تشاي لاتيه",
            nameEn: "Chai Latte",
            descriptionAr: "شاي بالتوابل مع حليب مبخر",
            price: 16,
            categoryId: 4,
            sortOrder: 3,
        },
    });

    // === حلويات ===
    const cheesecake = await prisma.menuItem.upsert({
        where: { id: 17 },
        update: {},
        create: {
            id: 17,
            nameAr: "تشيز كيك",
            nameEn: "Cheesecake",
            descriptionAr: "تشيز كيك كلاسيكي كريمي",
            price: 25,
            categoryId: 5,
            sortOrder: 1,
        },
    });

    const brownie = await prisma.menuItem.upsert({
        where: { id: 18 },
        update: {},
        create: {
            id: 18,
            nameAr: "براوني",
            nameEn: "Brownie",
            descriptionAr: "براوني شوكولاتة دافئ",
            price: 20,
            categoryId: 5,
            sortOrder: 2,
        },
    });

    // === سناكات ===
    const croissant = await prisma.menuItem.upsert({
        where: { id: 19 },
        update: {},
        create: {
            id: 19,
            nameAr: "كرواسان",
            nameEn: "Croissant",
            descriptionAr: "كرواسان زبدة فرنسي",
            price: 12,
            categoryId: 6,
            sortOrder: 1,
        },
    });

    const clubSandwich = await prisma.menuItem.upsert({
        where: { id: 20 },
        update: {},
        create: {
            id: 20,
            nameAr: "كلوب ساندويتش",
            nameEn: "Club Sandwich",
            descriptionAr: "ساندويتش دجاج مع خضار",
            price: 28,
            categoryId: 6,
            sortOrder: 2,
        },
    });

    // ─── 4. مجموعات الخيارات ───
    console.log("⚙️ إنشاء خيارات القائمة...");

    // خيار الحجم — للاتيه والكابتشينو والموكا
    for (const itemId of [2, 3, 5, 7, 10]) {
        const sizeGroup = await prisma.menuOptionGroup.upsert({
            where: { id: itemId * 100 + 1 },
            update: {},
            create: {
                id: itemId * 100 + 1,
                nameAr: "الحجم",
                nameEn: "Size",
                isRequired: true,
                isMultiple: false,
                menuItemId: itemId,
                sortOrder: 1,
            },
        });

        await prisma.menuOption.upsert({
            where: { id: itemId * 1000 + 1 },
            update: {},
            create: {
                id: itemId * 1000 + 1,
                nameAr: "صغير",
                nameEn: "Small",
                extraPrice: 0,
                isDefault: true,
                optionGroupId: sizeGroup.id,
                sortOrder: 1,
            },
        });
        await prisma.menuOption.upsert({
            where: { id: itemId * 1000 + 2 },
            update: {},
            create: {
                id: itemId * 1000 + 2,
                nameAr: "وسط",
                nameEn: "Medium",
                extraPrice: 3,
                optionGroupId: sizeGroup.id,
                sortOrder: 2,
            },
        });
        await prisma.menuOption.upsert({
            where: { id: itemId * 1000 + 3 },
            update: {},
            create: {
                id: itemId * 1000 + 3,
                nameAr: "كبير",
                nameEn: "Large",
                extraPrice: 6,
                optionGroupId: sizeGroup.id,
                sortOrder: 3,
            },
        });
    }

    // خيار السكر — لكل القهوة الساخنة
    for (const itemId of [1, 2, 3, 4, 5, 6]) {
        const sugarGroup = await prisma.menuOptionGroup.upsert({
            where: { id: itemId * 100 + 2 },
            update: {},
            create: {
                id: itemId * 100 + 2,
                nameAr: "السكر",
                nameEn: "Sugar",
                isRequired: false,
                isMultiple: false,
                menuItemId: itemId,
                sortOrder: 2,
            },
        });

        await prisma.menuOption.upsert({
            where: { id: itemId * 1000 + 10 },
            update: {},
            create: {
                id: itemId * 1000 + 10,
                nameAr: "بدون سكر",
                nameEn: "No Sugar",
                extraPrice: 0,
                optionGroupId: sugarGroup.id,
                sortOrder: 1,
            },
        });
        await prisma.menuOption.upsert({
            where: { id: itemId * 1000 + 11 },
            update: {},
            create: {
                id: itemId * 1000 + 11,
                nameAr: "سكر قليل",
                nameEn: "Less Sugar",
                extraPrice: 0,
                optionGroupId: sugarGroup.id,
                sortOrder: 2,
            },
        });
        await prisma.menuOption.upsert({
            where: { id: itemId * 1000 + 12 },
            update: {},
            create: {
                id: itemId * 1000 + 12,
                nameAr: "سكر عادي",
                nameEn: "Normal Sugar",
                extraPrice: 0,
                isDefault: true,
                optionGroupId: sugarGroup.id,
                sortOrder: 3,
            },
        });
    }

    // خيار الحليب — للاتيه والكابتشينو
    for (const itemId of [2, 3, 7]) {
        const milkGroup = await prisma.menuOptionGroup.upsert({
            where: { id: itemId * 100 + 3 },
            update: {},
            create: {
                id: itemId * 100 + 3,
                nameAr: "نوع الحليب",
                nameEn: "Milk Type",
                isRequired: false,
                isMultiple: false,
                menuItemId: itemId,
                sortOrder: 3,
            },
        });

        await prisma.menuOption.upsert({
            where: { id: itemId * 1000 + 20 },
            update: {},
            create: {
                id: itemId * 1000 + 20,
                nameAr: "حليب عادي",
                nameEn: "Regular Milk",
                extraPrice: 0,
                isDefault: true,
                optionGroupId: milkGroup.id,
                sortOrder: 1,
            },
        });
        await prisma.menuOption.upsert({
            where: { id: itemId * 1000 + 21 },
            update: {},
            create: {
                id: itemId * 1000 + 21,
                nameAr: "حليب لوز",
                nameEn: "Almond Milk",
                extraPrice: 4,
                optionGroupId: milkGroup.id,
                sortOrder: 2,
            },
        });
        await prisma.menuOption.upsert({
            where: { id: itemId * 1000 + 22 },
            update: {},
            create: {
                id: itemId * 1000 + 22,
                nameAr: "حليب شوفان",
                nameEn: "Oat Milk",
                extraPrice: 5,
                optionGroupId: milkGroup.id,
                sortOrder: 3,
            },
        });
    }

    // خيار إضافات — للكرواسان
    const fillingGroup = await prisma.menuOptionGroup.upsert({
        where: { id: 1901 },
        update: {},
        create: {
            id: 1901,
            nameAr: "الحشوة",
            nameEn: "Filling",
            isRequired: true,
            isMultiple: false,
            menuItemId: 19,
            sortOrder: 1,
        },
    });

    await prisma.menuOption.upsert({
        where: { id: 19001 },
        update: {},
        create: {
            id: 19001,
            nameAr: "سادة",
            nameEn: "Plain",
            extraPrice: 0,
            isDefault: true,
            optionGroupId: fillingGroup.id,
            sortOrder: 1,
        },
    });
    await prisma.menuOption.upsert({
        where: { id: 19002 },
        update: {},
        create: {
            id: 19002,
            nameAr: "شوكولاتة",
            nameEn: "Chocolate",
            extraPrice: 3,
            optionGroupId: fillingGroup.id,
            sortOrder: 2,
        },
    });
    await prisma.menuOption.upsert({
        where: { id: 19003 },
        update: {},
        create: {
            id: 19003,
            nameAr: "جبنة وزعتر",
            nameEn: "Cheese & Thyme",
            extraPrice: 5,
            optionGroupId: fillingGroup.id,
            sortOrder: 3,
        },
    });

    // ─── 5. أدمن افتراضي ───
    console.log("👤 إنشاء حساب الأدمن...");
    const hash = await bcrypt.hash("admin123", 12);
    await prisma.adminUser.upsert({
        where: { username: "admin" },
        update: {},
        create: {
            username: "admin",
            passwordHash: hash,
            displayName: "مدير النظام",
        },
    });

    // ─── ملخص ───
    const tableCount = await prisma.table.count();
    const catCount = await prisma.category.count();
    const itemCount = await prisma.menuItem.count();
    const groupCount = await prisma.menuOptionGroup.count();
    const optionCount = await prisma.menuOption.count();

    console.log(`\n✅ تم تغذية البيانات بنجاح!`);
    console.log(`   📋 طاولات: ${tableCount}`);
    console.log(`   📂 تصنيفات: ${catCount}`);
    console.log(`   🍽️ عناصر: ${itemCount}`);
    console.log(`   ⚙️ مجموعات خيارات: ${groupCount}`);
    console.log(`   🔘 خيارات: ${optionCount}`);
    console.log(`   👤 أدمن: admin / admin123`);
}

main()
    .catch((e) => {
        console.error("❌ خطأ:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
