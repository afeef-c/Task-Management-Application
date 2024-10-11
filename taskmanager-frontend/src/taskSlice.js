import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './api';  // Import the Axios instance

// Async thunk to get tasks
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/tasks/');
    return response.data;  // Only return the task data
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch tasks');
  }
});

// Async thunk to create a task
export const createTask = createAsyncThunk('tasks/createTask', async (taskData, { rejectWithValue }) => {
  try {
    const response = await api.post('/tasks/', taskData);
    return response.data;  // Only return the created task data
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to create task');
  }
});

// Async thunk to update a task
export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, ...taskData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/tasks/${id}/`, taskData); // Assuming PUT method
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to update task');
  }
});

// Async thunk to delete a task
export const deleteTask = createAsyncThunk('tasks/deleteTask', async (taskId, { rejectWithValue }) => {
  try {
    await api.delete(`/tasks/${taskId}/`);  // Await API call and check for errors
    return taskId;  // Return task ID to remove it from the state
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to delete task');
  }
});

// Initial state for tasks
const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

// Tasks slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // WebSocket: Add new task
    addTask: (state, action) => {
      state.tasks.push(action.payload); // Add task to the tasks array
    },
    updateTaskWS: (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
            state.tasks[index] = action.payload; // Update task in the tasks array
        }
    },
    removeTask: (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload); // Remove task from the tasks array
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.loading = false;
      state.tasks = action.payload;  // Store fetched tasks
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;  // Store error if fetch fails
    });

    // Create task
    builder.addCase(createTask.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.loading = false;
      state.tasks.push(action.payload);  // Add the newly created task to the state
    });
    builder.addCase(createTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;  // Store error if creation fails
    });

    // Update task
    builder.addCase(updateTask.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;  // Update the task in the state
      }
    });

    // Delete task
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);  // Remove the deleted task
    });
    builder.addCase(deleteTask.rejected, (state, action) => {
      state.error = action.payload;  // Store error if deletion fails
    });
  },
});

// Export WebSocket actions to handle task creation, update, and deletion
export const { addTask, updateTaskWS, removeTask } = taskSlice.actions;

// Export the reducer
export default taskSlice.reducer;
