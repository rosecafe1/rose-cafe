import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            include: {
                items: {
                    where: { isAvailable: true },
                    orderBy: { sortOrder: "asc" },
                    include: {
                        optionGroups: {
                            orderBy: { sortOrder: "asc" },
                            include: {
                                options: {
                                    where: { isAvailable: true },
                                    orderBy: { sortOrder: "asc" },
                                },
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({ categories }, { status: 200 });
    } catch (error) {
        console.error("Menu API error:", error);
        return NextResponse.json(
            { error: "فشل تحميل القائمة" },
            { status: 500 }
        );
    }
}
