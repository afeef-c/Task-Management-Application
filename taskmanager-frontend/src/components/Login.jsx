import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDetails, loginUser } from '../authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);
  const user = useSelector((state) => state.auth.user);
  const authTokens = useSelector((state) => state.auth.authTokens);

  useEffect(() => {
    if (authTokens) {
      dispatch(fetchUserDetails());
    }
  }, [authTokens, dispatch]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser(credentials));
  
    if (loginUser.fulfilled.match(resultAction)) {
      toast.success('Login successful!');
      navigate('/tasks'); // Redirect upon successful login
    } else {
      // Check if the payload has an error with a message
      const errorMessage = resultAction.payload?.detail || 'Login failed! Please try again.';
      toast.error(errorMessage);
    }
  };
  


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex flex-col items-center py-6">
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900 to-black flex flex-col p-6">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={credentials.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {/* {error && <p className="text-red-500 text-sm text-center">{error}</p>} */}
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-500">Create an account</p>
          <button
            disabled={loading}
            onClick={() => navigate('/register')}
            className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
          >
            Register
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
