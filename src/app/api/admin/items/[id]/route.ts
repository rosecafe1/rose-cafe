import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH update item
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const id: string = params.id;
    const data = await request.json();

    // Update main item fields
    const item = await prisma.menuItem.update({
        where: { id },
        data: {
            ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
            ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
            ...(data.descriptionAr !== undefined && { descriptionAr: data.descriptionAr }),
            ...(data.price !== undefined && { price: Number(parseFloat(data.price.toString()).toFixed(2)) }),
            ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
            ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
            ...(data.image !== undefined && { image: data.image }),
        },
        include: { category: { select: { nameAr: true } } },
    });

    // If optionGroups are provided, completely replace them for simplicity
    if (data.optionGroups !== undefined) {
        // Delete existing option groups for this item
        await prisma.menuOptionGroup.deleteMany({
            where: { menuItemId: id }
        });

        // Create new replacement option groups
        if (data.optionGroups.length > 0) {
            for (let gIndex = 0; gIndex < data.optionGroups.length; gIndex++) {
                const group = data.optionGroups[gIndex];
                await prisma.menuOptionGroup.create({
                    data: {
                        nameAr: group.nameAr,
                        nameEn: group.nameEn || "",
                        isRequired: group.isRequired || false,
                        isMultiple: group.isMultiple || false,
                        sortOrder: gIndex + 1,
                        menuItemId: id,
                        options: {
                            create: group.options?.map((opt: any, oIndex: number) => ({
                                nameAr: opt.nameAr,
                                nameEn: opt.nameEn || "",
                                extraPrice: Number(parseFloat(opt.extraPrice?.toString() || "0").toFixed(2)),
                                isDefault: opt.isDefault || false,
                                isAvailable: opt.isAvailable !== false,
                                sortOrder: oIndex + 1,
                            })) || []
                        }
                    }
                });
            }
        }
    }

    // Fetch the updated item with optionGroups
    const finalItem = await prisma.menuItem.findUnique({
        where: { id },
        include: {
            category: { select: { nameAr: true } },
            optionGroups: {
                orderBy: { sortOrder: 'asc' },
                include: { options: { orderBy: { sortOrder: 'asc' } } }
            }
        }
    });

    return NextResponse.json({ item: finalItem });
}

// DELETE item
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    await prisma.menuItem.delete({ where: { id: params.id as string } });
    return NextResponse.json({ success: true });
}
