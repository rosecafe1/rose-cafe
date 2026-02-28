import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

// Simple token-based session (token = base64(username:timestamp:hash))
function generateToken(username: string): string {
    const timestamp = Date.now().toString();
    const raw = `${username}:${timestamp}`;
    return Buffer.from(raw).toString("base64");
}

export async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    const user = await prisma.adminUser.findUnique({ where: { username } });
    if (!user || !user.isActive) {
        return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }

    const token = generateToken(username);
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
    });

    return { success: true };
}

export async function getSession(): Promise<{ username: string; displayName: string } | null> {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    try {
        const decoded = Buffer.from(token, "base64").toString("utf8");
        const [username] = decoded.split(":");
        if (!username) return null;

        const user = await prisma.adminUser.findUnique({ where: { username } });
        if (!user || !user.isActive) return null;

        return { username: user.username, displayName: user.displayName };
    } catch {
        return null;
    }
}

export async function logout() {
    const cookieStore = cookies();
    cookieStore.delete(SESSION_COOKIE);
}
