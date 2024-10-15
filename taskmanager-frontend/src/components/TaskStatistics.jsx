import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import api from '../api';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend, Title);

const TaskStatistics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/task-stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching task statistics", error);
                setError("Failed to load statistics");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);
    
    const chartData = {
        labels: ['Completed', 'Pending', 'In Progress', 'Overdue'],
        datasets: [
            {
                label: 'Task Statistics',
                data: stats ? [
                    stats.completed_tasks,
                    stats.pending_tasks,
                    stats.in_progress_tasks,
                    stats.overdue_tasks
                ] : [0, 0, 0, 0],
                backgroundColor: ['#4caf50', '#ffeb3b', '#03a9f4', '#f44336'], // Colors for the pie chart slices
                hoverOffset: 4,
            },
        ],
    };
    console.log(stats)
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Task Distribution',
            },
        },
    };

    if (loading) {
        return <p>Loading statistics...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-screen p-4">
            <h2 className="text-2xl font-bold mb-6">Task Statistics</h2>
            <div className="w-full max-w-2xl h-96">
                <Pie data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default TaskStatistics;
