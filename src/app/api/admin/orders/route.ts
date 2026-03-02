import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
        where.status = status;
    }

    const orders = await prisma.order.findMany({
        where,
        include: {
            table: true,
            items: {
                include: { options: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    return NextResponse.json({ orders });
}
