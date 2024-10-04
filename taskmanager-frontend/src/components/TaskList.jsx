import React, { useEffect, useState } from 'react';
import { connectWebSocket } from '../api';

import { useDispatch, useSelector } from 'react-redux';
import { deleteTask, fetchTasks } from '../taskSlice';


const TaskList = ({ onEdit }) => {
    const dispatch = useDispatch();
    const { tasks, loading, error } = useSelector((state) => state.tasks);

    useEffect(() => {
        // Dispatch action to fetch tasks on component mount
        dispatch(fetchTasks());

        // WebSocket connection for real-time updates
        const socket = connectWebSocket();
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'task.created') {
                // Optionally refetch tasks or dispatch another action
                dispatch(fetchTasks()); // Refetch tasks on creation for now
            }
        };

        return () => socket.close();
    }, [dispatch]);

    // Handle task deletion
    const handleDelete = async (id) => {
        dispatch(deleteTask(id));
    };
    if (!Array.isArray(tasks)) {
        return <p>No tasks available.</p>; // Handle the case when tasks is not an array
      }
    return (
        <div>
            <h2>Task List</h2>
            {loading && <p>Loading tasks...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>

                {tasks.map((task) => (
                    <li key={task.id}>
                        {task.title} - {task.status}
                        <button onClick={() => onEdit(task)}>Edit</button>
                        <button onClick={() => handleDelete(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;
