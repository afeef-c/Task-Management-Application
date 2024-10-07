import React, { useEffect, useState } from 'react';
import { connectWebSocket } from '../api';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTask, fetchTasks } from '../taskSlice';
import { fetchUserDetails } from '../authSlice';
import TaskStatistics from './TaskStatistics';
import ErrorBoundary from './ErrorBoundary';
import { useNavigate } from 'react-router-dom';

const TaskList = ({ onEdit }) => {
    const dispatch = useDispatch();
    const { tasks, loading, error } = useSelector((state) => state.tasks);
    const user = useSelector((state) => state.auth.user); 
    const authTokens = useSelector((state) => state.auth.authTokens);
    const navigate = useNavigate()
    const [filter, setFilter] = useState('all'); // Filter state for task category
    const [view, setView] = useState('tasks'); // State to toggle between task list and statistics

    useEffect(() => {
        if (authTokens) {
            dispatch(fetchUserDetails());
        }
    }, [authTokens, dispatch]);

    useEffect(() => {
        // Dispatch action to fetch tasks on component mount
        dispatch(fetchTasks());

        // WebSocket connection for real-time updates
        const socket = connectWebSocket();
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'task.created') {
                dispatch(fetchTasks()); // Refetch tasks on creation
            }
        };

        return () => socket.close();
    }, [dispatch]);

    // Handle task deletion
    const handleDelete = async (id) => {
        dispatch(deleteTask(id));
    };

    // Get current date to compare with due dates
    const currentDate = new Date();

    // Filter tasks based on selected category and overdue status
    const filteredTasks = tasks.filter((task) => {
        if (filter === 'all') return true; // Return all tasks if 'all' is selected
        if (filter === 'overdue') {
            return task.due_date && new Date(task.due_date) < currentDate && task.status !== 'DONE';
        }
        return task.status === filter;
    });

    // Navigation options for task categories (including "All Tasks" and "Overdue Tasks")
    const navCategories = [
        { key: 'all', label: 'All Tasks' }, // New "All Tasks" option
        { key: 'overdue', label: 'Overdue Tasks' }, // "Overdue Tasks" category
        { key: 'DONE', label: 'Completed' },
        { key: 'TODO', label: 'ToDo' },
        { key: 'IN_PROGRESS', label: 'In Progress' },
    ];

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center py-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Task Management</h2>

            {/* Navigation to switch between task list and statistics */}
            <nav className="mb-6 flex space-x-4 justify-center">
                <button
                    className={`px-6 py-2 text-lg font-semibold rounded-full border-2 ${view === 'tasks' ?  'bg-white border-green-300 text-green-700': 'bg-grey-500 border-grey-500 text-black' } hover:bg-green-600 hover:border-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                    onClick={() => setView('tasks')}
                >
                    Task List
                </button>
                <button
                    className={`px-6 py-2 text-lg font-semibold rounded-full border-2 ${view === 'statistics' ?  'bg-white border-green-300 text-gray-700': 'bg-grey-500 border-grey-500 text-black' } hover:bg-green-600 hover:border-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                    onClick={() => setView('statistics')}
                >
                    Task Statistics
                </button>
            </nav>

            {view === 'tasks' ? (
                <>
                    {/* Navigation for task categories */}
                    <nav className="mb-6 flex space-x-4">
                        {navCategories.map((category) => (
                            <button
                                key={category.key}
                                className={`px-4 py-2 rounded-lg shadow ${filter === category.key ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white transition duration-200`}
                                onClick={() => setFilter(category.key)}
                            >
                                {category.label}
                            </button>
                        ))}
                    </nav>

                    {loading && <p className="text-blue-500">Loading tasks...</p>}
                    {error && <p className="text-red-500 mb-4">{typeof error === 'string' ? error : error.detail || 'An unknown error occurred.'}</p>}

                    {!filteredTasks.length ? (
                        <p className="text-center text-gray-500">No tasks available in this category.</p>
                    ) : (
                        <ul className="w-full max-w-3xl bg-white shadow-xl rounded-lg divide-y divide-gray-200">
                            {filteredTasks.map((task) => (
                                <li key={task.id} className="flex justify-between items-center p-6 hover:bg-gray-50 transition duration-200">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                                        <p className={`text-sm mt-1 ${task.status === 'DONE' ? 'text-green-500' : task.status === 'IN_PROGRESS' ? 'text-yellow-500' : 'text-red-500'}`}>
                                            Status: {task.status}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Created on: {new Date(task.created_at).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Last updated: {new Date(task.updated_at).toLocaleDateString()}
                                        </p>
                                        {task.due_date && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Due by: {new Date(task.due_date).toLocaleDateString()}
                                                {new Date(task.due_date) < currentDate && task.status !== 'DONE' && (
                                                    <span className="ml-2 text-red-500 font-semibold">Overdue</span>
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    {user.is_superuser && (
                                        <div className="flex flex-col items-center justify-center space-y-2 mr-6">
                                            <p className="text-sm text-gray-500">Assigned to:</p>
                                            <p className="text-sm font-semibold text-gray-700">{task.user}</p>
                                        </div>
                                    )}

                                    <div className="flex space-x-4">
                                        {/* Conditionally render Edit button based on task status */}
                                        {(task.status !== 'DONE' && task.status !== 'OVERDUE') && (
                                            <button
                                                onClick={() => onEdit(task)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-200"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(task.id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                </li>
                            ))}
                        </ul>
                    )}
                </>
            ) : (
                    <TaskStatistics />
            )}
        </div>
    );
};

export default TaskList;
