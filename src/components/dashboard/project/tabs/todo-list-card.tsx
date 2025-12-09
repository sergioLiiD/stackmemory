import { useState } from "react";
import { Project, Task } from "@/data/mock";
import { CheckSquare, Square, Trash2, Plus, ListTodo } from "lucide-react";
import { useDashboard } from "../../dashboard-context";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export function TodoListCard({ project }: { project: Project }) {
    const { updateProject } = useDashboard();
    const [inputValue, setInputValue] = useState("");

    const tasks = project.tasks || [];

    const saveTasks = async (newTasks: Task[]) => {
        // Optimistic update
        updateProject(project.id, { tasks: newTasks });

        // Persist
        if (supabase) {
            const { error } = await supabase
                .from('projects')
                .update({ tasks: newTasks })
                .eq('id', project.id);

            if (error) console.error("Error saving tasks:", error);
        }
    };

    const handleAddTask = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const newTask: Task = {
            id: crypto.randomUUID(),
            text: inputValue.trim(),
            completed: false
        };

        saveTasks([newTask, ...tasks]);
        setInputValue("");
    };

    const toggleTask = (taskId: string) => {
        const newTasks = tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        saveTasks(newTasks);
    };

    const deleteTask = (taskId: string) => {
        const newTasks = tasks.filter(t => t.id !== taskId);
        saveTasks(newTasks);
    };

    const completedCount = tasks.filter(t => t.completed).length;

    return (
        <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-emerald-400" />
                    Pending Tasks
                </h3>
                {tasks.length > 0 && (
                    <span className="text-[10px] text-neutral-500 font-mono">
                        {completedCount}/{tasks.length}
                    </span>
                )}
            </div>

            <form onSubmit={handleAddTask} className="flex gap-2 mb-3">
                <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-neutral-600"
                />
                <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </form>

            <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[150px] custom-scrollbar pr-1">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className={cn(
                            "group flex items-center gap-3 p-3 rounded-xl border transition-all",
                            task.completed
                                ? "bg-white/5 border-transparent opacity-60"
                                : "bg-[#181818] border-white/5 hover:border-white/10"
                        )}
                    >
                        <button
                            onClick={() => toggleTask(task.id)}
                            className={cn("shrink-0 transition-colors", task.completed ? "text-emerald-500" : "text-neutral-500 hover:text-white")}
                        >
                            {task.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </button>

                        <span className={cn(
                            "flex-1 text-sm transition-all break-all",
                            task.completed ? "text-neutral-500 line-through" : "text-neutral-300"
                        )}>
                            {task.text}
                        </span>

                        <button
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-all p-1"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="text-center py-8 text-neutral-600 text-sm border border-dashed border-white/5 rounded-xl">
                        <p>No tasks yet.</p>
                        <p className="text-xs mt-1">Keep track of your next steps.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
