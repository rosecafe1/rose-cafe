import type { Metadata } from "next";
import MenuView from "@/components/MenuView";

export const metadata: Metadata = {
    title: "روز كافيه · قائمة الطعام",
    description: "تصفّح قائمة روز كافيه",
};

export default function Home() {
    return <MenuView />;
}
