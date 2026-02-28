import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH update item
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const id = parseInt(params.id);
    const data = await request.json();

    const item = await prisma.menuItem.update({
        where: { id },
        data: {
            ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
            ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
            ...(data.descriptionAr !== undefined && { descriptionAr: data.descriptionAr }),
            ...(data.price !== undefined && { price: data.price }),
            ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
            ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
            ...(data.image !== undefined && { image: data.image }),
        },
        include: { category: { select: { nameAr: true } } },
    });
    return NextResponse.json({ item });
}

// DELETE item
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    await prisma.menuItem.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true });
}
