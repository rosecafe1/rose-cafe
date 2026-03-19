const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkItem() {
    try {
        const item = await prisma.menuItem.findFirst({
            where: { nameAr: 'أراجيل' },
            include: {
                optionGroups: {
                    include: { options: true }
                }
            }
        });

        console.log(JSON.stringify(item, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkItem();
