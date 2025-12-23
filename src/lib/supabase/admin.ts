import { createClient } from '@supabase/supabase-js';

// Note: This client should ONLY be used in server-side API routes.
// NEVER use this on the client side.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey)
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

// Helper to ensure we have the admin client or throw appropriate error at RUNTIME
export const getAdminClient = () => {
    if (!supabaseAdmin) {
        throw new Error("Supabase Admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.");
    }
    return supabaseAdmin;
};
