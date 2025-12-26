import { checkAdminAccess } from "@/lib/auth/admin-auth";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import { Separator } from "@/components/ui/separator";
import { AdminUserActions } from "./user-actions";

// Simple Card Component for Stats
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
        .select('id, email, tier, created_at, billing_period_end, custom_project_limit, last_sign_in_at, usage_count_chat, usage_limit_chat, usage_count_insight, usage_limit_insight')
        .order('created_at', { ascending: false });

    if (profilesError) {
        return <div className="p-8 text-red-500">Error loading admin data: {profilesError.message}</div>;
    }

    const totalUsers = profiles.length;
    const freeUsers = profiles.filter(p => p.tier === 'free').length;
    const proUsers = profiles.filter(p => p.tier === 'pro').length;
    const founderUsers = profiles.filter(p => p.tier === 'founder').length;

    // 2. Fetch Projects Stats
    const { count: totalProjects, data: allProjects } = await supabase
        .from('projects')
        .select('user_id', { count: 'exact' });

    // count projects per user
    const projectCounts: Record<string, number> = {};
    allProjects?.forEach(p => {
        projectCounts[p.user_id] = (projectCounts[p.user_id] || 0) + 1;
    });

    // 3. Estimate AI Usage (Embeddings count)
    const { count: totalEmbeddings } = await supabase
        .from('embeddings')
        .select('*', { count: 'exact', head: true });

    // 4. Fetch Usage Costs & Logs
    const { data: usageLogs } = await supabase
        .from('usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    // Aggregation
    const totalCost = usageLogs?.reduce((acc, log) => acc + (log.cost_estimated || 0), 0) || 0;

    const costByModel: Record<string, number> = {};
    const costByAction: Record<string, number> = {};

    usageLogs?.forEach(log => {
        costByModel[log.model || 'unknown'] = (costByModel[log.model || 'unknown'] || 0) + (log.cost_estimated || 0);
        costByAction[log.action || 'unknown'] = (costByAction[log.action || 'unknown'] || 0) + (log.cost_estimated || 0);
    });

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
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
                    <StatCard title="AI Costs (Est.)" value={`$${totalCost.toFixed(4)}`} subtext="Gemini API Spend (Last 100)" />
                    <StatCard title="Total Projects" value={totalProjects || 0} subtext={`${totalEmbeddings || 0} AI Vectors stored`} />
                </div>

                {/* Cost Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
                        <h3 className="text-lg font-semibold mb-4">Cost by Model</h3>
                        <div className="space-y-3">
                            {Object.entries(costByModel).map(([model, cost]) => (
                                <div key={model} className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-400">{model}</span>
                                    <span className="font-mono text-white">${cost.toFixed(5)}</span>
                                </div>
                            ))}
                            {Object.keys(costByModel).length === 0 && <p className="text-neutral-500 text-sm">No usage logged yet.</p>}
                        </div>
                    </div>
                    <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
                        <h3 className="text-lg font-semibold mb-4">Cost by Feature</h3>
                        <div className="space-y-3">
                            {Object.entries(costByAction).map(([action, cost]) => (
                                <div key={action} className="flex justify-between items-center text-sm capitalize">
                                    <span className="text-neutral-400">{action}</span>
                                    <span className="font-mono text-white">${cost.toFixed(5)}</span>
                                </div>
                            ))}
                            {Object.keys(costByAction).length === 0 && <p className="text-neutral-500 text-sm">No usage logged yet.</p>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Table (Span 2) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Users Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Latest Users</h2>
                            <div className="border border-neutral-800 rounded-xl overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-neutral-900 text-neutral-400 font-medium">
                                        <tr>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Tier</th>
                                            <th className="p-4">Values</th>
                                            <th className="p-4">Usage (Mos.)</th>
                                            <th className="p-4">Last Active</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
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
                                                    <td className="p-4 text-neutral-300 font-mono">
                                                        {projectCounts[user.id] || 0} Proj
                                                    </td>
                                                    <td className="p-4 font-mono text-xs">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={user.usage_count_chat >= (user.usage_limit_chat || 20) ? "text-red-400" : "text-neutral-400"}>
                                                                Chat: {user.usage_count_chat}/{user.usage_limit_chat || 20}
                                                            </span>
                                                            <span className={user.usage_count_insight >= (user.usage_limit_insight || 1) ? "text-red-400" : "text-neutral-400"}>
                                                                Insight: {user.usage_count_insight}/{user.usage_limit_insight || 3}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-xs text-neutral-500">
                                                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                                                    </td>
                                                    <td className="p-4">
                                                        <AdminUserActions
                                                            userId={user.id}
                                                            initialTier={user.tier}
                                                            initialLimit={user.custom_project_limit}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div className="p-3 text-center text-xs text-neutral-500 bg-neutral-900/50 border-t border-neutral-800">
                                    Showing last 50 users
                                </div>
                            </div>
                        </div>

                        {/* Usage Logs Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Reference API Usage (Last 100 calls)</h2>
                            <div className="border border-neutral-800 rounded-xl overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-neutral-900 text-neutral-400 font-medium">
                                        <tr>
                                            <th className="p-3">Time</th>
                                            <th className="p-3">Feature</th>
                                            <th className="p-3">Model</th>
                                            <th className="p-3">Tokens (In/Out)</th>
                                            <th className="p-3 text-right">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800 bg-black/50">
                                        {usageLogs?.map((log) => (
                                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-3 text-xs text-neutral-500">
                                                    {new Date(log.created_at).toLocaleTimeString()}
                                                </td>
                                                <td className="p-3 capitalize text-neutral-300">
                                                    {log.action}
                                                </td>
                                                <td className="p-3 font-mono text-xs text-indigo-400">
                                                    {log.model}
                                                </td>
                                                <td className="p-3 font-mono text-xs text-neutral-400">
                                                    {log.input_tokens} / {log.output_tokens}
                                                </td>
                                                <td className="p-3 font-mono text-xs text-right text-emerald-400">
                                                    ${log.cost_estimated?.toFixed(5)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
