import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET all items (admin - includes unavailable)
export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const where: any = {};
    if (categoryId) where.categoryId = parseInt(categoryId);

    const items = await prisma.menuItem.findMany({
        where,
        orderBy: { sortOrder: "asc" },
        include: {
            category: { select: { nameAr: true } },
            optionGroups: {
                orderBy: { sortOrder: "asc" },
                include: { options: { orderBy: { sortOrder: "asc" } } },
            },
        },
    });
    return NextResponse.json({ items });
}

// POST create item
export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { nameAr, nameEn, descriptionAr, price, categoryId, image } = await request.json();
    if (!nameAr || !price || !categoryId) {
        return NextResponse.json({ error: "الاسم والسعر والتصنيف مطلوبين" }, { status: 400 });
    }

    const maxSort = await prisma.menuItem.aggregate({
        where: { categoryId },
        _max: { sortOrder: true },
    });

    const item = await prisma.menuItem.create({
        data: {
            nameAr,
            nameEn: nameEn || "",
            descriptionAr: descriptionAr || null,
            price,
            categoryId,
            image: image || null,
            sortOrder: (maxSort._max.sortOrder || 0) + 1,
        },
        include: { category: { select: { nameAr: true } } },
    });
    return NextResponse.json({ item }, { status: 201 });
}
