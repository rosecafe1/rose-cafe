import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import QRManager from "./QRManager";

export default async function AdminTablesPage() {
    const session = await getSession();
    if (!session) redirect("/admin/login");
    return <QRManager />;
}
