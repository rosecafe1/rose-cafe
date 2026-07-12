import { redirect } from "next/navigation";

// Tables are no longer used — the menu lives on the homepage.
// Redirect any legacy /t/<number> link to the main menu.
export default function TablePage() {
    redirect("/");
}
