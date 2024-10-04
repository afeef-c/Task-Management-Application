import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import Logout from '../components/Logout';

const TasksPage = () => {
    const [taskToEdit, setTaskToEdit] = useState(null);

    return (
        <div>
            <Logout/>
            <h1>Tasks</h1>
            <TaskForm taskToEdit={taskToEdit} onTaskCreated={() => setTaskToEdit(null)} />
            <TaskList onEdit={(task) => setTaskToEdit(task)} />
        </div>
    );
};

export default TasksPage;
