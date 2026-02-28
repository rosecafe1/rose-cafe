import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import MenuManager from "./MenuManager";

export default async function AdminMenuPage() {
    const session = await getSession();
    if (!session) redirect("/admin/login");
    return <MenuManager />;
}
