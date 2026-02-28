import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET all tables
export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const tables = await prisma.table.findMany({ orderBy: { number: "asc" } });
    return NextResponse.json({ tables });
}

// POST create table
export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { number } = await request.json();
    if (!number) return NextResponse.json({ error: "رقم الطاولة مطلوب" }, { status: 400 });

    const exists = await prisma.table.findUnique({ where: { number } });
    if (exists) return NextResponse.json({ error: "رقم الطاولة موجود" }, { status: 409 });

    const table = await prisma.table.create({
        data: { number },
    });
    return NextResponse.json({ table }, { status: 201 });
}
