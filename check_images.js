const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const cats = await p.category.findMany({ select: { id: true, nameAr: true, image: true } });
    console.log('=== CATEGORIES ===');
    cats.forEach(c => console.log(c.nameAr, '|', c.image || 'NO IMAGE'));

    console.log('');

    const items = await p.menuItem.findMany({ select: { id: true, nameAr: true, image: true, categoryId: true } });
    console.log('=== MENU ITEMS ===');
    items.forEach(i => console.log(i.nameAr, '|', i.image || 'NO IMAGE'));

    await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
