import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { tableNumber: string } }
) {
    try {
        const tableNumber = parseInt(params.tableNumber);

        if (isNaN(tableNumber) || tableNumber < 1 || tableNumber > 100) {
            return NextResponse.json(
                { error: "رقم طاولة غير صالح" },
                { status: 400 }
            );
        }

        const table = await prisma.table.findUnique({
            where: { number: tableNumber },
        });

        if (!table || !table.isActive) {
            return NextResponse.json(
                { error: "الطاولة غير موجودة" },
                { status: 404 }
            );
        }

        return NextResponse.json({ table });
    } catch (error) {
        console.error("Table API error:", error);
        return NextResponse.json(
            { error: "خطأ في الخادم" },
            { status: 500 }
        );
    }
}
