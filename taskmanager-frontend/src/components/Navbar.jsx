import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'; // Assuming you are using React Router
import { useDispatch, useSelector } from 'react-redux'; // To access user state if using Redux
import { fetchUserDetails } from '../authSlice';
import Logout from './Logout';

const Navbar = () => {
    // Access the user state, assuming you have it in your Redux store
    const user = useSelector((state) => state.auth.user); // Update with the correct path to user state
    const dispatch = useDispatch();
    const authTokens = useSelector((state) => state.auth.authTokens);
    
    useEffect(() => {
        if (authTokens) {
            dispatch(fetchUserDetails());
        }
    }, [authTokens, dispatch]);

    return (
        
        <nav className="bg-gray-900 p-4 flex max-w-screen-lg items-center justify-between px-4 py-2 mx-auto sticky top-0 shadow-lg lg:px-8 lg:py-3 backdrop-blur-lg backdrop-saturate-150  border-b border-gray-700 transition duration-300 ease-in-out">
            {/* App Title */}
            <h1 className="text-white text-2xl font-bold tracking-wide">
                <Link to="/" className="hover:text-gray-400 transition duration-200 ease-in-out">Task Manager</Link>
            </h1>

            {/* User Info & Logout Button */}
            {user && (
                <div className="flex items-center space-x-6">
                    <span className="text-white text-lg font-medium transition duration-200 ease-in-out hover:text-purple-300">
                        {user.is_staff ? 'Hi Admin' : `Hi ${user.username}`}
                    </span>

                    {/* Logout button component */}
                    <Logout />
                </div>
            )}
        </nav>
    );
};

export default Navbar;
