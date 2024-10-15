import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import TasksPage from './pages/TasksPage';
import Login from './components/Login';
import Register from './components/Register';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDetails } from './authSlice';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TaskStatistics from './components/TaskStatistics';

const PrivateRoute = ({ user, children }) => {
    return user ? children : <Navigate to="/login" />;
};

function App() {
    const user = useSelector((state) => state.auth.user);  // Use user from Redux store
    const dispatch = useDispatch();
    const authTokens = useSelector((state) => state.auth.authTokens);

    useEffect(() => {
        if (authTokens) {
            dispatch(fetchUserDetails());
        }
    }, [authTokens, dispatch]);

    return (
        <>
            <ToastContainer /> {/* Moved outside Router to ensure it always renders */}
            <Router>
                <Navbar />
                <Routes>
                    {/* Login Route */}
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/tasks" />} />

                    {/* Register Route */}
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes */}
                    <Route 
                        path="/tasks" 
                        element={<PrivateRoute user={user}><TasksPage /></PrivateRoute>} 
                    />
                    <Route 
                        path="/statistics" 
                        element={<PrivateRoute user={user}><TaskStatistics /></PrivateRoute>} 
                    />

                    {/* Catch-all route */}
                    <Route path="*" element={<Navigate to={user ? "/tasks" : "/login"} />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
