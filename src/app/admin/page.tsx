
"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, Activity, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [view, setView] = useState<'overview' | 'clients'>('overview');
    const [clients, setClients] = useState<any[]>([]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/stats');
            if (res.status === 401) throw new Error("Unauthorized");
            if (res.status === 403) throw new Error("Forbidden: You are not an admin");

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setStats(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setClients(data.users || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'overview') fetchStats();
        if (view === 'clients') fetchClients();
    }, [view]);

    if (loading && !stats && !clients.length) {
        return (
            <div className="flex bg-[#041814] h-screen items-center justify-center text-[#FDFBF8]">
                <Activity className="w-6 h-6 animate-pulse text-green-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col bg-[#041814] h-screen items-center justify-center gap-4 text-[#FDFBF8]">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-neutral-400">{error}</p>
                <Link href="/dashboard" className="text-green-500 hover:underline">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#041814] text-[#FDFBF8] p-8">
            <header className="max-w-7xl mx-auto flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Activity className="w-8 h-8 text-green-500" />
                        Admin & Monitoring
                    </h1>
                    <p className="text-neutral-400 mt-1">Platform health, costs, and user activity.</p>
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setView('overview')}
                        className={cn("px-4 py-2 rounded-md text-sm font-medium transition-colors", view === 'overview' ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white")}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setView('clients')}
                        className={cn("px-4 py-2 rounded-md text-sm font-medium transition-colors", view === 'clients' ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white")}
                    >
                        Clients
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto space-y-8">
                {view === 'overview' && stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard
                                title="Total Users"
                                value={stats.users}
                                icon={Users}
                                color="text-blue-500"
                            />
                            <StatCard
                                title="Total AI Cost"
                                value={`$${stats.totalCost.toFixed(4)}`}
                                icon={DollarSign}
                                color="text-green-500"
                                subtext="Accumulated API Spend"
                            />
                            <StatCard
                                title="Recent Activity"
                                value={stats.recentActivity.length}
                                icon={Activity}
                                color="text-purple-500"
                                subtext="Logs in last batch"
                            />
                        </div>

                        {/* Recent Activity Table */}
                        <div className="bg-[#06201b] rounded-3xl border border-white/5 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5">
                                <h3 className="text-lg font-semibold">Live Usage Logs</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-neutral-400">
                                    <thead className="bg-white/5 text-neutral-200">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Time (UTC)</th>
                                            <th className="px-6 py-3 font-medium">User</th>
                                            <th className="px-6 py-3 font-medium">Action</th>
                                            <th className="px-6 py-3 font-medium">Model</th>
                                            <th className="px-6 py-3 font-medium">Tokens (In/Out)</th>
                                            <th className="px-6 py-3 font-medium text-right">Est. Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {stats.recentActivity.map((log: any) => (
                                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-neutral-500">
                                                    {new Date(log.created_at).toLocaleTimeString()}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs">
                                                    {log.user_id.split('-')[0]}...
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-2 py-1 rounded-full text-xs font-medium border",
                                                        log.action === 'chat'
                                                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                    )}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{log.model}</td>
                                                <td className="px-6 py-4">{log.input_tokens} / {log.output_tokens}</td>
                                                <td className="px-6 py-4 text-right text-white">
                                                    ${log.cost_estimated?.toFixed(5)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {view === 'clients' && (
                    <div className="bg-[#06201b] rounded-3xl border border-white/5 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Registered Clients</h3>
                            <button onClick={fetchClients}><RefreshCw className="w-4 h-4 text-neutral-500 hover:text-white" /></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-neutral-400">
                                <thead className="bg-white/5 text-neutral-200">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Email</th>
                                        <th className="px-6 py-3 font-medium">Tier</th>
                                        <th className="px-6 py-3 font-medium">User ID</th>
                                        <th className="px-6 py-3 font-medium">Created At</th>
                                        <th className="px-6 py-3 font-medium text-right text-white">Total Spend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {clients.map((client: any) => (
                                        <tr key={client.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-medium">
                                                {client.email || "No email"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn("px-2 py-1 rounded-full text-xs uppercase font-bold", client.tier === 'pro' ? "bg-green-500/20 text-green-400" : "bg-neutral-500/20 text-neutral-400")}>
                                                    {client.tier || 'Free'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">{client.id}</td>
                                            <td className="px-6 py-4">{new Date(client.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right font-mono text-green-400">
                                                ${(client.total_spend || 0).toFixed(4)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, subtext }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#06201b] p-6 rounded-3xl border border-white/5"
        >
            <div className="flex items-center justify-between mb-4">
                <span className="text-neutral-400 font-medium">{title}</span>
                <div className={`p-2 rounded-xl bg-white/5 ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            {subtext && <p className="text-xs text-neutral-500">{subtext}</p>}
        </motion.div>
    );
}

// Utility for styles
import { cn } from "@/lib/utils";
