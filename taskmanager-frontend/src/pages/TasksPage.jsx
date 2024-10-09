import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import Logout from '../components/Logout';

const TasksPage = () => {
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleCreateTask = () => {

        setIsFormVisible(!(isFormVisible)); // Show the form
    };

    const handleEditTask = (task) => {
        setTaskToEdit(task); // Set the task to edit
        setIsFormVisible(true); // Show the form
    };

    const handleTaskCreated = () => {
        setTaskToEdit(null); // Clear the edit task state
        setIsFormVisible(false); // Hide the form after creating or editing
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6">
            <div className="w-full max-w-screen-lg bg-white rounded-lg shadow-lg p-6 mb-6">
                {/* Button to create a new task */}
                <div className="flex justify-between mb-4">
                    <button 
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onClick={handleCreateTask}
                    >
                        {isFormVisible? 'X' :"Create Task"}
                    </button>
                </div>

                {/* TaskForm is only visible when isFormVisible is true */}
                {isFormVisible && (
                    <TaskForm 
                        taskToEdit={taskToEdit} 
                        onTaskCreated={handleTaskCreated} 
                    />
                )}

                {/* Task List */}
                <TaskList onEdit={handleEditTask} />
            </div>
            <div className="w-full max-w-lg">
                {/* Additional content can go here */}
            </div>
        </div>
    );
};

export default TasksPage;
