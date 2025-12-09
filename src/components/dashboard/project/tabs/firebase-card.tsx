import { useState } from "react";
import { Project, FirebaseConfig } from "@/data/mock";
import { Copy, Eye, EyeOff, Flame, Save, X, Pencil } from "lucide-react";
import { useDashboard } from "../../dashboard-context";
import { supabase } from "@/lib/supabase";

export function FirebaseConfigCard({ project }: { project: Project }) {
    const { updateProject } = useDashboard();
    const [isEditing, setIsEditing] = useState(false);
    const [config, setConfig] = useState<FirebaseConfig>({
        apiKey: project.firebaseConfig?.apiKey || "",
        authDomain: project.firebaseConfig?.authDomain || "",
        projectId: project.firebaseConfig?.projectId || "",
        storageBucket: project.firebaseConfig?.storageBucket || "",
        messagingSenderId: project.firebaseConfig?.messagingSenderId || "",
        appId: project.firebaseConfig?.appId || ""
    });

    const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

    const handleChange = (key: keyof FirebaseConfig, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        setIsEditing(true);
    };

    const toggleVisibility = (key: string) => {
        setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        // Optimistic update
        updateProject(project.id, { firebaseConfig: config });
        setIsEditing(false);

        // Persist
        if (supabase) {
            const { error } = await supabase
                .from('projects')
                .update({ firebase_config: config })
                .eq('id', project.id);

            if (error) console.error("Error saving firebase config:", error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    Firebase Configuration
                </h3>
                {isEditing && (
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-medium transition-colors"
                    >
                        <Save className="w-3 h-3" />
                        Save Changes
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config).map(([key, value]) => (
                    <div key={key}>
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="relative group">
                            <input
                                type={visibleKeys[key] ? "text" : "password"}
                                value={value}
                                onChange={(e) => handleChange(key as keyof FirebaseConfig, e.target.value)}
                                className="w-full bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors font-mono"
                                placeholder={`Enter ${key}...`}
                            />
                            <button
                                onClick={() => toggleVisibility(key)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                            >
                                {visibleKeys[key] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-white/5 text-center">
                <p className="text-[10px] text-neutral-600">
                    This configuration is stored in your project database. Ensure appropriate RLS policies are active in production.
                </p>
            </div>
        </div>
    );
}

function ConfigField({ label, field, value, isEditing, onChange, onCopy }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">{label}</label>
            {isEditing ? (
                <input
                    value={value}
                    onChange={(e) => onChange(field, e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-mono text-white focus:outline-none focus:border-orange-500"
                />
            ) : (
                <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-lg px-3 py-2">
                    <code className="text-xs text-neutral-300 font-mono truncate">{value || "-"}</code>
                    {value && (
                        <button onClick={() => onCopy(value)} className="text-neutral-600 hover:text-white ml-2">
                            <Copy className="w-3 h-3" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
