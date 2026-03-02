import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "لا يوجد ملف" }, { status: 400 });

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
        return NextResponse.json({ error: "نوع الملف غير مدعوم" }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "حجم الملف أكبر من 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // In Next.js standalone mode, process.cwd() is .next/standalone. 
    // Static files are served from the actual '/app/public' folder in docker
    // We try multiple paths to be safe (Local dev vs Docker Prod)
    const isProdContainer = process.env.NODE_ENV === 'production';
    const baseDir = isProdContainer ? path.join('/app', 'public') : path.join(process.cwd(), "public");

    const uploadDir = path.join(baseDir, "uploads", "menu");
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const url = `/uploads/menu/${filename}`;
    return NextResponse.json({ url }, { status: 201 });
}

