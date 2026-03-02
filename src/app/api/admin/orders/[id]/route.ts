import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { eventManager } from "@/lib/events";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const orderId = params.id;
    if (!orderId) {
        return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 });
    }

    const { status } = await request.json();
    const validStatuses = ["NEW", "PREPARING", "READY", "SERVED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }

    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            status,
            statusChangedBy: session.username,
        },
        include: {
            table: true,
            items: { include: { options: true } },
        },
    });

    // Broadcast to admin
    eventManager.broadcast("status_change", order);

    return NextResponse.json({ order });
}
