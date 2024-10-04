import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { toast } from 'react-toastify';
import api from '../api';

const Register = () => {
  const [userData, setUserData] = useState({ username: '', password: '' });
  const { loading, error } = useSelector((state) => state.auth); // Accessing loading and error from Redux state
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    try {
      const response = await api.post('/register/', userData);
      toast.success(response.data.message);
      setUserData({ username: '', password: '' }); // Reset the input fields
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'An error occurred during registration.'; // Access the detail property properly
      toast.error(errorMsg);
      setMessage(errorMsg); // Set message for display
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={userData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={userData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {/* Render the error message if it exists */}
      {error && <p>{error.detail || error}</p>} {/* Access the detail property here */}
      {message && <p>{message}</p>} {/* Show any additional message */}
    </div>
  );
};

export default Register;
