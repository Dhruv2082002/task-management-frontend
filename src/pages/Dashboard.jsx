import { useState } from 'react';
import { useTasks } from '../hooks/useTasks'; // Assuming we moved the hook here or need to create index
// Since I created useTasks in hooks/useTasks.js, I need to make sure I import correctly.
// But wait, the previous tool call created `src/hooks/useTasks.js`.
// I need to ensure `src/hooks` exists? NO, I didn't create the directory explicitly in the previous step?
// checking previous tool call... `TargetFile: ...src/hooks/useTasks.js`. write_to_file creates directories. Good.

import CreateTaskDialog from '../components/CreateTaskDialog';
import { Plus, Pencil, Trash2, Calendar, CheckCircle, Circle } from 'lucide-react';
import clsx from 'clsx';
// import { format } from 'date-fns'; // Not used in this snippet, using helper

export default function Dashboard() {
    const { tasks, loading, deleteTask, toggleComplete, refresh, isTaskToggling } = useTasks();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const openCreateDialog = () => {
        setEditingTask(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (task) => {
        setEditingTask(task);
        setIsDialogOpen(true);
    };

    const handleTaskSaved = () => {
        refresh();
    };

    const handleDelete = (id) => {
        // UI validation/confirmation here
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(id);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
                <button
                    onClick={openCreateDialog}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-1" />
                    New Task
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No tasks</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                    {tasks.map((task) => (
                        <div key={task.id} className={clsx("group bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between transition-all hover:shadow-md", task.isCompleted && "bg-gray-50 border-gray-100 opacity-75")}>
                            <div className="flex items-start gap-3">
                                <button
                                    onClick={() => toggleComplete(task)}
                                    disabled={isTaskToggling(task.id)}
                                    className={clsx(
                                        "mt-1 flex-shrink-0 transition-colors focus:outline-none",
                                        isTaskToggling(task.id) ? "cursor-not-allowed opacity-50" : "text-gray-400 hover:text-indigo-600"
                                    )}
                                >
                                    {task.isCompleted ? (
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                    ) : (
                                        <Circle className="h-6 w-6" />
                                    )}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h3 className={clsx("text-lg font-medium text-gray-900 truncate transition-all", task.isCompleted && "line-through text-gray-500")}>
                                        {task.title}
                                    </h3>
                                    <p className={clsx("mt-1 text-sm text-gray-500 line-clamp-2", task.isCompleted && "text-gray-400")}>
                                        {task.description}
                                    </p>
                                    {task.dueDate && (
                                        <div className="mt-2 flex items-center text-xs text-gray-500">
                                            <Calendar className="h-3.5 w-3.5 mr-1" />
                                            Due: {formatDate(task.dueDate)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEditDialog(task)}
                                    className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-gray-50 transition-colors"
                                    title="Edit"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(task.id)}
                                    className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateTaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onTaskSaved={handleTaskSaved}
                taskToEdit={editingTask}
            />
        </div>
    );
}
