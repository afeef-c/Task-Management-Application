import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import TasksPage from './pages/TasksPage';
import Login from './components/Login';
import Register from './components/Register';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDetails } from './authSlice';

function App() {
    const user = useSelector((state) => state.auth.user);  // Use user from Redux store
    const dispatch = useDispatch();
    const authTokens = useSelector((state) => state.auth.authTokens);
    useEffect(() => {
        if (authTokens) {
            dispatch(fetchUserDetails());
        }
    }, [authTokens, dispatch]);
    console.log("user: ",user)
    return (
        <Router>
            <Routes>
                {/* Redirect to tasks if user is authenticated, otherwise show Login */}
                <Route
                    path="/login"
                    element={!user ? <Login /> : <Navigate to="/tasks" />}
                />

                {/* Registration page is always accessible */}
                <Route path="/register" element={<Register />} />

                {/* If authenticated, show tasks page; otherwise redirect to login */}
                <Route
                    path="/tasks"
                    element={user ? <TasksPage /> : <Navigate to="/login" />}
                />
                
                {/* Catch-all route to redirect users */}
                <Route path="*" element={<Navigate to={user ? "/tasks" : "/login"} />} />
            </Routes>
        </Router>
    );
}

export default App;
