import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventManager } from "@/lib/events";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max orders
const RATE_WINDOW = 60_000; // per minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
        return true;
    }
    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
    return true;
}

export async function POST(request: Request) {
    try {
        // Rate limit
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: "طلبات كثيرة — انتظر قليلاً" },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { tableNumber, notes, idempotencyKey, items } = body;

        // Validate
        if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "بيانات غير صالحة" },
                { status: 400 }
            );
        }

        // Check idempotency
        if (idempotencyKey) {
            const existing = await prisma.order.findUnique({
                where: { idempotencyKey },
            });
            if (existing) {
                return NextResponse.json({ order: existing, duplicate: true });
            }
        }

        // Verify table
        const table = await prisma.table.findUnique({
            where: { number: tableNumber },
        });
        if (!table || !table.isActive) {
            return NextResponse.json(
                { error: "الطاولة غير موجودة" },
                { status: 404 }
            );
        }

        // Fetch all menu items with options
        const menuItemIds = items.map((i: any) => i.menuItemId);
        const menuItems = await prisma.menuItem.findMany({
            where: { id: { in: menuItemIds }, isAvailable: true },
            include: {
                optionGroups: {
                    include: { options: true },
                },
            },
        });

        if (menuItems.length !== menuItemIds.length) {
            return NextResponse.json(
                { error: "بعض الأصناف غير متوفرة" },
                { status: 400 }
            );
        }

        // Build order items with snapshots
        let totalAmount = 0;
        const orderItemsData = items.map((cartItem: any) => {
            const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId)!;
            const unitPrice = Number(menuItem.price);
            const quantity = Math.max(1, Math.min(99, cartItem.quantity || 1));

            // Resolve options
            const selectedOptionIds: string[] = cartItem.optionIds || [];
            const allOptions = menuItem.optionGroups.flatMap((g) => g.options);
            const selectedOptions = allOptions.filter((o) => selectedOptionIds.includes(o.id));

            const optionsExtra = selectedOptions.reduce((sum, o) => sum + Number(o.extraPrice), 0);
            const itemTotal = (unitPrice + optionsExtra) * quantity;
            totalAmount += itemTotal;

            return {
                menuItemId: menuItem.id,
                quantity,
                unitPrice,
                itemNameAr: menuItem.nameAr,
                notes: cartItem.notes || null,
                options: {
                    create: selectedOptions.map((opt) => ({
                        menuOptionId: opt.id,
                        optionNameAr: opt.nameAr,
                        extraPrice: Number(opt.extraPrice),
                    })),
                },
            };
        });

        // Create order in transaction
        const order = await prisma.order.create({
            data: {
                tableId: table.id,
                notes: notes || null,
                totalAmount,
                idempotencyKey: idempotencyKey || null,
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: {
                    include: { options: true },
                },
                table: true,
            },
        });

        // Broadcast to admin
        eventManager.broadcast("new_order", order);

        return NextResponse.json({ order }, { status: 201 });
    } catch (error) {
        console.error("Order API error:", error);
        return NextResponse.json(
            { error: "فشل إنشاء الطلب" },
            { status: 500 }
        );
    }
}
