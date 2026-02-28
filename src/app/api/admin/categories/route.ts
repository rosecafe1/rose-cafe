import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET all categories (for admin - includes inactive)
export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const categories = await prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
            _count: { select: { items: true } },
        },
    });
    return NextResponse.json({ categories });
}

// POST create category
export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { nameAr, nameEn, image } = await request.json();
    if (!nameAr) return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });

    const maxSort = await prisma.category.aggregate({ _max: { sortOrder: true } });
    const category = await prisma.category.create({
        data: { nameAr, nameEn: nameEn || "", image: image || null, sortOrder: (maxSort._max.sortOrder || 0) + 1 },
    });
    return NextResponse.json({ category }, { status: 201 });
}
