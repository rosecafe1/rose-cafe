import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
    try {
        const pathSegments = params.path;

        // حماية من التلاعب في المسارات (Path Traversal)
        if (pathSegments.some(segment => segment.includes('..'))) {
            return new NextResponse("Invalid path", { status: 400 });
        }

        // تحديد مسار المجلد الأساسي بناءً على البيئة (دوكر أو تطوير محلي)
        const isProdContainer = process.env.NODE_ENV === 'production';
        const baseDir = isProdContainer ? path.join('/app', 'public') : path.join(process.cwd(), "public");

        // بناء المسار النهائي للصورة
        const finalPath = path.join(baseDir, "uploads", ...pathSegments);

        // التحقق من وجود الصورة في السيرفر
        if (!fs.existsSync(finalPath)) {
            return new NextResponse("Image not found", { status: 404 });
        }

        // قراءة الصورة
        const file = await readFile(finalPath);
        const ext = finalPath.split('.').pop()?.toLowerCase();

        const contentTypes: Record<string, string> = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'svg': 'image/svg+xml'
        };

        // إرسال الصورة كاستجابة مع ترويسة الكاش
        return new NextResponse(file, {
            headers: {
                "Content-Type": ext && contentTypes[ext] ? contentTypes[ext] : "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Image serve error:", error);
        return new NextResponse("Server error", { status: 500 });
    }
}
