import { checkAdminAccess } from "@/lib/auth/admin-auth";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import { Separator } from "@/components/ui/separator";

// Simple Card Component for Stats if BentoCard is too complex or different
function StatCard({ title, value, subtext }: { title: string, value: string | number, subtext?: string }) {
    return (
        <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
            <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
            <div className="mt-2 text-3xl font-bold text-white">{value}</div>
            {subtext && <p className="text-xs text-neutral-500 mt-1">{subtext}</p>}
        </div>
    );
}

export default async function AdminPage() {
    const isAllowed = await checkAdminAccess();

    if (!isAllowed) {
        redirect('/dashboard');
    }

    // Use Admin Client to bypass RLS for stats
    const supabase = getAdminClient();

    import { AdminUserActions } from "./user-actions";

    // ... existing imports

    // 1. Fetch Profiles Stats
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, tier, created_at, billing_period_end, custom_project_limit')
        .order('created_at', { ascending: false });

    // ... existing code

    <tr>
        <th className="p-4">Email</th>
        <th className="p-4">Tier</th>
        <th className="p-4">Limits</th>
        <th className="p-4">Joined</th>
        <th className="p-4">Actions</th>
    </tr>
                                </thead >
        <tbody className="divide-y divide-neutral-800 bg-black/50">
            {profiles.slice(0, 50).map((user) => {
                const isAdmin = ['sergio@ideapunkt.de', 'sergio@liid.mx'].includes(user.email);
                return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-neutral-300">
                            {user.email}
                            {isAdmin && <span className="ml-2 px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 text-[10px] font-bold border border-red-800/50">ADMIN</span>}
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider 
                                                    ${user.tier === 'founder' ? 'bg-amber-900/40 text-amber-400' :
                                    user.tier === 'pro' ? 'bg-violet-900/40 text-violet-400' :
                                        'bg-neutral-800 text-neutral-400'}`}>
                                {user.tier}
                            </span>
                        </td>
                        <td className="p-4 text-xs text-neutral-500">
                            {user.custom_project_limit ? (
                                <span className="text-cyan-400 font-bold">{user.custom_project_limit} (Custom)</span>
                            ) : (
                                <span>Default</span>
                            )}
                        </td>
                        <td className="p-4 text-neutral-500">
                            {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                            <AdminUserActions
                                userId={user.id}
                                initialTier={user.tier}
                                initialLimit={user.custom_project_limit}
                            />
                        </td>
                    </tr>
                )
            })}
        </tbody>
                            </table >
        <div className="p-3 text-center text-xs text-neutral-500 bg-neutral-900/50 border-t border-neutral-800">
            Showing last 20 users
        </div>
                        </div >
                    </div >

        {/* Side Panel / Alerts */ }
        < div className = "space-y-4" >
                        <h2 className="text-xl font-semibold">System Health</h2>
                        <div className="p-6 rounded-xl bg-green-900/10 border border-green-900/30 text-green-400">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-bold">Operational</span>
                            </div>
                            <p className="text-sm opacity-80">All triggers and webhooks are active.</p>
                        </div>

                        <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
                            <h3 className="font-medium mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="https://app.lemonsqueezy.com/dashboard" target="_blank" className="text-blue-400 hover:underline">
                                        Lemon Squeezy Dashboard ↗
                                    </a>
                                </li>
                                <li>
                                    <a href="https://supabase.com/dashboard" target="_blank" className="text-green-400 hover:underline">
                                        Supabase Dashboard ↗
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div >
                </div >

            </div >
        </div >
    );
}
