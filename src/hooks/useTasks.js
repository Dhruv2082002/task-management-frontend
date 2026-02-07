import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { toast } from 'sonner';

export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        const controller = new AbortController();
        
        const fetchData = async () => {
            try {
                const response = await client.get('/Tasks', {
                    signal: controller.signal
                });
                setTasks(response.data);
            } catch (error) {
                if (error.code !== "ERR_CANCELED") {
                    console.error('Failed to fetch tasks', error);
                    toast.error('Failed to load tasks');
                }
            } finally {
                // Only set loading false if not canceled (component likely unmounted or new request started)
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const cleanup = fetchTasks();
        // Since fetchTasks is async calling it directly in useEffect (and it returns a promise) is okay 
        // IF we change fetchTasks to NOT handle the abort logic internally but return the abort function.
        // HOWEVER, the pattern `useEffect(fetchTasks, [fetchTasks])` is existing. 
        // The cleaner way is to let fetchTasks strictly be the function that runs.
        
        // Wait, fetchTasks is a useCallback dependency. The previous code was:
        // useEffect(() => { fetchTasks(); }, [fetchTasks]);
        
        // My proposed change to fetchTasks above returns the cleanup function.
        // So I should update this useEffect to:
        return cleanup; 
    }, [fetchTasks]);

    const createTask = async (taskData) => {
        // Optimistic update could be complex here due to ID from backend, so we'll await.
        try {
            const requestId = crypto.randomUUID();
            await client.post('/Tasks', taskData, {
                headers: {
                    'X-Request-ID': requestId
                }
            });
            toast.success('Task created successfully');
            fetchTasks();
            return true;
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 409) {
                toast.error('Duplicate request detected');
            } else {
                toast.error('Failed to create task');
            }
            return false;
        }
    };

    const updateTask = async (id, taskData) => {
        try {
            await client.put(`/Tasks/${id}`, taskData);
            setTasks(prev => prev.map(t => t.id === id ? { ...t, ...taskData } : t));
            toast.success('Task updated');
            return true;
        } catch (error) {
            console.error(error);
            toast.error('Failed to update task');
            fetchTasks(); // Revert on error
            return false;
        }
    };

    const [togglingTaskIds, setTogglingTaskIds] = useState(new Set());

    const isTaskToggling = useCallback((taskId) => {
        return togglingTaskIds.has(taskId);
    }, [togglingTaskIds]);

    const toggleComplete = async (task) => {
        if (togglingTaskIds.has(task.id)) return;

        setTogglingTaskIds(prev => {
            const newSet = new Set(prev);
            newSet.add(task.id);
            return newSet;
        });

        const originalTask = { ...task };
        const updatedTask = { ...task, isCompleted: !task.isCompleted };
        
        // Optimistic Update
        setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));

        try {
             // API expects full object for PUT usually, or at least the DTO fields
            await client.put(`/Tasks/${task.id}`, {
                title: updatedTask.title,
                description: updatedTask.description || "",
                dueDate: updatedTask.dueDate,
                isCompleted: updatedTask.isCompleted
            });
            // Quiet success for toggle
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
            // Revert
            setTasks(prev => prev.map(t => t.id === task.id ? originalTask : t));
        } finally {
            setTogglingTaskIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(task.id);
                return newSet;
            });
        }
    };

    const deleteTask = async (id) => {
        try {
            await client.delete(`/Tasks/${id}`);
            setTasks(prev => prev.filter(t => t.id !== id));
            toast.success('Task deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete task');
        }
    };

    return {
        tasks,
        loading,
        createTask,
        updateTask,
        deleteTask,
        toggleComplete,
        isTaskToggling,
        refresh: fetchTasks
    };
}
