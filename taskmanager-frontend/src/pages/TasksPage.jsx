import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import Logout from '../components/Logout';

const TasksPage = () => {
    const [taskToEdit, setTaskToEdit] = useState(null);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6">
            <div className="w-full max-w-screen-lg bg-white rounded-lg shadow-lg p-6 mb-6">
                <TaskForm taskToEdit={taskToEdit} onTaskCreated={() => setTaskToEdit(null)} />

                <TaskList onEdit={(task) => setTaskToEdit(task)} />
            </div>
            <div className="w-full max-w-lg">
                
            </div>
        </div>
    );
};

export default TasksPage;
