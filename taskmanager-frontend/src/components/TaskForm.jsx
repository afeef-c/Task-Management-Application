import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, fetchTasks, updateTask } from '../taskSlice';
import { fetchUserDetails, fetchUsers } from '../authSlice';
import { addTask, updateTaskWS, removeTask } from '../taskSlice';
import { connectWebSocket } from '../api';
import { toast } from 'react-toastify';

const TaskForm = ({ taskToEdit, onTaskCreated }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.tasks);
    const user = useSelector((state) => state.auth.user);
    const users = useSelector((state) => state.auth.users); // Fetching users from Redux state
    const authTokens = useSelector((state) => state.auth.authTokens);

    const [title, setTitle] = useState('');
    const [assignedUser, setAssignedUser] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('TODO');
    const [dueDate, setDueDate] = useState('');

    // Fetch user details and users
    useEffect(() => {
        if (authTokens) {
            dispatch(fetchUserDetails());
        }
    }, [authTokens, dispatch]);

    useEffect(() => {
        if (user.is_superuser) {
            dispatch(fetchUsers());
        }
    }, [dispatch, user.is_superuser]);

    // Pre-fill form when taskToEdit is provided
    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title || '');
            setDescription(taskToEdit.description || '');
            setAssignedUser(taskToEdit.assigned_user || ''); // Ensure this uses the correct field
            setStatus(taskToEdit.status || 'TODO');
            setDueDate(taskToEdit.due_date || '');
        } else {
            // Reset form
            setTitle('');
            setDescription('');
            setAssignedUser('');
            setStatus('TODO');
            setDueDate('');
        }
    }, [taskToEdit]);

    useEffect(() => {
        const socket = connectWebSocket();
    
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received: ', data);
    
            if (data.type === 'task.create') {
                console.log('Task created:', data.task);
                dispatch(addTask(data.task));
            } else if (data.type === 'task.update') {
                console.log('Task updated:', data.task);
                dispatch(updateTaskWS(data.task));
            } else if (data.type === 'task.deleted') {
                console.log('Task deleted ID:', data.task_id);
                dispatch(removeTask(data.task_id));
            }
            
        };
    
        return () => {
            socket.close();
        };
    }, [dispatch, user]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const task = {
            title,
            description,
            status,
            due_date: dueDate || null,
            assigned_user: assignedUser,
        };

        let resultAction;
        if (taskToEdit) {
            resultAction = await dispatch(updateTask({ id: taskToEdit.id, ...task }));
        } else {
            resultAction = await dispatch(createTask(task));
        }

        if (createTask.fulfilled.match(resultAction) || updateTask.fulfilled.match(resultAction)) {
            onTaskCreated(resultAction.payload);
            toast.success(`${taskToEdit ? 'Task updated' : 'Task created'} successfully!`);
            // Reset form if a new task was created
            if (!taskToEdit) {
                setTitle('');
                setDescription('');
                setStatus('TODO');
                setAssignedUser('');
                setDueDate('');
            }
        } else if (resultAction.error) {
            toast.error("Failed to save task. Please try again.");
        }
    };

    // Filter out admin users from the list
    const usersArray = users ? Object.values(users).filter(user => !user.is_superuser) : [];

    return (
        <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                {taskToEdit ? 'Edit Task' : 'Create Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                </select>

                {user.is_superuser && (
                    <select 
                        value={assignedUser}
                        onChange={(e) => setAssignedUser(e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        disabled={!!taskToEdit} // Disable if in edit mode
                        required
                    >
                        <option value="">Select User</option>
                        {usersArray.map((availableUser) => (
                            <option key={availableUser.id} value={availableUser.id}>
                                {availableUser.username}
                            </option>
                        ))}
                    </select>
                )}

                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">Add due date if any (Optional)</label>
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${loading ? 'bg-gray-400' : 'bg-teal-500 hover:bg-teal-600'}`}
                >
                    {loading ? 'Saving...' : taskToEdit ? 'Update Task' : 'Save Task'}
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
        </>
    );
};

export default TaskForm;
