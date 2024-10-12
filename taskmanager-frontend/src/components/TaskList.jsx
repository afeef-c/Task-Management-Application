import React, { useEffect, useState, useRef } from 'react';
import { connectWebSocket } from '../api';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTask, fetchTasks } from '../taskSlice';
import { fetchUserDetails } from '../authSlice';
import TaskStatistics from './TaskStatistics';
import { useNavigate } from 'react-router-dom';
import { addTask, updateTaskWS, removeTask } from '../taskSlice';
import { toast } from 'react-toastify';

const TaskList = ({ onEdit }) => {
    const dispatch = useDispatch();
    const { tasks, loading, error } = useSelector((state) => state.tasks);
    const user = useSelector((state) => state.auth.user);
    const authTokens = useSelector((state) => state.auth.authTokens);
    const [filter, setFilter] = useState('all');
    const [view, setView] = useState('tasks');
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const taskFormRef = useRef(null);

    useEffect(() => {
        if (authTokens) {
            dispatch(fetchUserDetails());
            dispatch(fetchTasks());
        }
    }, [authTokens, dispatch]);

    useEffect(() => {
        const socket = connectWebSocket();
    
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received: ', data);
    
            if (data.type === 'task.create') {
                // Only add task if it belongs to the current user or if the user is an admin
                dispatch(addTask(data.task)); // Add the new task to Redux state
                
            } else if (data.type === 'task.update') {
                dispatch(updateTaskWS(data.task)); // Update the existing task in Redux state
            } else if (data.type === 'task.deleted') {
                dispatch(removeTask(data.task_id)); // Remove the task from Redux state
            }
        };
    
        return () => {
            socket.close();
        };
    }, [dispatch, user.id, user.is_superuser]);
    
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this task?");
        if (confirmDelete) {
            await dispatch(deleteTask(id));
            toast.success("Task deleted successfully!");
        }
    };

    const currentDate = new Date();

    const filteredTasks = tasks.filter((task) => {
        if (filter === 'all') return true;
        if (filter === 'overdue') {
            return task.due_date && new Date(task.due_date) < currentDate && task.status !== 'DONE';
        }
        return task.status === filter;
    });

    const navCategories = [
        { key: 'all', label: 'All Tasks' },
        { key: 'overdue', label: 'Overdue Tasks' },
        { key: 'DONE', label: 'Completed' },
        { key: 'TODO', label: 'ToDo' },
        { key: 'IN_PROGRESS', label: 'In Progress' },
    ];

    const toggleExpand = (taskId) => {
        setExpandedTaskId(prevId => (prevId === taskId ? null : taskId));
    };

    const handleEditClick = (task) => {
        if (taskFormRef.current) {
            taskFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        onEdit(task);
    };
    
    return (
        <>
            {/* Task Form Section (Reference) */}
            <div ref={taskFormRef} className="mt-10">
                {/* Render your task form component here */}
            </div>
            <div className="bg-gray-100 min-h-screen flex flex-col items-center py-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">Task Management</h2>

                {/* Navigation to switch between task list and statistics */}
                <nav className="mb-6 flex space-x-4 justify-center">
                    <button
                        className={`px-6 py-2 text-lg font-semibold rounded-full border-2 ${view === 'tasks' ? 'bg-white border-green-300 text-green-700' : 'bg-grey-500 border-grey-500 text-black'} hover:bg-green-600 hover:border-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                        onClick={() => setView('tasks')}
                    >
                        Task List
                    </button>
                    <button
                        className={`px-6 py-2 text-lg font-semibold rounded-full border-2 ${view === 'statistics' ? 'bg-white border-green-300 text-gray-700' : 'bg-grey-500 border-grey-500 text-black'} hover:bg-green-600 hover:border-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
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
                                    <li key={task.id}>
                                        <div className="flex justify-between items-center p-6 hover:bg-gray-50 transition duration-200" onClick={() => toggleExpand(task.id)}>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                                                <p className={`text-sm mt-1 ${task.status === 'DONE' ? 'text-green-500' : task.status === 'IN_PROGRESS' ? 'text-yellow-500' : 'text-red-500'}`}>
                                                    Status: {task.status}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Last updated: {new Date(task.updated_at).toLocaleDateString()}<br />
                                                </p>
                                            </div>
                                            {user.is_superuser && (
                                                <div className="flex space-x-4">
                                                    <p className='text-xs text-gray-500'> Assigned user: <br />{task.user}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expanded task details */}
                                        {expandedTaskId === task.id && (
                                            <div className='flex bg-gray-400 justify-between items-center p-6 '>
                                                <div className=" p-2 ">
                                                    <h4 className="text-lg font-semibold">Description:</h4>
                                                    <p>{task.description}</p>

                                                    <p className="text-xs text-yellow-400">
                                                        Created on: {new Date(task.created_at).toLocaleDateString()}<br />
                                                        Due by: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                                                    </p>
                                                </div>

                                                <div className="flex space-x-4">
                                                    {/* Conditionally render Edit button based on task status */}
                                                    {(task.status !== 'DONE' && task.status !== 'OVERDUE') && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent toggle on button click
                                                                handleEditClick(task);
                                                            }}
                                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-200"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent toggle on button click
                                                            handleDelete(task.id);
                                                        }}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                ) : (
                    <TaskStatistics />
                )}
            </div>
        </>
    );
};

export default TaskList;
