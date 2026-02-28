import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const data = await request.json();
    const table = await prisma.table.update({
        where: { id: parseInt(params.id) },
        data: {
            ...(data.label !== undefined && { label: data.label }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
    });
    return NextResponse.json({ table });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    await prisma.table.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true });
}
