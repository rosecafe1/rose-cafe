import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
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

        // Upload to Cloudinary using a stream
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "rose-cafe/menu",
                    transformation: [{ width: 800, crop: "limit", quality: "auto" }] // Optimize on upload
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        // @ts-ignore
        const url = uploadResult.secure_url;

        return NextResponse.json({ url }, { status: 201 });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return NextResponse.json({ error: "فشل في رفع الصورة للسيرفر السحابي" }, { status: 500 });
    }
}
