import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MenuPage from "./MenuPage";

interface Props {
    params: { tableNumber: string };
}

export async function generateMetadata({ params }: Props) {
    return {
        title: `طاولة ${params.tableNumber} — روز كافيه`,
        description: "تصفح القائمة واطلب من طاولتك",
    };
}

export default async function TablePage({ params }: Props) {
    const tableNumber = parseInt(params.tableNumber);

    if (isNaN(tableNumber)) {
        notFound();
    }

    const table = await prisma.table.findUnique({
        where: { number: tableNumber },
    });

    if (!table || !table.isActive) {
        notFound();
    }

    return <MenuPage tableNumber={tableNumber} />;
}
