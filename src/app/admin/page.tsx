import { checkAdminAccess } from "@/lib/auth/admin-auth";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/bento-card"; // Assuming reused card or standard UI
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

    // 1. Fetch Profiles Stats
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, tier, created_at, billing_period_end')
        .order('created_at', { ascending: false });

    if (profilesError) {
        return <div className="p-8 text-red-500">Error loading admin data: {profilesError.message}</div>;
    }

    const totalUsers = profiles.length;
    const freeUsers = profiles.filter(p => p.tier === 'free').length;
    const proUsers = profiles.filter(p => p.tier === 'pro').length;
    const founderUsers = profiles.filter(p => p.tier === 'founder').length;

    // 2. Fetch Projects Stats
    const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

    // 3. Estimate AI Usage (Embeddings count)
    // Note: 'code_embeddings' might be large, counting might be slow. Use head:true.
    const { count: totalEmbeddings } = await supabase
        .from('code_embeddings')
        .select('*', { count: 'exact', head: true });


    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-neutral-400">Monitoring StackMemory usage & billing.</p>
                    </div>
                    <div className="px-3 py-1 bg-neutral-900 rounded-full text-xs text-neutral-500 border border-neutral-800">
                        Admin Access Area
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard title="Total Users" value={totalUsers} subtext="Registered accounts" />
                    <StatCard title="Pro Legends" value={proUsers} subtext="€8.99/mo (MRR Impact)" />
                    <StatCard title="Founders" value={founderUsers} subtext="€49.99 One-time" />
                    <StatCard title="Total Projects" value={totalProjects || 0} subtext={`${totalEmbeddings || 0} AI Vectors stored`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Table (Span 2) */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-semibold">Latest Users</h2>
                        <div className="border border-neutral-800 rounded-xl overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-neutral-900 text-neutral-400 font-medium">
                                    <tr>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Tier</th>
                                        <th className="p-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800 bg-black/50">
                                    {profiles.slice(0, 20).map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono text-neutral-300">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider 
                                                    ${user.tier === 'founder' ? 'bg-amber-900/40 text-amber-400' :
                                                        user.tier === 'pro' ? 'bg-violet-900/40 text-violet-400' :
                                                            'bg-neutral-800 text-neutral-400'}`}>
                                                    {user.tier}
                                                </span>
                                            </td>
                                            <td className="p-4 text-neutral-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-3 text-center text-xs text-neutral-500 bg-neutral-900/50 border-t border-neutral-800">
                                Showing last 20 users
                            </div>
                        </div>
                    </div>

                    {/* Side Panel / Alerts */}
                    <div className="space-y-4">
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
                    </div>
                </div>

            </div>
        </div>
    );
}
