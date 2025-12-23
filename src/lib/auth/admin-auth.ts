import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const ADMIN_EMAILS = [
    'sergio@ideapunkt.de',
    'sergio@liid.mx'
];

export async function checkAdminAccess() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        return false;
    }

    return ADMIN_EMAILS.includes(user.email);
}

export async function requireAdmin() {
    const isAllowed = await checkAdminAccess();
    if (!isAllowed) {
        throw new Error("Unauthorized");
    }
}
