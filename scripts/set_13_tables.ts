import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Ensuring exactly 13 tables exist...");

    // First, delete tables with numbers > 13
    await prisma.table.deleteMany({
        where: {
            number: { gt: 13 }
        }
    });

    // Check existing tables 1-13
    for (let i = 1; i <= 13; i++) {
        const table = await prisma.table.findUnique({
            where: { number: i }
        });

        if (!table) {
            await prisma.table.create({
                data: {
                    number: i,
                    label: `طاولة ${i}`,
                    isActive: true
                }
            });
            console.log(`Created table ${i}`);
        }
    }

    console.log("Done. There should now be exactly 13 tables.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
