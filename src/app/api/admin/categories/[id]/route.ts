import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH update category
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const id = parseInt(params.id);
    const data = await request.json();

    const category = await prisma.category.update({
        where: { id },
        data: {
            ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
            ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
            ...(data.image !== undefined && { image: data.image }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
            ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        },
    });
    return NextResponse.json({ category });
}

// DELETE category
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    try {
        await prisma.category.delete({ where: { id: parseInt(params.id) } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to delete category:", error);
        return NextResponse.json({ error: error.message || "فشل الحذف" }, { status: 500 });
    }
}
