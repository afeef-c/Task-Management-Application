import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

const TasksPage = () => {
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleCreateTask = () => {
        setIsFormVisible(!isFormVisible); // Show the form
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
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex flex-col items-center py-6">
            <div className="w-full max-w-screen-lg bg-gray-800 bg-opacity-90 rounded-lg shadow-lg p-6 mb-6 ">
                {/* Button to create a new task */}
                <div className="flex justify-between mb-4">
                    <button 
                        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                        onClick={handleCreateTask}
                    >
                        {isFormVisible ? 'X' : "Create Task"}
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
