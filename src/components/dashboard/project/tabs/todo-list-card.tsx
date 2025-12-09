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
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 flex flex-col shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
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
                    className="flex-1 bg-neutral-100 dark:bg-black/30 border border-neutral-200 dark:border-white/10 rounded-full px-4 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 placeholder:text-neutral-500 dark:placeholder:text-neutral-600 transition-all"
                />
                <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors aspect-square flex items-center justify-center border border-transparent hover:border-emerald-500/20"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </form>

            <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[150px] custom-scrollbar pr-1">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className={cn(
                            "group flex items-center gap-3 p-3 rounded-2xl border transition-all",
                            task.completed
                                ? "bg-neutral-100 dark:bg-white/5 border-transparent opacity-60"
                                : "bg-white dark:bg-[#181818] border-neutral-200 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 shadow-sm dark:shadow-none"
                        )}
                    >
                        <button
                            onClick={() => toggleTask(task.id)}
                            className={cn("shrink-0 transition-colors rounded-full p-0.5", task.completed ? "text-emerald-500" : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-white")}
                        >
                            {task.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </button>

                        <span className={cn(
                            "flex-1 text-sm transition-all break-all",
                            task.completed ? "text-neutral-400 dark:text-neutral-500 line-through" : "text-neutral-700 dark:text-neutral-300"
                        )}>
                            {task.text}
                        </span>

                        <button
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-all p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full"
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
