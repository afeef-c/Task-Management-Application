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
        
        <nav className="bg-gray-900 p-4 flex max-w-screen-lg items-center justify-between px-4 py-2 mx-auto   sticky top-3 shadow lg:px-8 lg:py-3 backdrop-blur-lg backdrop-saturate-150 z-[9999]">


            <h1 className="text-white text-2xl font-semibold">Task Manager</h1>
            {user && (
                <div className="flex items-center space-x-4">
                    {user.is_staff? <span className="text-white">Hi Admin </span>
                    
                
                    :<span className="text-white">Hi {user.username}</span>
                }
                    <Logout />
                </div>
            )}
        </nav>
    );
};

export default Navbar;
