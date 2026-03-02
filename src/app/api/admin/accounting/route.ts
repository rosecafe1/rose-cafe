import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "today";
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (fromDate && toDate) {
        startDate = new Date(fromDate);
        endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
    } else {
        switch (period) {
            case "today":
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case "week":
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                break;
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case "all":
                startDate = new Date(2020, 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
    }

    const whereServed = {
        status: "SERVED" as const,
        createdAt: { gte: startDate, lte: endDate },
    };

    const whereNotCancelled = {
        status: { not: "CANCELLED" as const },
        createdAt: { gte: startDate, lte: endDate },
    };

    try {
        // 1. Total revenue & order count (SERVED orders only)
        const revenueAgg = await prisma.order.aggregate({
            where: whereServed,
            _sum: { totalAmount: true },
            _count: true,
            _avg: { totalAmount: true },
        });

        const totalRevenue = revenueAgg._sum.totalAmount || 0;
        const orderCount = revenueAgg._count || 0;
        const avgOrder = revenueAgg._avg.totalAmount || 0;

        // 2. All orders count (including non-served but not cancelled)
        const allOrdersCount = await prisma.order.count({ where: whereNotCancelled });
        const cancelledCount = await prisma.order.count({
            where: { status: "CANCELLED", createdAt: { gte: startDate, lte: endDate } },
        });

        // 3. Top selling items
        const topItems = await prisma.orderItem.groupBy({
            by: ["itemNameAr"],
            where: { order: whereServed },
            _sum: { quantity: true },
            _count: true,
            orderBy: { _sum: { quantity: "desc" } },
            take: 10,
        });

        // Get revenue per item
        const topItemsWithRevenue = await Promise.all(
            topItems.map(async (item) => {
                const revenue = await prisma.orderItem.aggregate({
                    where: { itemNameAr: item.itemNameAr, order: whereServed },
                    _sum: { unitPrice: true, quantity: true },
                });
                const totalQty = revenue._sum.quantity || 0;
                const unitPrice = revenue._sum.unitPrice || 0;
                return {
                    name: item.itemNameAr,
                    quantity: item._sum.quantity || 0,
                    revenue: unitPrice * totalQty / (totalQty || 1),
                    orderCount: item._count,
                };
            })
        );

        // 4. Daily sales breakdown
        const orders = await prisma.order.findMany({
            where: whereServed,
            select: { totalAmount: true, createdAt: true },
            orderBy: { createdAt: "asc" },
        });

        const dailySalesMap = new Map<string, { revenue: number; count: number }>();
        orders.forEach((order) => {
            const day = order.createdAt.toISOString().split("T")[0];
            const existing = dailySalesMap.get(day) || { revenue: 0, count: 0 };
            existing.revenue += order.totalAmount;
            existing.count += 1;
            dailySalesMap.set(day, existing);
        });

        const dailySales = Array.from(dailySalesMap.entries()).map(([date, data]) => ({
            date,
            revenue: Math.round(data.revenue * 100) / 100,
            count: data.count,
        }));

        // 5. Sales by category
        const categoryStats = await prisma.orderItem.groupBy({
            by: ["menuItemId"],
            where: { order: whereServed },
            _sum: { quantity: true },
        });

        const menuItems = await prisma.menuItem.findMany({
            where: { id: { in: categoryStats.map((c) => c.menuItemId) } },
            select: { id: true, price: true, category: { select: { nameAr: true } } },
        });

        const categoryMap = new Map<string, { revenue: number; count: number }>();
        categoryStats.forEach((stat) => {
            const mi = menuItems.find((m) => m.id === stat.menuItemId);
            if (mi) {
                const catName = mi.category.nameAr;
                const existing = categoryMap.get(catName) || { revenue: 0, count: 0 };
                existing.revenue += mi.price * (stat._sum.quantity || 0);
                existing.count += stat._sum.quantity || 0;
                categoryMap.set(catName, existing);
            }
        });

        const salesByCategory = Array.from(categoryMap.entries())
            .map(([name, data]) => ({
                name,
                revenue: Math.round(data.revenue * 100) / 100,
                count: data.count,
            }))
            .sort((a, b) => b.revenue - a.revenue);

        return NextResponse.json({
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            orderCount,
            avgOrder: Math.round(avgOrder * 100) / 100,
            allOrdersCount,
            cancelledCount,
            topItems: topItemsWithRevenue,
            dailySales,
            salesByCategory,
            period,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });
    } catch (error: any) {
        console.error("Accounting API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
