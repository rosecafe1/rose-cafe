import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tablesCount = await prisma.table.count();
    const categoriesCount = await prisma.category.count();
    const itemsCount = await prisma.menuItem.count();
    const adminCount = await prisma.adminUser.count();

    console.log(`✅ Database connection successful!`);
    console.log(`📋 Tables: ${tablesCount}`);
    console.log(`📂 Categories: ${categoriesCount}`);
    console.log(`🍽️ Menu Items: ${itemsCount}`);
    console.log(`👤 Admins: ${adminCount}`);
}

main()
    .catch((e) => {
        console.error('❌ Database connection failed', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
