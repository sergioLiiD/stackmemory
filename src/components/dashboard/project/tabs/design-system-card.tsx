"use client";

import { useState } from "react";
import { Project, DesignSystem } from "@/data/mock";
import { Palette, Type, Plus, X, Copy, Trash2 } from "lucide-react";
import { useDashboard } from "../../dashboard-context";
import { supabase } from "@/lib/supabase";

export function DesignSystemCard({ project }: { project: Project }) {
    const { updateProject } = useDashboard();
    const [activeTab, setActiveTab] = useState<'colors' | 'fonts'>('colors');
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [newColor, setNewColor] = useState({ name: "", value: "" });
    const [newFont, setNewFont] = useState<{ name: string, type: 'sans' | 'serif' | 'mono' | 'display' }>({ name: "", type: "sans" });

    const design = project.design || { colors: [], fonts: [] };

    const saveDesign = async (newDesign: DesignSystem) => {
        updateProject(project.id, { design: newDesign });
        if (supabase) {
            await supabase.from('projects').update({ design_system: newDesign }).eq('id', project.id);
        }
    };

    const handleAddColor = () => {
        if (!newColor.name || !newColor.value) return;
        saveDesign({
            ...design,
            colors: [...design.colors, newColor]
        });
        setNewColor({ name: "", value: "" });
        setIsAdding(false);
    };

    const handleAddFont = () => {
        if (!newFont.name) return;
        saveDesign({
            ...design,
            fonts: [...design.fonts, newFont]
        });
        setNewFont({ name: "", type: "sans" });
        setIsAdding(false);
    };

    const handleDelete = (type: 'color' | 'font', index: number) => {
        if (type === 'color') {
            saveDesign({ ...design, colors: design.colors.filter((_, i) => i !== index) });
        } else {
            saveDesign({ ...design, fonts: design.fonts.filter((_, i) => i !== index) });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-pink-500" /> Design System
                </h3>
                <div className="flex gap-1 bg-neutral-100 dark:bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('colors')}
                        className={`p-1.5 rounded-md transition-all ${activeTab === 'colors' ? 'bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                        title="Colors"
                    >
                        <Palette className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab('fonts')}
                        className={`p-1.5 rounded-md transition-all ${activeTab === 'fonts' ? 'bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                        title="Typography"
                    >
                        <Type className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Add Button */}
            {!isAdding && (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full mb-4 py-2 text-xs border border-dashed border-neutral-300 dark:border-white/10 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-3 h-3" /> Add {activeTab === 'colors' ? 'Color' : 'Font'}
                </button>
            )}

            {/* Add Form */}
            {isAdding && (
                <div className="mb-4 p-3 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5 space-y-3 animation-fade-in">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-neutral-500 uppercase">New {activeTab === 'colors' ? 'Color' : 'Font'}</span>
                        <button onClick={() => setIsAdding(false)} className="text-neutral-400 hover:text-neutral-500"><X className="w-3 h-3" /></button>
                    </div>

                    {activeTab === 'colors' ? (
                        <>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={newColor.value}
                                    onChange={(e) => setNewColor(prev => ({ ...prev, value: e.target.value }))}
                                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                                />
                                <input
                                    value={newColor.value}
                                    onChange={(e) => setNewColor(prev => ({ ...prev, value: e.target.value }))}
                                    placeholder="#000000"
                                    className="flex-1 bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-lg px-2 text-xs focus:outline-none focus:border-pink-500"
                                />
                            </div>
                            <input
                                value={newColor.name}
                                onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Name (e.g. Primary Brand)"
                                className="w-full bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-pink-500"
                            />
                            <button onClick={handleAddColor} className="w-full py-1.5 bg-pink-500 text-white rounded-lg text-xs font-bold">Add Color</button>
                        </>
                    ) : (
                        <>
                            <input
                                value={newFont.name}
                                onChange={(e) => setNewFont(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Font Family (e.g. Inter)"
                                className="w-full bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-pink-500"
                            />
                            <select
                                value={newFont.type}
                                onChange={(e) => setNewFont(prev => ({ ...prev, type: e.target.value as any }))}
                                className="w-full bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-pink-500 appearance-none"
                            >
                                <option value="sans">Sans Serif</option>
                                <option value="serif">Serif</option>
                                <option value="mono">Monospace</option>
                                <option value="display">Display</option>
                            </select>
                            <button onClick={handleAddFont} className="w-full py-1.5 bg-pink-500 text-white rounded-lg text-xs font-bold">Add Font</button>
                        </>
                    )}
                </div>
            )}

            {/* Content List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {activeTab === 'colors' ? (
                    design.colors.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {design.colors.map((color, i) => (
                                <div key={i} className="group relative p-2 rounded-xl border border-neutral-200 dark:border-white/5 flex items-center gap-3 hover:border-pink-500/30 transition-colors">
                                    <div
                                        className="w-8 h-8 rounded-full shadow-sm border border-neutral-100 dark:border-white/10 shrink-0"
                                        style={{ backgroundColor: color.value }}
                                    />
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-neutral-900 dark:text-white truncate" title={color.name}>{color.name}</div>
                                        <div className="text-[10px] font-mono text-neutral-500 truncate">{color.value}</div>
                                    </div>
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 bg-white dark:bg-black/80 rounded-md p-0.5 backdrop-blur-sm transition-opacity">
                                        <button onClick={() => copyToClipboard(color.value)} className="p-1 hover:text-pink-500"><Copy className="w-3 h-3" /></button>
                                        <button onClick={() => handleDelete('color', i)} className="p-1 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !isAdding && <div className="text-center py-6 text-neutral-500 text-xs italic">No colors added</div>
                ) : (
                    design.fonts.length > 0 ? (
                        <div className="space-y-2">
                            {design.fonts.map((font, i) => (
                                <div key={i} className="group flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5 hover:border-pink-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-neutral-400 font-serif text-sm border border-neutral-200 dark:border-white/5">
                                            Aa
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-neutral-900 dark:text-white">{font.name}</div>
                                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">{font.type}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete('font', i)} className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : !isAdding && <div className="text-center py-6 text-neutral-500 text-xs italic">No fonts added</div>
                )}
            </div>
        </div>
    );
}
