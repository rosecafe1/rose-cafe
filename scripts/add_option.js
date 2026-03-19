const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addOption() {
    try {
        const groups = await prisma.menuOptionGroup.findMany({
            where: { nameAr: 'السكر' },
            include: { options: true }
        });

        for (const group of groups) {
            const hasBdoon = group.options.some(o => o.nameAr === 'بدون');
            if (!hasBdoon) {
                await prisma.menuOption.create({
                    data: {
                        nameAr: 'بدون',
                        nameEn: 'Without',
                        extraPrice: 0,
                        optionGroup: {
                            connect: { id: group.id }
                        }
                    }
                });
                console.log(`Added "بدون" to group ${group.id}`);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

addOption();
