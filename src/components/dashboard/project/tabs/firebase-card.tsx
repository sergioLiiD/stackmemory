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

    const handleChange = (key: keyof FirebaseConfig, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
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
        <div className="p-6 rounded-2xl bg-[#121212] border border-orange-500/20 shadow-lg shadow-orange-900/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" /> Firebase Configuration
                </h3>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="text-neutral-500 hover:text-white transition-colors">
                        <Pencil className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300">
                            <X className="w-4 h-4" />
                        </button>
                        <button onClick={handleSave} className="text-green-400 hover:text-green-300">
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* API Key */}
                <div className="col-span-1 md:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">apiKey</label>
                    {isEditing ? (
                        <input
                            value={config.apiKey}
                            onChange={(e) => handleChange('apiKey', e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-mono text-white focus:outline-none focus:border-orange-500"
                        />
                    ) : (
                        <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-lg px-3 py-2">
                            <code className="text-xs text-neutral-300 font-mono truncate">{config.apiKey || "Not set"}</code>
                            {config.apiKey && (
                                <button onClick={() => copyToClipboard(config.apiKey)} className="text-neutral-600 hover:text-white ml-2">
                                    <Copy className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <ConfigField label="authDomain" field="authDomain" value={config.authDomain} isEditing={isEditing} onChange={handleChange} onCopy={copyToClipboard} />
                <ConfigField label="projectId" field="projectId" value={config.projectId} isEditing={isEditing} onChange={handleChange} onCopy={copyToClipboard} />
                <ConfigField label="storageBucket" field="storageBucket" value={config.storageBucket} isEditing={isEditing} onChange={handleChange} onCopy={copyToClipboard} />
                <ConfigField label="messagingSenderId" field="messagingSenderId" value={config.messagingSenderId} isEditing={isEditing} onChange={handleChange} onCopy={copyToClipboard} />
                <ConfigField label="appId" field="appId" value={config.appId} isEditing={isEditing} onChange={handleChange} onCopy={copyToClipboard} />
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 text-center">
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
