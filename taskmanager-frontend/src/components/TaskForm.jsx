import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, updateTask } from '../taskSlice'; // Add updateTask for editing

const TaskForm = ({ taskToEdit, onTaskCreated }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.tasks);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('TODO');

    // Pre-fill form when taskToEdit is provided
    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title || '');
            setDescription(taskToEdit.description || '');
            setStatus(taskToEdit.status || 'TODO');
        } else {
            // Reset form if no taskToEdit
            setTitle('');
            setDescription('');
            setStatus('TODO');
        }
    }, [taskToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const task = { title, description, status };

        // If taskToEdit is present, update the task; otherwise, create a new one
        let resultAction;
        if (taskToEdit) {
            resultAction = await dispatch(updateTask({ id: taskToEdit.id, ...task }));
        } else {
            resultAction = await dispatch(createTask(task));
        }

        // Handle the result of the task creation/update
        if (createTask.fulfilled.match(resultAction) || updateTask.fulfilled.match(resultAction)) {
            onTaskCreated(resultAction.payload);

            // Reset form if a new task was created (not updating)
            if (!taskToEdit) {
                setTitle('');
                setDescription('');
                setStatus('TODO');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
            </select>
            <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : taskToEdit ? 'Update Task' : 'Save Task'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};

export default TaskForm;
