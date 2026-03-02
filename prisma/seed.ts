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
            where: { id: String().padStart(24, '0') },
            update: {},
            create: { id: String().padStart(24, '0'), nameAr: "قهوة ساخنة", nameEn: "Hot Coffee", sortOrder: 1, image: "☕" },
        }),
        prisma.category.upsert({
            where: { id: String().padStart(24, '0') },
            update: {},
            create: { id: String().padStart(24, '0'), nameAr: "قهوة باردة", nameEn: "Iced Coffee", sortOrder: 2, image: "🧊" },
        }),
        prisma.category.upsert({
            where: { id: String().padStart(24, '0') },
            update: {},
            create: { id: String().padStart(24, '0'), nameAr: "مشروبات طازجة", nameEn: "Fresh Drinks", sortOrder: 3, image: "🍊" },
        }),
        prisma.category.upsert({
            where: { id: String().padStart(24, '0') },
            update: {},
            create: { id: String().padStart(24, '0'), nameAr: "شاي", nameEn: "Tea", sortOrder: 4, image: "🍵" },
        }),
        prisma.category.upsert({
            where: { id: String().padStart(24, '0') },
            update: {},
            create: { id: String().padStart(24, '0'), nameAr: "حلويات", nameEn: "Desserts", sortOrder: 5, image: "🍰" },
        }),
        prisma.category.upsert({
            where: { id: String().padStart(24, '0') },
            update: {},
            create: { id: String().padStart(24, '0'), nameAr: "سناكات", nameEn: "Snacks", sortOrder: 6, image: "🥐" },
        }),
    ]);

    // ─── 3. عناصر القائمة مع الخيارات ───
    console.log("🍽️ إنشاء عناصر القائمة...");

    // === قهوة ساخنة ===
    const espresso = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "إسبريسو",
            nameEn: "Espresso",
            descriptionAr: "قهوة إسبريسو غنية ومركزة",
            price: 12,
            categoryId: String().padStart(24, '0'),
            sortOrder: 1,
        },
    });

    const latte = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "لاتيه",
            nameEn: "Latte",
            descriptionAr: "إسبريسو مع حليب مبخر ناعم",
            price: 18,
            categoryId: String().padStart(24, '0'),
            sortOrder: 2,
        },
    });

    const cappuccino = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "كابتشينو",
            nameEn: "Cappuccino",
            descriptionAr: "إسبريسو مع رغوة حليب كثيفة",
            price: 18,
            categoryId: String().padStart(24, '0'),
            sortOrder: 3,
        },
    });

    const americano = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "أمريكانو",
            nameEn: "Americano",
            descriptionAr: "إسبريسو مع ماء ساخن",
            price: 14,
            categoryId: String().padStart(24, '0'),
            sortOrder: 4,
        },
    });

    const mocha = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "موكا",
            nameEn: "Mocha",
            descriptionAr: "إسبريسو مع شوكولاتة وحليب",
            price: 22,
            categoryId: String().padStart(24, '0'),
            sortOrder: 5,
        },
    });

    const turkishCoffee = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "قهوة تركية",
            nameEn: "Turkish Coffee",
            descriptionAr: "قهوة تركية أصلية مع هيل",
            price: 10,
            categoryId: String().padStart(24, '0'),
            sortOrder: 6,
        },
    });

    // === قهوة باردة ===
    const icedLatte = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "آيس لاتيه",
            nameEn: "Iced Latte",
            descriptionAr: "لاتيه بارد منعش",
            price: 20,
            categoryId: String().padStart(24, '0'),
            sortOrder: 1,
        },
    });

    const icedAmericano = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "آيس أمريكانو",
            nameEn: "Iced Americano",
            descriptionAr: "أمريكانو بارد مع ثلج",
            price: 16,
            categoryId: String().padStart(24, '0'),
            sortOrder: 2,
        },
    });

    const coldBrew = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "كولد برو",
            nameEn: "Cold Brew",
            descriptionAr: "قهوة باردة مخمرة ببطء ٢٤ ساعة",
            price: 22,
            categoryId: String().padStart(24, '0'),
            sortOrder: 3,
        },
    });

    const frappe = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "فرابيه",
            nameEn: "Frappé",
            descriptionAr: "قهوة مثلجة كريمية",
            price: 24,
            categoryId: String().padStart(24, '0'),
            sortOrder: 4,
        },
    });

    // === مشروبات طازجة ===
    const orangeJuice = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "عصير برتقال طازج",
            nameEn: "Fresh Orange Juice",
            descriptionAr: "عصير برتقال طبيعي 100%",
            price: 15,
            categoryId: String().padStart(24, '0'),
            sortOrder: 1,
        },
    });

    const lemonade = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "ليموناضة",
            nameEn: "Lemonade",
            descriptionAr: "ليمون طازج مع نعناع",
            price: 14,
            categoryId: String().padStart(24, '0'),
            sortOrder: 2,
        },
    });

    const mojito = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "موهيتو",
            nameEn: "Mojito",
            descriptionAr: "نعناع مع ليمون وصودا",
            price: 18,
            categoryId: String().padStart(24, '0'),
            sortOrder: 3,
        },
    });

    // === شاي ===
    const tea = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "شاي أحمر",
            nameEn: "Black Tea",
            descriptionAr: "شاي أحمر كلاسيكي",
            price: 8,
            categoryId: String().padStart(24, '0'),
            sortOrder: 1,
        },
    });

    const greenTea = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "شاي أخضر",
            nameEn: "Green Tea",
            descriptionAr: "شاي أخضر ياباني",
            price: 10,
            categoryId: String().padStart(24, '0'),
            sortOrder: 2,
        },
    });

    const chaiLatte = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "تشاي لاتيه",
            nameEn: "Chai Latte",
            descriptionAr: "شاي بالتوابل مع حليب مبخر",
            price: 16,
            categoryId: String().padStart(24, '0'),
            sortOrder: 3,
        },
    });

    // === حلويات ===
    const cheesecake = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "تشيز كيك",
            nameEn: "Cheesecake",
            descriptionAr: "تشيز كيك كلاسيكي كريمي",
            price: 25,
            categoryId: String().padStart(24, '0'),
            sortOrder: 1,
        },
    });

    const brownie = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "براوني",
            nameEn: "Brownie",
            descriptionAr: "براوني شوكولاتة دافئ",
            price: 20,
            categoryId: String().padStart(24, '0'),
            sortOrder: 2,
        },
    });

    // === سناكات ===
    const croissant = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "كرواسان",
            nameEn: "Croissant",
            descriptionAr: "كرواسان زبدة فرنسي",
            price: 12,
            categoryId: String().padStart(24, '0'),
            sortOrder: 1,
        },
    });

    const clubSandwich = await prisma.menuItem.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "كلوب ساندويتش",
            nameEn: "Club Sandwich",
            descriptionAr: "ساندويتش دجاج مع خضار",
            price: 28,
            categoryId: String().padStart(24, '0'),
            sortOrder: 2,
        },
    });

    // ─── 4. مجموعات الخيارات ───
    console.log("⚙️ إنشاء خيارات القائمة...");

    // خيار الحجم — للاتيه والكابتشينو والموكا
    for (const itemId of [2, 3, 5, 7, 10]) {
        const sizeGroup = await prisma.menuOptionGroup.upsert({
            where: { id: String(itemId * 100 + 1).padStart(24, '0') },
            update: {},
            create: {
                id: String(itemId * 100 + 1).padStart(24, '0'),
                nameAr: "الحجم",
                nameEn: "Size",
                isRequired: true,
                isMultiple: false,
                menuItemId: String(itemId).padStart(24, '0'),
                sortOrder: 1,
            },
        });

        await prisma.menuOption.upsert({
            where: { id: String(itemId * 1000 + 1).padStart(24, '0') },
            update: {},
            create: {
                id: String(itemId * 1000 + 1).padStart(24, '0'),
                nameAr: "صغير",
                nameEn: "Small",
                extraPrice: 0,
                isDefault: true,
                optionGroupId: String(sizeGroup.id).padStart(24, '0'),
                sortOrder: 1,
            },
        });
        await prisma.menuOption.upsert({
            where: { id: String(itemId * 1000 + 2).padStart(24, '0') },
            update: {},
            create: {
                id: String(itemId * 1000 + 2).padStart(24, '0'),
                nameAr: "وسط",
                nameEn: "Medium",
                extraPrice: 3,
                optionGroupId: String(sizeGroup.id).padStart(24, '0'),
                sortOrder: 2,
            },
        });
        await prisma.menuOption.upsert({
            where: { id: String(itemId * 1000 + 3).padStart(24, '0') },
            update: {},
            create: {
                id: String(itemId * 1000 + 3).padStart(24, '0'),
                nameAr: "كبير",
                nameEn: "Large",
                extraPrice: 6,
                optionGroupId: String(sizeGroup.id).padStart(24, '0'),
                sortOrder: 3,
            },
        });
    }

    // خيار السكر — لكل القهوة الساخنة
    for (const itemId of [1, 2, 3, 4, 5, 6]) {
        const sugarGroup = await prisma.menuOptionGroup.upsert({
            where: { id: String(itemId * 100 + 2).padStart(24, '0') },
            update: {},
            create: {
                id: String(itemId * 100 + 2).padStart(24, '0'),
                nameAr: "السكر",
                nameEn: "Sugar",
                isRequired: false,
                isMultiple: false,
                menuItemId: String(itemId).padStart(24, '0'),
                sortOrder: 2,
            },
        });

        await prisma.menuOption.upsert({
            where: { id: String(itemId * 1000 + 10).padStart(24, '0') },
            update: {},
            create: {
                id: String(itemId * 1000 + 10).padStart(24, '0'),
                nameAr: "بدون سكر",
                nameEn: "No Sugar",
                extraPrice: 0,
                optionGroupId: String(sugarGroup.id).padStart(24, '0'),
                sortOrder: 1,
            },
        });
        await prisma.menuOption.upsert({
            where: { id: String(itemId * 1000 + 11).padStart(24, '0') },
            update: {},
            create: {
                id: String(itemId * 1000 + 11).padStart(24, '0'),
                nameAr: "سكر قليل",
                nameEn: "Less Sugar",
                extraPrice: 0,
                optionGroupId: String(sugarGroup.id).padStart(24, '0'),
                sortOrder: 2,
            },
        });
        await prisma.menuOption.upsert({
            where: { id: String(itemId * 1000 + 12).padStart(24, '0') },
            update: {},
            create: {
                id: String(itemId * 1000 + 12).padStart(24, '0'),
                nameAr: "سكر عادي",
                nameEn: "Normal Sugar",
                extraPrice: 0,
                isDefault: true,
                optionGroupId: String(sugarGroup.id).padStart(24, '0'),
                sortOrder: 3,
            },
        });
    }

    // خيار الحليب — للاتيه والكابتشينو
    for (const itemId of [2, 3, 7]) {
        const milkGroup = await prisma.menuOptionGroup.upsert({
            where: { id: String(itemId * 100 + 3).padStart(24, '0') },
            update: {},
            create: {
                id: String(itemId * 100 + 3).padStart(24, '0'),
                nameAr: "نوع الحليب",
                nameEn: "Milk Type",
                isRequired: false,
                isMultiple: false,
                menuItemId: String(itemId).padStart(24, '0'),
                sortOrder: 3,
            },
        });

        await prisma.menuOption.upsert({
            where: { id: String(itemId * 1000 + 20).padStart(24, '0') },
            update: {},
            create: {
                id: String(itemId * 1000 + 20).padStart(24, '0'),
                nameAr: "حليب عادي",
                nameEn: "Regular Milk",
                extraPrice: 0,
                isDefault: true,
                optionGroupId: String(milkGroup.id).padStart(24, '0'),
                sortOrder: 1,
            },
        });
        await prisma.menuOption.upsert({
            where: { id: String(itemId * 1000 + 21).padStart(24, '0') },
            update: {},
            create: {
                id: String(itemId * 1000 + 21).padStart(24, '0'),
                nameAr: "حليب لوز",
                nameEn: "Almond Milk",
                extraPrice: 4,
                optionGroupId: String(milkGroup.id).padStart(24, '0'),
                sortOrder: 2,
            },
        });
        await prisma.menuOption.upsert({
            where: { id: String(itemId * 1000 + 22).padStart(24, '0') },
            update: {},
            create: {
                id: String(itemId * 1000 + 22).padStart(24, '0'),
                nameAr: "حليب شوفان",
                nameEn: "Oat Milk",
                extraPrice: 5,
                optionGroupId: String(milkGroup.id).padStart(24, '0'),
                sortOrder: 3,
            },
        });
    }

    // خيار إضافات — للكرواسان
    const fillingGroup = await prisma.menuOptionGroup.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "الحشوة",
            nameEn: "Filling",
            isRequired: true,
            isMultiple: false,
            menuItemId: String().padStart(24, '0'),
            sortOrder: 1,
        },
    });

    await prisma.menuOption.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "سادة",
            nameEn: "Plain",
            extraPrice: 0,
            isDefault: true,
            optionGroupId: String(fillingGroup.id).padStart(24, '0'),
            sortOrder: 1,
        },
    });
    await prisma.menuOption.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "شوكولاتة",
            nameEn: "Chocolate",
            extraPrice: 3,
            optionGroupId: String(fillingGroup.id).padStart(24, '0'),
            sortOrder: 2,
        },
    });
    await prisma.menuOption.upsert({
        where: { id: String().padStart(24, '0') },
        update: {},
        create: {
            id: String().padStart(24, '0'),
            nameAr: "جبنة وزعتر",
            nameEn: "Cheese & Thyme",
            extraPrice: 5,
            optionGroupId: String(fillingGroup.id).padStart(24, '0'),
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
