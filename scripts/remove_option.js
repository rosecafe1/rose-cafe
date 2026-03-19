const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeOption() {
    try {
        const groups = await prisma.menuOptionGroup.findMany({
            where: { nameAr: 'السكر' },
            include: { options: true }
        });

        for (const group of groups) {
            const bdoonOption = group.options.find(o => o.nameAr === 'بدون');
            if (bdoonOption) {
                await prisma.menuOption.delete({
                    where: { id: bdoonOption.id }
                });
                console.log(`Deleted "بدون" from group ${group.id}`);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

removeOption();
