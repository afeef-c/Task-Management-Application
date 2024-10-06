import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { toast } from 'react-toastify';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [userData, setUserData] = useState({ username: '', password: '' });
  const { loading, error } = useSelector((state) => state.auth); // Accessing loading and error from Redux state
  const [message, setMessage] = useState('');
  const navigate = useNavigate()
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
      e.preventDefault(); // Prevent the default form submission
      try {
          const response = await api.post('/register/', userData);
          toast.success(response.data.message);
          navigate('/login'); // Redirect to the login page on success
          setUserData({ username: '', password: '' }); // Reset the input fields
      } catch (error) {
          const errorResponse = error.response?.data?.detail || error.response?.data?.username || 'An error occurred during registration.'; 
        
          // Handle specific error when user already exists
          if (error.response?.data?.username) {
              toast.error('User already exists.');
          } else {
              toast.error(errorResponse);
          }

          setMessage(errorResponse); // Set the error message in the state for display
      }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Register</h2>
          
          <form onSubmit={handleRegister} className="space-y-4">
              <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={userData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={userData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                  {loading ? 'Registering...' : 'Register'}
              </button>
          </form>
          
          {/* Render the error message if it exists */}
          {error && <p className="text-red-500 text-sm text-center mt-2">{error.detail || error}</p>} 
          {message && <p className="text-green-500 text-sm text-center mt-2">{message}</p>} 

          {/* Login button to navigate to login page */}
          <div className="mt-4">
              <p className="text-center text-gray-500">Already have an account?</p>
              <button
                  onClick={() => navigate('/login')} // Navigate to the login page
                  className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                  Login
              </button>
          </div>
      </div>
    </div>
  );
};

export default Register;
