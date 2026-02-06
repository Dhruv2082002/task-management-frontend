import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import client from '../api/client';

export default function CreateTaskDialog({ open, onOpenChange, onTaskSaved, taskToEdit }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
        } else {
            setTitle('');
            setDescription('');
            setDueDate('');
        }
        setError('');
    }, [taskToEdit, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                title,
                description,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            };

            if (taskToEdit) {
                // For update, we need to include IsCompleted status (preserve it)
                // The API expects UpdateTaskDto: Title, Description, IsCompleted, DueDate
                // We should probably pass existing IsCompleted or handle it.
                // Let's assume onTaskSaved handles the refresh, but the API call happens here? 
                // Better to make API call here.
                await client.put(`/Tasks/${taskToEdit.id}`, {
                    ...payload,
                    isCompleted: taskToEdit.isCompleted
                });
            } else {
                await client.post('/Tasks', payload);
            }
            onOpenChange(false);
            onTaskSaved();
        } catch (err) {
            setError('Failed to save task.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow" />
                <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
                    <Dialog.Title className="text-xl font-bold text-gray-900 m-0">
                        {taskToEdit ? 'Edit Task' : 'Create New Task'}
                    </Dialog.Title>
                    <Dialog.Description className="mt-[10px] mb-5 text-[15px] leading-normal text-gray-600">
                        {taskToEdit ? 'Update the details of your task.' : 'Add a new task to your list.'}
                    </Dialog.Description>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <fieldset className="space-y-1">
                            <label className="text-sm font-medium text-gray-700" htmlFor="title">
                                Title
                            </label>
                            <input
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </fieldset>
                        <fieldset className="space-y-1">
                            <label className="text-sm font-medium text-gray-700" htmlFor="description">
                                Description
                            </label>
                            <textarea
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                id="description"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </fieldset>
                        <fieldset className="space-y-1">
                            <label className="text-sm font-medium text-gray-700" htmlFor="dueDate">
                                Due Date
                            </label>
                            <input
                                type="date"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                id="dueDate"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </fieldset>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="mt-[25px] flex justify-end gap-3">
                            <Dialog.Close asChild>
                                <button className="inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none text-gray-700 hover:bg-gray-100 focus:outline-none">
                                    Cancel
                                </button>
                            </Dialog.Close>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex h-[35px] items-center justify-center rounded-[4px] bg-indigo-600 px-[15px] font-medium leading-none text-white hover:bg-indigo-500 focus:shadow-[0_0_0_2px] focus:shadow-indigo-400 focus:outline-none disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Task'}
                            </button>
                        </div>
                    </form>

                    <Dialog.Close asChild>
                        <button
                            className="absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full text-indigo-900 hover:bg-indigo-100 focus:shadow-[0_0_0_2px] focus:shadow-indigo-400 focus:outline-none"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
